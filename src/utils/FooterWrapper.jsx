import React from "react";

const FooterWrapper = ({ children }) => {
  return (
    <footer className="sticky bottom-0 z-40 bg-white shadow-inner">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {children}
      </div>
    </footer>
  );
};

export default FooterWrapper;
