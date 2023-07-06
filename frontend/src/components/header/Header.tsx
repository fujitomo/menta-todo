import { useContext, useState } from "react";

import { AppBar, Box, Tabs, Typography } from "@mui/material";
import { LoginContext } from "../shared/LoginProvider";
import styles from "./Header.module.css";

//ヘッダー色はTailwindCSSでは変更できないので、makeStylesを使用
// const useStyles = makeStyles((theme) => ({
//   appBar: {
//     backgroundColor: "#CDA16F", // 背景色を指定
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: "0 20px", // 左右に余白を設定
//     height: "80px",
//   },
// }));

export default function Header() {
  const [value, setValue] = useState(0);
  const { login } = useContext(LoginContext);
  // const navigate = useNavigate();
  // useEffect(() => {
  //   var localLogin = localStorage.getItem("login");
  //   if (localLogin || login) {
  //     navigate("/");
  //   }
  // }, [login, navigate]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  // const classes = useStyles();

  return (
    <Box>
      <AppBar position="static" className={styles.appBar}>
        <Typography className="h-10 pt-5 text-4xl">
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
