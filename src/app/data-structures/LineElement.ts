import { v4 } from "uuid";
import { SublineElement } from "./SublineElement";

export class LineElement{
    constructor(){
        this.active = true;
        this.id = v4();
        this.text = '';
        this.children = [];
        this.children.push(new SublineElement())
    }
    active: boolean
    id: string;
    text: string;
    children: Array<SublineElement>;
    type: string;
}   