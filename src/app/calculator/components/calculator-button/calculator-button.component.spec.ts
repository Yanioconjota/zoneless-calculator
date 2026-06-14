import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CalculatorButtonComponent } from "./calculator-button.component";

// fixture.nativeElement → host <calculator-button> (clases de `host: {}`)
// querySelector('button') → <button> interno del template (otros bindings)
describe('CalculatorButtonComponent', () => {
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
    // host binding — clase en el elemento raíz, isDoubleSize=false por defecto
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.classList.value).toContain('w-1/4');
  });

  it('should apply w-2/4 double size is true', () => {
    // host binding — setInput antes de detectChanges para que el host se re-evalúe
    fixture.componentRef.setInput('isDoubleSize', true);
    fixture.detectChanges();

    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.classList.value).toContain('w-2/4');
  });

  it('should apply is-command class when isCommand is true', () => {
    // is-command viene de [class.is-command]="isCommand()" en el <button> del template,
    // no del `host: {}` del decorador → se busca con querySelector('button'), no en fixture.nativeElement
    fixture.componentRef.setInput('isCommand', true);
    fixture.detectChanges();

    const buttonElement = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(buttonElement?.classList.contains('is-command')).toBe(true);
  });

  it('should emit onClick when handleClick is called', () => {
    // output test — spy en emit; textContent con espacios verifica que trim() se aplica
    const spy = vi.spyOn(component.onClick, 'emit');
    const buttonElement = (fixture.nativeElement as HTMLElement).querySelector('button');
    buttonElement!.textContent = ' 7 ';
    buttonElement?.click();

    expect(spy).toHaveBeenCalledWith('7');
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
