import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, pipe, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environments } from '../../environments/environments';
import { ContentRequest } from '../../shared/models/content-request';
import { ContentResponse } from '../../shared/models/content-response';
import { GeneratedContent } from '../../shared/models/generated-content';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly apiUrl = environments.apiUrl;

  constructor(private http: HttpClient) {}

  generateContent(request: ContentRequest): Observable<GeneratedContent> {
    return this.http
      .post<ContentResponse>(`${this.apiUrl}/api/content/generate`, request)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.error || 'Error desconocido');
          }
        }),
        catchError(this.handleError)
      );
  }

  checkHealth(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/api/content/health`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      const status = error.status || 0;
      if (status === 0) {
        errorMessage = 'Error de conexión';
      } else {
        errorMessage = `Código: ${status}, Mensaje: ${error.message}`;
      }
    }

    console.error('Error en ContentService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
