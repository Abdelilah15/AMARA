import { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Header = () => {
  const {userData} = useContext(AppContext);

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <img src={assets.user_robot} alt="" className='w-36 h-36 rounded-full mb-6'/>
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>ⴰⵣⵓⵍ {userData ? userData.name : 'siwn'}!
        <img className='w-8 aspect-square' src={assets.hand_wave} alt="" />
      </h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Azul nnk</h2>
      <p className='mb-8 max-w-md'>ⴰⵛⵏⵢⴰⵍ ⴰⵎⴰⵣⵉⵖ ⴷ ⵉⵙⵙⵓⴼⵖ ⵓⴳⵔⴰⵡ ⵏ ⵉⵎⴰⵣⵉⵖⵏ ⴳ ⵉⵙⴳⴳⵯⴰⵙⵏ ⵏ 70, ⵉⵍⵍⴰⵏ ⴳ ⵜⵎⵓⵔⵜ ⵏ ⴼⵕⴰⵏⵚⴰ.</p>
      <button className='cursor-pointer border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transation-all'>Get started</button>
    </div>
  )
}

export default Header
