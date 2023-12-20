import { Box } from "@mui/material";
import React, { ReactNode } from "react";
import Header from "../header/Header";
import { MessageSnackbar } from "../MessageParts/MessageSnackbar";
import { State, notificationsState } from "@/recoilAtoms/recoilState";
import { useNotifications } from "@/hooks/useNotifications";
import { useRecoilValue } from "recoil";
import { useMessageSnackbar } from "@/hooks/MessageParts/useMessageSnackbar";

import 'dayjs/locale/ja';

type Props = {
  children: ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const notification = useRecoilValue(notificationsState);
  const notifications = useNotifications();
  const { handleCloseSnackbar } = useMessageSnackbar();
  return (
    <Box className="min-h-screen w-full bg-base_color">
      <Header />
      <Box component="main">
        <React.Fragment>{children}</React.Fragment>
        <MessageSnackbar
          open={notification.state === State.ERROR || notification.state === State.ERROR2}
          autoHideDuration={notifications.closeTimer()}
          onClose={handleCloseSnackbar}
        >
          {notifications.message()}
        </MessageSnackbar>
      </Box >
    </Box>
  );
};

export default MainLayout;
