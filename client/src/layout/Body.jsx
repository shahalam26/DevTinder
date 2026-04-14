import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Body = ({ user, setUser, onLogout }) => {
  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={onLogout} />
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <Outlet context={{ user, setUser }} />
      </div>
    </div>
  );
};

export default Body;
