// hooks/useInactivityTimer.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useInactivityTimer = () => {
  const navigate = useNavigate();
  const { access_token, logout } = useAuthStore();
  const timerRef = useRef(null);

  const resetTimer = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer only if user is logged in
    if (access_token) {
      timerRef.current = setTimeout(() => {
        // Show warning toast
        toast.error('Session expired due to 5 minutes of inactivity. Please login again.', {
          duration: 5000,
        });
        
        // Clear last activity
        localStorage.removeItem('last_activity');
        
        // Logout user
        logout();
        navigate('/login', { replace: true });
      }, INACTIVITY_TIME);
    }
  };

  useEffect(() => {
    if (!access_token) return;

    // Set up event listeners for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'keypress',
      'wheel'
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      // Update last activity timestamp
      localStorage.setItem('last_activity', Date.now().toString());
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Set initial last activity
    localStorage.setItem('last_activity', Date.now().toString());
    
    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [access_token, navigate, logout]);

  return null;
};