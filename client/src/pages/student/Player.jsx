import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import { toast } from 'react-toastify'
import Loading from '../../components/student/Loading'
import axios from 'axios'

const Player = () => {
  const { enrolledCourses, allCourses, calculateChapterTime, backendUrl, getToken, userData,
    fetchEnrolledCourses } = useContext(AppContext)
  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [openSection, setOpenSection] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)

  useEffect(() => {
    let found = enrolledCourses.find((course) => course._id === courseId)
    if (!found) {
      found = allCourses.find((course) => course._id === courseId)
    }
    if (found) {
      setCourseData(found)
      found.courseRatings?.forEach((item) => {
        if (userData && item.userId === userData._id) {
          setInitialRating(item.rating)
        }
      })
    }
  }, [enrolledCourses, allCourses, courseId, userData])

  const toggleSection = (index) => {
    setOpenSection(prev => (
      {
        ...prev,
        [index]: !prev[index]
      }))
  }

  const markLectureAsCompleted = async (lectureId) => {
    try {
      if (!lectureId) return
      const token = await getToken()
      if (!token) return toast.warn("Please sign in first")

      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress', {
        courseId,
        lectureId
      }, { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      if (!token) return

      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress', { courseId }, { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        setProgressData(data.progressData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Error getting course progress:", error.message)
    }
  }

  useEffect(() => {
    if (userData) {
      getCourseProgress()
    }
  }, [userData, courseId])

  const handleRate = async (rating) => {
    try {
      const token = await getToken()
      if (!token) return toast.warn("Please sign in first")

      const { data } = await axios.post(backendUrl + '/api/user/add-rating', { courseId, rating }, { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        toast.success(data.message)
        fetchEnrolledCourses()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return courseData ? (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        {/* left column */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className='pt-5'>
            {courseData?.courseContent?.map((chapter, chapterIndex) => (

              <div key={chapterIndex} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" onClick={() => toggleSection(chapterIndex)}>
                  <div className="flex items-center gap-2">
                    <img className={`transform transition-transform ${openSection[chapterIndex] ? 'rotate-180' : ''}`}
                      src={assets.down_arrow_icon} alt="arrow_icon" />
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle} </p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent?.length || 0} Lectures - {calculateChapterTime(chapter)} </p>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${openSection[chapterIndex] ? "max-h-96" : "max-h-0"}`}>
                  <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300 '>
                    {chapter.chapterContent?.map((lecture, lectureIndex) => (
                      <li key={lectureIndex} className='flex items-start gap-2 py-1'>
                        <img src={progressData && progressData.lectureCompleted?.includes(lecture.lectureId) ?
                          assets.blue_tick_icon : assets.play_icon} alt="play_icon" className='w-4 h-4 mt-1' />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && <p onClick={() => setPlayerData({
                              ...lecture, chapter: chapterIndex + 1, lecture: lectureIndex + 1
                            })}
                              className='text-blue-500 cursor-pointer'>Watch</p>}
                            <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })} </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-2 py-3 mt-10'>
            <h1 className='text-xl font-bold'>Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* right column */}
        <div className='md:mt-10'>
          {playerData ? (
            <div>
              <YouTube videoId={playerData.lectureUrl?.split('/').pop()} iframeClassName='w-full aspect-video' />
              <div className='flex justify-between items-center mt-1'>
                <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle} </p>
                <button
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  className='text-blue-600 font-medium cursor-pointer'
                >
                  {progressData && progressData.lectureCompleted?.includes(playerData.lectureId) ? "Completed" : "Mark Completed"}
                </button>
              </div>
            </div>
          )
            : <img src={courseData?.courseThumbnail || ''} alt='' className='w-full rounded' />
          }
        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
}

export default Player
