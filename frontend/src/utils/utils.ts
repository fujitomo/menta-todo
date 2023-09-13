import { useAPIAuth } from "../hooks/apis/useAPIAuth";

//サーバーサイドのみで使用可能
export const checkLogin = async (
    accessToken: string | undefined,
    refreshToken: string | undefined
) => {
    const { getProfile } = useAPIAuth();

    try {
        const response = await getProfile(accessToken, refreshToken);
        let newtoken = response?.headers["newtoken"]
        console.log("newtoken:", newtoken);

        return {
            isLogin: response?.status === 200 || response?.status === 404,
            newToken: newtoken
        };
    } catch (error) {
        // エラー処理（例：ログインページに遷移）
        return {
            isLogin: false,
            newToken: null
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