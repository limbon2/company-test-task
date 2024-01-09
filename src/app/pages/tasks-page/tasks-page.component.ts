import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSkeletonModule } from "ng-zorro-antd/skeleton";
import { NzNotificationModule } from "ng-zorro-antd/notification";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzPaginationModule } from "ng-zorro-antd/pagination";
import { Observable, switchMap, tap } from "rxjs";
import { ERRORS_MESSAGES, MAX_TASKS_PER_PAGE } from "src/app/config/api";
import { ApiFetchTasksQueryParams } from "src/app/models/api.model";
import { Task, TaskStatus } from "src/app/models/task.model";
import { TasksService } from "src/app/services/tasks.service";
import { AuthService } from "src/app/services/auth.service";
import { TaskFormComponent } from "src/app/components/task-form/task-form.component";
import { HeaderComponent } from "src/app/components/header/header.component";
import { TaskComponent } from "src/app/components/task/task.component";

@UntilDestroy()
@Component({
  selector: "ta-tasks-page",
  templateUrl: "./tasks-page.component.html",
  styleUrls: ["./tasks-page.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    TaskComponent,
    NzCardModule,
    NzPaginationModule,
    NzButtonModule,
    NzModalModule,
    NzSkeletonModule,
    NzIconModule,
    NzSelectModule,
    NzNotificationModule,
  ],
})
export class TasksPageComponent implements OnInit {
  public readonly maxTasksPerPage = MAX_TASKS_PER_PAGE;
  public readonly taskStatuses = TaskStatus;
  public readonly errorMessages = ERRORS_MESSAGES;

  private readonly tasksService = inject(TasksService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);

  public readonly query: ApiFetchTasksQueryParams = {};

  public tasks: Task[] = [];
  public taskCount: number = 0;
  public maxPages: number = 0;

  public isFetchingTasks: boolean = false;

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

  public onQueryChange(key: keyof ApiFetchTasksQueryParams, value: any): void {
    this.query[key] = value;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.query, queryParamsHandling: "merge" });
  }

  public openTaskForm(task?: Task): void {
    const modal = this.modalService.create({
      nzTitle: task ? "Редактировать задачу" : "Новая задача",
      nzData: task,
      nzContent: TaskFormComponent,
      nzFooter: null,
    });

    modal.afterClose.pipe(untilDestroyed(this)).subscribe((task) => {
      if (task) {
        const index = this.tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = task;
        } else {
          const shouldIncrementPageCount = this.tasks.length % this.maxTasksPerPage === 0;
          if (shouldIncrementPageCount) {
            this.maxPages += 1;
          }
          this.tasks.push(task);
        }
      }
    });
  }

  private fetchTasks(): Observable<{ tasks: Task[]; count: number }> {
    return this.tasksService.fetchTasks(this.query).pipe(
      tap((result) => {
        this.tasks = result.tasks;
        this.taskCount = result.count;

        this.maxPages = Math.ceil(this.taskCount / this.maxTasksPerPage);
      })
    );
  }
}
