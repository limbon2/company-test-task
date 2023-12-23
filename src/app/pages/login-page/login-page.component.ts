import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { ApiLoginData } from "src/app/models/api.model";
import { AuthService } from "src/app/services/auth.service";

@UntilDestroy()
@Component({
  selector: "login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.scss"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, NzButtonModule, NzFormModule],
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly loginForm = this.fb.group({
    username: this.fb.control("", { validators: [Validators.required] }),
    password: this.fb.control("", { validators: [Validators.required] }),
  });

  public isLoggingIn: boolean = false;

  public login(): void {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;

      this.authService
        .login(this.loginForm.value as ApiLoginData)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.isLoggingIn = false;
          this.router.navigate([""]);
        });
    }
  }
}
