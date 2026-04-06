import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Body = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">

      {/* Navbar */}
      <Navbar />

      {/* Page content */}
      <div className="pt-20 flex justify-center">
        <Outlet />
      </div>

    </div>
  );
};

export default Body;