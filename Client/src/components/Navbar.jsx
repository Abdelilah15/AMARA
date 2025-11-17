import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'




const Navbar = () => {
    const navigate = useNavigate()
    const {userData, backendUrl, setUserData, setIsLoggedin} = useContext(AppContext)

  return (
<div className="w-full flex justify-between items-center p-4 sm:px-6 sm:px-24 absolute top-0">
  <img src={assets.user} alt="" className="w-28 sm:w-32" />

{userData ? 
  <div className='flex justify-center w-12 h-12 items-center border border-gray-500 rounded-full bg-gray-200 text-gray-800 font-medium cursor-pointer relative group'>
    {userData.name[0].toUpperCase()}
    <div className='absolute hidden group-hover:block top-0 right-0 text-black rounded bg-white shadow-lg' style={{borderTopRightRadius: "20px"}}>
      <div className='flex justify-center w-12 h-12 items-center border border-gray-500 rounded-full bg-gray-200 text-gray-800 font-medium cursor-pointer relative group mt-2 mr-2' style={{marginLeft: "auto"}}>
    {userData.name[0].toUpperCase()}</div>
      <ul className='list-none text-black p-4 rounded-lg text-sm m-0 w-40'>
        <li className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Verify email</li>
        <li className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Logout</li>
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
