import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const { navigate, isEducator } = useContext(AppContext)
  const location = useLocation()

  const isCourseListPage = location.pathname.includes('/course-list')
  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer' />

      {/* For desktop screen */}
      <div className='hidden md:flex items-center gap-5 text-gray-500' >
        <div className='flex items-center gap-5'>
          <Show when="signed-in">
            <button onClick={() => { navigate('/educator') }}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
            <Link to='/my-enrollments'>My Enrollments</Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton className='bg-blue-600 text-white px-5 py-2 rounded-full' />
            <SignUpButton className='bg-blue-600 text-white px-5 py-2 rounded-full' />
          </Show>
        </div>
      </div>

      {/* For phone screen */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <Show when="signed-in">
          <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
            <button onClick={() => { navigate('/educator') }}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
            <Link to='/my-enrollments'>My Enrollments</Link>
            <UserButton />
          </div>
        </Show>
        <Show when="signed-out">
          <SignInButton><img src={assets.user_icon} /></SignInButton>
        </Show>
      </div>
    </div>
  )
}

export default Navbar