import { Component, computed, inject, viewChildren } from '@angular/core';
import { CalculatorButton } from '../calculator-button/calculator-button';
import { CalculatorService } from '@/calculator/services/calculator-service';

@Component({
  selector: 'calculator',
  imports: [CalculatorButton],
  templateUrl: './calculator.html',
  host: {
    '(document:keyup)': 'handleKeyboardEvent($event)',
  },
})
export class Calculator {
  private calculatorService = inject(CalculatorService);
  calculatorButtons = viewChildren(CalculatorButton);
  resultText = computed(() => this.calculatorService.resultText());
  subResultText = computed(() => this.calculatorService.subResultText());
  lastOperator = computed(() => this.calculatorService.lastOperator());
  handleClick(key: string) {
    this.calculatorService.constructNumber(key);
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.trim();
    const equivalentKey: Record<string, string> = {
      Escape: 'C',
      Clear: 'C',
      Enter: '=',
      'x': '*',
      '÷': '/',
    }
    const keyValue = equivalentKey[key] ?? key;
    this.handleClick(keyValue);

    this.calculatorButtons().forEach(button => {
      button.keyboardPressedStyle(key);
    });
  }
}
