import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + K: Search/Focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/app/analyze');
      }

      // Ctrl/Cmd + B: Batch
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        navigate('/app/batch');
      }

      // Ctrl/Cmd + H: History
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        navigate('/app/history');
      }

      // Ctrl/Cmd + /: Help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        navigate('/app/help');
      }

      // ?: Show shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toast.success(
          'Keyboard Shortcuts:\n' +
          '⌘/Ctrl + K - Analyze\n' +
          '⌘/Ctrl + B - Batch\n' +
          '⌘/Ctrl + H - History\n' +
          '⌘/Ctrl + / - Help',
          { duration: 5000 }
        );
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
};