import React, { ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useMessageSnackbar } from '@/hooks/MessageParts/useMessageSnackbar';

type MessageSnackbarProps = {
  open: boolean;
  autoHideDuration: number | null;
  onClose: () => void;
  children: ReactNode; // 子要素を受け取るための型
};

export const MessageSnackbar: React.FC<MessageSnackbarProps> = ({ open, autoHideDuration, children }) => {

  const {
    handleCloseSnackbar
  } = useMessageSnackbar();

  //メッセージに\nがあれば改行する
  const formatMessage = (message: ReactNode) => {
    if (typeof message === 'string') {
      return message.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
    }
    return message;
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={autoHideDuration}
      onClose={handleCloseSnackbar}
    >
      <Alert
        severity="error"
        className="bg-red-400 text-white"
        onClose={handleCloseSnackbar}
      >
        <Typography>
          {formatMessage(children)}
        </Typography>
      </Alert>
    </Snackbar>
  );
};