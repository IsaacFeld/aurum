import { FileElement } from "../data-structures/FileElement";


export class FileService {
    constructor(fileMap: Map<string, FileElement>) {
        this.fileMap = fileMap
    }
    fileMap: Map<string, FileElement> 
    currentPath = 'root/';
    add(fileElement: FileElement){
        fileElement.path = this.currentPath
        this.fileMap.set(fileElement.id, fileElement)
        if(fileElement.isFolder){
            window.electronAPI.addFolder(this.currentPath, fileElement.id)
        }
        else{
            window.electronAPI.addFile(this.currentPath, fileElement.id)
        }
        window.electronAPI.setFilemap(this.fileMap)
    }
    delete(id: string){
        if(!this.fileMap.get(id)!.isFolder){
            this.fileMap.delete(id)
            window.electronAPI.removeFile(this.currentPath, id)
        }
        else{
            this.fileMap.forEach((fileElement) =>{
                if(fileElement.path != null){
                    if(fileElement.path.includes(id)){
                        this.fileMap.delete(fileElement.id)
                    }
                }
            })
            this.fileMap.delete(id)
            window.electronAPI.removeFolder(this.currentPath, id)
        }
        window.electronAPI.setFilemap(this.fileMap)
    }
    clear(){
        this.fileMap.clear()
        window.electronAPI.setFilemap(new Map<string, FileElement>())
    }
    updateFolder(folderId: string){
        let results = new Array()
        this.fileMap.forEach(function(fileElement){
            if(fileElement.parentId == folderId){
                results.push(fileElement)
            }
        })
        return results
    }
    rename(id: string, newName: string){
        this.fileMap.get(id)!.name = newName;
        window.electronAPI.setFilemap(this.fileMap)
    }
    queryFolder(folderId: string){
        console.log(folderId)
            let results = new Array()
            this.fileMap.forEach(function(fileElement) {
                console.log(folderId)
                console.log(fileElement.parentId)
                if(fileElement.parentId == folderId && fileElement.id != folderId){
                    results.push(fileElement)
                }
            })
            if(folderId != 'root'){
                this.currentPath += `${this.fileMap.get(folderId)!.id}/`
            }
            return results
    }
    return(activeFileElement: FileElement){
        let results = new Array()
        let previousParent: string;
        if(activeFileElement == null){
            previousParent = this.fileMap.get(this.currentPath.split('/')[this.currentPath.split('/').length - 2])!.parentId
        }
        else{
            previousParent = this.fileMap.get(activeFileElement.parentId)!.parentId
        }
        this.fileMap.forEach(function(fileElement) {
            // all current File Elements have the same parent
            // Check parent's parent, and search for all File Elements with that parent
            if(fileElement.parentId == previousParent){
                results.push(fileElement)
            }
        })
        let temp = this.currentPath.split('/')
        temp.splice(temp.length-2)
        this.currentPath = temp.join('/')
        if(this.currentPath[this.currentPath.length] != '/' && this.currentPath.length != 0){
            this.currentPath += '/'
        }
        return results
    }
    convertPath(){
        let convertedPath = '';
            for(let i = 0; i < this.currentPath.split('/').length-1; i++){
                if(this.fileMap.get(this.currentPath.split('/')[i])?.name == null){
                    convertedPath+='root/'
                }
                else{
                    convertedPath += `${this.fileMap.get(this.currentPath.split('/')[i])?.name}/`;

                }
            }

        return convertedPath;
    }
}