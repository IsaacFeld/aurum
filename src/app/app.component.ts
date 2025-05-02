import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar.component';
import { TexteditorComponent } from './texteditor/texteditor.component';
import { LineElement } from './data-structures/LineElement';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TexteditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  visible = "initial" // sidebar visibility
  mousePosition: any // mousePos for disabling ENTER KEY INPUT firing sidebar close/open button while typing
  currentId: string = ''; // On file select, current id is updated and passed on to texteditor | FILE SELECT EVENT
  currentEvent: any // currentEvent passed on to text editor can be move or delete | FILE MOVE/DELETE EVENT
  fileSaveEvent: any // fileSave event passed on to sidebar

  toggleSidebar(event: any) {
    if(event.sourceCapabilities){
      if(this.visible == 'hide'){
        this.visible = 'show';
      }
      else{
        this.visible = 'hide';
      }
    }

  }
  disableSidebar(event: any){
    event.target.classList.remove('disabled')
    document.querySelector('#fileEditor')?.classList.add('disabled')
  }
  enableSidebar(event: any){
    if(document.querySelector('.fileElementInput') == null){
      event.target.classList.remove('disabled')
    }
    document.querySelector('#fileExplorer')?.classList.add('disabled')
  }

  mouseMove(event: any){
      this.mousePosition.x = event.clientX
      this.mousePosition.y = event.clientY
  }
  ngOnInit(){
    this.mousePosition = new Object(
      {
        x: NaN,
        y: NaN,
      }
    )
  }


  saveFile(event: any){   
  // Receive locally saved data from texteditor saveFile event 
  // -> Save Current file to Filemap.json & Current File Plaintext in respective .md file
    this.fileSaveEvent = event // Emit fileSaveEvent to sidebar
    window.electronAPI.saveFile(event) // Save to file via electronjs
  }

  updateCurrentId(event: string){
    this.currentId = event
  }
  textEditorDelete(event: string){ // Simple delete event sent to text editor
    this.currentEvent = 
    {
      eventId: event,
      type: 'delete'

    }

  }
  textEditorMove(event: any){ // Sidebar move sent to texteditor event either 'FORWARD' or 'RETURN'
    this.currentEvent = 
    {
      eventId: event.id,
      move: event.move,
      newPath: event.newPath,
      newParent: event.newParent,
      newFile: event.newFile,
      type: 'move'
    }

  }
  textEditorRename(event: any){
    this.currentEvent = {
      newName: event.newName,
      id: event.id,
      type: 'rename'
    }
  }


}


