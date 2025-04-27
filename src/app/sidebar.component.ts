import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BypassHtmlSanitizerPipe } from './bypass.pipe';
import { FileElement } from './data-structures/FileElement';
import { FileService } from './services/FileService';
import { v4 } from 'uuid'
import { CdkTrapFocus } from '@angular/cdk/a11y';



@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
    imports: [BypassHtmlSanitizerPipe, CdkTrapFocus]
})


export class Sidebar{
    @Input() mousePosition: any; // For checking if user's mouse is within the text editor or sidebar
    @Input() sidebarVisible = '';
    fs: FileService;
    fileElements: Array<FileElement> = []

    @Output() fileSelectEvent = new EventEmitter<string> // sending id to texteditor

    /* Dragging */
    currentDragFileId: string
    currentId: string
    lastActiveID: string

    currentPath: string;
    displayedCurrentPath: string;

    canReturn = false;

    strokeColor = '#D5C4A1'

    // Add file & folder buttons
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
        let fileMapData = window.electronAPI.getFilemap()

        let fileMap = new Map<string, FileElement>()
        if(fileMapData.length != 0){
            fileMapData = JSON.parse(fileMapData)
            for(let i = 0; i < fileMapData.length; i ++){
                fileMap.set(fileMapData[i][0], fileMapData[i][1])
            }
            window.electronAPI.setFilemap(fileMap)
        }
        this.fs = new FileService(fileMap)
        this.currentPath = this.fs.convertPath()
        this.displayedCurrentPath = this.currentPath.split('root/')[1]
        this.fileElements = this.fs.queryFolder('root')
    }
    getOpacity(isFolder:boolean){
        let opacity: number
        isFolder ?  opacity = 1 : opacity = 0
        return opacity
    }
    query(folderId: string, event: any){
        console.log(this.fs.fileMap)
        console.log(this.fs.fileMap.get(folderId))
        if(this.fs.fileMap.get(folderId)!.isFolder) {
            this.canReturn = true
            this.fileElements =  this.fs.queryFolder(folderId)
        }
        else{
            // Clicked on file EVENT -> save file id to currentId
            this.currentId = event.target.classList[0]
            
            if(this.lastActiveID){ // If there was a previous file open, close it.
                if(this.fs.fileMap.get(this.lastActiveID)){
                    this.fs.fileMap.get(this.lastActiveID)!.active = ''

                }
            }

            this.fs.fileMap.get(this.currentId)!.active = 'active' // open new file
            this.lastActiveID = this.currentId // save new file id to last active id

            this.fileSelectEvent.emit(this.currentId) // tell texteditor to load new file data
        }
        this.currentId = event.target.classList[0] // asign new id to clicked file
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
        if(!document.querySelector('#fileExplorer')?.classList.contains('disabled')){
            let parentId: string;
            if(this.fileElements[0] == null){
                parentId = this.fs.currentPath.split('/')[this.fs.currentPath.split('/').length -2]
            }
            else{
                parentId = this.fileElements[0].parentId
            }
    
            let fileId = v4();
            this.fs.add(new FileElement('', fileId, false, parentId))
            this.fileElements = this.fs.updateFolder(parentId)
        }
    }
    addFolder(){
        if(!document.querySelector('#fileExplorer')?.classList.contains('disabled')){
            let parentId: string;
            if(this.fileElements[0] == null){
                parentId = this.fs.currentPath.split('/')[this.fs.currentPath.split('/').length -2]
            }
            else{
                parentId = this.fileElements[0].parentId
            }
            let folderId = v4()
            this.fs.add(new FileElement('', folderId, true, parentId))
            this.fileElements = this.fs.updateFolder(parentId)
        }
    }

    rename(id: string, renameEvent: any){
        this.fs.rename(id, renameEvent.target.value)
        if(document.elementFromPoint(this.mousePosition.x, this.mousePosition.y)?.classList.contains('EditorContainer')){
            document.querySelector('#fileExplorer')?.classList.add('disabled')
            document.querySelector('#fileEditor')?.classList.remove('disabled')
        }
    }
    focusOut(event: any, nativeEvent: Event){ // on finishing input for filename (can check for valid file name)

        if(event.target.value.length == 0){
            event.target.parentElement.remove()
            this.fs.delete(event.target.classList[0])
        }
        else{
        }


       // document.querySelector(`.${event.target.classList[0]}`)?.classList.add('active')

    }
    dragStart(draggedId: string){
        this.currentDragFileId = draggedId;
    }

    dropInFolder(event: any) {
        if(event.toElement.classList.contains('file')){
            event.toElement.classList.remove('abducted')    
            if(this.fs.fileMap.get(event.toElement.classList[0])?.isFolder){
               let targetDir = this.fs.fileMap.get(event.toElement.classList[0])
               let draggedFile = this.fs.fileMap.get(this.currentDragFileId)
               if(targetDir!.id != draggedFile!.id){
                let newFileElement = new FileElement(draggedFile!.name, draggedFile!.id, draggedFile!.isFolder, targetDir!.id)
                newFileElement.path = draggedFile!.path
                newFileElement!.path ? newFileElement!.path += targetDir!.id + '/' : console.log('error moving forward directory')
                this.fs.fileMap.set(this.currentDragFileId, newFileElement)

                window.electronAPI.move(this.fs.currentPath, draggedFile!.id, targetDir!.id, draggedFile!.isFolder)

                this.fileElements = this.fs.updateFolder(targetDir!.parentId)
               }    
            }
        }
    }
    returnDirDrag(event: any){
        // return parentid to previous dir and update folder
        let dragFile = this.fs.fileMap.get(this.currentDragFileId)
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

        this.fs.fileMap.set(this.currentDragFileId, newFileElement)

        window.electronAPI.move(this.fs.currentPath, dragFile!.id, undefined, dragFile!.isFolder)

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
        let dragFile = this.fs.fileMap.get(this.currentDragFileId)
        this.fs.delete(this.currentDragFileId)
        this.fileElements = this.fs.updateFolder(dragFile!.parentId)
    }



}