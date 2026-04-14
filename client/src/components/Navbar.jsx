import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../utils/SocketContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const socketCtx = useSocket();
  const unreadCount = socketCtx ? socketCtx.globalUnreadCount : 0;

  const handleLogout = async () => {
    try {
      await onLogout?.();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-pink-600 font-semibold bg-pink-50/80 dark:text-pink-400 dark:bg-pink-500/10 shadow-sm"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 font-medium transition-all duration-200";

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/60">
        <div className="mx-auto flex relative w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(user ? "/feed" : "/")}
          >
            <span className="text-pink-500 text-2xl">❤</span>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent hidden sm:block">
              DevTinder
            </h1>
          </div>

          {/* Centered Desktop Links */}
          {user && (
            <div className="hidden absolute left-1/2 -translate-x-1/2 items-center p-1 space-x-1 border border-slate-200/50 bg-slate-50/50 rounded-full dark:border-slate-700/50 dark:bg-slate-900/50 md:flex">
              <Link to="/feed" className={`rounded-full px-5 py-1.5 text-sm ${isActive("/feed")}`}>Feed</Link>
              <Link to="/requests" className={`rounded-full px-5 py-1.5 text-sm ${isActive("/requests")}`}>Requests</Link>
              <Link to="/matches" className={`rounded-full px-5 py-1.5 text-sm ${isActive("/matches")}`}>Matches</Link>
              <Link to="/chats" className={`relative rounded-full px-5 py-1.5 text-sm ${isActive("/chats")}`}>
                Chats
                {unreadCount > 0 && (
                   <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                     {unreadCount}
                   </span>
                )}
              </Link>
            </div>
          )}

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {!user ? (
              <>
                <ThemeToggle />
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <ThemeToggle />

                {/* Profile Circle Avatar */}
                <Link
                  to="/profile"
                  className="h-10 w-10 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-transparent bg-gradient-to-tr from-pink-500 to-violet-500 text-white shadow-sm transition-all hover:scale-105 hover:border-pink-300 dark:hover:border-pink-500"
                >
                  {user.photourl ? (
                    <img src={user.photourl} alt="profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold">
                      {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </Link>

                {/* Minimal Logout Icon Button for Desktop */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden md:flex ml-1 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200/80 bg-white/90 backdrop-blur-lg pb-safe-area dark:border-slate-800/80 dark:bg-slate-950/90 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Link to="/feed" className={`flex flex-col items-center justify-center flex-1 py-3 text-xs ${isActive("/feed").includes("text-pink") ? "text-pink-600 dark:text-pink-400" : "text-slate-500 dark:text-slate-400"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="font-medium">Feed</span>
          </Link>
          <Link to="/requests" className={`flex flex-col items-center justify-center flex-1 py-3 text-xs ${isActive("/requests").includes("text-pink") ? "text-pink-600 dark:text-pink-400" : "text-slate-500 dark:text-slate-400"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="font-medium">Reqs</span>
          </Link>
          <Link to="/matches" className={`flex flex-col items-center justify-center flex-1 py-3 text-xs ${isActive("/matches").includes("text-pink") ? "text-pink-600 dark:text-pink-400" : "text-slate-500 dark:text-slate-400"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">Matches</span>
          </Link>
          <Link to="/chats" className={`flex flex-col items-center justify-center flex-1 py-3 text-xs ${isActive("/chats").includes("text-pink") ? "text-pink-600 dark:text-pink-400" : "text-slate-500 dark:text-slate-400"}`}>
            <div className="relative mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="font-medium">Chats</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center flex-1 py-3 text-xs text-rose-500 dark:text-rose-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </>
  );
}
