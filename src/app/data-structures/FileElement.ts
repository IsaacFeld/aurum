export class FileElement{
    constructor(name: string, id: string, isFolder: boolean, parentId: string){
        this.name = name
        this.id = id;
        this.isFolder = isFolder;
        this.parentId = parentId
    }

    name: string;
    id: string;
    isFolder: boolean;
    parentId: string;
    path: string;
}