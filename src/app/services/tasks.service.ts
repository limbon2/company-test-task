import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { CreateTaskData, Task, UpdateTaskData } from "../models/task.model";
import {
  ApiCreateTaskResponse,
  ApiFetchTasksQueryParams,
  ApiFetchTasksResponse,
  ApiResponse,
} from "../models/api.model";
import { API_URL } from "../config/api";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  public fetchTasks(params: ApiFetchTasksQueryParams): Observable<{ tasks: Task[]; count: number }> {
    return this.http.get<ApiFetchTasksResponse>(`${API_URL}/`, { params }).pipe(
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
      .post<ApiCreateTaskResponse>(`${API_URL}/create/`, formData)
      .pipe(map((response) => response.message));
  }

  public updateTask(id: number, data: UpdateTaskData): Observable<void> {
    const formData = new FormData();
    formData.append("text", data.text);
    formData.append("status", data.status.toString());
    if (this.authService.token) {
      formData.append("token", this.authService.token);
    }

    return this.http.post<ApiResponse<null>>(`${API_URL}/edit/${id}`, formData).pipe(map(() => {}));
  }
}
