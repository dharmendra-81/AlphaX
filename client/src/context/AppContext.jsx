import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(true)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [completedLectures, setCompletedLectures] = useState(() => {
        try {
            const saved = localStorage.getItem('completedLectures')
            return saved ? JSON.parse(saved) : {}
        } catch {
            return {}
        }
    })

    const toggleLectureCompleted = (courseId, lectureId) => {
        setCompletedLectures(prev => {
            const currentCourseCompleted = prev[courseId] || []
            let updated
            if (currentCourseCompleted.includes(lectureId)) {
                updated = currentCourseCompleted.filter(id => id !== lectureId)
            } else {
                updated = [...currentCourseCompleted, lectureId]
            }
            const newValue = { ...prev, [courseId]: updated }
            localStorage.setItem('completedLectures', JSON.stringify(newValue))
            return newValue
        })
    }

    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses)
    }

    // Function to calculate avg rating
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) {
            return 0;
        }
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })

        return (totalRating / course.courseRatings.length)
    }

    // Function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] })
    }

    // Fumction to calculate course duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map((chapter) =>
            chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            ))
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] })
    }

    // function to calculate no of lectures
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0
        course.courseContent.forEach((chapter) => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length
            }
        })
        return totalLectures
    }

    // Fetch user enrolled courses
    const fetchEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses)
    }

    useEffect(() => {
        fetchAllCourses()
        fetchEnrolledCourses()
    }, [])

    const value = {
        currency, allCourses, navigate, calculateRating, isEducator, setIsEducator, calculateChapterTime, 
        calculateCourseDuration, calculateNoOfLectures, enrolledCourses, fetchEnrolledCourses,
        completedLectures, toggleLectureCompleted
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}