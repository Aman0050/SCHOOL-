import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      // Single Key Navigations
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        navigate('/dashboard/attendance');
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        navigate('/dashboard/fees');
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        navigate('/dashboard/students');
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        navigate('/dashboard/examinations');
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        // Dispatch custom event that the Student module can listen to open the "Add Student" drawer
        window.dispatchEvent(new CustomEvent('open-new-student'));
      }
      if (e.key === '?') {
        e.preventDefault();
        alert('Global Shortcuts:\n\nCmd/Ctrl+K : Global Search\nA : Attendance\nF : Fees\nS : Students\nE : Exams\nN : New Student\n? : Show this help');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);
};
