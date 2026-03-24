import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useEmailService = () => {
  const [isSending, setIsSending] = useState(false);

  const sendRequest = useCallback(async (endpoint, data) => {
    setIsSending(true);
    
    try {
      const response = await fetch(`${API_URL}/email${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSending(false);
    }
  }, []);

  // Contact form submission
  const sendContactForm = useCallback(async (formData) => {
    return sendRequest('/contact', formData);
  }, [sendRequest]);

  // Newsletter subscription
  const sendNewsletterWelcome = useCallback(async (email, name = '') => {
    return sendRequest('/newsletter/welcome', { email, name });
  }, [sendRequest]);

  return {
    isSending,
    sendContactForm,
    sendNewsletterWelcome
  };
};

export default useEmailService;