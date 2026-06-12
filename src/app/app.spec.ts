import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    // Fixture es el contenedor del componente creado para testear en la terminal ya que el dom no existe en la terminal
    const fixture = TestBed.createComponent(App);
    // componentInstance es el componente en sí
    const app = fixture.componentInstance;

    const compiled = fixture.nativeElement as HTMLElement;
    expect(app).toBeTruthy();
  });

  // Test de smoke/sanity: verifica que el entorno de testing y el motor de
  // ejecución funcionan correctamente. No prueba lógica del componente —
  // prueba que Vitest corre, que expect() existe y que la aritmética básica
  // de JS es confiable. Si este test falla, el problema está en la config
  // del test runner, no en el código de la aplicación.
  it('it should be 4', () => {
    // expect() envuelve el valor a evaluar
    // toBe() es el matcher de igualdad estricta (===)
    expect(2 + 2).toBe(4);
  });

  /* it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, zoneless-calculator');
  }); */
});
