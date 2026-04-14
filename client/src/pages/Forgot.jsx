import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const Forgot = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    emailId: "",
    otp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
       await api.post("/send-otp", { emailId: form.emailId, type: "forgot" });
       toast.success("Verification code sent to email!");
       setStep(2);
    } catch (err) {
       const errorMsg = err?.response?.data?.errors?.[0] || err?.response?.data?.message || "Failed to send OTP";
       toast.error(errorMsg);
    } finally {
       setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/forgot-password", form);
      toast.success(res.data.message || "Password updated! You can now log in.");
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Failed to reset password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-section flex items-center justify-center px-4 py-12">
      <div className="page-card w-full max-w-md p-8">
          <>
            <h2 className="page-title mb-2 text-center">
              {step === 1 ? "Forgot Password 🔒" : "Verify & Reset 🔑"}
            </h2>
            <p className="page-subtitle mb-6 text-center">
              {step === 1 ? "Enter your email to receive a password reset code." : `We sent a 6-digit code to ${form.emailId}.`}
            </p>

            <form className="space-y-5" onSubmit={step === 1 ? handleSendOtp : handleResetPassword}>
              
              {step === 1 && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      Registered Email
                    </label>
                    <input
                      name="emailId"
                      type="email"
                      value={form.emailId}
                      onChange={handleChange}
                      placeholder="satoshi@bitcoin.org"
                      className="field-input w-full"
                      required
                      autoFocus
                    />
                  </div>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                        6-Digit OTP Code
                    </label>
                    <input
                        name="otp"
                        type="text"
                        maxLength="6"
                        value={form.otp}
                        onChange={handleChange}
                        placeholder="123456"
                        className="field-input w-full text-center text-2xl tracking-[0.5em] font-mono mb-4"
                        required
                        autoFocus
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                      New Password
                    </label>
                    <input
                      name="newPassword"
                      type="password"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="field-input w-full"
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="text-center mt-3">
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          Use a different email
                      </button>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="primary-button w-full disabled:opacity-50">
                {loading ? "Please wait..." : (step === 1 ? "Send Reset Code" : "Update Password")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-400">
                Login
              </Link>
            </p>
          </>
      </div>
    </div>
  );
};

export default Forgot;
