import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";
import { CourseProgress } from "../models/CourseProgress.js";
import { clerkClient } from "@clerk/express";

const getUserId = (req) => {
    return (typeof req.auth === 'function' ? req.auth() : req.auth)?.userId;
}

// Helper to ensure user exists in MongoDB if signed in via Clerk
const ensureUser = async (userId) => {
    if (!userId) return null;
    let user = await User.findById(userId);
    if (!user) {
        try {
            const clerkUser = await clerkClient.users.getUser(userId);
            if (clerkUser) {
                const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
                user = await User.create({
                    _id: userId,
                    name: fullName,
                    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
                    imageUrl: clerkUser.imageUrl || '',
                    enrolledCourses: []
                });
            }
        } catch (error) {
            console.error("Error auto-syncing Clerk user to MongoDB:", error.message);
        }
    }
    return user;
}

// get user data
export const getUserData = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        let user = await ensureUser(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// users enrolled courses with lecture links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.json({ success: false, message: "Unauthorized", enrolledCourses: [] });
        }
        const userData = await User.findById(userId).populate("enrolledCourses");
        if (!userData) {
            return res.json({ success: true, enrolledCourses: [] });
        }

        res.status(200).json({ success: true, enrolledCourses: userData.enrolledCourses || [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// course purchase
export const coursePurchase = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const userData = await ensureUser(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: "User or Course not found" })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // stripe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

        const currency = (process.env.CURRENCY || 'usd').toLowerCase()

        // creating line items for stripe
        const lineItems = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.round(Number(newPurchase.amount) * 100)
            },
            quantity: 1,
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: lineItems,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString(),
            }
        })
        res.json({ success: true, url: session.url, session_url: session.url })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// update user course progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { courseId, lectureId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.status(200).json({ success: true, message: "Lecture already completed" })
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
            return res.json({ success: true, message: "Progress updated successfully" })
        } else {
            await CourseProgress.create({ userId, courseId, lectureCompleted: [lectureId] })
            return res.json({ success: true, message: "Progress updated successfully" })
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// get user course progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { courseId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// add user ratings to course
export const addUserRating = async (req, res) => {
    const userId = getUserId(req);
    const { courseId, rating } = req.body

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Invalid input" })
    }

    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.json({ success: false, message: "Course not found" })
        }

        const user = await User.findById(userId)
        if (!user || !user.enrolledCourses.some(id => id.toString() === courseId.toString())) {
            return res.json({ success: false, message: "User is not enrolled in this course" })
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId.toString() === userId.toString())
        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating
        } else {
            course.courseRatings.push({ userId, rating })
        }
        await course.save()
        res.json({ success: true, message: "Rating added successfully" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
