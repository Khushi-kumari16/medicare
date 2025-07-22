import React from "react";
import AppHeader from "./_components/AppHeader";

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="px-10 md:px-20 lg:px-40">
      {/* You can wrap this with header/sidebar if needed */}
      <AppHeader/>
      {children}
    </div>
  );
}

export default DashboardLayout;
