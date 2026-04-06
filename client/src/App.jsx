import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Body from "./layout/Body";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";

function App() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios to always send cookies
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Change the URL to your actual backend URL
        await axios.get("http://localhost:4000/viewProfile");
        setAuth(true);
      } catch  {
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={!auth ? <Landing /> : <Navigate to="/feed" replace />}
        />
        
        {/* Login - Pass setAuth so Login.js can update App state */}
        <Route
          path="/login"
          element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/feed" replace />}
        />

        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/feed"
          element={auth ? <Body /> : <Navigate to="/" replace />}
        >
          <Route index element={<Feed />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;