export enum TaskStatus {
  Incomplete = 0,
  IncompleteAdminEdit = 1,
  Complete = 10,
  CompleteAdminEdit = 11,
}

export type Task = {
  id: number;
  email: string;
  username: string;
  text: string;
  status: TaskStatus;
};

export type CreateTaskData = {
  username: string;
  email: string;
  text: string;
};

export type UpdateTaskData = {
  text: string;
  status: TaskStatus;
};
