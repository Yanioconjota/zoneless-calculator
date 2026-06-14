import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'calculator-button',
  imports: [],
  templateUrl: './calculator-button.component.html',
  styleUrls: ['./calculator-button.component.scss'],
  host: {
    class: 'border-r border-b border-indigo-400',
    '[class.w-2/4]': 'isDoubleSize()',
    '[class.w-1/4]': '!isDoubleSize()',
  },
})
export class CalculatorButtonComponent {

  onClick = output<string>();
  contentValue = viewChild<ElementRef<HTMLButtonElement>>('button')
  isPressed = signal(false);
  // transform normaliza el valor antes de almacenarlo en el signal.
  // Problema: un atributo HTML sin valor llega como string vacío "" en lugar de true.
  //   <calculator-button isCommand>   → Angular entrega ""   (sin transform sería incorrecto)
  //   <calculator-button [isCommand]="true"> → Angular entrega true
  // transform unifica ambos casos → "" se convierte en true, boolean pasa directo.
  // Alternativa más concisa: input(false, { transform: booleanAttribute }) de @angular/core
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
