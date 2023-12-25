import { AppBar, Avatar, Box, Typography } from "@mui/material";
import { useHeader } from "@/hooks/header/useHeader";
import { UpdatePopover } from "../Popover/UpdatePopover";

export default function Header() {
  const {
    getAnchorEl,
    isOpenUpdatePopover,
    handleSortButtonClick,
    handleOpenPopover,
    isDisplayAvatar,
    recoilProfileValues
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
                  src={recoilProfileValues.attachmentURL}
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
        userName={recoilProfileValues.userName}
        email={recoilProfileValues.email}
      />
    </>
  );
}