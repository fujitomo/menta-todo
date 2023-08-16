type User = {
  email: string;
  password: string;
  onetimepassword: string;
};

type Token = {
  accesstoken: string;
  refreshtoken: string;
};

export type { Token, User };

