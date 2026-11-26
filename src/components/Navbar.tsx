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
    <header className="sticky top-0 z-30 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-white/60 dark:border-slate-800/80 shadow-xs print:hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Sidebar Hamburger Toggle & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button for mobile & desktop collapse */}
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle navigation menu"
              className="btn-liquid-3d-icon p-2 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
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
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-white/40 flex-shrink-0">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-xs" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                    {profile.labName || 'Raza Lab'}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/50">
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
            
            {/* Quick New Report Button (3D Liquid Glass Emerald) */}
            <button
              onClick={() => onNavigate('new-report')}
              className="btn-liquid-3d-emerald inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md"
            >
              <PlusCircle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">New Report</span>
              <span className="sm:hidden text-xs">New</span>
            </button>

            {/* Role Switcher (Glossmorphic Glass Pill) */}
            <div className="glass-panel hidden lg:flex items-center gap-1.5 p-1 rounded-xl border border-white/60 dark:border-slate-700/60 text-xs shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-bold rounded-lg px-2 py-1 outline-none border border-slate-200/50 dark:border-slate-700/50 cursor-pointer shadow-xs text-xs"
              >
                <option value="Pathologist (Dr. Ghulam)">Pathologist (Dr. Ghulam)</option>
                <option value="Senior Lab Technician">Senior Lab Technician</option>
                <option value="System Administrator">Administrator</option>
              </select>
            </div>

            {/* Dark / Light Mode Switch (Liquid 3D Icon Button) */}
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
              className="btn-liquid-3d-icon p-2 rounded-xl text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
