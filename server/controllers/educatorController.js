import { clerkClient } from "@clerk/express";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';

// update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        })
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
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId

        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()
        res.json({ success: true, message: 'Course created successfully', courseId: newCourse._id })

    } catch (error) {
        res.json({ success: false, message: 'Error creating course', error: error.message })
    }
}

// get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educatorId = req.auth.userId
        const courses = await Course.find({ educator: educatorId })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: 'Error fetching courses', error: error.message })
    }
}

// get educator dashboard data
export const educatorDashboardData = async (req, res) => {
    try {
        const educatorId = req.auth.userId
        const courses = await Course.find({ educator: educatorId })
        const totalCourses = courses.length
        const courseIds = courses.map(course => course._id)

        // calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: "completed"
        })
        const totalEarnings = purchases.reduce((total, purchase) => {
            return total + purchase.amount
        }, 0)

        // collect unique enrolled student ids with their course titles
        const enrolledStudentsData = []
        for(const course of courses){
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
        res.json({success: true, dashboardData: {totalEarnings, enrolledStudentsData, totalCourses}
            })

    } catch (error) {
        res.json({ success: false, message: 'Error fetching dashboard data', error: error.message })
    }
}

// get enrolled students data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educatorId = req.auth.userId
        const courses = await Course.find({ educator: educatorId })
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseData: purchase.createdAt,
        }))
        
        res.json({ success: true, enrolledStudents })
    } catch (error) {
        res.json({ success: false, message: 'Error fetching enrolled students data', error: error.message })
    }
}

