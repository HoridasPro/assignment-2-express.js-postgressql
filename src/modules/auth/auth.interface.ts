const roles = ["contributor", "maintainer"];
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: (typeof roles)[number];
}

export interface IReturnUser {
  id: number;
  name: string;
  role: string
  email: string;
}
export interface IReturn {
  name: string;
  email: string;
  password: string;
  role: (typeof roles)[number];
}
