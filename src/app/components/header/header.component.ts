import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NzButtonModule } from "ng-zorro-antd/button";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "ta-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule, NzButtonModule],
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);

  public isLoggedIn: boolean = false;

  public ngOnInit(): void {
    this.isLoggedIn = !!this.authService.token;
  }

  public logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }
}
