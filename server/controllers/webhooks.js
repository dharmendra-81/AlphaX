import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

// API Controller function to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        await whook.verify(JSON.stringify(req.body), {
            'svix-id': req.headers["svix-id"],
            'svix-timestamp': req.headers["svix-timestamp"],
            'svix-signature': req.headers["svix-signature"]
        })

        const { data, type } = req.body

        let responsePayload = { success: true }

        switch (type) {
            case 'user.created': {
                const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User'
                const userData = {
                    _id: data.id,
                    email: data.email_addresses?.[0]?.email_address || '',
                    name: fullName,
                    imageUrl: data.image_url || '',
                }

                await User.create(userData)
                responsePayload.message = "User created"
                break;
            }

            case 'user.updated': {
                const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User'
                const userData = {
                    email: data.email_addresses?.[0]?.email_address || '',
                    name: fullName,
                    imageUrl: data.image_url || '',
                }
                await User.findByIdAndUpdate(data.id, userData)
                responsePayload.message = "User updated"
                break
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id)
                responsePayload.message = "User deleted"
                break
            }

            default: break
        }
        res.json(responsePayload)
    }
    catch (e) {
        res.status(500).json({ success: false, message: e.message })
    }
}

export const stripeWebhooks = async (req, res) => {
    try {
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

        const sig = req.headers["stripe-signature"]
        const event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object
                const paymentIntentId = paymentIntent.id
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                })
                if (session.data && session.data.length > 0 && session.data[0].metadata?.purchaseId) {
                    const { purchaseId } = session.data[0].metadata
                    const purchaseData = await Purchase.findById(purchaseId)
                    if (purchaseData) {
                        const userData = await User.findById(purchaseData.userId)
                        const courseData = await Course.findById(purchaseData.courseId.toString())

                        if (courseData && userData) {
                            if (!courseData.enrolledStudents.includes(userData._id)) {
                                courseData.enrolledStudents.push(userData._id)
                                await courseData.save()
                            }
                            if (!userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
                                userData.enrolledCourses.push(courseData._id)
                                await userData.save()
                            }
                        }

                        purchaseData.status = 'completed'
                        await purchaseData.save()
                    }
                }

                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object
                const paymentIntentId = paymentIntent.id
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                })
                if (session.data && session.data.length > 0 && session.data[0].metadata?.purchaseId) {
                    const { purchaseId } = session.data[0].metadata
                    const purchaseData = await Purchase.findById(purchaseId)
                    if (purchaseData) {
                        purchaseData.status = 'failed'
                        await purchaseData.save()
                    }
                }

                break
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
                break
        }

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}