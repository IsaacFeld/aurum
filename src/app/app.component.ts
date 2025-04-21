import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar.component';
import { TexteditorComponent } from './texteditor/texteditor.component';

declare global {
  interface Window {
  electronAPI: {
    sendMessage:
      (message : string) => void;
    communicate:
      () => void;
    
    }
  }

}
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, TexteditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  visible = "initial"
  title = 'aurum';
  editorClass = 'disabled'
  canSidebar = 'n'
  toggleSidebar() {
    if(this.visible == 'hide'){
      this.visible = 'show';
    }
    else{
      this.visible = 'hide';
    }
  }
  screenClick(event: any){
    if(event.target.classList.contains('EditorContainer') || event.target.classList.contains('subline') || event.target.classList.contains('im-line')){
      document.querySelector('#fileEditor')?.classList.remove('disabled')
    }
    else{
      document.querySelector('#fileEditor')?.classList.add('disabled')
      this.canSidebar = 'y'
    }
  }
  ngOnInit(){
    window.electronAPI.communicate()
  }



}


