import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { FileElement } from './data-structures/FileElement';
import { LineElement } from './data-structures/LineElement';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};

declare global { // needed for stuff
  interface Window {
  electronAPI: {
    sendMessage:
      (message : string) => void;
    communicate:
      () => void;
    sendData:
      (message : any) => void;
      
    addFile : 
      (currentPath: string, fileId: string) => void;

    addFolder : 
      (currentPath: string, folderId: string) => void;

    removeFile :
       (currentPath: string, fileId: string) => void;

    removeFolder : 
      (currentPath: string, folderId: string) => void;

    move : 
      (currentPath: string, fileId: string, targetId?: string, isFolder?: boolean) => void;
      
    getFilemap :
      () => any;

    setFilemap :
      (fileMap: Map<string, FileElement>) => void;

    getMarkdown: 
      (currentPath: string, fileId: string) => string,

    setMarkdown: 
      (currentPath: string, fileId: string, md: Array<string>) => void,

    getJSON: 
      (currentPath: string, fileId: string) => string,
    setJSON: 
      (currentPath: string, fileId: string, html: LineElement[]) => void,
    } 

  }

}
