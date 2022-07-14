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
    files.forEach(file => formData.append('files', file, file.name));
    this.fileService.upload(formData)
      .subscribe({
        next: (event: HttpEvent<string[]>) => {
          console.log(event);
          this.reportPorgress(event);
        },
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  onDownloadFiles(filename: string): void {
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
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading...');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Downloading...');
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) { //* Si la respueta trae un arreglo de nombres, entonces fue por el upload
          httpEvent.body.forEach(filename => this.filenames.unshift(filename));
        } else { //* Download logic
          saveAs(new File([httpEvent.body!], httpEvent.headers.get('File-Name')!, { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }));
          //*Otra forma
          //*saveAs(new Blob([httpEvent.body!], { type: `${httpEvent.headers.get('Content-Type')};charset=utf-8` }), httpEvent.headers.get('File-Name')!);
        }
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
