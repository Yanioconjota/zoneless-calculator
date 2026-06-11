import { Component } from '@angular/core';
import { CalculatorComponent } from '@/calculator/components/calculator/calculator.component';

@Component({
  selector: 'calculator-view',
  imports: [CalculatorComponent],
  templateUrl: './calculator-view.component.html',
})
export default class CalculatorViewComponent {}
