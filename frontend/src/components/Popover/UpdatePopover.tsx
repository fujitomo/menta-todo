import React from "react";
import { Popover, Typography, List, ListItem, ListItemText, Button, Box } from "@mui/material";
import { useUpdatePopover } from "@/hooks/Popover/useUpdatePopover";

interface UpdatePopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
  userName: string;
  email: string;
}

export const UpdatePopover: React.FC<UpdatePopoverProps> = ({ anchorEl, onClose, open, userName, email }) => {
  const {
    handleItemClick,
    handleLogout
  } = useUpdatePopover();

  // 並び替え条件の項目を配列として定義します
  const updateOptions = [
    { label: "メールアドレス変更", value: "updateEmail" },
    { label: "ログインパスワード変更", value: "updatePassword" },
    { label: "プロフィール登録・変更", value: "profile" },
  ];

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Typography className="text-4xl">{userName}</Typography>
      <Typography className="pl-2 pt-1">{email}</Typography>
      <List>
        {updateOptions.map((option) => (
          <ListItem key={option.value} onClick={() => handleItemClick(option.value, onClose)} className="hover:bg-gray-100">
            <ListItemText primary={option.label} className="cursor-pointer" />
          </ListItem>
        ))}
      </List>
      <Box className="flex justify-end">
        <Button
          className="app-button w-28 text-sm"
          variant="contained"
          onClick={() => handleLogout(onClose)}
          component="button"
        >
          ログアウト
        </Button>
      </Box>
    </Popover>
  );
};