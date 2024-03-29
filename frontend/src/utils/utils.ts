import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { parse } from "cookie";
import 'dayjs/locale/ja'; // 日本語のロケールをインポート

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

export async function loginCheckRedirect(context: GetServerSidePropsContext){
    const { req, res } = context;
    try {
      const cookies = parse(req.headers.cookie || '');
      const { isLogin, newToken } = await checkLogin(cookies.accessToken, cookies.refreshToken);

      if (!isLogin) return redirectToLogin();

      if (newToken) {
        res.setHeader('Set-Cookie', `accessToken=${newToken}; Path=/; HttpOnly; Secure`);
      }

      return { props: {} };
    } catch (err) {
      return redirectToLogin();
    }
  }

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

/**
 * 指定された日付（文字列またはDateオブジェクト）をフォーマットして文字列で返す。
 * 日付が無効な場合はundefinedを返す。
 * 
 * @param {string | Date | undefined | null} date - フォーマットする日付
 * @param {string} separator - 日付の区切り文字（デフォルトは"/"）
 * @return {string | undefined} フォーマットされた日付文字列またはundefined
 */
export const formatDate = (date: string | Date | undefined | null, separator = "/"): string | undefined => {
    if (!date) return undefined;

    let dateObj: Date;

    if (typeof date === 'string') {
        const parts = date.split('-').map(part => parseInt(part, 10));
        // 月は0から始まるため、1を引く
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        // 無効な日付の場合はundefinedを返す
        if (isNaN(dateObj.getTime())) {
            return undefined;
        }
    } else {
        dateObj = date;
    }

    const padZero = (num: number): string => String(num).padStart(2, '0');

    const year = dateObj.getFullYear();
    const month = padZero(dateObj.getMonth() + 1); // 月を2桁の文字列に変換
    const day = padZero(dateObj.getDate()); // 日を2桁の文字列に変換

    return `${year}${separator}${month}${separator}${day}`;
}

export const downloadAttachment = async (url: string): Promise<File | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('ファイルのダウンロードに失敗しました');
        }
        const blob = await response.blob();
        return new File([blob], url, { type: blob.type });
    } catch (error) {
        console.error('添付ファイルのダウンロード中にエラーが発生しました:', error);
        return null;
    }
};

export const downloadAllAttachments = async (attachments: string[]): Promise<File[]> => {
    try {
        // すべての添付ファイルに対してダウンロード関数を呼び出す
        const downloadPromises = attachments.map(url => downloadAttachment(url));

        // すべてのダウンロード処理が完了するのを待つ
        const files = await Promise.all(downloadPromises);

        // nullを除外して、Fileオブジェクトのみの配列を返す
        return files.filter(file => file !== null) as File[];
    } catch (error) {
        console.error('添付ファイルのダウンロード中にエラーが発生しました:', error);
        return [];
    }
};

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