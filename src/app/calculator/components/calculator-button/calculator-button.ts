import { Component, HostBinding, input } from '@angular/core';

@Component({
  selector: 'calculator-button',
  imports: [],
  templateUrl: './calculator-button.html',
  styleUrls: ['./calculator-button.scss'],
  host: {
    class: 'w-1/4 border-r border-b border-indigo-400',
  },
})
export class CalculatorButton {
  isCommand = input(false, {
    transform: (value: boolean | string) => (typeof value === 'string' ? value === '' : value),
  });
  isDoubleSize = input(false, {
    transform: (value: boolean | string) => (typeof value === 'string' ? value === '' : value),
  });
  /*
  @HostBinding('class.is-command') get commandStyle() {
    return this.isCommand();
  } */
  @HostBinding('class.w-2/4') get doubleSizeStyle() {
    return this.isDoubleSize();
  }
}
