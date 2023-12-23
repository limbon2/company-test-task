import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CreateTaskData, Task } from "src/app/models/task.model";
import { TasksService } from "src/app/services/tasks.service";

@UntilDestroy()
@Component({
  selector: "ta-tasks-page",
  templateUrl: "./tasks-page.component.html",
  styleUrls: ["./tasks-page.component.scss"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class TasksPageComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly fb = inject(FormBuilder);

  public tasks: Task[] = [];
  public taskForm = this.fb.group<CreateTaskData>({ text: "", email: "", username: "" });

  public ngOnInit(): void {
    this.tasksService
      .fetchTasks({})
      .pipe(untilDestroyed(this))
      .subscribe((result) => (this.tasks = result.tasks));
  }

  public createTask(event: SubmitEvent): void {
    event.preventDefault();

    this.tasksService
      .createTask(this.taskForm.value as CreateTaskData)
      .pipe(untilDestroyed(this))
      .subscribe((task) => this.tasks.push(task));
  }
}
