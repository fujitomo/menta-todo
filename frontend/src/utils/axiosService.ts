import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export type AxiosResponse = {
    statusCode?: number;
    headers?: object;
    payload?: object;
    errorMessage?: string;
    errorCode?: 'unknown' | 'timeout' | 'axios';
};

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APIROOT, // 任意のベースURL
    timeout: 5000, // タイムアウト時間（ミリ秒）
});

const handleError = (error: any): AxiosResponse => {
    let errorCode: 'unknown' | 'timeout' | 'axios' = 'unknown';
    let errorMessage = 'Unknown error';
    let statusCode;
  
    if (axios.isCancel(error)) {
      errorCode = 'axios';
      errorMessage = 'Request was cancelled';
    } else if (error.code === 'ECONNABORTED') {
      errorCode = 'timeout';
      errorMessage = 'Request timed out';
    } else if (error.response?.status) {
      statusCode = error.response.status;
    } else if (error.message) {
      errorMessage = error.message;
      errorCode = 'axios';
    }

    return {
      statusCode: statusCode,
      errorMessage: errorMessage,
      errorCode: errorCode,
    };
  };

  const makeRequest = async (method: 'get' | 'post', config: AxiosRequestConfig): Promise<AxiosResponse> => {
    try {
      const response = await axiosInstance[method](config.url!, config.data, {
        headers: config.headers,
        params: method === 'get' ? config.params : undefined,
      });
      return {
        statusCode: response.status,
        payload: response.data,
        headers: response,
      };
    } catch (error: any) {
      return handleError(error);
    }
  };

  export const axiosService = {
    post: (config: AxiosRequestConfig) => makeRequest('post', config),
    get: (config: AxiosRequestConfig) => makeRequest('get', config),
  };
