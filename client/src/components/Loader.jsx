import React from "react";

const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="flex flex-col items-center space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-lg font-medium text-base-content/80 animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
