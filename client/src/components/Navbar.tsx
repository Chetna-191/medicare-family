import React from 'react';
import { HeartPulse, Plus, UserPlus, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenAddMember: () => void;
  onOpenAddMedicine: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddMember,
  onOpenAddMedicine,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0F766E] border-b border-teal-900/40 px-4 sm:px-8 py-3.5 shadow-md transition-all text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#2A9D8F] text-white flex items-center justify-center shadow-md shadow-black/10 border border-teal-400/30 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-lg">
                MediCare
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-800 text-teal-100 border border-teal-500/40">
                Family
              </span>
            </div>
            <p className="text-[10px] text-teal-100/90 font-medium hidden sm:block">
              Medicine Reminder & Schedule Hub
            </p>
          </div>
        </Link>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Action: Add Medicine */}
          <button
            onClick={onOpenAddMedicine}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2A9D8F] hover:bg-[#238276] text-white shadow-md shadow-black/10 border border-teal-400/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>

          {/* Quick Action: Add Member */}
          <button
            onClick={onOpenAddMember}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-800/80 hover:bg-teal-800 text-teal-50 border border-teal-600/50 shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-teal-200" />
            <span className="hidden md:inline">Add Member</span>
          </button>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-teal-600/50">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Family Account'}
              </div>
              <div className="text-[10px] text-teal-200 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-300" />
                {user?.email}
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-teal-200 hover:text-white hover:bg-teal-800/90 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
