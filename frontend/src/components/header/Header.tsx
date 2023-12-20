import { AppBar, Avatar, Box, Tab, Tabs, Typography } from "@mui/material";
import { useHeader } from "@/hooks/header/useHeader";
import { UpdatePopover } from "../Popover/UpdatePopover";
import { useUpdatePopover } from "@/hooks/Popover/useUpdatePopover";

export default function Header() {
  const { avatarURL } = useHeader();
  const {
    getAnchorEl,
    isOpenUpdatePopover,
    handleSortButtonClick,
    userName,
    email,
    handleOpenPopover,
    isDisplayAvatar
  } = useHeader();

  return (
    <>
      <Box>
        <AppBar position="static" className="bg-header_color">
          <Box className="flex items-center justify-between flex-wrap p-1">
            <Typography className="my-1 text-2xl md:text-4xl ml-5">
              TODOアプリケーション
            </Typography>
            <Box className="flex items-center">
              {isDisplayAvatar && (
                <Avatar
                  alt="アバター画像"
                  src={avatarURL}
                  className="w-14 h-14 my-1 cursor-pointer"
                  onClick={handleOpenPopover}
                />
              )}
            </Box>
          </Box>
        </AppBar>
      </Box>
      <UpdatePopover
        anchorEl={getAnchorEl()}
        onClose={() => { handleSortButtonClick(); }}
        open={isOpenUpdatePopover()}
        userName={userName}
        email={email}
      />
    </>
  );
}