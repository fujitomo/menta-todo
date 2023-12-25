// hooks/useSignUpForm.js
import { useEffect, useState } from "react";
import { useAPI } from "@/hooks/useAPI";
import Cookies from "js-cookie";
import { Profile, displayAvatar, profileValues } from '@/recoilAtoms/recoilState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Profile as typeProfile } from "@/types/profile";

export const useHeader = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isUpdatePopover, setUpdatePopover] = useState(false);
  const setProfileValues = useSetRecoilState(profileValues);
  const recoilProfileValues = useRecoilValue(profileValues);

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
        const profile: typeProfile | { data: null; message: string } | null | undefined = await getProfile(accessToken, refreshToken);
        return profile;
      };


      fetchData().then(async (profileData) => {
        if (profileData) {
          const values: Profile = {
            attachmentURL: window.URL.createObjectURL(profileData.attachment? profileData.attachment : new Blob()),
            userName: profileData.userName,
            email: profileData.email ? profileData.email : ""
          }
           console.log("test2", profileData);
          setProfileValues(values);
        }
      });
    }
  }, []);

  return {
    getAnchorEl,
    isOpenUpdatePopover,
    handleSortButtonClick,
    handleOpenPopover,
    isDisplayAvatar,
    recoilProfileValues
  };
};

