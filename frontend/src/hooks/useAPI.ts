import { User } from '@/types/auth';
import { useCallback, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { axiosService } from '@/utils/axiosService';
import Cookies from 'js-cookie';
import { State, TodoCard } from '@/recoilAtoms/recoilState';
import { SearchConditions } from '@/types/todos';
import { useRecoilDataSync } from './useRecoilDataSync';

// type APIRequest<T = any> = {
//     method: Method;
//     url: string;
//     data?: T;vscode-file://vscode-app/c:/Users/fujit/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html
//     headers?: Record<string, string>;
// };

export function useAPI() {
    const errorMessagesNetwork = "インターネットに接続できていない可能性があります。"
    const notifications = useNotifications();
    const {
        setTodoCardList,
      } = useRecoilDataSync();

    // ユーザーを作成する処理
    const createUser = useCallback(async (user: User) => {
        notifications.open({ id: 'createUser', state: State.PROSSING });
        try {
            const res = await axiosService.post({
                url: '/auth/create_account',
                data: user,
            });

            if (res.statusCode === undefined) {
                notifications.rejected({ id: "emailAuthentication", state: State.ERROR, message: `${errorMessagesNetwork}` });
                return
            }

            switch (res.statusCode) {
                case 200:
                    const payload = res.payload as { accesstoken: string };
                    console.log("1:" + payload.accesstoken);
                    Cookies.set('accessToken', payload.accesstoken);
                    console.log(Cookies.get('accessToken'));
                    notifications.confirmed({ id: "createUser", state: State.SUCCESS });
                    break;
                case 409:
                    notifications.rejected({ id: "createUser", state: State.ERROR, message: "既に登録されています。" });
                    break;
                case 401:
                    notifications.rejected({
                        id: "createUser", state: State.ERROR, message: `401エラー：ワンタイムパスワードを間違えている可能性があります。\n
                    または、ワンタイムパスワードの1日あたりの生成回数上限に達している可能性があります。` });
                    break;
                default:
                    notifications.rejected({ id: "createUser", state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            console.log("2");
            notifications.rejected({ id: 'createUser', state: State.ERROR, message: e.message });

        }
    }, [notifications]);

    const emailAuthentication = useCallback(
        async (accessToken: string | undefined,
            onetimePassword: string
        ) => {
            notifications.open({ id: 'emailAuthentication', state: State.PROSSING });

            const res = await axiosService.post({
                url: '/auth/email_authentication',
                data: { onetimepassword: onetimePassword },
                headers: { Authorization: "Bearer " + accessToken }
            });
            if (res.statusCode === undefined) {
                notifications.rejected({ id: "emailAuthentication", state: State.ERROR2, message: `${errorMessagesNetwork}` });
                return
            }

            switch (res.statusCode) {
                case 200:
                    const payload = res.payload as { accesstoken: string; refreshtoken: string };
                    Cookies.set('accessToken', payload.accesstoken);
                    Cookies.set('refreshToken', payload.refreshtoken);
                    notifications.confirmed({ id: "emailAuthentication", state: State.SUCCESS2 });
                    break;
                case 409:
                    notifications.rejected({ id: "emailAuthentication", state: State.ERROR2, message: "409エラー：既に登録されています。" });
                    break;
                case 401:
                    notifications.rejected({
                        id: "emailAuthentication", state: State.ERROR2, message: `401エラー：ワンタイムパスワードを間違えている可能性があります。\n
                        または、ワンタイムパスワードの1日あたりの生成回数上限に達している可能性があります。`});
                    break;
                default:
                    notifications.rejected({ id: "emailAuthentication", state: State.ERROR2, message: `${res.statusCode}エラー` });
                    break;
            }
        }, []
    );

    const login = useCallback(async (email: string | undefined, password: string | undefined) => {
        notifications.open({ id: 'login', state: State.PROSSING });

        try {
            const res = await axiosService.post({
                url: '/auth/login',
                data: {
                    email: email,
                    password: password,
                },
            });

            if (res.statusCode === undefined) {
                notifications.rejected({ id: "getTodoList", state: State.ERROR, message: `${errorMessagesNetwork}` });
                return
            }

            switch (res.statusCode) {
                case 200:
                    const payload = res.payload as { accesstoken: string; refreshtoken: string };
                    Cookies.set('accessToken', payload.accesstoken);
                    Cookies.set('refreshToken', payload.refreshtoken);
                    notifications.confirmed({ id: 'login', state: State.SUCCESS });
                    break;
                case 409:
                    notifications.rejected({ id: 'login', state: State.ERROR, message: '既に登録されています。' });
                    break;
                case 401:
                    notifications.rejected({
                        id: 'login',
                        state: State.ERROR,
                        message: "メールアドレスまたはパスワードが正しくありません",
                    });
                    break;
                default:
                    notifications.rejected({ id: 'login', state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: 'login', state: State.ERROR, message: e.message });
        }
    }, []);

    const getProfile = useCallback(
        async (
            accessToken: string | undefined,
            refreshToken: string | undefined
        ) => {

            notifications.open({ id: 'getProfile', state: State.PROSSING });

            try {
                const headers = {
                    Authorization: "Bearer " + accessToken,
                    "refreshtoken": refreshToken
                };

                if (refreshToken) {
                    headers["refreshtoken"] = refreshToken;
                }

                const res = await axiosService.get({
                    url: '/auth/get_profile',
                    headers
                });

                if (res === undefined) return { data: null, message: errorMessagesNetwork };

                notifications.confirmed({ id: 'getProfile', state: State.SUCCESS });
                return res;
            }
            catch (e: any) {
                notifications.rejected({ id: 'getProfile', state: State.ERROR, message: e.message });
            }
        }
        ,
        []
    )

    const getTodoList = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        searchConditions: SearchConditions | undefined = undefined
    ) => {

        try {
            notifications.open({ id: 'getTodoList', state: State.PROSSING });

            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken
            };

            let data = {}
            if (searchConditions !== undefined) {
                data = {
                    title: searchConditions.title,
                    description: searchConditions?.description,
                    tags_existence: searchConditions?.tagExists,
                    tag: searchConditions?.tagMatch,
                    attachments_existence: searchConditions?.attachmentsExists,
                    completed_date_start: searchConditions?.completeDateRange?.[0]?.format("YYYY-MM-DD"),
                    completed_date_end: searchConditions?.completeDateRange?.[1]?.format("YYYY-MM-DD"),
                    create_date_start: searchConditions?.startDateRange?.[0]?.format("YYYY-MM-DD"),
                    create_date_end: searchConditions?.startDateRange?.[1]?.format("YYYY-MM-DD"),
                    current_state: searchConditions?.status,
                };
            }

            const res = await axiosService.post({
                url: '/todo/get_todolist',
                data: data,
                headers: headers
            });

            if (res.statusCode === undefined) {
                notifications.rejected({ id: "getTodoList", state: State.ERROR, message: `${errorMessagesNetwork}` });
                return
            }

            switch (res.statusCode) {
                case 200:
                    console.log(res);
                    if (res.payload) {
                        const payload = res.payload as TodoCard[];

                        const todoCardList: TodoCard[] = payload.map((item: any) => {
                            const todoCard: TodoCard = {
                                userId: item.user_id,
                                todoId: item.todo_id,
                                title: item.title,
                                description: item.description,
                                currentState: item.current_state,
                                dateStart: new Date(item.date_start),
                                dateEnd: new Date(item.date_end),
                                tags: item.tags,
                                attachments: item.attachments,
                                color: item.color,
                                completedDate: new Date(item.completed_date),
                                createDate: new Date(item.create_date),
                            };
                            return todoCard;
                        });

                        setTodoCardList({ todoCardList: todoCardList as TodoCard[] });
                    }
                    notifications.confirmed({ id: 'getTodoList', state: State.SUCCESS });
                    break;
                case 404:
                    //データなし
                    setTodoCardList({ todoCardList: [] as TodoCard[] });
                    notifications.rejected({ id: 'getTodoList', state: State.ERROR, message: "TODOデータが存在しません" });
                    break;
                default:
                    //TODO: 空の配列を返すのは必要？
                    setTodoCardList({ todoCardList: [] as TodoCard[] });
                    notifications.rejected({ id: 'getTodoList', state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: 'login', state: State.ERROR, message: e.message });
        }
    }, []);

    const createTodo = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined
    ) => {

        try {
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken
            };

            const res = await axiosService.post({
                url: '/todo/get_todolist',
                data: {
                    email: accessToken,
                    password: refreshToken,
                },
                headers: headers
            });


        } catch (e: any) {
            notifications.rejected({ id: 'login', state: State.ERROR, message: e.message });
        }
    }, []);

    return {
        createUser,
        emailAuthentication,
        login,
        getProfile,
        getTodoList,
        createTodo
    };
}