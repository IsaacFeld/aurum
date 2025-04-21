import { Component } from '@angular/core';
import { LineElement } from '../data-structures/LineElement';
import { SublineElement } from '../data-structures/SublineElement';

@Component({
  selector: 'app-texteditor',
  imports: [],
  templateUrl: './texteditor.component.html',
  styleUrl: './texteditor.component.css'
})
export class TexteditorComponent {
  markdownString = new Array();
  currentLineText: string = '';
  currentSublineText: string = '';
  activeIndex = 0;
  activeChildIndex = 0;
  boldState = false;
  titleState = false;
  renderedHTML: LineElement[] = []; // array of LineElements will be used to render HTML / save data

  ngOnInit(){
    this.markdownString[this.activeIndex] = null;
    document.addEventListener('keydown', (event) =>{
      if(!document.querySelector('#fileEditor')!.classList.contains('disabled')){
        let canAdd = true;
        if (/^.$/u.test(event.key)) {
          if (this.markdownString[this.activeIndex] == null) {
            this.renderedHTML.push(new LineElement());
            this.markdownString[this.activeIndex] = '';
          }
          if (event.key == '*') { 
            console.log(this.titleState)
            if(!this.titleState){
              if(!this.boldState){
                this.renderedHTML[this.activeIndex].children[this.activeChildIndex].active = false; // reset active state
                this.renderedHTML[this.activeIndex].children.push(new SublineElement('bold')) // make new bold subline
                this.activeChildIndex++; // child added, so index needs to increase
                this.boldState = true;
              }
              else{
                canAdd = false;
                this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text += event.key // I want the asterisk to stay in the bold subline not move to the next one
                this.renderedHTML[this.activeIndex].children[this.activeChildIndex].active = false; // reset active state
                this.renderedHTML[this.activeIndex].children.push(new SublineElement()) // make new bold subline
                this.activeChildIndex++;
                this.boldState = false;
              }
            }
  
          }
          else if(event.key == '#' && this.getText().length == 0 || this.titleState){
            if(!this.titleState){
              if(this.renderedHTML[this.activeIndex].children[0] != null){
                this.renderedHTML[this.activeIndex].children.pop()
              }
              this.renderedHTML[this.activeIndex].children.push(new SublineElement('title-1')) // make new bold subline
              this.titleState = true;
              canAdd = false;
              this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text += event.key
            }
            else{
              canAdd = false;
              this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text += event.key
            }
            if(this.checkTitleTags(this.getText()).match(/#/g) || [].length < 7){ // Checks for how many tags and accords 'type' property accordingly for correct css class
              this.renderedHTML[this.activeIndex].children[this.activeChildIndex].type = `title-${(this.checkTitleTags(this.getText()).match(/#/g)!.length|| [].length)}`
            }
            else{
              this.renderedHTML[this.activeIndex].children[this.activeChildIndex].type = 'normal'
            }
          }
          if(canAdd){ // default add case for non-special characters
            this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text += event.key
          }
          this.markdownString[this.activeIndex] += event.key // raw text content
          // `key` matches a single unicode character
  
        }
        else{
          if(event.key == 'Backspace'){ // has the ability to change states, and remove states entirely
  
            if(this.renderedHTML[this.activeIndex] != null){
  
              if(this.getText().length != 0){ // basic checks
                this.markdownString[this.activeIndex] = this.markdownString[this.activeIndex].slice(0, -1)
                let lastChar = this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text.substring(this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text.length-1)
                this.deleteChar()
                if(lastChar == '#'){
                  if(this.checkTitleTags(this.getText()).match(/#/g) || [].length < 7 && this.checkTitleTags(this.getText()).match(/#/g) || [].length > 0){ // Checks for how many tags and accords 'type' property accordingly for correct css class
                    this.renderedHTML[this.activeIndex].children[this.activeChildIndex].type = `title-${(this.checkTitleTags(this.getText()).match(/#/g)!.length|| [].length)}`
                  }
                  else{
                    this.renderedHTML[this.activeIndex].children[this.activeChildIndex].type = 'normal'
                  }
                }
                if(!this.checkState(this.getText())){ // checks if we deleted an entire bold subline element's text if so remove it
                  if(this.activeChildIndex != 0){
                    this.renderedHTML[this.activeIndex].children.pop()
                    document.querySelector('span.active')?.remove()
                    this.activeChildIndex--
                    this.renderedHTML[this.activeIndex].children[this.activeChildIndex].active = true;
                  }
                }
              }
              else{
                if(this.activeIndex != 0){
                  if(this.activeChildIndex != 0){
                    let lastChar = this.renderedHTML[this.activeIndex].children[this.activeChildIndex-1].text.slice(this.renderedHTML[this.activeIndex].children[this.activeChildIndex-1].text.length -1)
                    if(lastChar == '*'){
                      this.boldState = true;
                    }
                    this.renderedHTML[this.activeIndex].children.pop()
                    this.activeChildIndex--
                    this.renderedHTML[this.activeIndex].children[this.activeChildIndex].active = true;
                    this.deleteChar()
                  }
                  else{
                    this.renderedHTML[this.activeIndex].children.pop() // Delete Last subline of current line element
                    this.renderedHTML.pop() // Delete current line element
                    this.activeIndex--; // Go back to previous line element
                    this.renderedHTML[this.activeIndex].active = true; // set previous line element to current one
                    this.renderedHTML[this.activeIndex].children[this.renderedHTML[this.activeIndex].children.length-1].active = true; // set the last subline of previous line element to current
                    this.activeChildIndex = this.renderedHTML[this.activeIndex].children.length-1 // set active child index to last subline of previous line element index
                  }
                }
  
  
              }
            }
  
  
          }
          if(event.key == 'Enter'){
            if(this.titleState){ // Reset title state on new line
              this.titleState = false;
            }
            this.renderedHTML.push(new LineElement()) // add new line
            this.renderedHTML[this.activeIndex].children[this.activeChildIndex].active = false; // reset active state for last child of previous line
            this.renderedHTML[this.activeIndex].active = false; // reset active state for previous line
            this.activeChildIndex = 0; // set active child index to zero ot point to first subline of new line
            this.activeIndex++; // increase active line index
            this.markdownString[this.activeIndex] = ''; // setup raw text
          }
          if(event.key == 'Alt'){
            console.log(this.markdownString)
          }
        }
      }

    })
  }
  checkState (text: string) {
    if(document.querySelector('span.active')?.classList.contains('bold') && !text.includes('*')){
      this.boldState = false;
      return false;
    }
    else if(document.querySelector('span[class*=title].active') && this.checkTitleTags(text).length == 0){
      this.titleState = false;
      return false;
    }
    else{
      return true;
    }

  }
  deleteChar(){
    this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text = this.getText().slice(0, -1)
  }
  getText() {
    if(this.renderedHTML[this.activeIndex].children.length == 0){
      return '';
    }
    return this.renderedHTML[this.activeIndex].children[this.activeChildIndex].text
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


