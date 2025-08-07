import React from 'react';
// import Navigation from './Navigation';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      {/* <Navigation /> */}
    </div>
  );
};

export default Layout;
