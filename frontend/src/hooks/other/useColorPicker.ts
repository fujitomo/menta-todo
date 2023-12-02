// hooks/useSignUpForm.js
import { useEffect, useState } from "react";

export const useColorPicker = (value?: string) => {
  const [color, setColor] = useState('#FFFFFF');
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  // value プロップスが変更された場合に color を更新
  useEffect(() => {
    if (value) {
      handleChangeComplete({ hex: value });
    }
  }, [value]);

  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeComplete = (color: { hex: React.SetStateAction<string>; }) => {
    console.log(color)
    setColor(color.hex);
    handleClose();
  };

  return {
    color,
    handleClick,
    handleClose,
    handleChangeComplete,
    anchorEl
  };
};
