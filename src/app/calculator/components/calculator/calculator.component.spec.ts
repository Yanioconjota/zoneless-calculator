import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CalculatorComponent } from "./calculator.component";
import { signal } from "@angular/core";
import { CalculatorService } from "@/calculator/services/calculator.service";
import { By } from "@angular/platform-browser";
import { CalculatorButtonComponent } from "../calculator-button/calculator-button.component";

// MockCalculatorService reemplaza al servicio real via `useValue` en providers[].
// Las signals son reales para que los computed() del componente funcionen.
// constructNumber es vi.fn(): función mock que registra llamadas sin ejecutar lógica real.
class MockCalculatorService {
  resultText = signal('100');
  subResultText = signal('20');
  lastOperator = signal('-');
  constructNumber = vi.fn();
};

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let mockCalculatorService: MockCalculatorService;

  beforeEach(() => {
    mockCalculatorService = new MockCalculatorService();

    // useValue inyecta el mock en lugar del servicio real para todos los tests del describe
    TestBed.configureTestingModule({
      imports: [CalculatorComponent],
      providers: [
        { provide: CalculatorService, useValue: mockCalculatorService },
      ],
    });

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial values from service', () => {
    // los computed() del componente derivan de las signals del mock
    expect(component.resultText()).toBe('100');
    expect(component.subResultText()).toBe('20');
    expect(component.lastOperator()).toBe('-');
  });

  it('should display values in the template', () => {
    mockCalculatorService.resultText.set('1000');
    mockCalculatorService.subResultText.set('200');
    mockCalculatorService.lastOperator.set('*');
    fixture.detectChanges(); // propaga los nuevos valores de signals al DOM

    expect(component.resultText()).toBe('1000');
    expect(component.subResultText()).toBe('200');
    expect(component.lastOperator()).toBe('*');
    expect(fixture.nativeElement.querySelector('#result-text').textContent).toBe('1000');
    expect(fixture.nativeElement.querySelector('#sub-result-text').textContent).toBe('200 *');
  });

  it('should call constructNumber when handleClick is called', () => {
    component.handleClick('1');
    expect(mockCalculatorService.constructNumber).toHaveBeenCalledWith('1');
  });

  it('should handle keyboard events correctly', () => {
    // KeyboardEvent construido manualmente — simula el evento que dispara el host binding
    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: '1' }));
    expect(mockCalculatorService.constructNumber).toHaveBeenCalledWith('1');
  });

  it('should handle special keyboard events (Enter -> =)', () => {
    // equivalentKey mapea Enter → '=' antes de llamar constructNumber
    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    expect(mockCalculatorService.constructNumber).toHaveBeenCalledWith('=');
  });

  it('should handle special keyboard events (Escape -> C)', () => {
    // equivalentKey mapea Escape → 'C' antes de llamar constructNumber
    component.handleKeyboardEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    expect(mockCalculatorService.constructNumber).toHaveBeenCalledWith('C');
  });

  it('should call constructNumber when buttons is clicked', () => {
    // By.directive() busca por clase de componente, no por selector CSS
    const buttons = fixture.debugElement.queryAll(By.directive(CalculatorButtonComponent));

    // triggerEventHandler dispara el output (onClick) del componente hijo en el contexto de Angular
    buttons[0].triggerEventHandler('onClick', 'C');
    expect(mockCalculatorService.constructNumber).toHaveBeenCalledWith('C');

    buttons.forEach(button => {
      button.triggerEventHandler('onClick', button.nativeElement.textContent);
      expect(mockCalculatorService.constructNumber).toHaveBeenCalledWith(button.nativeElement.textContent?.trim() ?? '');
    });
  });

  it('should update resultText signal when service updates', () => {
    // computed() en el componente se recalcula automáticamente cuando cambia la signal del mock
    mockCalculatorService.resultText.set('1000');
    fixture.detectChanges();
    expect(component.resultText()).toBe('1000');
  });

  it('should have 19 calculator-button components with content projected', () => {
    const buttons = fixture.nativeElement.querySelectorAll('calculator-button');
    expect(buttons.length).toBe(19);

    // verificación explícita de los primeros botones
    expect(buttons[0].textContent).toBe('C');
    expect(buttons[1].textContent).toBe('+/-');
    expect(buttons[2].textContent).toBe('%');
    expect(buttons[3].textContent).toBe('÷');
    expect(buttons[4].textContent).toBe('7');

    // todos los botones deben tener contenido proyectado no vacío
    buttons.forEach((button: HTMLButtonElement) => {
      expect(button.textContent?.trim()).toBeTruthy();
    });
  });
});
