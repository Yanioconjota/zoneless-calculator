import { ComponentFixture, TestBed } from "@angular/core/testing";
import CalculatorViewComponent from "./calculator-view.component";
import { Component } from "@angular/core";

// MockCalculatorComponent reemplaza al CalculatorComponent real durante el test.
// Propósito: aislar CalculatorViewComponent de la lógica y dependencias de su hijo.
// Mismo selector ('calculator') → Angular lo renderiza en lugar del componente real.
@Component({
  selector: 'calculator',
  template: '<div>Mock Calculator</div>',
})
class MockCalculatorComponent {}

describe('CalculatorViewComponent', () => {

  let component: CalculatorViewComponent;
  let fixture: ComponentFixture<CalculatorViewComponent>;

  beforeEach(() => {
    // Registramos CalculatorViewComponent en el entorno de test.
    // overrideComponent reemplaza su array imports[] original (que tiene CalculatorComponent)
    // por uno que usa MockCalculatorComponent — aísla el test al componente bajo prueba.
    TestBed.configureTestingModule({
      imports: [CalculatorViewComponent],
    }).overrideComponent(CalculatorViewComponent, {
      set: {
        imports: [MockCalculatorComponent],
      }
    });
    fixture = TestBed.createComponent(CalculatorViewComponent);
    component = fixture.componentInstance;
    // Dispara el primer ciclo de detección de cambios: ejecuta ngOnInit y
    // sincroniza el template con el estado inicial del componente.
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render calculator component', () => {
    // Verificamos que el selector 'calculator' existe en el DOM.
    // Como usamos MockCalculatorComponent, lo que se renderiza es '<div>Mock Calculator</div>',
    // pero el elemento <calculator> sigue presente — suficiente para verificar la integración.
    const calculatorComponent = fixture.nativeElement.querySelector('calculator');
    expect(calculatorComponent).toBeTruthy();
  });

  it('should contain specific css classes', () => {
    // classList.contains() verifica cada clase individualmente — más robusto que
    // comparar classList.value como string, porque resiste cambios de orden.
    const divElement = fixture.nativeElement as HTMLElement;
    const mustHaveClasses = 'w-full mx-auto rounded-xl bg-gray-100 shadow-xl text-gray-800 relative overflow-hidden'.split(' ');
    const calculatorComponent = divElement.querySelector('div');
    mustHaveClasses.forEach(cls => {
      expect(calculatorComponent?.classList.contains(cls)).toBe(true);
    });
  });
});
