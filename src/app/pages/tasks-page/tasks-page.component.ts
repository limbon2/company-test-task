import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSkeletonModule } from "ng-zorro-antd/skeleton";
import { NzPaginationModule } from "ng-zorro-antd/pagination";
import { Observable, switchMap, tap } from "rxjs";
import { MAX_TASKS_PER_PAGE } from "src/app/config/api";
import { ApiFetchTasksQueryParams } from "src/app/models/api.model";
import { CreateTaskData, Task } from "src/app/models/task.model";
import { TasksService } from "src/app/services/tasks.service";
import { AuthService } from "src/app/services/auth.service";

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
    NzCardModule,
    NzFormModule,
    NzPaginationModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    NzSkeletonModule,
  ],
})
export class TasksPageComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public readonly authService = inject(AuthService);

  public readonly query: ApiFetchTasksQueryParams = {};

  public tasks: Task[] = [];
  public taskCount: number = 0;

  public taskForm = this.fb.group({
    text: this.fb.control("", { validators: [Validators.required] }),
    email: this.fb.control("", { validators: [Validators.required, Validators.email] }),
    username: this.fb.control("", { validators: [Validators.required] }),
  });

  public maxPages: number = 0;

  public isVisible: boolean = false;
  public isCreating: boolean = false;
  public isFetching: boolean = false;

  public ngOnInit(): void {
    this.isFetching = true;
    this.route.queryParams
      .pipe(
        tap((params) => {
          this.query.page = Number(params["page"]) || 1;
          this.query.sort_direction = params["sort_direction"];
          this.query.sort_field = params["sort_field"];
        }),
        switchMap(() => this.fetchTasks()),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.isFetching = false;
      });
  }

  public onPageChange(page: number): void {
    console.warn("page change", page, this.query.page);
    this.query.page = page;
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

  public showModal(): void {
    this.isVisible = true;
  }

  public createTask(): void {
    if (this.taskForm.valid) {
      this.isCreating = true;
      this.tasksService
        .createTask(this.taskForm.value as CreateTaskData)
        .pipe(
          switchMap(() => this.fetchTasks()),
          untilDestroyed(this)
        )
        .subscribe(() => {
          this.isCreating = false;
          this.isVisible = false;
        });
    }
  }

  public handleCancel(): void {
    this.isVisible = false;
  }
}
