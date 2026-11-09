import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { Line } from 'rc-progress'
import Footer from '../../components/student/Footer'
import { toast } from 'react-toastify'
import axios from 'axios'

const MyEnrollments = () => {

  const { enrolledCourses, calculateCourseDuration, navigate, completedLectures, calculateNoOfLectures, userData, fetchEnrolledCourses,
    backendUrl, getToken
  } = useContext(AppContext)

  const [progressArray, setProgressArray] = useState([])

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          try {
            const { data } = await axios.post(`${backendUrl}/api/user/get-course-progress`,
              { courseId: course._id }, { headers: { Authorization: `Bearer ${token}` } })

            const totalLectures = calculateNoOfLectures(course)
            const lectureCompleted = data?.progressData?.lectureCompleted ? data.progressData.lectureCompleted.length : 0
            return { totalLectures, lectureCompleted }
          } catch {
            return { totalLectures: calculateNoOfLectures(course), lectureCompleted: 0 }
          }
        })
      )

      setProgressArray(tempProgressArray)
    }
    catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (userData) {
      fetchEnrolledCourses()
    }
  }, [userData])
  
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress()
    }
  }, [enrolledCourses])


  return (
    <>
      <div className='md:px-36 px-8 pt-10 min-h-[70vh]'>
        <h1 className='text-2xl font-semibold'>My Enrollments</h1>
        {enrolledCourses.length === 0 ? (
          <div className='py-16 text-center text-gray-500'>
            <p className='text-lg'>You haven't enrolled in any courses yet.</p>
            <button 
              onClick={() => navigate('/course-list')}
              className='mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-md cursor-pointer'
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <table className='md:table-auto table-fixed w-full overflow-hidden border mt-10'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>Course</th>
                <th className='px-4 py-3 font-semibold truncate'>Duration</th>
                <th className='px-4 py-3 font-semibold truncate'>Completed</th>
                <th className='px-4 py-3 font-semibold truncate'>Status</th>
              </tr>
            </thead>

            <tbody className='text-gray-700'>
              {enrolledCourses.map((course, index) => {
                const completedCount = progressArray[index] 
                  ? progressArray[index].lectureCompleted 
                  : (completedLectures[course._id]?.length || 0)
                const totalLectures = calculateNoOfLectures(course) || 1
                const percent = Math.min(100, Math.round((completedCount * 100) / totalLectures))
                const isCompleted = completedCount >= totalLectures && totalLectures > 0

                return (
                  <tr key={index} className='border-b border-gray-500/20'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 '>
                      <img src={course.courseThumbnail} alt='' className='w-14 sm:w-24 md:w-28' />
                      <div className="flex-1">
                        <p className='mb-1 max-sm:text-sm font-medium'>{course.courseTitle} </p>
                        <Line className='bg-gray-300 rounded-full' strokeWidth={2} percent={percent} />
                      </div>
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {calculateCourseDuration(course)}
                    </td>
                    <td className='px-4 py-3 max-sm:hidden'>
                      {completedCount} / {totalLectures}
                      <span> Lectures</span>
                    </td>
                    <td className='px-4 py-3 max-sm:text-right'>
                      <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white rounded cursor-pointer'
                        onClick={() => navigate('/player/' + course._id)}>
                        {isCompleted ? 'Completed' : 'Ongoing'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollments
