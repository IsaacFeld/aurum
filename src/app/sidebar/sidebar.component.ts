import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BypassHtmlSanitizerPipe } from '../pipes/bypass.pipe';
import { FileElement } from '../data-structures/FileElement';
import { FileService } from '../services/FileService';
import { v4 } from 'uuid'
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { SliderComponent } from "../slider/slider.component";



@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
    imports: [BypassHtmlSanitizerPipe, CdkTrapFocus, SliderComponent]
})


export class Sidebar{
    @Input() mousePosition: any; // For checking if user's mouse is within the text editor or sidebar
    @Input() sidebarVisible = ''; // For sidebar visibility toggle
    @Input() fileSaveEvent: any;      // Texteditor-specific attribues of fileElements need to be relayed to filemap
    fs: FileService;
    fileElements: Array<FileElement> = [] // Array of fileElements within the current directory to be rendered on to the screen 

    @Output() fileSelectEvent = new EventEmitter<string> // sending id to texteditor
    @Output() fileDeleteEvent = new EventEmitter<string> // sending id of deleted file to texteditor
    @Output() fileMoveEvent = new EventEmitter<Object> // sending new path & file id, and file to text editor
    @Output() fileRenameEvent = new EventEmitter<Object> // sending new name! So it updates dynamically
    /* Dragging */
    currentDragFileId: string 
    currentId: string
    lastActiveID: string

    currentPath: string;
    displayedCurrentPath: string;

    canReturn = false;

    strokeColor = '#D5C4A1'

    timer: any
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

    fontSliderTitle = 'Default';

    ngOnChanges(changes: any){
        // Texteditor-specific attribues of fileElements need to be relayed to filemap
        if(changes.fileSaveEvent){
            if(changes.fileSaveEvent.currentValue != null){
                this.fs.fileMap.get(changes.fileSaveEvent.currentValue.id)!.rHTML = changes.fileSaveEvent.currentValue.rHTML
                this.fs.fileMap.get(changes.fileSaveEvent.currentValue.id)!.md = changes.fileSaveEvent.currentValue.md
                this.fs.fileMap.get(changes.fileSaveEvent.currentValue.id)!.states = changes.fileSaveEvent.currentValue.states
            }
        }
  
    }
    switchFont(event: number){
        let titleArr = ['Miniscule', 'Small', 'Default', 'Big', 'Gigantic']
        let arrIndex = event - 1
        let arr = [
            ['1.424', '1.266', '1.125', '1', '0.9', '0.825'],
            ['1.602', '1.424', '1.266', '1.125', '1', '0.9'],
            ['1.802', '1.602', '1.424', '1.266', '1.125', '1'],
            ['2.002', '1.802', '1.602', '1.424', '1.266', '1.125'],
            ['2.202', '2.002', '1.802', '1.602', '1.424', '1.266'],
            
        ]
        let s = document.styleSheets[1]
        // If the last rule is a font size variable setter, delete so we don't create copies of the same rule
        if(s.cssRules[s.cssRules.length-1].cssText.includes('em !important;')){
            s.deleteRule(s.cssRules.length-1)
        }
        this.fontSliderTitle = titleArr[arrIndex]
        s.insertRule(`
            .subline
            {
                --t1-size: ${arr[arrIndex][0]}em !important;
                --t2-size: ${arr[arrIndex][1]}em !important;
                --t3-size: ${arr[arrIndex][2]}em !important;
                --t4-size: ${arr[arrIndex][3]}em !important;
                --t5-size: ${arr[arrIndex][4]}em !important;
                --t6-size: ${arr[arrIndex][5]}em !important;
                transition: font-size 0.3s ease-in;
            }
            `, s.cssRules.length)
        // Append rule to stylesheet controlling font size variables depending on slider stage
    }
    async ngOnInit(){
        // Read filemap.json and use that as a starting point 
        let fileMapData = await window.electronAPI.getFilemap()

        let fileMap = new Map<string, FileElement>()
        if(fileMapData.length != 0){
            fileMapData = JSON.parse(fileMapData)
            for(let i = 0; i < fileMapData.length; i ++){
                if(fileMapData[i][1].active == 'active'){
                    this.lastActiveID = fileMapData[i][1].id
                }
                fileMap.set(fileMapData[i][0], fileMapData[i][1])
            }
            window.electronAPI.setFilemap(fileMap) // Update filemap after converting it from an array to a map
        }
        this.fs = new FileService(fileMap) // setup new file service instance with file map
        this.currentPath = this.fs.convertPath()
        this.displayedCurrentPath = this.currentPath.split('root/')[1]
        this.fileElements = this.fs.queryFolder('root') // app starts at root folder
    }
    getOpacity(isFolder:boolean){ // If fileElement is a folder we show the folder icon, if not we hide the icon.
        let opacity: number
        isFolder ?  opacity = 1 : opacity = 0
        return opacity
    }
    query(folderId: string, event: any){ // Click on folder/file event
        if (event.detail === 1 || event.detail === 0) {
            this.timer = setTimeout(() => {
                if(this.fs.fileMap.get(folderId)!.isFolder) {
                    this.canReturn = true
                    this.fileElements =  this.fs.queryFolder(folderId) // Update file view to clicked folder's files
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
        
                    this.fileSelectEvent.emit(this.currentId) // tell app, and then app will tell texteditor to load new file data
                }
                this.currentId = event.target.classList[0] // asign new id to clicked file
                this.currentPath = this.fs.convertPath()
                this.displayedCurrentPath = this.currentPath.split('root/')[1]
            }, 150)
        }


    }
    returnDir(){
        this.fileElements = this.fs.return(this.fileElements[0]) 
        // If a file is present, we can use its path attribute to figure out previous dir
        // Else the file service will automatically use the current path to figure out previous dir
        this.currentPath = this.fs.convertPath()
        this.displayedCurrentPath = this.currentPath.split('root/')[1]
        if(this.currentPath == 'root/'){ // Can't return if at root
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
               // setting parent id of new file element
    
            let fileId = v4();
            this.fs.add(new FileElement('', fileId, false, parentId))
            // add new file element to filemap
            this.fileElements = this.fs.updateFolder(parentId)
            // update view to see new file
        }
    }
    addFolder(){
        // same as add file
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

    rename(id: string, renameEvent: any){ // While file element name is length of 0 upon changing the name we rename the file 
        this.fs.rename(id, renameEvent.target.value)
        if(document.elementFromPoint(this.mousePosition.x, this.mousePosition.y)?.classList.contains('EditorContainer')){
            document.querySelector('#fileExplorer')?.classList.add('disabled')
            document.querySelector('#fileEditor')?.classList.remove('disabled')
        }
    }
    renameFileElement(event: any){
        clearTimeout(this.timer)
        let oldName =  this.fs.fileMap.get(event.target.classList[0])!.name
        this.fs.fileMap.get(event.target.classList[0])!.name = ''
    }

    focusOut(event: any){ // on finishing input for filename (can check for valid file name)
        if(event.target.value.length == 0){
            event.target.parentElement.remove()
            this.fs.delete(event.target.classList[0])
            this.fileDeleteEvent.emit(event.target.classList[0])
        }
        else{
            this.fileRenameEvent.emit({
                newName: event.target.value,
                id: event.target.classList[0]
            })
        }

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
                // Constructing New File Element from dragFile (child) & targetDir (parent)
                let newFileElement = new FileElement(draggedFile!.name, draggedFile!.id, draggedFile!.isFolder, targetDir!.id)
                newFileElement.active = draggedFile!.active
                newFileElement.path = draggedFile!.path
                newFileElement.rHTML = draggedFile!.rHTML
                newFileElement.md = draggedFile!.md
                newFileElement.states = draggedFile!.states
                newFileElement!.path ? newFileElement!.path += targetDir!.id + '/' : console.log('error moving forward directory')

                this.fs.fileMap.set(this.currentDragFileId, newFileElement)
                window.electronAPI.move(this.fs.currentPath, draggedFile!.id, targetDir!.id, draggedFile!.isFolder)

                this.fileElements = this.fs.updateFolder(targetDir!.parentId)
                this.fileMoveEvent.emit(
                    {
                    id: draggedFile!.id,
                    move: 'forward',
                    newParent: newFileElement.parentId,
                    newPath: newFileElement.path,
                    newFile: newFileElement,
             
                    }
                )
                // Tell texteditor via app a file has been moved
                // Texteditor needs to update currentFile.path, or else when saving the file the old path will still be used
               }    
            }
        }

    }
    returnDirDrag(event: any){
        // Same as dropInFolder except the path is extrapolated differently
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
        newFileElement.active = dragFile!.active
        newFileElement.rHTML = dragFile!.rHTML
        newFileElement.md = dragFile!.md
        newFileElement.states = dragFile!.states


        let temp = newFileElement.path.split('/')   
        temp.splice(temp.length - 2, 1)
        newFileElement.path = temp.join('/');
        newFileElement.path ? newFileElement.path : console.log('error moving back directory')

        this.fs.fileMap.set(this.currentDragFileId, newFileElement)

        window.electronAPI.move(this.fs.currentPath, dragFile!.id, undefined, dragFile!.isFolder)

        this.fileElements = this.fs.updateFolder(dragFile!.parentId)
        this.fileMoveEvent.emit(
            {
               id: dragFile!.id,
               move: 'return',
               newParent: newFileElement.parentId,
               newPath: newFileElement.path,
               newFile: newFileElement,

            }   
        )
    }
    dragEnter(event: any){ // Show target dir
        if(event.toElement.classList.contains('icon')){
            event.toElement.classList.add('abducted')
        }
        else if(this.fs.fileMap.get(event.toElement.classList[0])!.isFolder){
        event.toElement.classList.add('abducted')
        }
     
    }
    dragLeave(event: any){ // Show target dir
        if(event.toElement.classList.contains('icon')){
            event.toElement.classList.remove('abducted')
        }
        else if(this.fs.fileMap.get(event.toElement.classList[0])!.isFolder){
            event.toElement.classList.remove('abducted')
        }
    }

    deleteFileElement(event: any){
        event.toElement.classList.remove('abducted')
        let dragFile = this.fs.fileMap.get(this.currentDragFileId)
        this.fs.delete(this.currentDragFileId)
        this.fileElements = this.fs.updateFolder(dragFile!.parentId)
        this.fileDeleteEvent.emit(this.currentDragFileId)
    }



}