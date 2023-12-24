import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NZ_MODAL_DATA, NzModalRef } from "ng-zorro-antd/modal";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { NzSelectModule } from "ng-zorro-antd/select";
import { ERRORS_MESSAGES } from "src/app/config/api";
import { CreateTaskData, Task, TaskStatus, UpdateTaskData } from "src/app/models/task.model";
import { AuthService } from "src/app/services/auth.service";
import { TasksService } from "src/app/services/tasks.service";
import { updateControlsValidity } from "src/app/utils/update-controls-validity";

@UntilDestroy()
@Component({
  selector: "ta-task-form",
  templateUrl: "./task-form.component.html",
  styleUrls: ["./task-form.component.scss"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzButtonModule, NzInputModule, NzFormModule, NzSelectModule],
})
export class TaskFormComponent implements OnInit {
  private readonly modalRef = inject(NzModalRef);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TasksService);
  private readonly notifications = inject(NzNotificationService);

  public readonly task: Task = inject(NZ_MODAL_DATA);

  public readonly taskStatuses = TaskStatus;
  public readonly errorMessages = ERRORS_MESSAGES;

  private readonly adminEditStatusMap: Partial<Record<TaskStatus, TaskStatus>> = {
    [TaskStatus.Complete]: TaskStatus.CompleteAdminEdit,
    [TaskStatus.Incomplete]: TaskStatus.IncompleteAdminEdit,
  };

  public readonly taskForm = this.fb.group({
    text: this.fb.control(this.task?.text, { validators: [Validators.required] }),
    email: this.fb.control(
      { value: this.task?.email, disabled: !!this.task },
      { validators: [Validators.required, Validators.email] }
    ),
    username: this.fb.control(
      { value: this.task?.username, disabled: !!this.task },
      { validators: [Validators.required] }
    ),
    status: this.fb.control(this.task?.status),
  });

  public isProcessing: boolean = false;

  private isLoggedIn: boolean = false;

  @Output() public beforeClose = new EventEmitter<boolean>();

  public ngOnInit(): void {
    this.isLoggedIn = !!this.authService.token;

    if (this.task) {
      const status = this.task.status;
      if (status === TaskStatus.CompleteAdminEdit || status === TaskStatus.IncompleteAdminEdit) {
        this.taskForm
          .get("status")
          ?.setValue(status === TaskStatus.CompleteAdminEdit ? TaskStatus.Complete : TaskStatus.Incomplete);
      }
    }
  }

  public createTask(): void {
    if (this.taskForm.valid) {
      this.isProcessing = true;

      this.taskService
        .createTask(this.taskForm.value as CreateTaskData)
        .pipe(untilDestroyed(this))
        .subscribe((task) => {
          this.isProcessing = false;
          this.notifications.success("Успех!", "Задача успешно добавлена");
          this.close(task);
        });
    } else {
      updateControlsValidity(this.taskForm);
    }
  }

  public updateTask(): void {
    if (!this.isLoggedIn) {
      this.notifications.error("Ошибка", "Необходима авторизация для редактирования задачи");
      return;
    }

    if (this.taskForm.valid) {
      this.isProcessing = true;

      const updateData = this.taskForm.value;

      const wasEditedByAdmin =
        this.task.status === TaskStatus.CompleteAdminEdit || this.task.status === TaskStatus.IncompleteAdminEdit;
      if (wasEditedByAdmin) {
        updateData.status = this.adminEditStatusMap[updateData.status!];
      }

      const hasTextChange = updateData.text !== this.task.text;
      if (hasTextChange && !wasEditedByAdmin) {
        updateData.status = this.adminEditStatusMap[updateData.status!];
      }

      this.taskService
        .updateTask(this.task.id, this.taskForm.value as UpdateTaskData)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.isProcessing = false;
          this.notifications.success("Успех!", "Задача успешно обновлена");
          this.close({ ...this.task, ...updateData } as Task);
        });
    } else {
      updateControlsValidity(this.taskForm);
    }
  }

  public close(task?: Task): void {
    this.modalRef.close(task);
  }
}
