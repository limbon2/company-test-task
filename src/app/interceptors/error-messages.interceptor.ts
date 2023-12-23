import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

@Injectable()
export class ErrorMessagesInterceptor implements HttpInterceptor {
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((response) => {
        if (response instanceof HttpResponse) {
          if (response.body.status !== "ok") {
            throw new HttpErrorResponse({
              error: response.body.message,
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
