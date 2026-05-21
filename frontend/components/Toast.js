import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#10b981' : '#ef4444';
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: bgColor,
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      zIndex: 1000,
      animation: 'slideUp 0.3s ease-out'
    }}>
      {message}
    </div>
  );
}