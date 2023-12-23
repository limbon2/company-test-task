import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { ApiLoginData, ApiLoginResponse } from "../models/api.model";
import { API_URL } from "../config/api";
import { appendDeveloper } from "../utils/append-developer";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private token: string | null = localStorage.getItem("test-app/token");

  public login(data: ApiLoginData): Observable<string> {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const headers = { "Content-Type": "multipart/form-data" };

    return this.http
      .post<ApiLoginResponse>(`${API_URL}/login/`, formData, { headers, params: appendDeveloper({}) })
      .pipe(
        map((response) => response.message.token),
        tap((token) => {
          this.token = token;
          localStorage.setItem("test-app/token", token);
        })
      );
  }
}
