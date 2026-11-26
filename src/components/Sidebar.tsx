import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Users, 
  History, 
  FlaskRound, 
  Palette, 
  Settings,
  PhoneCall,
  MapPin,
  ShieldCheck,
  X
} from 'lucide-react';
import { LabProfile } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  profile: LabProfile;
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  profile,
  isOpen,
  onClose,
  pendingCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'new-report', label: '2. New Report', icon: FilePlus2, badge: 'Create' },
    { id: 'patients', label: '3. Patient Records', icon: Users },
    { id: 'reports', label: '4. Report History', icon: History, count: pendingCount > 0 ? pendingCount : undefined },
    { id: 'test-library', label: '5. Test Library', icon: FlaskRound },
    { id: 'report-designer', label: '6. Report Designer', icon: Palette },
    { id: 'settings', label: '7. Laboratory Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose(); // Automatically close mobile drawer when an item is selected
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (only visible on mobile when open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-72 md:w-64 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-r border-slate-200/70 dark:border-slate-800/70 flex flex-col justify-between select-none print:hidden transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'
        }`}
      >
        <div className="p-3.5 space-y-2 overflow-y-auto flex-1">
          {/* Mobile Drawer Header */}
          <div className="flex md:hidden items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                {profile.labName || 'Raza Lab'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Pathology LIS Navigation</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 btn-liquid-3d-icon"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Main Navigation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`nav-btn-liquid-3d ${
                    isActive
                      ? 'nav-btn-liquid-3d-active'
                      : 'nav-btn-liquid-3d-inactive'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={isActive ? 'nav-icon-orb-active' : 'nav-icon-orb-inactive'}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-bold shadow-xs ${
                      isActive 
                        ? 'bg-white/25 text-white border border-white/40' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {item.count}
                    </span>
                  )}
                  {item.badge && !isActive && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Laboratory Quick Info Box (Bottom) */}
        <div className="p-3.5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="rounded-xl p-3 glass-panel border border-white/60 dark:border-slate-700/60 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pathologist on Duty</span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {profile.doctorName}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <PhoneCall className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{profile.address}</span>
            </div>
          </div>
          <div className="text-[10px] text-center text-slate-400 font-medium">
            Raza Clinical Laboratory • LIS 2.0
          </div>
        </div>
      </aside>
    </>
  );
};
