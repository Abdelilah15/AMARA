import React, { useRef, useEffect, useContext } from 'react'
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
import Feed from './pages/Feed';
import MediaModal from './components/MediaModal';
import { AppContext } from './context/AppContext'




const App = () => {
  const location = useLocation();

  const pathRef = useRef(null); // Stocke le chemin
  const previousPath = pathRef.current;

  useEffect(() => {
    pathRef.current = location.pathname; // Met à jour la référence après chaque rendu
  }, [location.pathname]);

  const hideNavRoutes = ['/', '/login', '/email-verify', '/reset-password', '/register'];
  const shouldShowNav = !hideNavRoutes.includes(location.pathname);
  const { mediaModalData } = useContext(AppContext);

  return (
    <div className={`flex bg-gray-900 min-h-screen ${mediaModalData ? 'overflow-hidden h-screen' : ''}`}>
      <ToastContainer />

      {/* Conteneur principal : s'ajuste si la sidebar est là ou non */}
      <div className={`flex-1 flex flex-col min-h-screen relative ${shouldShowNav ? 'md:ml-84' : ''} transition-all duration-300`}>
        
        {/* Affiche la Navbar uniquement si autorisé */}
        {shouldShowNav && <Navbar />}
        {shouldShowNav && <Sidebar previousPath={previousPath} />}
        
        <div className='flex-1'>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/email-verify' element={<EmailVerify />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/:username' element={<Profile />} />
                <Route path='/feed' element={<Feed />} />
            </Routes>
        </div>
      </div>
      <MediaModal />
    </div>
  );
}

export default App