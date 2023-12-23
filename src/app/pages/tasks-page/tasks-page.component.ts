import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Observable, map, switchMap, tap } from "rxjs";
import { PaginationComponent } from "src/app/components/pagination/pagination.component";
import { MAX_TASKS_PER_PAGE } from "src/app/config/api";
import { ApiFetchTasksQueryParams } from "src/app/models/api.model";
import { CreateTaskData, Task } from "src/app/models/task.model";
import { TasksService } from "src/app/services/tasks.service";

@UntilDestroy()
@Component({
  selector: "ta-tasks-page",
  templateUrl: "./tasks-page.component.html",
  styleUrls: ["./tasks-page.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PaginationComponent],
})
export class TasksPageComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public readonly query: ApiFetchTasksQueryParams = {};

  public tasks: Task[] = [];
  public taskCount: number = 0;

  public taskForm = this.fb.group<CreateTaskData>({ text: "", email: "", username: "" });

  public maxPages: number = 0;

  public ngOnInit(): void {
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
      .subscribe();
  }

  public createTask(event: SubmitEvent): void {
    event.preventDefault();

    this.tasksService
      .createTask(this.taskForm.value as CreateTaskData)
      .pipe(untilDestroyed(this))
      .subscribe((task) => this.tasks.push(task));
  }

  public onPageChange(page: number): void {
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
}
