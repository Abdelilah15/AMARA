import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'




const Navbar = () => {
    const navigate = useNavigate()
    const {userData, backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)
    const sendVerificationOtp = async () => {
      try {
        axios.defaults.withCredentials = true
        const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')
        if (data.success) {
          toast.success('Verification OTP sent to your email')
          navigate('/email-verify')
        } else {
          toast.error('Something went wrong')
        }
      } catch (error) {
        toast.error('Something went wrong')
      }
    }

    const logout = async () => {
      try {
        axios.defaults.withCredentials = true
        const {data} = await axios.post(backendUrl + '/api/auth/logout')
        data.success && setIsLoggedin(false)
        data.success && setUserData(false)
        navigate('/')
        toast.success('Logged out successfully')

      } catch (error) {
        toast.error('Something went wrong')
      }
    }

  return (
<div className="w-full flex justify-between items-center p-4 sm:px-6 sm:px-24 absolute top-0">
  <img src={assets.user} alt="" className="w-28 sm:w-32" />

{userData ? 
  <div className='flex justify-center w-12 h-12 items-center border border-gray-500 rounded-full bg-gray-200 text-gray-800 font-medium cursor-pointer relative group hover:rounded-tl-[0px] hover:rounded-bl-[0px] hover:border-none hover:bg-white'>
    {userData.name[0].toUpperCase()}
    <div className='absolute hidden group-hover:block top-0 right-11 text-black rounded bg-white shadow-lg'>
      <ul className='list-none text-black p-4 rounded-lg text-sm m-0 w-35'>
        {!userData.isAccountVerified && 
        <li onClick={sendVerificationOtp} className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Verify email</li> }
        
        <li onClick={logout} className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Logout</li>
        <li className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Profile</li>
      </ul>
    </div>
  </div>
  : <button onClick={()=>navigate('/login')}
  className="cursor-pointer flex gap-2 px-5 py-2 rounded-full bg-blue-400 text-white hover:bg-gray-800 hover:text-white transition-all duration-200">Login
    <img src={assets.anglecircleright} alt="Arrow" className="invert w-6 h-6"/>
  </button> }

  
</div>

  )
}

export default Navbar
