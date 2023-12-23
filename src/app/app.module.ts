import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { registerLocaleData } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";

import { NZ_I18N } from "ng-zorro-antd/i18n";
import { ru_RU } from "ng-zorro-antd/i18n";
import ru from "@angular/common/locales/ru";

import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

registerLocaleData(ru);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, BrowserAnimationsModule],
  providers: [
    { provide: NZ_I18N, useValue: ru_RU },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
