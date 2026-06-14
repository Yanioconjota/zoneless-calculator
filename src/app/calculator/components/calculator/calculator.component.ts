import { Component, computed, inject, viewChildren } from '@angular/core';
import { CalculatorButtonComponent } from '../calculator-button/calculator-button.component';
import { CalculatorService } from '@/calculator/services/calculator.service';

@Component({
  selector: 'calculator',
  imports: [CalculatorButtonComponent],
  templateUrl: './calculator.component.html',
  host: {
    '(document:keyup)': 'handleKeyboardEvent($event)',
  },
})
export class CalculatorComponent {
  private calculatorService = inject(CalculatorService);
  calculatorButtons = viewChildren(CalculatorButtonComponent);
  resultText = computed(() => this.calculatorService.resultText());
  subResultText = computed(() => this.calculatorService.subResultText());
  lastOperator = computed(() => this.calculatorService.lastOperator());
  handleClick(key: string) {
    this.calculatorService.constructNumber(key);
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(event);
    const key = event.key.trim();
    const equivalentKey: Record<string, string> = {
      Escape: 'C',
      Clear: 'C',
      Enter: '=',
      'x': '*',
      'X': '*',
      '÷': '/',
      '*': '*',
    }
    const keyValue = equivalentKey[key] ?? key;
    this.handleClick(keyValue);

    this.calculatorButtons().forEach(button => {
      button.keyboardPressedStyle(key);
    });
  }
}
