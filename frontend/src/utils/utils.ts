import axios from "axios";


//サーバーサイドのみで使用可能
export const checkLogin = async (
    accessToken: string | undefined,
    refreshToken: string | undefined
) => {
    try {
        const url = `${process.env.NEXT_PUBLIC_APIROOT}/auth/get_profile/`;
        const headers = {
            Authorization: "Bearer " + accessToken,
            "refreshtoken": refreshToken
        };
        //サーバーサイドではカスタムフックが使用できないのでaxiosで取得
        const response = await axios.get(url, { headers });
        let newtoken = response?.headers["newtoken"]
        console.log("newtoken:", newtoken);

        return {
            isLogin: response?.status === 200,
            isProfile: true,
            newToken: newtoken
        };
    } catch (error: any) {
        // エラー処理（例：ログインページに遷移）
        return {
            isLogin: error.response?.status === 404,
            isProfile: false,
            newToken: error.response?.headers["newtoken"]
        };
    }
};

export const redirectToLogin = () => {
    return {
        redirect: {
            destination: '/Login',
            permanent: false,
        },
    };
};

export const redirectToProfile = () => {
    return {
        redirect: {
            destination: '/Profile',
            permanent: false,
        },
    };
};

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月を2桁の文字列に変換
    const day = String(date.getDate()).padStart(2, '0'); // 日を2桁の文字列に変換
    return `${year}/${month}/${day}`;
}

export const EXISTENCE_OPTIONS = [
    { label: "", value: undefined },
    { label: "有り", value: true },
    { label: '無し', value: false },
  ];

export const STATE_ATTACHMENTS = [
    { label: "保留", value: "保留" },
    { label: "作業中", value: "作業中" },
    { label: "完了", value: "完了" },
    { label: "待機中", value: "待機中" },
  ];

export  const TAGS = [
    { name: '仕事' },
    { name: '遊び' },
    { name: '勉強' },
  ];
