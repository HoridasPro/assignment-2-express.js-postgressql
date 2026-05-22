const roles = ["contributor", "maintainer"];
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: (typeof roles)[number];
}

export interface IReturnUser {
  id: string;
  name: string;
  role: string;
}

