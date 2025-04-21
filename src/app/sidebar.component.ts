import { Component, Input, ViewChild } from '@angular/core';
import { BypassHtmlSanitizerPipe } from './bypass.pipe';
import { FileElement } from './data-structures/FileElement';
import { FileService } from './services/FileService';
import { v4 } from 'uuid'
import { A11yModule } from '@angular/cdk/a11y'
import { CdkTrapFocus } from '@angular/cdk/a11y';

@Component({
    selector: 'sidebar',
    template: `
        @if(sidebarVisible == 'initial' || sidebarVisible == 'show') {
        <div class="sidebar-container {{sidebarVisible}}">
            <div class="sidebar-content">
                <p class="sidebar-title quicksand-700 primaryText">{{title}}</p>
                <div class="button-container">
                    @for(button of buttons; track button.id){
                        @if(button.id == 0){
                            <button class="icon" (click)="addFile($event)" [innerHTML]="button.svg | bypassHtmlSanitizer"></button>
                        }
                        @else if(button.id == 1){
                            <button class="icon" (click)="addFolder()" [innerHTML]="button.svg | bypassHtmlSanitizer"></button>
                        }
                       
                    }
                </div>
                <div class="notes-container">
                <p class="quicksand-700 currentPath">{{displayedCurrentPath}}</p>
                <div class="toolbar">
                <button (dragover)="$event.preventDefault()" (drop)="returnDirDrag($event)" [disabled]="!canReturn" class="icon" id="prevDirButton" (click)="returnDir()">
                    <svg  aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path [attr.stroke]="strokeColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
                    </svg>
                </button>
                <button class="icon" id="trashButton" (drop)="deleteFileElement($event)" (dragenter)="dragEnter($event)" (dragleave)="dragLeave($event)" (dragover)="$event.preventDefault()">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"> <path [attr.stroke]="strokeColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/></svg>
                </button>
                </div>
                    @for(fileElement of fileElements; track fileElement!.id){
                        @if(fileElement.name.length != 0){
                            <ul draggable="true" (dragstart)="dragStart(fileElement.id)"(dragenter)="dragEnter($event)" (dragleave)="dragLeave($event)" (dragover)="$event.preventDefault()" (drop)="dropInFolder($event)">
                            <button  class="file quicksand-500 {{fileElement.id}}" (click)="query(fileElement.id)">
                                <svg  [attr.opacity]="getOpacity(fileElement.isFolder)"  aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" [attr.fill]="strokeColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd" d="M10.271 5.575C8.967 4.501 7 5.43 7 7.12v9.762c0 1.69 1.967 2.618 3.271 1.544l5.927-4.881a2 2 0 0 0 0-3.088l-5.927-4.88Z" clip-rule="evenodd"/>
                                </svg>
                                {{fileElement.name}}
                            </button>
                            </ul>
                        }
                        @else {
                            <div class="fileElementInputWrapper">
                                <input [cdkTrapFocusAutoCapture]="show" [cdkTrapFocus]="show" (blur)="focusOut($event, $event)" (change)="rename(fileElement.id, $event)" type="text"  class="fileElementInput quicksand-500 fileElInput {{fileElement.id}}">
                            </div>
                        }
                    }

                   
                </div>
            </div>
        </div>
        }
        @else {
            <div class="sidebar-container hiding">
            </div>
        }
    `,
    styleUrl: './sidebar.component.css',
    imports: [BypassHtmlSanitizerPipe, CdkTrapFocus]
})



export class Sidebar{
    currentDragFile: string
    show=true;
    fileElements = new Array;
    canReturn = false;
    currentPath: string;
    displayedCurrentPath: string;
    fs: FileService;
    strokeColor = '#D5C4A1'
    @Input() sidebarVisible = '';
    title = 'Aurum';
    buttons = [
        {
            svg:`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#D5C4A1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9V4a1 1 0 0 0-1-1H8.914a1 1 0 0 0-.707.293L4.293 7.207A1 1 0 0 0 4 7.914V20a1 1 0 0 0 1 1h4M9 3v4a1 1 0 0 1-1 1H4m11 6v4m-2-2h4m3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"/></svg>`, 
            id: 0,
        }, 
        {
            svg: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke=#D5C4A1 stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 8H4m8 3.5v5M9.5 14h5M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/></svg>`,
            id: 1,
        }   
    ]
    ngOnInit(){
        this.fs = new FileService(new Map<string, FileElement>)
        this.currentPath = this.fs.convertPath()
        this.displayedCurrentPath = this.currentPath.split('root/')[1]
    }
    getOpacity(isFolder:boolean){
        let opacity: number
        isFolder ?  opacity = 1 : opacity = 0
        return opacity
    }
    query(folderId: string){
        if(this.fs.fileMap.get(folderId)!.isFolder) {
            this.canReturn = true
            this.fileElements =  this.fs.queryFolder(folderId)
        }
        else{
            // Implement logic to open the markdown editor.
        }
        this.currentPath = this.fs.convertPath()
        this.displayedCurrentPath = this.currentPath.split('root/')[1]
    }
    returnDir(){
        this.fileElements = this.fs.return(this.fileElements[0])
        this.currentPath = this.fs.convertPath()
        this.displayedCurrentPath = this.currentPath.split('root/')[1]
        if(this.currentPath == 'root/'){
            this.canReturn = false;
        }
    }

    addFile(event: any){
        let parentId: string;
        if(this.fileElements[0] == null){
            parentId = this.fs.currentPath.split('/')[this.fs.currentPath.split('/').length -2]
        }
        else{
            parentId = this.fileElements[0].parentId
        }
        this.fs.add(new FileElement('', v4(), false, parentId))
        this.fileElements = this.fs.updateFolder(parentId)


    }
    addFolder(){
        let parentId: string;
        if(this.fileElements[0] == null){
            parentId = this.fs.currentPath.split('/')[this.fs.currentPath.split('/').length -2]
        }
        else{
            parentId = this.fileElements[0].parentId
        }
        this.fs.add(new FileElement('', v4(), true, parentId))
        this.fileElements = this.fs.updateFolder(parentId)

    }

    rename(id: string, event: any){
        this.fs.rename(id, event.target.value)
    }
    focusOut(event: any, nativeEvent: Event){
        if(event.target.value.length == 0){
            event.target.parentElement.remove()
            this.fs.delete(event.target.classList[0])
        }

    }
    dragStart(draggedId: string){
        this.currentDragFile = draggedId;
    }

    dropInFolder(event: any) {
        if(event.toElement.classList.contains('file')){
            event.toElement.classList.remove('abducted')    
            if(this.fs.fileMap.get(event.toElement.classList[0])?.isFolder){
               let targetDir = this.fs.fileMap.get(event.toElement.classList[0])
               let draggedFile = this.fs.fileMap.get(this.currentDragFile)
               if(targetDir!.id != draggedFile!.id){
                let newFileElement = new FileElement(draggedFile!.name, draggedFile!.id, draggedFile!.isFolder, targetDir!.id)
                newFileElement.path = draggedFile!.path
                newFileElement!.path ? newFileElement!.path += targetDir!.id + '/' : console.log('error moving forward directory')
                this.fs.fileMap.set(this.currentDragFile, newFileElement)
                this.fileElements = this.fs.updateFolder(targetDir!.parentId)
               }    
            }
        }
    }
    returnDirDrag(event: any){
        // return parentid to previous dir and update folder
        let dragFile = this.fs.fileMap.get(this.currentDragFile)
        let prevDir: string;
        if(this.fs.currentPath.split('/').length == 2){
            prevDir = 'root'
        }
        else{
            prevDir = this.fs.currentPath.split('/')[this.fs.currentPath.split('/').length - 3]
        }
        let newFileElement = new FileElement(dragFile!.name, dragFile!.id, dragFile!.isFolder, prevDir)
        newFileElement.path = dragFile!.path 
        let temp = newFileElement.path.split('/')   
        temp.splice(temp.length - 2, 1)
        newFileElement.path = temp.join('/');
        newFileElement.path ? newFileElement.path : console.log('error moving back directory')
        this.fs.fileMap.set(this.currentDragFile, newFileElement)
        this.fileElements = this.fs.updateFolder(dragFile!.parentId)
    }


    dragEnter(event: any){
         event.toElement.classList.add('abducted')
    }
    dragLeave(event: any){
        event.toElement.classList.remove('abducted')
    }

    deleteFileElement(event: any){
        event.toElement.classList.remove('abducted')
        let dragFile = this.fs.fileMap.get(this.currentDragFile)
        this.fs.delete(this.currentDragFile)
        this.fileElements = this.fs.updateFolder(dragFile!.parentId)
    }


}