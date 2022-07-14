import { HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';

import { saveAs } from 'file-saver';

import { FileService } from './file.service';

interface FileStatus {
  status: string;
  requestType: string;
  percent: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  filenames: string[] = [];
  fileStatus: FileStatus = { status: '', requestType: '', percent: 0 };

  constructor(private fileService: FileService) { }

  onUploadFiles(files: File[]): void {
    const formData = new FormData();
    for (const file of files) { formData.append('files', file, file.name); }
    this.fileService.upload(formData)
      .subscribe({
        next: (event: HttpEvent<string[]>) => {
          console.log(event);
          this.reportPorgress(event);
        },
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  onDownloadFile(filename: string): void {
    this.fileService.download(filename)
      .subscribe({
        next: (event: HttpEvent<Blob>) => {
          console.log(event);
          this.reportPorgress(event);
        },
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  private reportPorgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress: //* 1
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading...');
        break;
      case HttpEventType.DownloadProgress: //* 3
        if (httpEvent.total) { //*Leer nota 01
          this.updateStatus(httpEvent.loaded, httpEvent.total, 'Downloading...');
        }
        break;
      case HttpEventType.ResponseHeader: //* 2
        console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response: //* 4
        if (httpEvent.body instanceof Array) { //* Si la respueta trae un arreglo de nombres, entonces fue por el upload

          httpEvent.body.forEach(filename => this.filenames.unshift(filename));

        } else { //* Download logic
          saveAs(new File([httpEvent.body!], httpEvent.headers.get('File-Name')!, { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }));
          //*Otra forma
          //*saveAs(new Blob([httpEvent.body!], { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }), httpEvent.headers.get('File-Name')!);
        }

        this.fileStatus.status = 'done';
        break;
      default:
        console.log('Switch default', httpEvent);
        break;
    }
  }

  private updateStatus(loaded: number, total: number, requestType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round(100 * loaded / total);
  }

}
/**
 * * Nota 01:
 * * Cuando se hace un UPLOAD, empieza con type = 0, luego al ir subiendo
 * * el archivo es type = 1, hasta que termina de subir donde su 
 * * loaded == total, luego muestra un type = 2, y luego aquí ¡Ojo! muestra
 * * a continuación un {type = 3, loaded = 27}, es decir el case para descargar,
 * * el que precisamente está llamando al método this.updateStatus(...), quien en su
 * * interior hace la división para calcular el porcentaje, y al ver que no hay el total
 * * (undefined), realiza la operación y le asigna al atributo percent = NAN, que es lo
 * * que visualmente se observa por milésimas de segundo en pantalla. Finalmente, se recibe
 * * otro type = 4. 
 * * Entonces, para evitar que se muestre ese NAN, se hizo esa condición.
 */