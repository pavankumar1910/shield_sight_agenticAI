import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Search,
  FileStack,
  History,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { Scan } from 'lucide-react';
import { FileText } from 'lucide-react';
import { cn } from '../../lib/utils';


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview & Stats' },
  { path: '/app/analyze', icon: Search, label: 'Analyze URL', description: 'Single URL Check' },
  { path: '/app/batch', icon: FileStack, label: 'Batch Analysis', description: 'Multiple URLs' },
  { path: '/app/email-scan', icon: Mail, label: 'Email Scanner', description: 'Scan email URLs' },
  { path: '/app/qr-scanner', icon: Scan, label: 'QR Scanner', description: 'Scan QR codes' },
  { path: '/app/document-scanner', icon: FileText, label: 'Document Scanner', description: 'Scan document URLs' },
  { path: '/app/history', icon: History, label: 'History', description: 'Past Scans' },
  { path: '/app/help', icon: HelpCircle, label: 'Help', description: 'Support & FAQ' },
  { path: '/app/settings', icon: Settings, label: 'Settings', description: 'Preferences' },
];

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-50"
    >
      <div className={cn(
        "h-16 flex items-center border-b border-border px-4 transition-all duration-300 relative",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <motion.div
          initial={false}
          className={cn("flex items-center gap-3", collapsed && "hidden")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground">ShieldSight</h1>
              <p className="text-xs text-muted-foreground">Phishing Detection</p>
            </div>
          )}
        </motion.div>

        {collapsed && (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Toggle Button - Now positioned relative to the header */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors",
            !collapsed ? "ml-auto" : "absolute -right-4 top-1/2 -translate-y-1/2 border border-border bg-card shadow-sm"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon className={cn("w-5 h-5 flex-shrink-0", collapsed ? "mx-auto" : "")} />

                  {/* Label & Description */}
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex-1"
                    >
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs opacity-70">{item.description}</p>
                    </motion.div>
                  )}

                  {/* Hover Tooltip for Collapsed State */}
                  {collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
                    >
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs opacity-70">{item.description}</p>
                    </motion.div>
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 border-t border-border"
      >
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
          collapsed && "justify-center px-2"
        )}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
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
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">Free Plan</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.aside>
  );
};