import { v4 } from 'uuid';

export class SublineElement {
  constructor(type?: string) {
    this.active = true;
    this.id = v4();
    this.text = '';
    this.type = type ? type : 'normal';
  }
  active: boolean;
  id: string;
  text: string;
  type?: string;
}
