import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TasksPageComponent } from "./pages/tasks-page/tasks-page.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";

const routes: Routes = [
  { path: "", component: TasksPageComponent },
  { path: "login", component: LoginPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
