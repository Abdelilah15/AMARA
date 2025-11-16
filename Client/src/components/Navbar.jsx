import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'




const Navbar = () => {
    const navigate = useNavigate()

  return (
<div className="w-full flex justify-between items-center p-4 sm:px-6 sm:px-24 absolute top-0">
  <img src={assets.user} alt="" className="w-28 sm:w-32" />
  <button onClick={()=>navigate('/login')}
  className="cursor-pointer flex gap-2 px-5 py-2 rounded-full bg-blue-400 text-white hover:bg-gray-800 hover:text-white transition-all duration-200">Login
    <img src={assets.anglecircleright} alt="Arrow" className="invert w-6 h-6"/>
  </button>
</div>

  )
}

export default Navbar
