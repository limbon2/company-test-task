import { Task } from "./task.model";

export type ApiResponse<T> = {
  status: string;
  message: T;
};

export type ApiFetchTasksQueryParams = {
  sort_field?: Exclude<keyof Task, "text">;
  sort_direction?: "asc" | "desc";
  page?: number;
};

export type ApiFetchTasksResponse = ApiResponse<{
  tasks: Task[];
  total_task_count: number;
}>;

export type ApiCreateTaskResponse = ApiResponse<Task>;

export type ApiLoginData = {
  username: string;
  password: string;
};

export type ApiLoginResponse = ApiResponse<{ token: string }>;
