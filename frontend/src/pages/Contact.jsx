import React, { useState, useEffect, useRef } from 'react';
import '../styles/Contact.css';
import { assets } from '../assets/assets';
import { useEmailService } from '../hook/useEmailService';
import { toast } from 'react-toastify';
import { 
  FaEnvelope, 
  FaPhone, 
  FaComments, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUserMd, 
  FaShippingFast, 
  FaHeadset, 
  FaCalendarAlt, 
  FaPaperPlane,
  FaTimes,
  FaRobot,
  FaUser,
  FaPaperclip,
  FaSmile,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error

  // EmailJS hook
  const { sendContactForm, isSending } = useEmailService();

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: 'Hello! Welcome to Mass Labs. How can I help you today?', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const subjects = [
    'Product Question',
    'Technical Support',
    'Consultation',
    'Order',
    'Return/Exchange',
    'Partnership',
    'Other'
  ];

  const faqItems = [
    {
      icon: <FaClock className="icon" />,
      question: 'What is the response time?',
      answer: 'We commit to responding to all emails within 24 business hours. For emergencies, use our live chat available on the site.'
    },
    {
      icon: <FaUserMd className="icon" />,
      question: 'Can I speak directly with an expert?',
      answer: 'Yes, our free consultations allow you to speak directly with one of our certified experts.'
    },
    {
      icon: <FaShippingFast className="icon" />,
      question: 'How can I track my order?',
      answer: 'All tracking information is sent by email after order confirmation.'
    },
    {
      icon: <FaHeadset className="icon" />,
      question: 'Do you offer after-sales support?',
      answer: 'Absolutely. Our after-sales support is available for all your questions regarding the use of our products.'
    }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');

    try {
      // Send email via EmailJS
      const result = await sendContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        urgency: formData.urgency,
        submitted_at: new Date().toLocaleString()
      });

      if (result.success) {
        setFormStatus('success');
        toast.success('Message sent successfully! We will respond within 24 hours.');
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            urgency: 'normal'
          });
          setFormStatus('idle');
        }, 2000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setFormStatus('error');
      toast.error('Failed to send message. Please try again or use live chat.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Chat functions
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return 'Our prices vary by product. You can check our shop page for current pricing, or I can connect you with a sales representative.';
    } else if (lowerInput.includes('shipping') || lowerInput.includes('delivery')) {
      return 'We offer discreet worldwide shipping. Delivery typically takes 3-7 business days depending on your location.';
    } else if (lowerInput.includes('stock') || lowerInput.includes('available')) {
      return 'Stock availability is shown on each product page. Items marked "In Stock" are ready to ship immediately.';
    } else if (lowerInput.includes('consultation') || lowerInput.includes('expert')) {
      return 'We offer free consultations with our certified experts. Would you like me to schedule one for you?';
    } else if (lowerInput.includes('order') || lowerInput.includes('buy')) {
      return 'You can place orders directly through our website. Would you like help finding a specific product?';
    } else if (lowerInput.includes('contact') || lowerInput.includes('email')) {
      return 'You can reach us via the contact form on this page, or email us directly at contact@masslabs.shop.';
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! How can I assist you with our products today?';
    } else {
      return 'Thank you for your message. For more detailed assistance, please fill out the contact form below or I can connect you with a human agent.';
    }
  };

  // Get button content based on status
  const getSubmitButtonContent = () => {
    switch (formStatus) {
      case 'loading':
        return (
          <>
            <FaSpinner className="btn-icon spin" />
            Sending...
          </>
        );
      case 'success':
        return (
          <>
            <FaCheckCircle className="btn-icon" />
            Sent Successfully!
          </>
        );
      default:
        return (
          <>
            <FaPaperPlane className="btn-icon" />
            Send message
          </>
        );
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-banner">
          <img 
            src={assets.about_contact?.Cont_h || '/default-banner.jpg'} 
            alt="Contact Us - Performance SARMS" 
            className="banner-image"
          />
          <div className="banner-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>
            Contact <span className="text-gradient">Us</span>
          </h1>
          <p className="hero-subtitle">
            Get in touch with our team for any questions about our products or services
          </p>
          <div className="hero-cta">
            <a href="#contact-form" className="btn btn-primary">
              <FaEnvelope className="btn-icon" />
              Send Message
            </a>
            <button onClick={toggleChat} className="btn btn-outline">
              <FaComments className="btn-icon" />
              Live Chat
            </button>
          </div>
        </div>
      </section>

      {/* Live Chat Widget */}
      <div className={`chat-widget ${isChatOpen ? 'open' : ''}`}>
        {/* Chat Toggle Button */}
        <button 
          className="chat-toggle"
          onClick={toggleChat}
          aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
        >
          {isChatOpen ? <FaTimes /> : <FaComments />}
          {!isChatOpen && <span className="chat-badge">1</span>}
        </button>

        {/* Chat Window */}
        {isChatOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <FaRobot />
                </div>
                <div className="chat-title">
                  <h4>Mass Labs Support</h4>
                  <span className="chat-status">
                    <span className="status-dot online"></span>
                    Online
                  </span>
                </div>
              </div>
              <button 
                className="chat-close"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close chat"
              >
                <FaTimes />
              </button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-message ${msg.type}`}
                >
                  <div className="message-avatar">
                    {msg.type === 'bot' ? <FaRobot /> : <FaUser />}
                  </div>
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message bot typing">
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleChatSubmit}>
              <button type="button" className="chat-tool-btn" aria-label="Attach file">
                <FaPaperclip />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
              />
              <button type="button" className="chat-tool-btn" aria-label="Emoji">
                <FaSmile />
              </button>
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={!chatInput.trim()}
                aria-label="Send message"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Contact Form */}
      <section id="contact-form" className="contact-form-section section-padding">
        <div className="container">
          <div className="form-container">
            <div className="form-header">
              <h2>Contact Form</h2>
              <p>
                Fill out this form and our team will respond as soon as possible
              </p>
              {formStatus === 'error' && (
                <div className="form-error">
                  Failed to send message. Please try again or use live chat.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <FaUserMd className="form-icon" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={formStatus === 'loading' || formStatus === 'success'}
                    placeholder="Your first and last name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope className="form-icon" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={formStatus === 'loading' || formStatus === 'success'}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject">
                    <FaComments className="form-icon" />
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={formStatus === 'loading' || formStatus === 'success'}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="urgency">
                    <FaClock className="form-icon" />
                    Urgency
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    disabled={formStatus === 'loading' || formStatus === 'success'}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <FaEnvelope className="form-icon" />
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={formStatus === 'loading' || formStatus === 'success'}
                  placeholder="Describe your request in detail..."
                  rows="6"
                />
              </div>

              <div className="form-actions">
                <div className="privacy-agreement">
                  <input 
                    type="checkbox" 
                    id="privacy" 
                    required
                    disabled={formStatus === 'loading' || formStatus === 'success'}
                  />
                  <label htmlFor="privacy">
                    I agree that my personal data will be processed in accordance 
                    with the <a href="/privacy">privacy policy</a>.
                  </label>
                </div>

                <button 
                  type="submit" 
                  className={`btn btn-primary btn-lg ${formStatus === 'success' ? 'success' : ''}`}
                  disabled={formStatus === 'loading' || formStatus === 'success' || isSending}
                >
                  {getSubmitButtonContent()}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Quick */}
      <section className="contact-faq section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Quick <span className="text-gradient">Questions</span>
            </h2>
          </div>

          <div className="faq-list">
            {faqItems.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-icon-wrapper">
                  {faq.icon}
                </div>
                <div className="faq-content">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;