import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface ConfirmDialogProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  content: string;
  confirmAction: () => void;
  isCancel?: boolean;
}

function ConfirmDialog({ open, handleClose, title, content, confirmAction }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={confirmAction} color="success" autoFocus>
          確認
        </Button>
        <Button onClick={handleClose} color="success">
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;