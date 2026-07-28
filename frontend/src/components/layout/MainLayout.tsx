import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../dashboard/Sidebar';
import { Navbar } from '../dashboard/Navbar';
import { cn } from '../../lib/utils';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Menu } from 'lucide-react';

export const MainLayout = () => {
  useKeyboardShortcuts();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background">

      {/* 🔹 Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <div
        className={cn(
          "fixed z-50 h-screen transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* 🔹 Navbar - ✅ NOTIFICATIONS ALREADY IN NotificationsDropdown.tsx */}
      <Navbar sidebarCollapsed={sidebarCollapsed} />

      {/* 🔹 Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-[280px]"
        )}
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 🔹 Mobile Floating Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-primary text-white shadow-2xl flex items-center justify-center"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* 🔹 Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-500 to-pink-600 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};