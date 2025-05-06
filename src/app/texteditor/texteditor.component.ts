import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LineElement } from '../data-structures/LineElement';
import { SublineElement } from '../data-structures/SublineElement';
import { FileElement } from '../data-structures/FileElement';

@Component({
  selector: 'app-texteditor',
  imports: [],
  templateUrl: './texteditor.component.html',
  styleUrl: './texteditor.component.css'
})

export class TexteditorComponent {
  /* External File retrieval & local save system */
  @Output() saveFileEvent = new EventEmitter<FileElement>(false) // Tell app to save file
  @Input() id: string; 
  @Input() fileEvent: any;

  currentFile: FileElement | any 
  // currentFile represents all the data of the selected file (SEE './data-structures/FileElement.ts') 
  // Can be any since we need to set null for delete event
  localFilemap: Map<string, FileElement> = new Map() // local version of filemap that should correspond to actual sidebar filemap
  /* File Properties */ 
  markdownString: Array<String> // plaintext to be stored in .md file
  renderedHTML: LineElement[] = []; // complex html visualization of plaintext 
  activeIndex: number = 0 // line index
  activeChildIndex: number = 0 // subline index
  boldState: boolean = false // if text is currently within asterisks or after one
  titleState: boolean = false // if text is currently after a ##
  fileName: string; // file name to be displayed as the title

  init: boolean = true // for setting .active correctly on app initialization

  lastActiveId: string; // for setting .active correctly on app initialization

  ngOnInit(){
    /* TYPING LOGIC */
    document.addEventListener('keydown', (event) =>{
      if(document.querySelector('#fileExplorer')!.classList.contains('disabled') && document.querySelector('.fileElementInput') == null && this.currentFile && this.localFilemap){
        let canAdd = true;

 
        if( this.renderedHTML.length == 0){
          this.renderedHTML.push(new LineElement())
        }

        if (event.ctrlKey && event.key === 's') { // SAVE LOGIC
          // Prevent the Save dialog to open
          event.preventDefault();
          // Place your code here
          this.saveFileEvent.emit(this.currentFile)
        }
        else{
          if (/^.$/u.test(event.key)) {
            if (event.key == '*') { 
              if(!this.currentFile.states.titleState){
                if(!this.currentFile.states.boldState){
                  this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].active = false; // reset active state
                  this.renderedHTML[this.currentFile.states.activeIndex].children.push(new SublineElement('bold')) // make new bold subline
                  this.currentFile.states.activeChildIndex++; // child added, so index needs to increase
                  this.currentFile.states.boldState = true;
                }
                else{
                  canAdd = false;
                  this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text += event.key // I want the asterisk to stay in the bold subline not move to the next one
                  this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].active = false; // reset active state
                  this.renderedHTML[this.currentFile.states.activeIndex].children.push(new SublineElement()) // make new bold subline
                  this.currentFile.states.activeChildIndex++;
                  this.currentFile.states.boldState = false;
                }
              }
    
            }
            else if(event.key == '#' && this.getText().length == 0 || this.currentFile.states.titleState){
              if(!this.currentFile.states.titleState){
                if(this.renderedHTML[this.currentFile.states.activeIndex].children[0] != null){
                  this.renderedHTML[this.currentFile.states.activeIndex].children.pop()
                }
                this.renderedHTML[this.currentFile.states.activeIndex].children.push(new SublineElement('title-1')) // make new bold subline
                this.currentFile.states.titleState = true;
                canAdd = false;
                this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text += event.key
              }
              else{
                canAdd = false;
                this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text += event.key
              }
              if(this.checkTitleTags(this.getText()).match(/#/g) || [].length < 7){ // Checks for how many tags and accords 'type' property accordingly for correct css class
                this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].type = `title-${(this.checkTitleTags(this.getText()).match(/#/g)!.length|| [].length)}`
              }
              else{
                this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].type = 'normal'
              }
            }
            if(canAdd){ // default add case for non-special characters
              this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text += event.key
            }
            this.markdownString[this.currentFile.states.activeIndex] += event.key // raw text content
            // `key` matches a single unicode character
    
          }
          else{
            if(event.key == 'Backspace'){ // has the ability to change states, and remove states entirely
    
              if(this.renderedHTML[this.currentFile.states.activeIndex] != null){
    
                if(this.getText().length != 0){ // basic checks
                  this.markdownString[this.currentFile.states.activeIndex] = this.markdownString[this.currentFile.states.activeIndex].slice(0, -1)
                  let lastChar = this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text.substring(this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text.length-1)
                  this.deleteChar()
                  if(lastChar == '#'){
                    if(this.checkTitleTags(this.getText()).match(/#/g) || [].length < 7 && this.checkTitleTags(this.getText()).match(/#/g) || [].length > 0){ // Checks for how many tags and accords 'type' property accordingly for correct css class
                      this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].type = `title-${(this.checkTitleTags(this.getText()).match(/#/g)!.length|| [].length)}`
                    }
                    else{
                      this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].type = 'normal'
                    }
                  }
                  if(!this.checkState(this.getText())){ // checks if we deleted an entire bold subline element's text if so remove it
                    if(this.currentFile.states.activeChildIndex != 0){
                      this.renderedHTML[this.currentFile.states.activeIndex].children.pop()
                      document.querySelector('span.active')?.remove()
                      this.currentFile.states.activeChildIndex--
                      this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].active = true;
                    }
                  }
                }
                else{
                  if(this.currentFile.states.activeIndex != 0){
                    if(this.currentFile.states.activeChildIndex != 0){
                      let lastChar = this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex-1].text.slice(this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex-1].text.length -1)
                      if(lastChar == '*'){
                        this.currentFile.states.boldState = true;
                      }
                      this.renderedHTML[this.currentFile.states.activeIndex].children.pop()
                      this.currentFile.states.activeChildIndex--
                      this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].active = true;
                      this.deleteChar()
                    }
                    else{
                      this.renderedHTML[this.currentFile.states.activeIndex].children.pop() // Delete Last subline of current line element
                      this.renderedHTML.pop() // Delete current line element
                      this.currentFile.states.activeIndex--; // Go back to previous line element
                      this.renderedHTML[this.currentFile.states.activeIndex].active = true; // set previous line element to current one
                      this.renderedHTML[this.currentFile.states.activeIndex].children[this.renderedHTML[this.currentFile.states.activeIndex].children.length-1].active = true; // set the last subline of previous line element to current
                      this.currentFile.states.activeChildIndex = this.renderedHTML[this.currentFile.states.activeIndex].children.length-1 // set active child index to last subline of previous line element index
                    }
                  }
    
    
                }
              }
    
    
            }
            if(event.key == 'Enter'){
              if(this.currentFile.states.titleState){ // Reset title state on new line
                this.currentFile.states.titleState = false;
              }
              this.renderedHTML.push(new LineElement()) // add new line
              
              this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].active = false; // reset active state for last child of previous line
              this.renderedHTML[this.currentFile.states.activeIndex].active = false; // reset active state for previous line
              this.currentFile.states.activeChildIndex = 0; // set active child index to zero ot point to first subline of new line
              this.currentFile.states.activeIndex++; // increase active line index
              this.markdownString[this.currentFile.states.activeIndex] = ''; // setup raw text

              this.saveFileEvent.emit(this.currentFile) // Save after new line
            }
          }
        }

      }
    })
  }
  async ngOnChanges(changes: any){
    // Listen for changes: 
    // IF change is of type fileEvent -> Could be of type Move or Delete -> update paths & parentid for move/ delete entry in map and clear rHTML from screen
    // IF change is of type currentId -> File has been selected, set this.currentFile to selected file to load all data
    // -> In all cases send out the saveFile event after loading, moving, or deleting to keep everything up to date.
    if(changes.fileEvent && changes.fileEvent.currentValue != null && changes.fileEvent.currentValue.type != 'rename'){
      if(changes.fileEvent.currentValue.eventId == this.id){
        if(changes.fileEvent.currentValue.type == 'move'){
          this.currentFile.path = changes.fileEvent.currentValue.newPath
          this.currentFile.parentId = changes.fileEvent.currentValue.newParent
          this.saveFileEvent.emit(this.currentFile)
        }
        else if(changes.fileEvent.currentValue.type == 'delete'){
          this.localFilemap.delete(this.id)
          if(this.id = this.currentFile.id){
            this.currentFile = null
          }
          this.renderedHTML = []
        }
      }
      else{
        this.saveFileEvent.emit(changes.fileEvent.currentValue.newFile)
      }
    }
    else if(changes.fileEvent && changes.fileEvent.currentValue != null && changes.fileEvent.currentValue.type == 'rename'){
      if(this.currentFile){
        if(this.currentFile.id == changes.fileEvent.currentValue.id){
          this.fileName = changes.fileEvent.currentValue.newName
          this.currentFile.name = changes.fileEvent.currentValue.newName
        }

      }
    }
    else{
      
      if(changes.id.previousValue != null && changes.id.previousValue.length != 0 || this.lastActiveId){
        if(this.localFilemap.get(changes.id.previousValue || this.lastActiveId) ){
          this.currentFile.active = ''
          this.saveFileEvent.emit(this.currentFile)

        }


      }
      let filemapJSON = await window.electronAPI.getFilemap()
      if(filemapJSON.length != 0){
        let savedFilemap = JSON.parse(filemapJSON)
        for(let i = 0; i < savedFilemap.length; i++){
          if(savedFilemap[i][1].active == 'active' && this.init){
            this.id = savedFilemap[i][1].id
            this.lastActiveId = this.id
            this.init = false
          }
          this.localFilemap.set(savedFilemap[i][0], savedFilemap[i][1])
        }

      }
      this.currentFile = this.localFilemap.get(this.id)!
      if(this.currentFile){
        this.currentFile.states.titleState = this.currentFile.states.titleState
        this.currentFile.states.boldState = this.currentFile.states.boldState
        this.currentFile.states.activeIndex = this.currentFile.states.activeIndex
        this.currentFile.states.activeChildIndex = this.currentFile.states.activeChildIndex
        this.renderedHTML = this.currentFile.rHTML
        this.markdownString = this.currentFile.md
        this.fileName = this.currentFile.name
        this.currentFile.active = 'active'
        this.saveFileEvent.emit(this.currentFile)
      }
    }




  }

  /* HELPER FUNCTIONS (FOR TPYING LOGIC) */
  checkState (text: string) {
    if(document.querySelector('span.active')?.classList.contains('bold') && !text.includes('*')){
      this.currentFile.states.boldState = false;
      return false;
    }
    else if(document.querySelector('span[class*=title].active') && this.checkTitleTags(text).length == 0){
      this.currentFile.states.titleState = false;
      return false;
    }
    else{
      return true;
    }

  }
  deleteChar(){
    this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text = this.getText().slice(0, -1)
  }
  getText() {
    if(this.renderedHTML[this.currentFile.states.activeIndex].children.length == 0){
      return '';
    }
    return this.renderedHTML[this.currentFile.states.activeIndex].children[this.currentFile.states.activeChildIndex].text
  }
  checkTitleTags(text: string){
    for(let i = 0; i < text.length; i ++){
      if(text[i] != '#'){
        return text.substring(0, i)
      }
    }
    return text;
  }
}


