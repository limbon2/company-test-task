import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzIconModule } from "ng-zorro-antd/icon";
import { Task, TaskStatus } from "src/app/models/task.model";
import { AuthService } from "src/app/services/auth.service";

@UntilDestroy()
@Component({
  selector: "ta-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule],
})
export class TaskComponent implements OnInit {
  @Input() public task: Task;

  private readonly authService = inject(AuthService);

  public readonly taskStatuses = TaskStatus;

  public isLoggedIn: boolean = false;

  @Output() public taskFormOpen = new EventEmitter<Task>();

  public ngOnInit(): void {
    this.isLoggedIn = !!this.authService.token;

    this.authService.onLogout.pipe(untilDestroyed(this)).subscribe(() => {
      this.isLoggedIn = false;
    });
  }
}
