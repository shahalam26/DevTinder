import React from "react";

const Shimmer = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16 px-4 pb-12 flex flex-col">
      {/* Navbar Skeleton (fixed top) */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 w-full max-w-4xl mx-auto mt-8">
        {/* User Card Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 w-full mb-8 relative overflow-hidden">
          {/* Shimmer Effect overlay */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse shrink-0"></div>
            
            <div className="space-y-4 flex-1 w-full text-center md:text-left">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3 mx-auto md:mx-0 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto md:mx-0 animate-pulse"></div>
              
              <div className="flex gap-3 justify-center md:justify-start mt-6">
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 space-y-3 relative z-10">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Shimmer;
