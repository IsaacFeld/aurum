import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'

})
export class SliderComponent {
  @Input() title: string;
  @Output() stageEvent = new EventEmitter<number>
  originX = 0; // screenX of slider ball at the 3rd stage
  lastEmit = 3; // default stage of slider (center)
  dragStart(event: any){
    if(this.originX == 0){ // Only set originX once!
      this.originX = event.screenX 
    }
    let element = document.querySelector('#slider')
    element!.classList.add('drag-preview') // Hides the draggable copy of slider ball
    requestAnimationFrame(() => {
      element!.classList.remove('drag-preview');
    });
  }
  dragEnd(){
    let element = document.querySelector('#slider')
    let storedClass = element!.classList[0] // save last class & remove all others
    if(storedClass == 'five'){
      element!.classList.remove('four')
      element!.classList.remove('three')
      element!.classList.remove('two')
      element!.classList.remove('one')
    }
    else if(storedClass == 'four'){
      element!.classList.remove('five')
      element!.classList.remove('three')
      element!.classList.remove('two')
      element!.classList.remove('one')
    }
    else if(storedClass == 'three'){
      element!.classList.remove('four')
      element!.classList.remove('five')
      element!.classList.remove('two')
      element!.classList.remove('one')
    }
    else if(storedClass == 'two'){
      element!.classList.remove('four')
      element!.classList.remove('three')
      element!.classList.remove('five')
      element!.classList.remove('one')
    }
    else{
      element!.classList.remove('four')
      element!.classList.remove('three')
      element!.classList.remove('two')
      element!.classList.remove('five')
    }


  }
  drag(event: any){
    if(event.screenX != 0){
      // Based on how the screenX compares to originX we can determine which state the slider is in, and emit that index.
      if(event.screenX > (this.originX + (56 * 2))){
        let element = document.querySelector('#slider')
        element!.classList.remove('five')
        element!.classList.remove('four')
        element!.classList.remove('three')
        element!.classList.remove('one')
        element!.classList.remove('two')
        element!.classList.add('five')
        if(this.lastEmit != 5){
          this.stageEvent.emit(5)
          this.lastEmit = 5
        }
      }
      else if(event.screenX > (this.originX + 56)){
        let element = document.querySelector('#slider')
        element!.classList.remove('five')
        element!.classList.remove('four')
        element!.classList.remove('three')
        element!.classList.remove('one')
        element!.classList.remove('two')
        if(this.lastEmit != 4){
          this.stageEvent.emit(4)
          this.lastEmit = 4
        }

        element!.classList.add('four')
      }
      else if(event.screenX > this.originX - 20 && event.screenX < this.originX + 20){
        let element = document.querySelector('#slider')
        element!.classList.remove('five')
        element!.classList.remove('four')
        element!.classList.remove('three')
        element!.classList.remove('one')
        element!.classList.remove('two')
  
        if(this.lastEmit != 3){
          this.stageEvent.emit(3)
          this.lastEmit = 3
        }
        element!.classList.add('three')
      }
      else if(event.screenX < this.originX - (56 * 2)){
        let element = document.querySelector('#slider')
        element!.classList.remove('five')
        element!.classList.remove('four')
        element!.classList.remove('three')
        element!.classList.remove('one')
        element!.classList.remove('two')
        if(this.lastEmit != 1){
          this.stageEvent.emit(1)
          this.lastEmit = 1
        }

        element!.classList.add('one')
  
      }
      else if(event.screenX < this.originX - (56)){
        let element = document.querySelector('#slider')
        element!.classList.remove('five')
        element!.classList.remove('four')
        element!.classList.remove('three')
        element!.classList.remove('one')
        element!.classList.remove('two')
        if(this.lastEmit != 2){
          this.stageEvent.emit(2)
          this.lastEmit = 2
        }
        element!.classList.add('two')
      }
    }



  }
}
