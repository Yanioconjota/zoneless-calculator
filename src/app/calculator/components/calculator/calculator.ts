import { Component, viewChildren } from '@angular/core';
import { CalculatorButton } from '../calculator-button/calculator-button';

@Component({
  selector: 'calculator',
  imports: [CalculatorButton],
  templateUrl: './calculator.html',
  host: {
    '(document:keyup)': 'handleKeyboardEvent($event)',
  },
})
export class Calculator {
  calculatorButtons = viewChildren(CalculatorButton);
  handleClick(key: string) {
    console.log({key});
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.trim();
    const equivalentKey: Record<string, string> = {
      Escape: 'C',
      Clear: 'C',
      Backspace: 'C',
      Delete: 'C',
      Return: '=',
      Enter: '=',
      '*': 'x',
      '/': '÷',
    }
    const keyValue = equivalentKey[key] ?? key;
    this.handleClick(keyValue);

    this.calculatorButtons().forEach(button => {
      button.keyboardPressedStyle(key);
    });
  }
}
