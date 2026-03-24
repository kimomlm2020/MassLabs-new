import React, { useEffect } from 'react'  // ⭐ AJOUTÉ useEffect
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import AnnouncementBar from './components/AnnouncementBar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import About from './pages/About'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Research from './pages/Research'
import Consultation from './pages/Consultation'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import RefundPolicy from './pages/RefundPolicy'
import Profile from './pages/Profile'
import VerifyOrder from './pages/VerifyOrder.jsx'


// ⭐ COMPONENT POUR SCROLL TO TOP
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

const App = () => {
  return (
    <div className='app-wrapper'>
      <ToastContainer />
      
      <ScrollToTop />
      
      <Navbar />
      <AnnouncementBar />
      
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/shop' element={<Shop />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/about' element={<About />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/verify-order' element={<VerifyOrder />} />
          <Route path='/research' element={<Research />} />
          <Route path='/consultation' element={<Consultation />} />
          <Route path='/terms' element={<TermsOfService />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/shipping' element={<ShippingPolicy />} />
          <Route path='/refund' element={<RefundPolicy />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      
      <Footer />
    </div>
  )
}

export default App