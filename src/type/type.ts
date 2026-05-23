export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  status: number;
  error?: string;
};

const allowedSorts = ["newest", "oldest"];
const allowedTypes = ["bug", "feature_request"];
const allowedStatuss = ["open", "in_progress", "resolved"];

export type IssuesSort = {
  allowedSort: (typeof allowedSorts)[number];
  allowedType: (typeof allowedTypes)[number];
  allowedStatus: (typeof allowedStatuss)[number];
};
