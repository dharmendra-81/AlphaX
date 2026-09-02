import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";

// get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


// users enrolled courses with lecture links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate("enrolledCourses");

        res.status(200).json(userData.enrolledCourses);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// course purchase
export const coursePurchase = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers
        const userId = req.auth.userId;
        const userData = await User.findById(userId);
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

        // strpe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLowerCase()

        // creating line items to for stripe
        const lineItems = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
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
        res.json({ success: true, url: session.url })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
