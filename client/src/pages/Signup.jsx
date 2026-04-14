import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const Signup = ({ refreshAuth }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/signup", form);
      await refreshAuth?.();
      toast.success(res.data.message || "Account created! Welcome 🚀");
      navigate("/feed");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data ||
        "Signup failed";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="page-section flex items-center justify-center px-4 py-12">
      <div className="page-card w-full max-w-md p-8">

          <>
            <h2 className="page-title mb-2 text-center">
              Create Account 🚀
            </h2>
            <p className="page-subtitle mb-6 text-center">
              Set up your profile and start discovering developers nearby.
            </p>

            <form className="space-y-5" onSubmit={handleSignup}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Satoshi"
                  className="field-input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Nakamoto"
                  className="field-input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email
                </label>
                <input
                  name="emailId"
                  type="email"
                  value={form.emailId}
                  onChange={handleChange}
                  placeholder="satoshi@bitcoin.org"
                  className="field-input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="field-input w-full"
                />
              </div>

              <button type="submit" className="primary-button w-full">
                Sign Up
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-400">
                Login
              </Link>
            </p>
          </>
      </div>
    </div>
  );
};

export default Signup;
