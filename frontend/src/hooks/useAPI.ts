import { UpdatePassword } from '@/types/auth';
import { Profile } from '@/types/profile';

import { User } from '@/types/auth';
import { useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { AxiosResponse, axiosService } from '@/utils/axiosService';
import Cookies from "js-cookie";
import { State, TodoCard, notificationsState } from '@/recoilAtoms/recoilState';
import { SearchConditions, TodoDetail } from '@/types/todos';
import { useRecoilDataSync } from './useRecoilDataSync';
import { downloadAllAttachments, downloadAttachment, formatDate } from '@/utils/utils';
import { useRecoilState, useRecoilValue } from 'recoil';

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

    const [notification] = useRecoilState(notificationsState);

    // ユーザーを作成する処理
    const createUser = useCallback(async (user: User) => {
        const id = 'createUser';
        try {
            notifications.open({ id: id, state: State.PROSSING });
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
                    console.log("createUser")

                    const payload = res.payload as { accesstoken: string; refreshtoken: string };
                    Cookies.set('accessToken', payload.accesstoken);
                    Cookies.set('refreshToken', payload.refreshtoken);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 400:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録値が不正です。" });
                    break;
                case 401:
                    notifications.rejected({ id: id, state: State.ERROR, message: "ワンタイムパスワードの1日あたりの生成回数上限に達しています。" });
                    break;
                case 409:
                    notifications.rejected({ id: id, state: State.ERROR, message: "既に登録されています。" });
                    break;
                case 404:
                    notifications.rejected({ id: id, state: State.ERROR, message: "データが存在しません。" });
                    break;
                case 500:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録に失敗しました。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });

        }
    }, []);

    const updateEmail = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        email: string | undefined,
    ) => {
        const id = 'updateEmail';
        try {
            notifications.open({ id: id, state: State.PROSSING });

            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken
            };

            const res = await axiosService.post({
                headers: headers,
                url: '/auth/update_email',
                data: { email: email }
            });

            if (res.statusCode === undefined) {
                notifications.rejected({ id: "updateEmail", state: State.ERROR, message: `${errorMessagesNetwork}` });
                return
            }

            switch (res.statusCode) {
                case 200:
                    console.log("updateEmail")
                    updateTokenFromResponse(res);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 400:
                    notifications.rejected({ id: id, state: State.ERROR, message: "無効なメールアドレスです。" });
                    break;
                case 401:
                    notifications.rejected({ id: id, state: State.ERROR, message: "ワンタイムパスワードの1日あたりの生成回数上限に達しています。" });
                    break;
                case 404:
                    notifications.rejected({
                        id: id, state: State.ERROR, message: "データが存在しない。" });
                    break;
                case 409:
                    notifications.rejected({
                        id: id, state: State.ERROR, message: "既に登録されています。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const emailAuthentication = useCallback(
        async (accessToken: string | undefined,
               refreshToken: string | undefined,
               onetimePassword: string
        ) => {
            const id = 'emailAuthentication';
            try {
                notifications.open({ id: id, state: State.PROSSING });

                const headers = {
                    Authorization: "Bearer " + accessToken,
                    "refreshtoken": refreshToken
                };
 
                console.log(headers, "headers")

                const res = await axiosService.post({
                    url: '/auth/email_authentication',
                    data: { onetimepassword: onetimePassword },
                    headers: headers
                });
                if (res.statusCode === undefined) {
                    notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: `${errorMessagesNetwork}` });
                    return
                }

                switch (res.statusCode) {
                    case 200:
                        console.log("emailAuthentication")
                        const payload = res.payload as { accesstoken: string; refreshtoken: string };
                        Cookies.set('accessToken', payload.accesstoken);
                        Cookies.set('refreshToken', payload.refreshtoken);
                        notifications.confirmed({ id: id, state: State.SUCCESS_EMAIL_AUTENTICATION });
                        break;
                    case 401:
                        notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: `ワンタイムパスワードを間違えている可能性があります。\n
                            または、ワンタイムパスワードの1日あたりの生成回数上限に達している可能性があります。`});
                            break;
                    case 404:
                        notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: "データが登録されていません。" });
                        break;
                    case 409:
                        notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: "既に登録されています。" });
                        break;
                    default:
                        notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: `${res.statusCode}エラー` });
                        break;
                }
            } catch (e: any) {
                notifications.rejected({ id: id, state: State.ERROR, message: e.message });
            }
        }, []
    );

    const updateEmailAuthentication = useCallback(
        async (accessToken: string | undefined,
               refreshToken: string | undefined,
               onetimePassword: string
        ) => {
            const id = 'updateEmailAuthentication';
            try {
                notifications.open({ id: id, state: State.PROSSING });

                const headers = {
                    Authorization: "Bearer " + accessToken,
                    "refreshtoken": refreshToken
                };

                const res = await axiosService.post({
                    url: '/auth/update_email_authentication',
                    data: { onetime_password: onetimePassword },
                    headers: headers
                });

                if (res.statusCode === undefined) {
                    notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: `${errorMessagesNetwork}` });
                    return
                }

                switch (res.statusCode) {
                    case 200:
                        console.log("updateEmailAuthentication")

                        updateTokenFromResponse(res);
                        notifications.confirmed({ id: id, state: State.SUCCESS_EMAIL_AUTENTICATION });
                        break;
                    case 401:
                        notifications.rejected({
                            id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: `ワンタイムパスワードを間違えている可能性があります。\n
                            または、ワンタイムパスワードの1日あたりの生成回数上限に達している可能性があります。` });
                        break;
                    case 404:
                        notifications.rejected({
                            id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: "登録メールアドレスが見つかりません。"});
                        break;
                    default:
                        notifications.rejected({ id: id, state: State.ERROR_EMAIL_AUTENTICATION, message: `${res.statusCode}エラー` });
                        break;
                }
            } catch (e: any) {
                notifications.rejected({ id: id, state: State.ERROR, message: e.message });
            }
        }, []
    );

    const login = useCallback(async (email: string | undefined, password: string | undefined) => {
        const id = 'login';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const res = await axiosService.post({
                url: '/auth/login',
                data: {
                    email: email,
                    password: password,
                },
            });

            if (res.statusCode === undefined) {
                notifications.rejected({ id: id, state: State.ERROR, message: `${errorMessagesNetwork}` });
                return
            }

            switch (res.statusCode) {
                case 200:
                    console.log("login")
                    const payload = res.payload as { accesstoken: string; refreshtoken: string };
                    Cookies.set('accessToken', payload.accesstoken);
                    Cookies.set('refreshToken', payload.refreshtoken);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 401:
                    notifications.rejected({
                        id: id,
                        state: State.ERROR,
                        message: "メールアドレスまたはパスワードが正しくありません",
                    });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const getProfile = useCallback(
        async (
            accessToken: string | undefined,
            refreshToken: string | undefined
        ) => {
            const id = 'getProfile';
            try {
                notifications.open({ id: id, state: State.PROSSING });
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

                if (res.statusCode === undefined) {
                    notifications.rejected({ id: id, state: State.ERROR, message: `${errorMessagesNetwork}` });
                    return
                }

                switch (res.statusCode) {
                    case 200:
                        console.log("getProfile")

                        updateTokenFromResponse(res);
                        if (res.payload) {
                            const payload = res.payload as { user_name: string, email: string, birthday: Date, avatar_photo: string };
                            const downloadedFile = await downloadAttachment(payload.avatar_photo);
                            const profile: Profile = {
                                userName: payload.user_name,
                                email: payload.email,
                                birthday: payload.birthday,
                                attachment: downloadedFile !== null ? downloadedFile : undefined,
                            };
                            notifications.confirmed({ id: id, state: State.STANDBY });
                            return profile;
                        }
                        break;
                    case 404:
                        notifications.confirmed({ id: id, state: State.STANDBY });
                        break;
                    default:
                        notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                        break;
                }
            }
            catch (e: any) {
                notifications.rejected({ id: id, state: State.ERROR, message: e.message });
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
        const id = 'getTodoList';
        try {
            notifications.open({ id: id, state: State.PROSSING });
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
                    tag: searchConditions?.tags,
                    attachments_existence: searchConditions?.attachmentsExists,
                    // completed_date_start: searchConditions?.dateEndRange?.[0]?.format("YYYY-MM-DD"),
                    // completed_date_end: searchConditions?.dateEndRange?.[1]?.format("YYYY-MM-DD"),
                    create_date_start: searchConditions?.dateStartRange?.[0]?.format("YYYY-MM-DD"),
                    create_date_end: searchConditions?.dateStartRange?.[1]?.format("YYYY-MM-DD"),
                    current_state: searchConditions?.currentState,
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
                    console.log("getTodoList")

                    updateTokenFromResponse(res);
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
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 404:
                //     //データなし
                //     setTodoCardList({ todoCardList: [] as TodoCard[] });
                //     notifications.rejected({ id: id, state: State.ERROR, message: "TODOデータが存在しません" });
                     break;
                default:
                    //TODO: 空の配列を返すのは必要？
                    setTodoCardList({ todoCardList: [] as TodoCard[] });
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const createTodo = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        todoDetail: TodoDetail
    ) => {
        const id = 'createTodo';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };

            const formData = new FormData();
            const sortedAttachments = todoDetail.attachments?.filter(file => file !== undefined) ?? [];
            if (sortedAttachments) {
                // Loop through the attachments array and append each file to the form data
                sortedAttachments.forEach((file) => {
                    // ここで、単一のファイルをFormDataに追加します。
                    formData.append('attachments', file);
                });
            }

            formData.append("request_model", JSON.stringify({
                title: todoDetail.title,
                description: todoDetail.description,
                date_start: formatDate(todoDetail.dateStart, "-"),
                date_end: formatDate(todoDetail.dateEnd, "-"),
                tags: todoDetail.tags,
                color: todoDetail.color,
                current_state: todoDetail.currentState
            }));

            const res = await axiosService.post({
                url: '/todo/create_todo',
                data: formData,
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    console.log("createTodo")
                    console.log(Cookies.get('accessToken'));
                    updateTokenFromResponse(res);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 400:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録値に不正があります。" });
                    break;
                case 413:
                    notifications.rejected({ id: id, state: State.ERROR, message: "アップロードファイルに2MBより大きいものがあります。" });
                    break;
                case 500:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録に失敗しました。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);


    const createProfile = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        profile: Profile
    ) => {
        const id = 'createTodo';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };

            const formData = new FormData();

            if (profile.attachment) {
                formData.append('attachment', profile.attachment);
            }

            formData.append("request_model", JSON.stringify({
                user_name: profile.userName,
                birthday: formatDate(profile.birthday, "-"),
            }));

            const res = await axiosService.post({
                url: '/auth/create_profile',
                data: formData,
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    console.log("createProfile")
                    updateTokenFromResponse(res);
                    if (res.payload) {
                        const payload = res.payload as { user_name: string, birthday: Date, attachment: File };

                        const profile: Profile = {
                            userName: payload.user_name,
                            birthday: payload.birthday,
                            attachment: payload.attachment,
                        };

                        return profile;
                    }
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 404:
                    notifications.rejected({
                        id: id, state: State.ERROR, message: "ファイルデータ登録に失敗しました。" });
                    break;
                case 409:
                    notifications.rejected({ id: id, state: State.ERROR, message: "既に登録されています。" });
                    break;
                case 413:
                    notifications.rejected({ id: id, state: State.ERROR, message: "アップロードファイルに2MBより大きいものがあります。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const updateProfile = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        profile: Profile
    ) => {
        const id = 'updateProfile';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };
            console.log("profile", profile)
            const formData = new FormData();
            if (profile.attachment) {
                formData.append('file', profile.attachment);
            }

            formData.append("request_model", JSON.stringify({
                user_name: profile.userName,
                birthday: formatDate(profile.birthday, "-")
            }));

            Cookies.remove('accessToken');
            const res = await axiosService.post({
                url: '/auth/update_profile',
                data: formData,
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    console.log("updateProfile")
                    updateTokenFromResponse(res);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 404:
                    notifications.rejected({ id: id, state: State.ERROR, message: "プロフィールデータが登録されていません。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const updatePassword = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        updatePassword: UpdatePassword
    ) => {
        const id = 'updatePassword';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };
            const res = await axiosService.post({
                url: '/auth/update_password',
                data: {
                    old_password: updatePassword.oldPassword,
                    new_password: updatePassword.newPassword,
                },
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    updateTokenFromResponse(res);
                    notifications.confirmed({ id: id, state: State.SUCCESS_PASSWORD });
                    break;
                case 400:
                    notifications.rejected({ id: id, state: State.ERROR, message: "更新前パスワードが間違っています。" });
                    break;
                case 404:
                    notifications.rejected({
                        id: id, state: State.ERROR, message: `登録データが見つかりません。` });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);



    const updateTodo = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        todoDetail: TodoDetail
    ) => {
        const id = 'updateTodo';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };

            const formData = new FormData();
            const sortedAttachments = todoDetail.attachments?.filter(file => file !== undefined) ?? [];
            if (sortedAttachments) {
                // Loop through the attachments array and append each file to the form data
                sortedAttachments.forEach((file) => {
                    // ここで、単一のファイルをFormDataに追加します。
                    formData.append('attachments', file);
                });
            }

            // Add other form data
            formData.append("request_model", JSON.stringify({
                todo_id: todoDetail.todoId,
                title: todoDetail.title,
                description: todoDetail.description,
                date_start: formatDate(todoDetail.dateStart, "-"),
                date_end: formatDate(todoDetail.dateEnd, "-"),
                tags: todoDetail.tags,
                color: todoDetail.color,
                current_state: todoDetail.currentState
            }));

            const res = await axiosService.post({
                url: '/todo/update_todo',
                data: formData,
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    console.log("updateTodo")
                    updateTokenFromResponse(res);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 400:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録値に不正があります。" });
                    break;
                case 404:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録対象データが見つかりませんでした。" });
                    break;
                case 413:
                    notifications.rejected({ id: id, state: State.ERROR, message: "アップロードファイルに2MBより大きいものがあります。" });
                    break;
                case 500:
                    notifications.rejected({ id: id, state: State.ERROR, message: "登録に失敗しました。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const deleteTodo = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        todoId: string
    ) => {
        const id = 'deleteTodo';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };

            const res = await axiosService.delete({
                url: '/todo/delete_todo',
                params: { todo_id: todoId },
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    console.log("deleteTodo")
                    updateTokenFromResponse(res);
                    notifications.confirmed({ id: id, state: State.SUCCESS });
                    break;
                case 404:
                    notifications.rejected({ id: id, state: State.ERROR, message: "削除対象データが見つかりません。" });
                    break;
                case 500:
                    notifications.rejected({
                        id: id, state: State.ERROR, message: `削除処理に失敗しました。` });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    }, []);

    const getTodoDatail = useCallback(async (
        accessToken: string | undefined,
        refreshToken: string | undefined,
        todoId: string
    ) => {
        const id = 'getTodoDatail';
        try {
            notifications.open({ id: id, state: State.PROSSING });
            const headers = {
                Authorization: "Bearer " + accessToken,
                "refreshtoken": refreshToken,
            };

            const res = await axiosService.post({
                url: '/todo/get_todo',
                data: { todo_id: todoId },
                headers: headers
            });

            switch (res.statusCode) {
                case 200:
                    console.log("getTodoDatail")

                    updateTokenFromResponse(res);
                    const payload = res.payload as { accesstoken: string, todo_id: string, title: string, description: string, date_start: Date, date_end: Date, tags: string[], current_state: string, attachments: string[], color: string };
                    //添付ファイルのダウンロード
                    const attachments = payload.attachments; // これは添付ファイルのURLが格納された配列です
                    const downloadedFiles = await downloadAllAttachments(attachments);

                    const todoDetail: TodoDetail = {
                        todoId: payload.todo_id,
                        title: payload.title, // `someTitleField` は `payload` に含まれるタイトルのフィールド名
                        description: payload.description,
                        dateStart: payload.date_start,
                        dateEnd: payload.date_end,
                        tags: payload.tags,
                        currentState: payload.current_state,
                        attachments: downloadedFiles,
                        color: payload.color
                    };
                    notifications.confirmed({ id: id, state: State.STANDBY }); //更新画面を開いたときに、SUCCESSだと画面が閉じるためSTANDBY
                    return todoDetail;

                case 404:
                    notifications.rejected({ id: id, state: State.ERROR, message: "対象データが見つかりません。" });
                    break;
                default:
                    notifications.rejected({ id: id, state: State.ERROR, message: `${res.statusCode}：エラー` });
                    break;
            }
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
        return {} as TodoDetail
    }, []);

    const stanbyNotification = (
    ) => {
        const id = 'stanbyNotification';
        try {
            console.log("stanbyNotification")
            notifications.confirmed({ id: id, state: State.STANDBY });
        } catch (e: any) {
            notifications.rejected({ id: id, state: State.ERROR, message: e.message });
        }
    };


    const updateTokenFromResponse = (res: AxiosResponse) => {
        const newToken = (res.headers as { [key: string]: string })?.["newtoken"];
        if (newToken) {
           console.log("newToken777")
           Cookies.set('accessToken', newToken);
        }
      };

    return {
        createUser,
        emailAuthentication,
        login,
        getProfile,
        getTodoList,
        createTodo,
        deleteTodo,
        stanbyNotification,
        getTodoDatail,
        updateTodo,
        createProfile,
        updateProfile,
        updateEmail,
        updateEmailAuthentication,
        updatePassword
    };
}
