import Navbar from '../components/Navbar'
import Header from '../components/Header'
import "./Home.css";

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x'>
      <Navbar/>
      <Header/>
    </div>
  )
}

export default Home
