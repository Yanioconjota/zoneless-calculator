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

    // nativeElement es el elemento raíz del componente en el DOM simulado (JSDOM).
    // Se castea a HTMLElement para tener acceso a la API del DOM (querySelector,
    // textContent, classList, etc.). Se usa para verificar lo que el usuario
    // vería en el navegador: texto renderizado, elementos presentes, clases CSS, etc.
    // Ejemplo de uso:
    //   compiled.querySelector('h1')?.textContent → lee el texto de un h1
    //   compiled.querySelectorAll('button').length → cuenta botones en el DOM
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

  it('it should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  // Test de renderizado frágil: verifica que el componente se renderiza con las clases CSS esperadas, pero si se cambia el orden de las clases, el test fallará.
  it('it should render router-outlet with css classes', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    const routerOutletContainer = compiled.querySelector('div');
    const mustHaveClasses = 'min-w-screen min-h-screen bg-slate-600 flex items-center justify-center px-5 py-5';

    expect(routerOutletContainer?.classList.value).toBe(mustHaveClasses);
  });

  // Test de renderizado robusto: verifica que el componente se renderiza con las clases CSS esperadas, incluso si se cambia el orden de las clases.
  it('it should render router-outlet with all css classes', () => {
      const fixture = TestBed.createComponent(App);
      const compiled = fixture.nativeElement as HTMLElement;
      const routerOutletContainer = compiled.querySelector('div');
      const mustHaveClasses = 'min-w-screen min-h-screen bg-slate-600 flex items-center justify-center px-5 py-5'.split(' ');

      routerOutletContainer?.classList.forEach(cls => {
        expect(mustHaveClasses.includes(cls)).toBe(true);
      });
  });

  // Test de renderizado robusto: verifica que el componente se renderiza con los atributos esperados, incluso si se cambia el orden de los atributos.
  it('it should render buy me a beer link with attributes', () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;
    const buyMeABeerLink = compiled.querySelector('a');

    expect(buyMeABeerLink?.getAttribute('title')).toBe('Buy me a beer');
    expect(buyMeABeerLink?.getAttribute('href')).toBe('https://www.buymeacoffee.com/scottwindon');
    expect(buyMeABeerLink?.getAttribute('target')).toBe('_blank');
    expect(buyMeABeerLink).toBeTruthy();
  });


});
