import React from 'react';
import { 
  PlusCircle, 
  UserCheck, 
  Moon, 
  Sun, 
  FlaskConical,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { LabProfile } from '../types';

interface NavbarProps {
  profile: LabProfile;
  currentRole: string;
  onRoleChange: (role: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentRole,
  onRoleChange,
  isDarkMode,
  onToggleTheme,
  onNavigate,
  isSidebarOpen,
  onToggleSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs print:hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Sidebar Hamburger Toggle & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button for mobile & desktop collapse */}
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
              className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Brand Logo & Title */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer min-w-0" 
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                    {profile.labName || 'Raza Lab'}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> LIS 2.0
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden xs:block">
                  {profile.doctorName}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions, Role & Theme Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            
            {/* Quick New Report Button */}
            <button
              onClick={() => onNavigate('new-report')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">New Report</span>
              <span className="sm:hidden text-xs">New</span>
            </button>

            {/* Role Switcher (Hidden on small mobile, visible on tablet/desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded px-2 py-1 outline-none border-0 cursor-pointer shadow-xs text-xs"
              >
                <option value="Pathologist (Dr. Ghulam)">Pathologist (Dr. Ghulam)</option>
                <option value="Senior Lab Technician">Senior Lab Technician</option>
                <option value="System Administrator">Administrator</option>
              </select>
            </div>

            {/* Dark / Light Mode Switch (Touch friendly) */}
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
