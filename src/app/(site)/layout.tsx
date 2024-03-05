import React, { FC, ReactNode } from "react";

interface HomeLayoutProps {
  children: ReactNode;
}
const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default HomeLayout;
