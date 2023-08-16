import { Box } from "@mui/material";
import React, { ReactNode } from "react";
import Header from "../header/Header";

type Props = {
  children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <Box className="h-screen w-full bg-base_color">
      <Header />
      <Box component="main">
        {/* TODO <React.Fragmentで囲む理由（外すとエラーになる） */}
        <React.Fragment>{children}</React.Fragment>
      </Box >
    </Box>
  );
};

export default MainLayout;
