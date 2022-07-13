import { HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';

import { FileService } from './file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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

  private reportPorgress(httpEvent: HttpEvent<string[] | Blob>) {
    throw new Error('Method not implemented.');
  }

}
