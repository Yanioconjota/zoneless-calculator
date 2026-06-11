import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'calculator-button',
  imports: [],
  templateUrl: './calculator-button.html',
  styleUrls: ['./calculator-button.scss'],
  host: {
    class: 'border-r border-b border-indigo-400',
    '[class.w-2/4]': 'isDoubleSize()',
    '[class.w-1/4]': '!isDoubleSize()',
  },
})
export class CalculatorButton {

  onClick = output<string>();
  contentValue = viewChild<ElementRef<HTMLButtonElement>>('button')
  isPressed = signal(false);
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
  /* @HostBinding('class.w-2/4') get doubleSizeStyle() {
    return this.isDoubleSize();
  } */

  handleClick () {
    const value = this.contentValue()?.nativeElement.textContent;
    if (!value) return;
    console.log(value);
    this.onClick.emit(value);
  }

  keyboardPressedStyle (key: string) {
    if (!this.contentValue()) return;
    const value = this.contentValue()?.nativeElement.textContent;
    if (value !== key) return;

    this.isPressed.set(true);
    setTimeout(() => {
      this.isPressed.set(false);
    }, 100);
  }
}
