import React from "react";

const HeaderWrapper = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {children}
      </div>
    </header>
  );
};

export default HeaderWrapper;
