import React, { FC, ReactNode } from "react";
import Header from "@/components/landing-page/Header";

interface HomeLayoutProps {
  children: ReactNode;
}
const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default HomeLayout;
