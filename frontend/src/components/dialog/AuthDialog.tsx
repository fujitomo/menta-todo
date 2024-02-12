import {
  Box,
  Dialog,
  DialogActions,
  TextField
} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useAuthDialog } from "@/hooks/dialog/useAuthDialog";
import { EMAIL_MODE } from "@/recoilAtoms/recoilState";

interface AuthDialogProps {
  emailMode: EMAIL_MODE;
  newEmail?: string;
}

export function AuthModal({ emailMode, newEmail }: AuthDialogProps) {

  const {
    register,
    handleSubmit,
    errors,
    notifications,
    onSubmitEmailAuthentication,
    handleCloseAuthModal,
    isOpenAuthModal
  } = useAuthDialog(emailMode, newEmail);

  return (
    <Dialog
      open={isOpenAuthModal()}
      onClose={handleCloseAuthModal}
      className="pointer-events-none z-{1000}"
    >
      <DialogTitle>ワンタイムパスワード入力</DialogTitle>
      <DialogContent>
        <DialogContentText>
          メールアドレスに届いたパスワードを入力して下さい。
        </DialogContentText>
        <TextField
          className="pointer-events-auto"
          autoFocus
          required
          margin="dense"
          fullWidth
          id="onetimepassword"
          label="ワンタイムパスワード"
          variant="standard"
          type="onetimepassword"
          {...register("onetimepassword")}
          error={"onetimepassword" in errors}
          helperText={
            <Box component="span" className="text-base text-red-500">
              {typeof errors.onetimepassword?.message === 'string' && <span>{errors.onetimepassword.message}</span>}
            </Box>
          }
          disabled={notifications.isLoading()}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
          loading={notifications.isLoading()}
          onClick={handleSubmit(onSubmitEmailAuthentication)}
        >
          実行
        </LoadingButton>
        <LoadingButton
          className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
          onClick={handleCloseAuthModal}
          loading={notifications.isLoading()}
        >
          閉じる
        </LoadingButton>
      </DialogActions>
    </Dialog >
  );
}