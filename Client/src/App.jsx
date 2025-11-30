import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile'
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Settings from './pages/Settings';


const App = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isEmailVerifyPage = location.pathname === '/email-verify';
  const isResetPasswordPage = location.pathname === '/reset-password';
  const isSettingsPage = location.pathname === '/settings';

  const hideNavRoutes = ['/', '/login', '/email-verify', '/reset-password', '/register'];
  const shouldShowNav = !hideNavRoutes.includes(location.pathname);

  return (
    <div className='flex'> {/* Ajout de flex pour la mise en page Sidebar + Contenu */}
      <ToastContainer />
      
      {/* Affiche la Sidebar uniquement si autorisé */}
      {shouldShowNav && <Sidebar />}

      {/* Conteneur principal : s'ajuste si la sidebar est là ou non */}
      <div className={`flex-1 flex flex-col min-h-screen relative ${shouldShowNav ? 'md:ml-84' : ''} transition-all duration-300`}>
        
        {/* Affiche la Navbar uniquement si autorisé */}
        {shouldShowNav && <Navbar />}
        
        <div className='flex-1'>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/email-verify' element={<EmailVerify />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/:username' element={<Profile />} />
            </Routes>
        </div>
      </div>
    </div>
  );
}

export default App