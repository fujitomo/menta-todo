import { useState } from "react";

import { AppBar, Box, Tabs, Typography } from "@mui/material";

export default function Header() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <AppBar position="static" className="bg-header_color">
        <Typography className="h-10 p-5 text-4xl">
          TODOアプリケーション
        </Typography>
        <Tabs
          className="{styles.selectEmpty}"
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        ></Tabs>
      </AppBar>
    </Box>
  );
}
