import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const Login = ({ refreshAuth }) => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await api.post("/login", {
        emailId,
        password,
      });

      await refreshAuth?.();
      toast.success("Login successful 🚀");
      navigate("/feed");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Login failed";

      toast.error(errorMsg);
    }
  };



  return (
    <div className="page-section flex items-center justify-center px-4 py-12">
      <div className="page-card w-full max-w-md p-8">
        <h2 className="page-title mb-2 text-center text-slate-900 dark:text-white pb-3">
          Welcome Back 👋
        </h2>
        <p className="page-subtitle mb-6 text-center">
          Log in to continue exploring developers and matches.
        </p>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              className="field-input w-full"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="satoshi@bitcoin.org"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot" className="text-xs font-semibold text-pink-500 hover:text-pink-400">
                  Forgot password?
                </Link>
            </div>
            <input
              type="password"
              className="field-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button w-full"
          >
            Login
          </button>
        </form>



        <div className="relative mt-6 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a href={`${apiUrl}/auth/github`} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#24292e] dark:bg-white text-white dark:text-[#24292e] px-4 py-2.5 text-sm font-medium transition hover:opacity-90">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
          <a href={`${apiUrl}/auth/google`} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </a>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-pink-500 hover:text-pink-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
