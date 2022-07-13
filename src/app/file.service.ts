import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private readonly server: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  /**
   ** reportProgress: true, mostrará algún progreso de cualquier solicitud HTTP.
   ** observe: 'events', debemos usar esta opción si deseamos ver todos los eventos, 
   **     incluido el progreso de las transferencias. Además, debemos devolver 
   **     un Observable de tipo HttpEvent.
   */
  upload(formData: FormData): Observable<HttpEvent<string[]>> {
    return this.http.post<string[]>(`${this.server}/file/upload`, formData, { reportProgress: true, observe: 'events' });
  }

  download(filename: string): Observable<HttpEvent<Blob>> {
    return this.http.get(`${this.server}/file/download/${filename}`, { reportProgress: true, observe: 'events', responseType: 'blob' });
  }


}
