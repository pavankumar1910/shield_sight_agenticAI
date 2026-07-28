import { motion } from 'framer-motion';
import { Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { NotificationsDropdown } from '../layout/NotificationsDropdown';  // ✅ ADDED

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export const Navbar = ({ sidebarCollapsed }: NavbarProps) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className={cn(
        "fixed top-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-b border-border z-40 transition-all duration-300",
        sidebarCollapsed ? "left-20" : "left-[280px]"
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-heading font-bold text-foreground">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.displayName || 'User'}
          </p>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* ✅ NOTIFICATIONS - REPLACED WITH DROPDOWN COMPONENT */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.div>
          </motion.button>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.displayName?.charAt(0).toUpperCase() || 'U'
                )}
              </div>

              {/* Name & Email */}
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-foreground">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>

              {/* Dropdown Icon */}
              <motion.div
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-border bg-muted/50">
                    <p className="font-medium text-sm text-foreground">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/app/profile');  // ✅ FIXED: Added /app prefix
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Profile</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};