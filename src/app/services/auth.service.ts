import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { ApiLoginData, ApiLoginResponse } from "../models/api.model";
import { API_URL } from "../config/api";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "test-app/token";

  private readonly http = inject(HttpClient);
  private _token: string | null = localStorage.getItem("test-app/token");

  public get token(): string | null {
    return this._token;
  }

  constructor() {
    window.addEventListener("storage", (event) => {
      if (event.key === this.tokenKey) {
        this._token = event.newValue;
      }
    });
  }

  public login(data: ApiLoginData): Observable<string> {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    return this.http.post<ApiLoginResponse>(`${API_URL}/login/`, formData).pipe(
      map((response) => response.message.token),
      tap((token) => {
        this._token = token;
        localStorage.setItem(this.tokenKey, token);
      })
    );
  }

  public logout(): void {
    this._token = null;
    localStorage.removeItem(this.tokenKey);
  }
}
