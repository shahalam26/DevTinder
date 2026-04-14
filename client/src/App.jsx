import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from 'react-hot-toast';

import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";

import Body from "./layout/Body";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Forgot = lazy(() => import("./pages/Forgot"));
const Feed = lazy(() => import("./pages/Feed"));
const Profile = lazy(() => import("./pages/Profile"));
const Requests = lazy(() => import("./pages/Requests"));
const Matches = lazy(() => import("./pages/Matches"));
const ChatsList = lazy(() => import("./pages/ChatsList"));
const Chat = lazy(() => import("./pages/Chat"));
const ChatLayout = lazy(() => import("./pages/ChatLayout"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
import { SocketProvider } from "./utils/SocketContext";

import api from "./utils/api";

function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get("/me");
        setAuth(true);
        setUser(res.data);
      } catch {
        setAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const refreshAuth = async () => {
    try {
      const res = await api.get("/me");
      setAuth(true);
      setUser(res.data);
      return res.data;
    } catch {
      setAuth(false);
      setUser(null);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } finally {
      setAuth(false);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-slate-600 dark:text-slate-300">
        Loading your workspace...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Suspense fallback={<Loader />}>
          <Routes>
        {/* PUBLIC */}
        <Route
          path="/"
          element={
            !auth ? (
              <Landing user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/feed" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            !auth ? (
              <Login refreshAuth={refreshAuth} />
            ) : (
              <Navigate to="/feed" replace />
            )
          }
        />

        <Route
          path="/signup"
          element={!auth ? <Signup refreshAuth={refreshAuth} /> : <Navigate to="/feed" replace />}
        />

        <Route
          path="/forgot"
          element={!auth ? <Forgot /> : <Navigate to="/feed" replace />}
        />



        {/* PROTECTED LAYOUT */}
        <Route
          path="/"
          element={
            auth ? (
              <SocketProvider user={user}>
                <Body user={user} setUser={setUser} onLogout={handleLogout} />
              </SocketProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="feed" element={<Feed />} />
          <Route path="profile" element={<Profile />} />
          <Route path="requests" element={<Requests />} />
          <Route path="matches" element={<Matches />} />
          <Route path="chats" element={<ChatLayout user={user} />}>
             <Route path=":targetUserId" element={<Chat user={user} />} />
          </Route>
          <Route path="user/:userId" element={<UserProfile />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
