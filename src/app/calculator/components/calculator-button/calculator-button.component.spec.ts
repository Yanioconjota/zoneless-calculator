import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CalculatorButtonComponent } from "./calculator-button.component";

// CalculatorButtonComponent usa la propiedad `host` del decorador @Component para
// aplicar clases al elemento raíz (<calculator-button>) en lugar del template interno.
// En los tests, fixture.nativeElement apunta a ese elemento raíz (el host),
// por lo que classList.value refleja directamente las clases definidas en `host: { ... }`.
describe('CalculatorButtonComponent', () => {
  // fixture y component se declaran con `let` fuera del beforeEach para que sean
  // visibles en todos los it(). El beforeEach los asigna antes de cada test.
  let component: CalculatorButtonComponent;
  let fixture: ComponentFixture<CalculatorButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalculatorButtonComponent],
    });

    fixture = TestBed.createComponent(CalculatorButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply w-1/4 double size is false', () => {
    // Arrange: beforeEach ya creó el componente con isDoubleSize=false (valor por defecto).
    // El host aplica 'w-1/4' cuando isDoubleSize() es false.

    // Assert: verificamos la clase en el elemento host (fixture.nativeElement).
    const hostElement = fixture.nativeElement as HTMLElement;
    const cssClasses = hostElement.classList.value;
    expect(cssClasses).toContain('w-1/4');
  });

  it('should apply w-2/4 double size is true', () => {
    // Act: setInput modifica el valor del input signal isDoubleSize en tiempo de test.
    // Debe ir ANTES de leer el DOM para que detectChanges() re-evalúe el host.
    fixture.componentRef.setInput('isDoubleSize', true);
    fixture.detectChanges(); // re-renderiza el host con el nuevo valor del signal

    // Assert: el host ahora debe tener 'w-2/4' en lugar de 'w-1/4'.
    const hostElement = fixture.nativeElement as HTMLElement;
    const cssClasses = hostElement.classList.value;
    expect(cssClasses).toContain('w-2/4');
  });

  it('should apply is-command class when isCommand is true', () => {
    fixture.componentRef.setInput('isCommand', true);
    fixture.detectChanges();
    const hostElement = fixture.nativeElement as HTMLElement;
    const cssClasses = hostElement.classList.value;
    console.log(cssClasses);
    expect(cssClasses).toContain('is-command');
  });

  it('should emit onClick when handleClick is called', () => {
    // todo:
  });


  it('should set isPressed to true and then false when keyboardPressedStyle is called with matching key', (done) => {
    // todo:
  });

  it('should NOT set isPressed if key does not match', () => {
    // todo:
  });

  it('should display projected content', () => {
    // todo:
  });
});
