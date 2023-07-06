import { Token, User } from "@/types/auth";
import axios, { AxiosResponse } from "axios";

export const useAPIAuth = () => {
  const createUser = async (
    rootUrl: string | undefined,
    user: User
  ): Promise<AxiosResponse<Token> | undefined> => {
    try {
      const url = `${rootUrl}/auth/create_account`;
      const response = await axios.post(url, user);
      return response;
    } catch (error: any) {
      if (error.response) {
        // ステータスコードを返す
        console.log("エラー", error.response);
        return error.response;
      }
      return undefined;
    }
  };

  const emailAuthentication = async (
    rootUrl: string | undefined,
    onetimePassword: string
  ): Promise<AxiosResponse<any, any> | undefined> => {
    try {
      const url = `${rootUrl}/auth/email_authentication`;
      console.log(url);
      const accessToken = localStorage.getItem("accessToken");
      console.log(accessToken);
      const params = {
        onetimepassword: onetimePassword,
      };

      const response = await axios.post(url, params, {
        headers: {
          accesstoken: accessToken,
        },
      });
      return response;
    } catch (error: any) {
      if (error.response) {
        // ステータスコードを返す
        console.log(error.response.status);
        return error.response.status;
      }
      return undefined;
    }
  };

  return { createUser, emailAuthentication };
};
