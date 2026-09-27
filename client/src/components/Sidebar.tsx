import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Users, Pill, TrendingUp, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Daily Schedule', icon: Calendar, exact: true },
    { to: '/members', label: 'Family Members', icon: Users },
    { to: '/medicines', label: 'All Medicines', icon: Pill },
    { to: '/adherence', label: 'Adherence Hub', icon: TrendingUp, badge: 'Insights' },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-[#0F766E] rounded-3xl border border-teal-800/80 p-3.5 shadow-md sticky top-20 text-white">
        <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2A9D8F] text-white shadow-md shadow-black/10 border border-teal-400/30'
                      : 'text-teal-100 hover:text-white hover:bg-teal-800/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-200'}`} />
                    <span className="flex-1">{link.label}</span>
                    {link.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-teal-900/50 text-white border border-teal-400/40'
                            : 'bg-teal-800 text-teal-200 border border-teal-600/40'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Health Tip Widget */}
        <div className="hidden md:block mt-6 p-4 rounded-2xl bg-teal-800/70 border border-teal-600/40 text-xs text-teal-100">
          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Smart Medication Tip
          </div>
          <p className="text-teal-100/90 leading-relaxed text-[11px]">
            Keep a consistent routine. Taking daily doses at the same time increases overall treatment efficacy by up to 35%.
          </p>
        </div>
      </div>
    </aside>
  );
};
