import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { CreateTaskData, Task } from "../models/task.model";
import { ApiCreateTaskResponse, ApiFetchTasksQueryParams, ApiFetchTasksResponse } from "../models/api.model";
import { API_URL } from "../config/api";
import { appendDeveloper } from "../utils/append-developer";

@Injectable({ providedIn: "root" })
export class TasksService {
  private readonly http = inject(HttpClient);

  public fetchTasks(params: ApiFetchTasksQueryParams): Observable<{ tasks: Task[]; count: number }> {
    return this.http.get<ApiFetchTasksResponse>(`${API_URL}/`, { params: appendDeveloper(params) }).pipe(
      map((response) => ({
        tasks: response.message.tasks,
        count: Number(response.message.total_task_count),
      }))
    );
  }

  public createTask(data: CreateTaskData): Observable<Task> {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("text", data.text);

    return this.http
      .post<ApiCreateTaskResponse>(`${API_URL}/create/`, formData, { params: appendDeveloper({}) })
      .pipe(map((response) => response.message));
  }
}
