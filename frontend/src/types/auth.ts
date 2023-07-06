type User = {
  email: string;
  password: string;
  onetimepassword: string;
};

type Token = {
<<<<<<< HEAD
<<<<<<< HEAD
  accesstoken: string;
  refreshoken: string;
=======
  token: string;
  access_token: string;
  refreshToken: string;
>>>>>>> parent of 245f46b... 下記メッセージの対応が難しい為、ブランチ間違えのコミット削除を手動でおこなった　
=======
  accesstoken: string;
  refreshoken: string;
>>>>>>> 85bfe60940bb68bc19e4028c327a20437ba5e3d8
};

export type { User, Token };
