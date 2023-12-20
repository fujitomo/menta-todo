type User = {
  email: string;
  password: string;
  onetimepassword: string;
};

type UpdatePassword = {
  oldPassword: string;
  newPassword: string;
  checkPassword: string;
};

type Token = {
  accesstoken: string;
  refreshtoken: string;
};

export type { Token, User, UpdatePassword };

