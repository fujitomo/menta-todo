// hooks/useSignUpForm.js
import { useEffect, useState } from "react";
import { useAPI } from "@/hooks/useAPI";
import Cookies from "js-cookie";
import { Profile } from "@/types/profile";
import { useRecoilValue } from "recoil";
import { displayAvatar } from '@/recoilAtoms/recoilState';

export const useHeader = () => {
  const [avatarURL, setAvatarURL] = useState("/images/avatar.png");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isUpdatePopover, setUpdatePopover] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const isDisplayAvatar = useRecoilValue(displayAvatar);

  // API関連の処理を行うカスタムフック
  const { getProfile } = useAPI();

  const getAnchorEl = () => {
    return anchorEl;
  };

  const handleSortButtonClick = () => {
    // ポップオーバーを閉じる
    setUpdatePopover(false);
  };

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setUpdatePopover(!isUpdatePopover);
    setAnchorEl(event.currentTarget);
  };

  const isOpenUpdatePopover = () => {
    return isUpdatePopover;
  };

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    if (accessToken !== undefined || refreshToken !== undefined) {
      const fetchData = async () => {
        const profile: Profile | { data: null; message: string } | null | undefined = await getProfile(accessToken, refreshToken);
        return profile;
      };

      fetchData().then(async (profileData) => {
        if (profileData && profileData.attachment) {
          setAvatarURL(window.URL.createObjectURL(profileData.attachment));
          setUserName(profileData.userName);
          setEmail(profileData.email ? profileData.email : "");
        }
      });
    }
  }, []);

  return {
    avatarURL,
    getAnchorEl,
    userName,
    email,
    isOpenUpdatePopover,
    handleSortButtonClick,
    handleOpenPopover,
    isDisplayAvatar
  };
};

