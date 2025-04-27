import { LineElement } from "./LineElement";

export class FileElement{
    constructor(name: string, id: string, isFolder: boolean, parentId: string){
        this.name = name
        this.id = id;
        this.isFolder = isFolder;
        this.parentId = parentId
        this.active = '';
        this.rHTML = [];
        this.md = ['']
        this.states = {
            titleState: false,
            boldState: false,
            activeIndex: 0,
            activeChildIndex: 0,
        }

    }
    name: string;
    id: string;
    isFolder: boolean;
    parentId: string;
    path: string;
    active: string;
    rHTML: LineElement[];
    md: string[];
    states: {
        titleState: boolean,
        boldState: boolean,
        activeIndex: number,
        activeChildIndex: number,
    }
    index: number;
}