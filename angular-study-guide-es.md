# Guía de Estudio — Angular 22 (Español)

> Basada en el proyecto **Zoneless Calculator**. Cada sección incluye teoría, analogías, diagramas y ejemplos del código real del proyecto.

---

## Índice

1. [Zone.js vs Zoneless](#1-zonejs-vs-zoneless)
2. [Servicios con Signals (`@Service`)](#2-servicios-con-signals-service)
3. [Computed Signals](#3-computed-signals)
4. [Host Property Condicional](#4-host-property-condicional)
5. [Remover `@HostListener` y `@HostBinding`](#5-remover-hostlistener-y-hostbinding)
6. [Output Emitter Refs](#6-output-emitter-refs)
7. [Signal `viewChild`](#7-signal-viewchild)
8. [Signal `viewChildren`](#8-signal-viewchildren)
9. [Realizar cálculos y operaciones](#9-realizar-cálculos-y-operaciones)
10. [Validaciones y consideraciones](#10-validaciones-y-consideraciones)
11. [Conceptos complementarios](#11-conceptos-complementarios)
12. [Testing con Vitest y TestBed](#12-testing-con-vitest-y-testbed)

---

## 1. Zone.js vs Zoneless

### ¿Qué es Zone.js?

Zone.js es una librería que **intercepta cada operación asíncrona del navegador** (setTimeout, Promise, XHR, event listeners, etc.) para que Angular sepa cuándo algo pudo haber cambiado y dispare una verificación en todo el árbol de componentes.

```
┌─────────────────────────────────────────────────┐
│               MODELO CON ZONE.JS                │
│                                                 │
│  El usuario hace clic en un botón               │
│       │                                         │
│       ▼                                         │
│  Zone.js intercepta el evento                   │
│       │                                         │
│       ▼                                         │
│  Angular: "algo ocurrió, verificar todo"        │
│       │                                         │
│       ▼                                         │
│  ┌────────────────────────────┐                 │
│  │   Detección de cambios     │                 │
│  │   Raíz                     │                 │
│  │   ├── ComponenteA ← revisar│                 │
│  │   │   ├── ComponenteB ← revisar│             │
│  │   │   └── ComponenteC ← revisar│             │
│  │   ├── ComponenteD ← revisar│                 │
│  │   └── ComponenteE ← revisar│                 │
│  └────────────────────────────┘                 │
│   ¡Aunque solo ComponenteB haya cambiado!       │
└─────────────────────────────────────────────────┘
```

**Costos de Zone.js:**
- **Rendimiento:** se verifica todo el árbol tras cada evento asíncrono, incluso los no relacionados.
- **Tamaño del bundle:** suma ~100 KB.
- **Depuración:** el parcheo de APIs nativas dificulta la lectura de stack traces.
- **Compatibilidad:** algunas librerías de terceros entran en conflicto con sus parches.

### ¿Qué es Zoneless?

Una aplicación Angular Zoneless **elimina Zone.js por completo**. Los componentes solo se actualizan cuando un **Signal** notifica explícitamente que un valor cambió.

```
┌─────────────────────────────────────────────────┐
│               MODELO ZONELESS                   │
│                                                 │
│  signal.set(nuevoValor)                         │
│       │                                         │
│       ▼                                         │
│  Angular: "signal cambió, notificar consumidores│
│       │                                         │
│       ▼                                         │
│  ┌────────────────────────────┐                 │
│  │   Re-render dirigido       │                 │
│  │   Raíz                     │                 │
│  │   ├── ComponenteA ← omitir │                 │
│  │   │   ├── ComponenteB ← ✔ │                 │
│  │   │   └── ComponenteC ← omitir│             │
│  │   ├── ComponenteD ← omitir │                 │
│  │   └── ComponenteE ← omitir │                 │
│  └────────────────────────────┘                 │
│   ¡Solo ComponenteB estaba suscrito al signal!  │
└─────────────────────────────────────────────────┘
```

### Comparación

```
┌──────────────────────┬────────────────────────────────────┐
│      Zone.js         │         Zoneless (Signals)          │
├──────────────────────┼────────────────────────────────────┤
│ Parchea APIs async   │ Sin parcheo — APIs nativas intactas │
│ Verifica todo árbol  │ Actualiza solo componentes afectados│
│ ~100 KB extra bundle │ Sin overhead de Zone                │
│ Implícito (mágico)   │ Explícito (el dev controla updates) │
│ Más fácil de migrar  │ Requiere adoptar Signals            │
│ Default Angular 2–18 │ Estable desde Angular 19+           │
└──────────────────────┴────────────────────────────────────┘
```

### Analogía

Imaginá una **casa inteligente** con sensores de movimiento:

- **Zone.js:** Cada vez que *cualquier* puerta se abre, todas las luces de todos los cuartos parpadean para verificar si deben encenderse. Funciona, pero es ineficiente.
- **Zoneless:** Cada luz está conectada solo al sensor de su cuarto. Solo reacciona la luz correspondiente.

### Cómo se habilita en el proyecto

```typescript
// src/app/app.config.ts
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ← habilita el modo zoneless
    provideRouter(routes),
  ],
};
```

---

## 2. Servicios con Signals (`@Service`)

### Teoría

Un **servicio** en Angular es una clase que encapsula lógica de negocio y estado compartido entre componentes. Combinado con **Signals**, el servicio se convierte en la única fuente de verdad reactiva de la aplicación.

```
┌──────────────────────────────────────────────────┐
│                    SERVICIO                      │
│                                                  │
│  signal('0') ──→ resultText                      │
│  signal('0') ──→ subResultText     estado        │
│  signal('+') ──→ lastOperator                    │
│                                                  │
│  constructNumber()  ──→  lógica de entrada       │
│  calculateResult()  ──→  lógica de cálculo       │
│                                                  │
│        ↓ inyectado con inject()                  │
│  ┌─────────────┐   ┌─────────────┐              │
│  │  Calculator │   │  OtroComp.  │  consumidores │
│  └─────────────┘   └─────────────┘              │
└──────────────────────────────────────────────────┘
```

### `@Service()` vs `@Injectable()` (Angular 22+)

| Angular ≤21 | Angular 22+ |
|-------------|-------------|
| `@Injectable({ providedIn: 'root' })` | `@Service()` |
| Global, requiere opción explícita | Global por defecto |

### Ejemplo del proyecto

```typescript
// src/app/calculator/services/calculator-service.ts
import { Service, signal } from '@angular/core';

@Service()

export class CalculatorService {
  public resultText    = signal('0');
  public subResultText = signal('0');
  public lastOperator  = signal('+');

  constructNumber(value: string): void { ... }
  calculateResult(): void { ... }
}
```

### Inyección con `inject()`

```typescript
// src/app/calculator/components/calculator/calculator.component.ts
export class CalculatorComponent {
  private calculatorService = inject(CalculatorService); // sin constructor
}
```

### Cuándo NO usar scope global

```typescript
@Service({ providedIn: null }) // no global
export class LocalService { ... }

@Component({
  providers: [LocalService], // instancia propia por componente
})
export class MyComponent { ... }
```

### Analogía

El servicio es como el **servidor central de un banco**: todos los cajeros (componentes) consultan el mismo saldo (signal). Cuando el saldo cambia, solo los cajeros que muestran ese saldo actualizan su pantalla.

---

## 3. Computed Signals

### Teoría

Un `computed()` es un signal **de solo lectura** cuyo valor se deriva automáticamente de otros signals. Angular recalcula el valor solo cuando alguno de sus signals de entrada cambia.

```
  signal A ──┐
             ├──→ computed() ──→ valor derivado (solo lectura)
  signal B ──┘

  Si A o B cambian → computed se recalcula automáticamente
  Si ninguno cambia → computed devuelve el valor cacheado
```

### API

```typescript
import { signal, computed } from '@angular/core';

const precio   = signal(100);
const cantidad = signal(3);
const total    = computed(() => precio() * cantidad());

console.log(total()); // 300
precio.set(150);
console.log(total()); // 450 — recalculado automáticamente
```

### Ejemplo del proyecto

El componente `Calculator` no lee el servicio directamente: expone signals derivadas.

```typescript
// src/app/calculator/components/calculator/calculator.component.ts
export class CalculatorComponent {
  private calculatorService = inject(CalculatorService);

  // signals derivadas del servicio — se actualizan automáticamente
  resultText    = computed(() => this.calculatorService.resultText());
  subResultText = computed(() => this.calculatorService.subResultText());
  lastOperator  = computed(() => this.calculatorService.lastOperator());
}
```

Y en el template:

```html
@if(subResultText() !== '0') {
  <span>{{ subResultText() }} {{ lastOperator() }}</span>
}
<span>{{ resultText() }}</span>
```

### Diferencia entre `signal` y `computed`

```
┌────────────────┬──────────────────────────────────────┐
│   signal()     │   computed()                          │
├────────────────┼──────────────────────────────────────┤
│ Lectura/Escritura│ Solo lectura                        │
│ set() / update()│ Sin métodos de escritura             │
│ Fuente de datos │ Derivado de otras fuentes            │
│ Siempre fresco  │ Cacheado hasta que dependencias cam. │
└────────────────┴──────────────────────────────────────┘
```

### Analogía

`computed()` es como la **factura de un supermercado**: no escribís el total a mano, se calcula automáticamente de los ítems que ya están en la lista. Si cambia el precio de un ítem, el total se recalcula solo.

---

## 4. Host Property Condicional

### Teoría

El objeto `host` del decorador `@Component` permite vincular clases, atributos y eventos directamente al **elemento host** — el tag HTML que representa al componente en el DOM (`<calculator-button>`), no a su template interno.

```
DOM resultante:

<calculator-button class="border-r border-b border-indigo-400 w-1/4">
  <button class="...">C</button>
</calculator-button>
```

### Sintaxis

```typescript
@Component({
  host: {
    // Clases estáticas (siempre presentes)
    class: 'clase-fija otra-clase',

    // Clases condicionales (se agregan/quitan según expresión)
    '[class.nombre-clase]': 'expresionBooleana()',

    // Atributos dinámicos
    '[attr.aria-label]': 'labelSignal()',

    // Eventos
    '(click)': 'handler($event)',
    '(document:keyup)': 'handleKeyboard($event)',
  },
})
```

### Ejemplo del proyecto — ancho condicional

```typescript
// src/app/calculator/components/calculator-button/calculator-button.component.ts
@Component({
  host: {
    class: 'border-r border-b border-indigo-400', // siempre presente
    '[class.w-2/4]': 'isDoubleSize()',             // ancho doble si es true
    '[class.w-1/4]': '!isDoubleSize()',            // ancho simple si es false
  },
})
export class CalculatorButtonComponent {
  isDoubleSize = input(false, { transform: ... });
}
```

En el template padre:

```html
<!-- botón normal: w-1/4 -->
<calculator-button>7</calculator-button>

<!-- botón doble: w-2/4 (ej: tecla =) -->
<calculator-button isDoubleSize>=</calculator-button>
```

### Ejemplo del proyecto — evento en el host

```typescript
// src/app/calculator/components/calculator/calculator.component.ts
@Component({
  host: {
    '(document:keyup)': 'handleKeyboardEvent($event)', // escucha teclado global
  },
})
export class CalculatorComponent {
  handleKeyboardEvent(event: KeyboardEvent) { ... }
}
```

### Analogía

El host es como la **fachada de un edificio**: el `host` controla el color, tamaño y cartel de la fachada. El interior (template) es independiente. Desde afuera solo ves la fachada; lo que pasa adentro es responsabilidad del componente.

---

## 5. Remover `@HostListener` y `@HostBinding`

### El problema con los decoradores legacy

`@HostBinding` y `@HostListener` son decoradores de la era de NgModules. En componentes standalone con Signals son reemplazados por el objeto `host` del decorador.

### Comparación directa

**Antes — `@HostBinding` (legacy):**

```typescript
import { HostBinding } from '@angular/core';

export class CalculatorButtonComponent {
  @HostBinding('class.is-command')
  get commandStyle() {
    return this.isCommand(); // getter evaluado en cada CD
  }

  @HostBinding('class.w-2/4')
  get doubleSizeStyle() {
    return this.isDoubleSize();
  }
}
```

**Ahora — `host` en el decorador (moderno):**

```typescript
@Component({
  host: {
    '[class.is-command]': 'isCommand()',   // expresión evaluada una vez por signal
    '[class.w-2/4]':      'isDoubleSize()',
    '[class.w-1/4]':      '!isDoubleSize()',
  },
})
export class CalculatorButtonComponent { }
```

**Antes — `@HostListener` (legacy):**

```typescript
import { HostListener } from '@angular/core';

export class CalculatorComponent {
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { ... }
}
```

**Ahora — `host` en el decorador (moderno):**

```typescript
@Component({
  host: {
    '(document:keyup)': 'handleKeyboardEvent($event)',
  },
})
export class CalculatorComponent {
  handleKeyboardEvent(event: KeyboardEvent) { ... }
}
```

### Estado en el proyecto

Los `@HostBinding` están comentados como referencia del proceso de migración:

```typescript
// calculator-button.component.ts — comentarios conservados intencionalmente
/*
@HostBinding('class.is-command') get commandStyle() {
  return this.isCommand();
} */
/* @HostBinding('class.w-2/4') get doubleSizeStyle() {
  return this.isDoubleSize();
} */
```

### Ventajas del enfoque moderno

```
┌─────────────────────────┬─────────────────────────────┐
│   @HostBinding (legacy) │   host: {} (moderno)        │
├─────────────────────────┼─────────────────────────────┤
│ Disperso en la clase    │ Centralizado en el decorator │
│ Requiere import extra   │ Sin import adicional         │
│ Getter evaluado por CD  │ Expresión reactiva con Signal│
│ Verbose                 │ Conciso                      │
└─────────────────────────┴─────────────────────────────┘
```

---

## 6. Output Emitter Refs

### Teoría

`output()` es la API moderna de Angular 17+ para emitir eventos desde un componente hijo hacia su padre. Reemplaza `@Output() new EventEmitter()`.

### Comparación

**Antes (legacy):**

```typescript
import { Output, EventEmitter } from '@angular/core';

export class CalculatorButtonComponent {
  @Output() onClick = new EventEmitter<string>();

  handleClick() {
    this.onClick.emit('valor');
  }
}
```

**Ahora (moderno):**

```typescript
import { output } from '@angular/core';

export class CalculatorButtonComponent {
  onClick = output<string>(); // tipado, sin new EventEmitter

  handleClick() {
    this.onClick.emit('valor');
  }
}
```

### Ejemplo del proyecto

```typescript
// src/app/calculator/components/calculator-button/calculator-button.component.ts
export class CalculatorButtonComponent {
  onClick = output<string>(); // emite el texto del botón presionado

  handleClick() {
    const value = this.contentValue()?.nativeElement.textContent;
    if (!value) return;
    this.onClick.emit(value);
  }
}
```

En el template padre:

```html
<!-- src/app/calculator/components/calculator/calculator.component.html -->
<calculator-button (onClick)="handleClick($event)">7</calculator-button>
```

### Flujo del evento

```
Usuario hace clic
       │
       ▼
  <button> dispara (click) → handleClick() en CalculatorButtonComponent
       │
       ▼
  onClick.emit('7')
       │
       ▼
  (onClick)="handleClick($event)" en CalculatorComponent
       │
       ▼
  calculatorService.constructNumber('7')
       │
       ▼
  resultText signal se actualiza → UI re-renderiza
```

### Analogía

`output()` es como un **intercomunicador**: el botón (hijo) habla por el intercomunicador cuando alguien lo presiona. El componente padre tiene el receptor y decide qué hacer con el mensaje.

---

## 7. Signal `viewChild`

### Teoría

`viewChild()` devuelve una **referencia reactiva** a un elemento o componente del template del propio componente. Es un signal de solo lectura que Angular actualiza automáticamente cuando el DOM cambia.

### Comparación

**Antes (legacy):**

```typescript
import { ViewChild, ElementRef } from '@angular/core';

export class CalculatorButtonComponent {
  @ViewChild('button') buttonRef!: ElementRef<HTMLButtonElement>;
  // disponible solo después de ngAfterViewInit
}
```

**Ahora (moderno):**

```typescript
import { viewChild, ElementRef } from '@angular/core';

export class CalculatorButtonComponent {
  contentValue = viewChild<ElementRef<HTMLButtonElement>>('button');
  // es un signal — disponible reactivamente, sin lifecycle hooks
}
```

### Ejemplo del proyecto

```typescript
// src/app/calculator/components/calculator-button/calculator-button.component.ts
export class CalculatorButtonComponent {
  contentValue = viewChild<ElementRef<HTMLButtonElement>>('button');
  //                                                       ↑
  //                                          referencia al #button del template

  handleClick() {
    const value = this.contentValue()?.nativeElement.textContent;
    //                            ↑ se llama como función (es un signal)
    if (!value) return;
    this.onClick.emit(value.trim());
  }
}
```

Template al que apunta:

```html
<!-- calculator-button.html -->
<button #button (click)="handleClick()">
  <ng-content />
</button>
```

### Cuándo usar `viewChild`

```
┌──────────────────────────────┬──────────────────────────────────┐
│ Caso de uso                  │ Qué usar                         │
├──────────────────────────────┼──────────────────────────────────┤
│ Un elemento nativo del DOM   │ viewChild<ElementRef>('ref')      │
│ Un componente hijo           │ viewChild(MiComponente)           │
│ Una directiva                │ viewChild(MiDirectiva)            │
│ Todos los hijos del mismo tipo│ viewChildren(Tipo)               │
└──────────────────────────────┴──────────────────────────────────┘
```

### Analogía

`viewChild` es como una **cámara de seguridad** apuntando a un punto específico del template. Podés consultar en cualquier momento qué hay en ese punto sin necesitar un evento especial de ciclo de vida.

---

## 8. Signal `viewChildren`

### Teoría

`viewChildren()` devuelve un signal con un array de todas las instancias de un componente o directiva que están en el template del componente actual. Se actualiza reactivamente cuando se agregan o quitan elementos.

### Ejemplo del proyecto

```typescript
// src/app/calculator/components/calculator/calculator.component.ts
export class CalculatorComponent {
  calculatorButtons = viewChildren(CalculatorButtonComponent);
  //                              ↑ referencia a TODOS los <calculator-button>
  //                                del template de Calculator

  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.trim();
    // ...
    // recorre todos los botones para activar el efecto visual del teclado
    this.calculatorButtons().forEach(button => {
      button.keyboardPressedStyle(key);
    });
  }
}
```

### Diagrama

```
  Calculator template
  ┌────────────────────────────────────┐
  │  <calculator-button>C</>           │ ─┐
  │  <calculator-button>+/-</>         │  │
  │  <calculator-button>%</>           │  ├── viewChildren(CalculatorButtonComponent)
  │  <calculator-button>÷</>           │  │
  │  ... (17 botones en total)         │ ─┘
  └────────────────────────────────────┘       viewChildren(CalculatorButtonComponent)
           │                                   devuelve signal<CalculatorButtonComponent[]>
           ▼
  calculatorButtons() → [btn1, btn2, btn3, ...btn17]
```

### Diferencia con `viewChild`

```
viewChild()     → signal<T | undefined>      — uno solo
viewChildren()  → signal<readonly T[]>       — todos los del tipo
```

---

## 9. Realizar cálculos y operaciones

### Arquitectura del cálculo

```
  Usuario presiona botón/tecla
         │
         ▼
  CalculatorComponent.handleClick(key)
         │
         ▼
  CalculatorService.constructNumber(key)
         │
    ┌────┴────────────────────────────┐
    │  ¿Es número?   → agrega al display
    │  ¿Es operador? → guarda en lastOperator, mueve resultado a subResult
    │  ¿Es '='?      → llama calculateResult()
    │  ¿Es 'C'?      → resetea todo
    │  ¿Es Backspace?→ borra último dígito
    └────┬────────────────────────────┘
         │
         ▼
  Signals se actualizan → UI re-renderiza automáticamente
```

### Código de cálculo

```typescript
// src/app/calculator/services/calculator-service.ts
calculateResult() {
  const number1 = parseFloat(this.subResultText()); // operando izquierdo
  const number2 = parseFloat(this.resultText());    // operando derecho

  let result = 0;

  switch (this.lastOperator()) {
    case '+': result = number1 + number2; break;
    case '-': result = number1 - number2; break;
    case '*':
    case 'x':
    case 'X': result = number1 * number2; break;
    case '/':
    case '÷': result = number1 / number2; break;
  }

  this.resultText.set(result.toString()); // actualiza signal → re-render
  this.subResultText.set('0');
}
```

### Mapeo de teclas del teclado

```typescript
// src/app/calculator/components/calculator/calculator.component.ts
const equivalentKey: Record<string, string> = {
  Escape: 'C',   // Escape → limpiar
  Clear:  'C',
  Enter:  '=',   // Enter → calcular
  'x':    '*',   // x minúscula del teclado → multiplicar
  '÷':    '/',   // símbolo especial → dividir
};
const keyValue = equivalentKey[key] ?? key; // usa el mapeado o el original
```

---

## 10. Validaciones y consideraciones

Todas las validaciones viven en `constructNumber()` del servicio, siguiendo el principio de **responsabilidad única**: el componente solo emite valores, el servicio decide qué hacer con ellos.

### Mapa de validaciones

```
Input recibido
     │
     ├─ ¿No está en listas válidas?  → ignorar (log en consola)
     ├─ '='                          → calcular resultado
     ├─ 'C'                          → resetear todo a '0'
     ├─ 'Backspace'                  → borrar último dígito
     │      ├─ Si ya es '0'          → no hacer nada
     │      ├─ Si es '-X' (2 chars)  → set '0'
     │      └─ Si es 1 char          → set '0'
     ├─ operador (+, -, *, /)        → guardar operador, mover display a sub
     ├─ length >= 10                 → bloquear (máximo 10 dígitos)
     ├─ '.' ya existe en el número   → ignorar segundo punto
     ├─ '0' y display ya es '0'      → no agregar cero extra
     ├─ '+/-'                        → invertir signo
     └─ dígito                       → agregar al display
```

### Ejemplo: prevenir doble punto decimal

```typescript
if (value === '.' && !this.resultText().includes('.')) {
  if (this.resultText() === '0' || this.resultText() === '') {
    this.resultText.set('0.');
    return;
  }
  this.resultText.update((text) => text + '.');
  return;
}
// Si ya tiene punto, el if no entra y el '.' se ignora
```

### Ejemplo: cambio de signo

```typescript
if (value === '+/-') {
  if (this.resultText().includes('-')) {
    this.resultText.update((text) => text.slice(1)); // quita el '-'
    return;
  }
  this.resultText.update((text) => '-' + text); // agrega el '-'
  return;
}
```

### Validación de input con `signal.update()`

`update()` recibe la función transformadora — es preferible a `set()` cuando el nuevo valor depende del anterior:

```typescript
// menos seguro: lee y escribe en dos pasos
const current = this.resultText();
this.resultText.set(current + value);

// más seguro: atómico
this.resultText.update((text) => text + value);
```

---

## 11. Conceptos complementarios

### Proyección de contenido (`<ng-content>`)

Permite que el componente padre inserte contenido dentro del template del hijo.

```
  Padre:                    Hijo (calculator-button.html):
  ─────────────────         ────────────────────────────
  <calculator-button>       <button>
    7                  →      <ng-content />   ← aquí va el "7"
  </calculator-button>      </button>
```

En el proyecto cada botón proyecta su etiqueta:

```html
<calculator-button>C</calculator-button>
<calculator-button>+/-</calculator-button>
<calculator-button>=</calculator-button>
```

El componente no necesita saber qué texto muestra — solo provee el contenedor.

---

### Alias de rutas (Path Aliases)

```typescript
// tsconfig.json
"paths": { "@/*": ["./src/app/*"] }

// En el código:
import { CalculatorService } from '@/calculator/services/calculator-service';
// en lugar de:
import { CalculatorService } from '../../../calculator/services/calculator-service';
```

---

### Control flow nativo (`@if`, `@for`, `@switch`)

Angular 17+ reemplaza `*ngIf` y `*ngFor` con sintaxis nativa en los templates:

```html
<!-- @if en el proyecto -->
@if(subResultText() !== '0') {
  <span class="text-4xl">{{ subResultText() }} {{ lastOperator() }}</span>
}
```

---

### Efectos visuales con Signal + `setTimeout`

```typescript
// calculator-button.component.ts — efecto de tecla presionada
keyboardPressedStyle(key: string) {
  const value = this.contentValue()?.nativeElement.textContent?.trim();
  if (value !== key) return;

  this.isPressed.set(true);         // activar clase CSS
  setTimeout(() => {
    this.isPressed.set(false);      // desactivar después de 100ms
  }, 100);
}
```

En el template:

```html
<button [class.is-pressed]="isPressed()">
  <ng-content />
</button>
```

---

## 12. Testing con Vitest y TestBed

### Herramientas

Este proyecto usa **Vitest** como test runner (en lugar de Karma/Jasmine que era el default histórico de Angular). Vitest corre en Node.js usando **JSDOM** como DOM simulado — no necesita abrir un navegador real.

```
┌──────────────────────────────────────────────────────┐
│               STACK DE TESTING                       │
│                                                      │
│  Vitest          → ejecuta los tests, reporta        │
│  JSDOM           → simula el DOM del navegador       │
│  @angular/core/testing → TestBed, ComponentFixture   │
│  Expect / Matchers     → afirmaciones (assertions)   │
└──────────────────────────────────────────────────────┘
```

### Anatomía de un archivo `.spec.ts`

```typescript
// src/app/app.spec.ts
import { TestBed } from '@angular/core/testing';
import { App } from './app';

// describe() agrupa tests relacionados bajo un nombre común
describe('App', () => {

  // beforeEach() corre ANTES de cada test del grupo
  // Configura el módulo de testing con los componentes/imports necesarios
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],         // componente standalone se importa directamente
    }).compileComponents();   // compila templates y estilos
  });

  // it() define un test individual
  // Primer argumento: descripción legible de lo que se prueba
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // verifica que el componente se creó
  });

});
```

### `TestBed` — el entorno de testing de Angular

`TestBed` es el equivalente de `AppModule` pero para tests: configura el injector, compila los componentes y provee el contexto necesario para que Angular funcione fuera del navegador.

```
TestBed.configureTestingModule({ imports, providers, declarations })
  └─→ crea un NgModule de test en memoria

TestBed.createComponent(MiComponente)
  └─→ instancia el componente dentro de JSDOM
  └─→ devuelve un ComponentFixture<MiComponente>
```

### `ComponentFixture` — el contenedor del componente en tests

```
fixture
├── componentInstance   → la clase TypeScript (propiedades, métodos, signals)
├── nativeElement       → elemento HTML raíz en el DOM simulado (JSDOM)
├── debugElement        → wrapper Angular con helpers de query
├── detectChanges()     → fuerza una ronda de detección de cambios
└── whenStable()        → espera que terminen operaciones async (Promises, timers)
```

### `fixture.nativeElement` — acceso al DOM renderizado

`nativeElement` es el **elemento HTML raíz del componente** dentro del DOM simulado por JSDOM. Al castearlo a `HTMLElement` obtenemos acceso completo a la API estándar del DOM para verificar lo que el usuario vería en el navegador.

```typescript
const compiled = fixture.nativeElement as HTMLElement;

// Leer texto renderizado
compiled.querySelector('h1')?.textContent

// Verificar presencia de elementos
compiled.querySelectorAll('button').length

// Comprobar clases CSS aplicadas
compiled.querySelector('.resultado')?.classList.contains('activo')

// Leer atributos
compiled.querySelector('input')?.getAttribute('placeholder')
```

**`componentInstance` vs `nativeElement`:**

```
┌───────────────────────┬──────────────────────────────────────────┐
│ componentInstance     │ nativeElement                            │
├───────────────────────┼──────────────────────────────────────────┤
│ La clase TypeScript   │ El HTML resultante en el DOM             │
│ Propiedades, signals  │ Elementos, texto, clases, atributos      │
│ Lo que el dev escribió│ Lo que el usuario ve                     │
│ app.title, app.count()│ compiled.querySelector('h1').textContent  │
└───────────────────────┴──────────────────────────────────────────┘
```

Ejemplo completo:

```typescript
const fixture  = TestBed.createComponent(App);
const app      = fixture.componentInstance; // clase TypeScript
const compiled = fixture.nativeElement as HTMLElement; // HTML en JSDOM

fixture.detectChanges(); // dispara bindings para que el DOM se actualice

// Prueba de lógica (TypeScript)
expect(app).toBeTruthy();

// Prueba de renderizado (DOM)
expect(compiled.querySelector('h1')?.textContent).toContain('Hola');
```

### Tipos de test — de simple a complejo

```
┌─────────────────────┬──────────────────────────────────────────┐
│ Tipo                │ Qué prueba                               │
├─────────────────────┼──────────────────────────────────────────┤
│ Sanity / Smoke      │ Que el entorno funciona (2 + 2 === 4)    │
│ Unit (lógica pura)  │ Funciones, signals, servicios aislados   │
│ Unit (componente)   │ Renderizado, bindings, outputs           │
│ Integration         │ Componente + servicio juntos             │
│ E2E                 │ Flujo completo en navegador real         │
└─────────────────────┴──────────────────────────────────────────┘
```

### Test de Sanity/Smoke

El test más simple posible: verifica que el entorno de testing y el motor de ejecución funcionan. No prueba lógica del componente — prueba que Vitest corre y que `expect()` funciona. Si este test falla, el problema está en la configuración del runner, no en el código de la app.

### Matchers más comunes

```typescript
expect(valor).toBe(4);              // igualdad estricta ===
expect(valor).toEqual({ a: 1 });    // igualdad profunda (objetos)
expect(valor).toBeTruthy();         // cualquier valor truthy
expect(valor).toBeFalsy();          // null, undefined, 0, ''
expect(valor).toContain('texto');   // string o array contiene
expect(valor).toBeNull();           // estrictamente null
expect(fn).toThrow();               // la función lanza error
expect(mockFn).toHaveBeenCalled();  // spy fue invocado
```

### Testing de Signals en servicios

Con zoneless y Signals, los tests de servicios son simples — no necesitan `detectChanges()` para leer valores:

```typescript
it('should update resultText when a number is pressed', () => {
  const service = TestBed.inject(CalculatorService);

  service.constructNumber('5');

  expect(service.resultText()).toBe('5'); // signal se lee directamente con ()
});
```

### Tests del proyecto (`app.spec.ts`)

Los tests del componente raíz `App` cubren cuatro patrones distintos de verificación.

#### 1. Creación del componente

Verifica que el componente puede instanciarse sin errores. Es el test mínimo de cualquier componente.

```typescript
it('should create the app', () => {
  const fixture = TestBed.createComponent(App);
  const app = fixture.componentInstance;
  expect(app).toBeTruthy(); // la instancia existe y no es null/undefined
});
```

#### 2. Smoke test / Sanity

Verifica que el entorno de testing funciona. Si falla, el problema es el runner, no la app.

```typescript
it('it should be 4', () => {
  expect(2 + 2).toBe(4);
});
```

#### 3. Presencia de elemento en el DOM

Verifica que un elemento HTML existe en el DOM renderizado usando `querySelector`.

```typescript
it('it should render router-outlet', () => {
  const fixture = TestBed.createComponent(App);
  const compiled = fixture.nativeElement as HTMLElement;

  const routerOutlet = compiled.querySelector('router-outlet');
  expect(routerOutlet).toBeTruthy(); // el elemento existe en el DOM
});
```

#### 4. Clases CSS — comparación frágil vs robusta

Verificar clases CSS tiene dos enfoques con distinta tolerancia al cambio de orden:

**Frágil** — compara el string completo de `classList.value`. Si el orden de las clases cambia en el HTML, el test falla aunque todas las clases estén presentes.

```typescript
it('it should render router-outlet with css classes', () => {
  const fixture = TestBed.createComponent(App);
  const compiled = fixture.nativeElement as HTMLElement;
  const div = compiled.querySelector('div');
  const mustHaveClasses = 'min-w-screen min-h-screen bg-slate-600 flex items-center justify-center px-5 py-5';

  // ⚠ Falla si el orden de clases en el HTML cambia
  expect(div?.classList.value).toBe(mustHaveClasses);
});
```

**Robusta** — convierte el string en array y verifica que cada clase esté presente individualmente. El orden no importa.

```typescript
it('it should render router-outlet with all css classes', () => {
  const fixture = TestBed.createComponent(App);
  const compiled = fixture.nativeElement as HTMLElement;
  const div = compiled.querySelector('div');
  const mustHaveClasses = 'min-w-screen min-h-screen bg-slate-600 flex items-center justify-center px-5 py-5'.split(' ');

  // ✔ Resiste cambios de orden en el HTML
  div?.classList.forEach(cls => {
    expect(mustHaveClasses.includes(cls)).toBe(true);
  });
});
```

#### 5. Atributos de elementos

Verifica múltiples atributos de un mismo elemento con `getAttribute()`.

```typescript
it('it should render buy me a beer link with attributes', () => {
  const fixture = TestBed.createComponent(App);
  const compiled = fixture.nativeElement as HTMLElement;
  const link = compiled.querySelector('a');

  expect(link).toBeTruthy();
  expect(link?.getAttribute('title')).toBe('Buy me a beer');
  expect(link?.getAttribute('href')).toBe('https://www.buymeacoffee.com/scottwindon');
  expect(link?.getAttribute('target')).toBe('_blank');
});
```

#### Resumen de patrones

```
┌──────────────────────────────────┬───────────────────────────────────────┐
│ Qué verificar                    │ Cómo                                  │
├──────────────────────────────────┼───────────────────────────────────────┤
│ Componente instanciado           │ expect(app).toBeTruthy()              │
│ Elemento presente en DOM         │ expect(querySelector(...)).toBeTruthy()│
│ Clases CSS (frágil)              │ classList.value === string completo    │
│ Clases CSS (robusta)             │ classList.forEach + includes()        │
│ Atributo de elemento             │ getAttribute('attr') === valor        │
│ Texto renderizado                │ querySelector(...)?.textContent       │
└──────────────────────────────────┴───────────────────────────────────────┘
```

---

*Guía generada con el código real del proyecto `01-zoneless-calculator`. Angular 22.0.0.*
