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
  md: Array<string>
  html: LineElement[]
  activeIndex: number;
  activeChildIndex: number;
  titleState: boolean;
  boldState: boolean;
  visible = "initial"
  title = 'aurum';
  mousePosition: any

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
  saveStates(event: any){
    console.log('SAVE STATES')
    console.log(event)
  }
  saveFile(event: any){   // SAVE DATA LOCALLY, wait for save states event, and then do saving & loading (maybe loading not necessaryz) ^
    console.log('SAVING FILE DATA')
    if(this.md != null && this.md.length != 0 ){
      window.electronAPI.setMarkdown(event.path, event.id, this.md)
    }
    if(this.html != null && this.html.length != 0){
      window.electronAPI.setJSON(event.path, event.id, this.html)
    }
  }
  loadFile(event: any){
    console.log({loadPath: event.path})
    let newMD = window.electronAPI.getMarkdown(event.path, event.id)
    this.md = newMD.split('\n')
    let newHTML = window.electronAPI.getJSON(event.path, event.id)
    if(newHTML.length != 0){
      this.html = JSON.parse(newHTML)
    }
    else{
      this.html = new Array<LineElement>
    }
  }
 




}


