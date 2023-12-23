import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { NzNotificationService } from "ng-zorro-antd/notification";

@Injectable()
export class ErrorMessagesInterceptor implements HttpInterceptor {
  private readonly notifications = inject(NzNotificationService);

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((response) => {
        if (response instanceof HttpResponse) {
          if (response.body.status !== "ok") {
            this.notifications.error("Ошибка 😟", "Что то пошло не так");
            throw new HttpErrorResponse({
              error: JSON.stringify(response.body),
              headers: response.headers,
              url: response.url ?? "",
            });
          }
        }
        return response;
      })
    );
  }
}
