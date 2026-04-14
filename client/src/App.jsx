import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';

import Body from "./layout/Body";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Matches from "./pages/Matches";
import ChatsList from "./pages/ChatsList";
import Chat from "./pages/Chat";
import ChatLayout from "./pages/ChatLayout";
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
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
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



        {/* PROTECTED LAYOUT */}
        <Route
          path="/"
          element={
            auth ? (
              <SocketProvider user={user}>
                <Body user={user} onLogout={handleLogout} />
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
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
