import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile'
import Sidebar from './components/Sidebar';



const App = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isEmailVerifyPage = location.pathname === '/email-verify';
  const isResetPasswordPage = location.pathname === '/reset-password';


  return (
    <div className='flex main-h-screen'>
      <ToastContainer/>
      {!isHomePage && !isLoginPage && !isEmailVerifyPage && !isResetPasswordPage && <Sidebar />}
      <div className={`w-full transition-all duration-300 ${!isHomePage && !isLoginPage && !isEmailVerifyPage && !isResetPasswordPage ? 'sm:ml-64' : ''}`}>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
      </div>
    </div>
  )
}

export default App
