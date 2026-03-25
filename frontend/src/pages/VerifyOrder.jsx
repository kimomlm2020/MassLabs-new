import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const VerifyOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  
  const { clearCart, setCartItems } = useContext(ShopContext); // ✅ Ajouter setCartItems
  const hasRun = useRef(false);

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyPayment = async () => {
      if (!orderId) {
        toast.error('Invalid verification link');
        navigate('/cart');
        return;
      }

      try {
        const response = await axios.post(
          `${backendUrl}/api/order/verifyStripe`,
          {
            orderId,
            success: success === 'true'
          },
          { headers: { token } }
        );

        if (response.data?.success) {
          toast.success('Payment successful! Order confirmed.');
          
          setCartItems({}); 
          localStorage.removeItem('cartItems');
          
          await clearCart();
          
          setTimeout(() => {
            navigate('/profile', { replace: true });
          }, 2000);
        } else {
          toast.error('Payment failed or was cancelled.');
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        toast.error(error.response?.data?.message || 'Verification failed');
        setTimeout(() => {
          navigate('/cart');
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [backendUrl, clearCart, navigate, orderId, setCartItems, success, token]);

  if (verifying) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #333',
          borderTop: '4px solid #D4AF37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '30px'
        }} />
        <h2 style={{ color: '#D4AF37' }}>Verifying your payment...</h2>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default VerifyOrder;