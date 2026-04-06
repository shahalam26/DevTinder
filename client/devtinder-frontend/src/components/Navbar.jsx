import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { isLoggedIn, logoutUser } from "../utils/auth";

export default function Navbar() {
  const auth = isLoggedIn();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md 
      bg-black/40 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-pink-500 text-xl">❤</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            DevTinder
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">

          {auth ? (
            <>
              <Link to="/feed" className="text-gray-300 hover:text-white">Feed</Link>
              <span className="text-gray-300">Requests</span>
              <span className="text-gray-300">Matches</span>
              <span className="text-gray-300">Chat</span>
              <Link to="/feed/profile" className="text-gray-300 hover:text-white">Profile</Link>

              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />

              <Link to="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>

              <Link
                to="/signup"
                className="px-5 py-2 rounded-full
                bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              >
                Get Started
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}