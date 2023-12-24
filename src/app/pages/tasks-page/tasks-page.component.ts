import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSkeletonModule } from "ng-zorro-antd/skeleton";
import { NzNotificationModule, NzNotificationService } from "ng-zorro-antd/notification";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzPaginationModule } from "ng-zorro-antd/pagination";
import { EMPTY, Observable, catchError, switchMap, tap } from "rxjs";
import { ERRORS_MESSAGES, MAX_TASKS_PER_PAGE } from "src/app/config/api";
import { ApiFetchTasksQueryParams } from "src/app/models/api.model";
import { CreateTaskData, Task, TaskStatus, UpdateTaskData } from "src/app/models/task.model";
import { TasksService } from "src/app/services/tasks.service";
import { AuthService } from "src/app/services/auth.service";
import { updateControlsValidity } from "src/app/utils/update-controls-validity";

@UntilDestroy()
@Component({
  selector: "ta-tasks-page",
  templateUrl: "./tasks-page.component.html",
  styleUrls: ["./tasks-page.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NzCardModule,
    NzFormModule,
    NzPaginationModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    NzSkeletonModule,
    NzIconModule,
    NzSelectModule,
    NzNotificationModule,
  ],
})
export class TasksPageComponent implements OnInit {
  public readonly taskStatuses = TaskStatus;
  public readonly errorMessages = ERRORS_MESSAGES;

  private readonly tasksService = inject(TasksService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NzNotificationService);

  public readonly query: ApiFetchTasksQueryParams = {};

  public tasks: Task[] = [];
  public taskCount: number = 0;

  public readonly taskForm = this.fb.group({
    text: this.fb.control("", { validators: [Validators.required] }),
    email: this.fb.control("", { validators: [Validators.required, Validators.email] }),
    username: this.fb.control("", { validators: [Validators.required] }),
    status: this.fb.control(null as TaskStatus | null),
  });

  public maxPages: number = 0;

  public editingTaskId: number | null = null;

  public isFetchingTasks: boolean = false;
  public isFormShown: boolean = false;
  public isProcessingTask: boolean = false;

  public isLoggedIn: boolean = false;

  public ngOnInit(): void {
    this.isLoggedIn = !!this.authService.token;

    this.isFetchingTasks = true;

    this.route.queryParams
      .pipe(
        tap((params) => {
          this.query.page = Number(params["page"]) || 1;
          this.query.sort_direction = params["sort_direction"] ?? "asc";
          this.query.sort_field = params["sort_field"] ?? "id";
        }),
        switchMap(() => this.fetchTasks()),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.isFetchingTasks = false;
      });
  }

  public onPageChange(page: number): void {
    this.query.page = page;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.query, queryParamsHandling: "merge" });
  }

  public onSortChange(value: ApiFetchTasksQueryParams["sort_field"]): void {
    this.query.sort_field = value;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.query, queryParamsHandling: "merge" });
  }

  public onSortDirectionChange(): void {
    this.query.sort_direction = this.query.sort_direction === "asc" ? "desc" : "asc";
    this.router.navigate([], { relativeTo: this.route, queryParams: this.query, queryParamsHandling: "merge" });
  }

  private fetchTasks(): Observable<{ tasks: Task[]; count: number }> {
    return this.tasksService.fetchTasks(this.query).pipe(
      tap((result) => {
        this.tasks = result.tasks;
        this.taskCount = result.count;

        this.maxPages = Math.ceil(this.taskCount / MAX_TASKS_PER_PAGE);
      })
    );
  }

  public createTask(): void {
    if (this.taskForm.valid) {
      this.isProcessingTask = true;

      this.tasksService
        .createTask(this.taskForm.value as CreateTaskData)
        .pipe(
          switchMap(() => this.fetchTasks()),
          untilDestroyed(this)
        )
        .subscribe(() => {
          this.isProcessingTask = false;
          this.isFormShown = false;

          this.notifications.create("success", "Успех!", "Задача успешно создана");
        });
    } else {
      updateControlsValidity(this.taskForm);
    }
  }

  public updateTask(): void {
    if (this.taskForm.valid && this.editingTaskId) {
      this.isProcessingTask = true;

      this.tasksService
        .updateTask(this.editingTaskId, this.taskForm.value as UpdateTaskData)
        .pipe(
          catchError((err) => {
            console.error(err);
            this.notifications.error("Ошибка!", "Что то пошло не так");
            this.isProcessingTask = false;
            return EMPTY;
          }),
          switchMap(() => this.fetchTasks()),
          untilDestroyed(this)
        )
        .subscribe(() => {
          this.editingTaskId = null;
          this.isProcessingTask = false;
          this.isFormShown = false;

          this.notifications.create("success", "Успех!", "Задача успешно обновлена");
        });
    } else {
      updateControlsValidity(this.taskForm);
    }
  }

  public handleCancel(): void {
    this.isFormShown = false;
    this.editingTaskId = null;
  }

  public showCreateModal(): void {
    this.taskForm.reset();
    this.taskForm.controls.email.enable();
    this.taskForm.controls.username.enable();
    this.isFormShown = true;
  }

  public showEditModal(task: Task): void {
    this.editingTaskId = task.id;

    this.taskForm.reset();
    this.taskForm.setValue({ email: task.email, text: task.text, username: task.username, status: task.status });

    this.taskForm.controls.email.disable();
    this.taskForm.controls.username.disable();

    this.isFormShown = true;
  }

  public logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }
}
