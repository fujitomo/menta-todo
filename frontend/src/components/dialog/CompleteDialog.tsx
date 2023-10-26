import {
    Button,
    Dialog,
    DialogActions} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import { useCompleteDialog } from "@/hooks/dialog/useCompleteDialog";

export function CompleteDialog() {
    const {
        onSubmitCompleteClose,
        isOpenCompleteModal
    } = useCompleteDialog();

    return (
        <Dialog
            open={isOpenCompleteModal()}
            className="pointer-events-none"
            disableEnforceFocus={false}
        >
            <DialogTitle>ユーザー登録・認証完了</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    ユーザー登録・認証が完了しました。<br />
                    次回よりログイン画面からログインして下さい。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    className="pointer-events-auto bg-[#B29649] hover:bg-[#B29649]  font-base text-black font-bold rounded"
                    onClick={onSubmitCompleteClose}
                >
                    閉じる
                </Button>
            </DialogActions>
        </Dialog>
    );
}