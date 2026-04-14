import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const Login = ({ refreshAuth }) => {
  const navigate = useNavigate();

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
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Password
            </label>
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
