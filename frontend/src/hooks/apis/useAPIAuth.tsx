import { Token, User } from "@/types/auth";
import { Todo } from "@/types/todos";
import axios, { AxiosResponse } from "axios";

// const axiosInstance = axios.create({
//   withCredentials: true,
// });

const handleResponse = (error: any): AxiosResponse<Token> | undefined => {
  if (error.response) {
    return error.response;
  }
  return undefined;
};

export const useAPIAuth = () => {
  const createUser = async (
    user: User
  ): Promise<AxiosResponse<Token> | undefined> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APIROOT}/auth/create_account`;
      return await axios.post(url, user);
    } catch (error: any) {
      return handleResponse(error);
    }
  };

  const emailAuthentication = async (
    accessToken: string | undefined,
    onetimePassword: string
  ): Promise<AxiosResponse<Token> | undefined> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APIROOT}/auth/email_authentication`;
      const headers = {
        Authorization: "Bearer " + accessToken
      };

      const response = await axios.post(url, { onetimepassword: onetimePassword }, { headers });
      return response;
    } catch (error: any) {
      return handleResponse(error);
    }
  };

  const login = async (
    user: User
  ): Promise<AxiosResponse<Token> | undefined> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APIROOT}/auth/login`;
      const response = await axios.post(url, { email: user.email, password: user.password });
      return response;
    } catch (error: any) {
      return handleResponse(error);
    }
  };

  const getProfile = async (
    accessToken: string | undefined,
    refreshToken: string | undefined
  ): Promise<AxiosResponse<Token> | undefined> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APIROOT}/auth/get_profile`;
      const headers = {
        Authorization: "Bearer " + accessToken,
        "refreshtoken": refreshToken
      };

      const response = await axios.get(url, { headers });
      return response;
    } catch (error: any) {
      return handleResponse(error);
    }
  };

  const getTodoList = async (
    accessToken: string | undefined,
    refreshToken: string | undefined
  ): Promise<AxiosResponse<Todo[]> | undefined> => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APIROOT}/todo/get_todolist`;
      const headers = {
        Authorization: "Bearer " + accessToken,
        "refreshtoken": refreshToken
      };

      const response = await axios.post(url, {}, { headers });
      return response;
    } catch (error: any) {
      return undefined;
    }
  };

  return { createUser, emailAuthentication, login, getProfile, getTodoList };
};