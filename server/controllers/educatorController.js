import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';

const getUserId = (req) => {
    return (typeof req.auth === 'function' ? req.auth() : req.auth)?.userId;
}

// update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        });

        // Ensure user exists in MongoDB User collection
        let user = await User.findById(userId);
        if (!user) {
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                if (clerkUser) {
                    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Educator';
                    await User.create({
                        _id: userId,
                        name: fullName,
                        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
                        imageUrl: clerkUser.imageUrl || '',
                        enrolledCourses: []
                    });
                }
            } catch (err) {
                console.error("Error auto-syncing educator to MongoDB:", err.message);
            }
        }

        res.json({ success: true, message: 'Role updated to educator' })

    } catch (error) {
        console.error('Error updating role to educator:', error);
        res.status(500).json({ success: false, message: 'Failed to update role to educator', error: error.message })
    }
}

// Add new course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = getUserId(req);

        if (!educatorId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not attached' })
        }

        const parsedCourseData = typeof courseData === 'string' ? JSON.parse(courseData) : courseData
        parsedCourseData.educator = educatorId

        if (parsedCourseData.isPublished === undefined) {
            parsedCourseData.isPublished = true
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        parsedCourseData.courseThumbnail = imageUpload.secure_url

        const newCourse = await Course.create(parsedCourseData)
        res.json({ success: true, message: 'Course created successfully', courseId: newCourse._id })

    } catch (error) {
        res.json({ success: false, message: 'Error creating course', error: error.message })
    }
}

// get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educatorId = getUserId(req);
        if (!educatorId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const courses = await Course.find({ educator: educatorId })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: 'Error fetching courses', error: error.message })
    }
}

// get educator dashboard data
export const educatorDashboardData = async (req, res) => {
    try {
        const educatorId = getUserId(req);
        if (!educatorId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const courses = await Course.find({ educator: educatorId })
        const totalCourses = courses.length
        const courseIds = courses.map(course => course._id)

        // calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "completed"
        })
        const totalEarnings = purchases.reduce((total, purchase) => {
            return total + (Number(purchase.amount) || 0)
        }, 0)

        // collect unique enrolled student ids with their course titles
        const enrolledStudentsData = []
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl')

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            })
        }
        res.json({
            success: true, dashboardData: { totalEarnings, enrolledStudentsData, totalCourses }
        })

    } catch (error) {
        res.json({ success: false, message: 'Error fetching dashboard data', error: error.message })
    }
}

// get enrolled students data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educatorId = getUserId(req);
        if (!educatorId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const courses = await Course.find({ educator: educatorId })
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId || { name: 'Student', imageUrl: '' },
            courseTitle: purchase.courseId?.courseTitle || 'Course',
            purchaseDate: purchase.createdAt,
            purchaseData: purchase.createdAt,
        }))

        res.json({ success: true, enrolledStudents })
    } catch (error) {
        res.json({ success: false, message: 'Error fetching enrolled students data', error: error.message })
    }
}
