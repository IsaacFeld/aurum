import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar.component';
import { TexteditorComponent } from './texteditor/texteditor.component';
import { LineElement } from './data-structures/LineElement';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TexteditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  visible = "initial"
  title = 'aurum';
  mousePosition: any
  currentId: string = '';

  toggleSidebar() {
    if(this.visible == 'hide'){
      this.visible = 'show';
    }
    else{
      this.visible = 'hide';
    }
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
  saveFile(event: any){   // SAVE DATA LOCALLY, wait for save states event, and then do saving & loading (maybe loading not necessaryz) ^
    console.log(event)
    window.electronAPI.saveFile(event)
  }
  deleteCurrentHTML(event: any){
  }

  updateCurrentId(event: string){
    this.currentId = event
  }
 




}


