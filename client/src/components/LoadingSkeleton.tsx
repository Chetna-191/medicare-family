import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm animate-pulse flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="w-16 h-3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-16 h-6 bg-slate-200 rounded-full" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="w-full h-3 bg-slate-100 rounded" />
              <div className="w-3/4 h-3 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-5 flex justify-between items-center">
            <div className="w-20 h-4 bg-slate-200 rounded" />
            <div className="w-24 h-8 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="w-32 h-5 bg-slate-200 rounded" />
        <div className="w-24 h-4 bg-slate-100 rounded" />
      </div>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="w-28 h-4 bg-slate-200 rounded" />
          </div>
          <div className="w-20 h-4 bg-slate-100 rounded" />
          <div className="w-16 h-6 bg-slate-200 rounded-full" />
        </div>
      ))}
    </div>
  );
};
