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
  isDoubleSize = input(false, { transform: booleanAttribute });
}
```

En el template padre:

```html
<!-- botón normal: w-1/4 -->
<calculator-button>7</calculator-button>

<!-- botón doble: w-2/4 (ej: tecla =) -->
<calculator-button isDoubleSize>=</calculator-button>
```

### `transform` en `input()` — normalización de valores

`transform` es una función que Angular ejecuta automáticamente cada vez que el input recibe un valor, antes de almacenarlo en el signal. Actúa como una capa de normalización entre el template y la lógica del componente.

**El problema que resuelve:**

Los atributos HTML sin valor llegan como string vacío `""` en lugar de `true`:

```
// Template                              → valor recibido sin transform
<calculator-button isDoubleSize>        →  ""      (string vacío, no boolean)
<calculator-button [isDoubleSize]="true">  →  true
<calculator-button [isDoubleSize]="false"> →  false
```

Sin normalización, `isDoubleSize()` devolvería `""` en el primer caso, rompiendo el binding condicional en `host`.

**Solución con `transform` manual:**

```typescript
isDoubleSize = input(false, {
  transform: (value: boolean | string) => (typeof value === 'string' ? value === '' : value),
});
// ""    → "" === ""  → true  ✔
// true  → true       → true  ✔
// false → false      → false ✔
```

**Solución con `booleanAttribute` (recomendada):**

Angular provee `booleanAttribute` en `@angular/core` que hace exactamente lo mismo con menos código:

```typescript
import { input, booleanAttribute } from '@angular/core';

isCommand    = input(false, { transform: booleanAttribute });
isDoubleSize = input(false, { transform: booleanAttribute });
```

```
┌─────────────────────────────────┬────────────────────────────────────────────┐
│ Forma                           │ Cuándo usar                                │
├─────────────────────────────────┼────────────────────────────────────────────┤
│ transform: booleanAttribute     │ Inputs que representan flags booleanos     │
│ transform: numberAttribute      │ Inputs que deben recibir un número         │
│ transform: función propia       │ Normalización personalizada (trim, parse…) │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

`numberAttribute` sigue el mismo principio para inputs numéricos: convierte el string `"10"` del template en el número `10`.

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

### Boilerplate para testear un servicio (`calculator.service.spec.ts`)

Testear un servicio es más simple que testear un componente: no hay DOM, no hay `fixture`, no hay `detectChanges()`. Solo se obtiene la instancia del servicio e se interactúa directamente con sus métodos y signals.

#### Estructura del boilerplate

```typescript
// src/app/calculator/services/calculator.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { CalculatorService } from './calculator.service';

describe('CalculatorService', () => {
  // Variable accesible por todos los tests del bloque.
  // Se declara fuera del beforeEach para que cada it() pueda usarla.
  let service: CalculatorService;

  // beforeEach garantiza que cada test arranca con una instancia
  // limpia — sin estado residual del test anterior.
  beforeEach(() => {
    // Para servicios se usa providers[] en lugar de imports[].
    // Aunque el servicio sea @Service() global, se registra aquí
    // explícitamente para aislarlo en el entorno de test.
    TestBed.configureTestingModule({
      providers: [CalculatorService]
    });

    // TestBed.inject() obtiene la instancia del servicio del injector de test.
    // Equivale a inject() pero usado fuera del contexto de un componente.
    service = TestBed.inject(CalculatorService);

    vi.resetAllMocks();
  });

  // Test mínimo de creación
  it('it should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

#### `beforeEach` — aislamiento entre tests

`beforeEach` es una función de setup que se ejecuta **antes de cada test** (`it`) dentro del `describe`. Su propósito es garantizar que cada test arranca desde un estado limpio y conocido, sin contaminación del test anterior.

```
describe('CalculatorService', () => {
  │
  ├── beforeEach()  ← se ejecuta
  ├── it('test 1')  ← corre en estado limpio
  │
  ├── beforeEach()  ← se ejecuta de nuevo
  ├── it('test 2')  ← corre en estado limpio
  │
  ├── beforeEach()  ← se ejecuta de nuevo
  └── it('test 3')  ← corre en estado limpio
```

Sin `beforeEach`, una instancia de servicio compartida acumularía estado entre tests — si el test 1 setea `resultText` a `'999'`, el test 2 empezaría con ese valor en lugar de `'0'`, produciendo falsos negativos o positivos difíciles de depurar.

#### `vi.resetAllMocks()` vs `vi.clearAllMocks()`

Vitest expone dos métodos para limpiar el estado de los spies/mocks entre tests. Son similares pero tienen alcances distintos:

```
┌────────────────────────┬──────────────────────────────────────────────────────┐
│ Método                 │ Qué limpia                                           │
├────────────────────────┼──────────────────────────────────────────────────────┤
│ vi.clearAllMocks()     │ Historial de llamadas (calls, instances, results)    │
│                        │ NO restaura mockImplementation ni mockReturnValue    │
├────────────────────────┼──────────────────────────────────────────────────────┤
│ vi.resetAllMocks()     │ Todo lo anterior + elimina mockImplementation        │
│                        │ y mockReturnValue — el spy queda "vacío"             │
└────────────────────────┴──────────────────────────────────────────────────────┘
```

En la práctica:

```typescript
// Test 1
const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {});
console.log('hola');
// spyLog.mock.calls → [['hola']]

// ─── beforeEach con clearAllMocks ───
// spyLog.mock.calls    → []          ✔ historial limpiado
// mockImplementation   → () => {}    ✘ sigue silenciando la consola

// ─── beforeEach con resetAllMocks ───
// spyLog.mock.calls    → []          ✔ historial limpiado
// mockImplementation   → undefined   ✔ console.log vuelve a imprimir
```

**Regla práctica:** usar `resetAllMocks()` es más seguro. Garantiza que ningún mock del test anterior afecta al siguiente. `clearAllMocks()` es útil solo cuando se quiere preservar una implementación mock definida globalmente en `beforeAll`.

En el proyecto se usa `resetAllMocks()` en `beforeEach` para que cada test que necesite espiar `console.log` configure su propio spy desde cero:

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [CalculatorService] });
  service = TestBed.inject(CalculatorService);
  vi.resetAllMocks(); // limpia mocks e implementaciones del test anterior
});
```

#### Diferencia clave: componente vs servicio

```
┌────────────────────────────┬──────────────────────────────────────┐
│ Test de COMPONENTE         │ Test de SERVICIO                     │
├────────────────────────────┼──────────────────────────────────────┤
│ imports: [MiComponente]    │ providers: [MiServicio]              │
│ TestBed.createComponent()  │ TestBed.inject()                     │
│ fixture.componentInstance  │ variable service directamente        │
│ fixture.nativeElement      │ no aplica — no hay DOM               │
│ fixture.detectChanges()    │ no necesario — no hay bindings       │
└────────────────────────────┴──────────────────────────────────────┘
```

#### Testing de Signals en servicios

Con Zoneless y Signals, los tests de servicios son simples — no necesitan `detectChanges()` para leer valores. Los signals se leen llamándolos como funciones y se escriben directamente con `.set()`:

```typescript
it('should update resultText when a number is pressed', () => {
  service.constructNumber('5');
  expect(service.resultText()).toBe('5'); // signal se lee con ()
});

// También podemos setear signals directamente en el Arrange sin simular
// interacciones del usuario — ventaja clave de Signals en tests:
service.resultText.set('123');
service.lastOperator.set('-');
```

### Patrones de testing en el servicio (`calculator.service.spec.ts`)

El suite del `CalculatorService` cubre 17 casos que ilustran patrones reutilizables.

#### Patrón AAA — estructura recomendada

Cada test sigue el patrón **Arrange → Act → Assert**, separado visualmente con líneas en blanco y comentarios:

```typescript
it('should set resultText to "0" when C is pressed', () => {
  // Arrange: preparamos el estado inicial.
  service.resultText.set('123');
  service.lastOperator.set('-');

  // Act: ejecutamos la acción bajo prueba.
  service.constructNumber('C');

  // Assert: verificamos el estado resultante.
  expect(service.resultText()).toBe('0');
  expect(service.lastOperator()).toBe('+');
});
```

Cuando el Assert ocurre dentro del Act (estado que cambia paso a paso), se puede combinar Act + Assert:

```typescript
// Act + Assert combinados cuando verificamos estado intermedio
service.constructNumber('+/-');
expect(service.resultText()).toBe('-5');

service.constructNumber('+/-');
expect(service.resultText()).toBe('5');
```

#### Patrón forEach — probar múltiples valores sin repetir código

Cuando el mismo comportamiento aplica a varios inputs, un `forEach` evita duplicar el test:

```typescript
it('should handle operators correctly', () => {
  const operators = ['+', '-', '*', '/'];

  operators.forEach(operator => {
    // Arrange
    service.resultText.set('12345');

    // Act
    service.constructNumber(operator);

    // Assert: cada operador produce el mismo efecto estructural
    expect(service.lastOperator()).toBe(operator);
    expect(service.subResultText()).toBe('12345');
    expect(service.resultText()).toBe('0');
  });
});
```

#### Patrón de flujo completo (end-to-end del servicio)

Para operaciones que dependen de secuencia, se usa `constructNumber` tal como lo haría el usuario — en lugar de setear signals directamente — para probar el flujo completo:

```typescript
it('should calculate result correctly for addition', () => {
  // Arrange
  service.constructNumber('1');
  service.constructNumber('+');
  service.constructNumber('2');

  // Act
  service.constructNumber('=');

  // Assert
  expect(service.resultText()).toBe('3');
});
```

#### Patrón de edge cases / validaciones

Los tests de validación verifican que el servicio **no cambia** cuando recibe inputs límite:

```typescript
// Máximo de caracteres — resultText no crece más allá de 10
it('should handle max length', () => {
  service.resultText.set('1234567890'); // Arrange: display lleno
  service.constructNumber('1');         // Act: agregar uno más
  expect(service.resultText()).toBe('1234567890'); // Assert: sin cambio
});

// Input inválido — cualquier carácter fuera de las listas es ignorado
it('should handle invalid input', () => {
  service.constructNumber('a');         // Act
  expect(service.resultText()).toBe('0'); // Assert: sin cambio
});
```

#### Patrón spy + mockImplementation — verificar efectos secundarios

Algunos comportamientos del servicio producen efectos secundarios (como `console.log`) que no modifican el estado pero sí deben verificarse. Para eso se usa `vi.spyOn()` combinado con `mockImplementation`:

```typescript
it('should handle max length', () => {
  // Arrange: espiar console.log y silenciarlo durante el test.
  // vi.spyOn() intercepta las llamadas al método sin modificar su firma.
  const spyLog = vi.spyOn(console, 'log');

  // mockImplementation reemplaza la implementación real con una función
  // vacía (no-op). Esto evita ruido en la terminal del runner.
  // El spy sigue registrando todas las llamadas internamente.
  spyLog.mockImplementation(() => {});

  // Arrange: presionamos '1' veinte veces; solo 10 deben registrarse.
  for (let i = 0; i < 20; i++) {
    service.constructNumber('1');
  }

  // Assert 1: el display se detuvo en 10 caracteres.
  expect(service.resultText()).toBe('1111111111');
  // Assert 2: el servicio notificó el límite por consola.
  expect(spyLog).toHaveBeenCalledWith('Max length reached');
  // Assert 3: se notificó exactamente 10 veces (los 10 intentos extra).
  expect(spyLog).toHaveBeenCalledTimes(10);
});
```

Diagrama del flujo del spy:

```
                     ┌─────────────────────────────────────┐
console.log real  →  │ imprime en terminal + spy registra  │
                     └─────────────────────────────────────┘

                     ┌─────────────────────────────────────┐
console.log mock  →  │ no hace nada       + spy registra  │  ← lo que queremos
                     └─────────────────────────────────────┘
                                              ↓
                              toHaveBeenCalledWith(...)  ✔
                              toHaveBeenCalledTimes(...)  ✔
```

El `vi.resetAllMocks()` en `beforeEach` limpia el spy automáticamente antes de cada test, por lo que no es necesario restaurarlo manualmente.

#### Comportamiento de `parseFloat('-0')` en JavaScript

Un edge case notable: `-0` en JavaScript al ser convertido con `parseFloat` y operado aritméticamente da `0`:

```typescript
it('should handle negative zero input correctly', () => {
  service.constructNumber('0');
  service.constructNumber('+/-'); // resultText = '-0'
  service.constructNumber('=');   // parseFloat('-0') === 0 → 0 + 0 = 0
  expect(service.resultText()).toBe('0');
});
```

```
parseFloat('-0') → 0  (no -0)
String(-0)       → "0"
-0 === 0         → true en JS
```

#### Resumen de patrones del servicio

```
┌───────────────────────────────────┬──────────────────────────────────────────┐
│ Patrón                            │ Cuándo usarlo                            │
├───────────────────────────────────┼──────────────────────────────────────────┤
│ AAA con signal.set() en Arrange   │ Cuando el estado inicial es complejo     │
│ AAA con constructNumber en Arrange│ Cuando importa el flujo de entrada       │
│ forEach sobre casos similares     │ Mismo comportamiento con múltiples inputs│
│ Act + Assert combinados           │ Estado que evoluciona paso a paso        │
│ Assert sin cambio (edge case)     │ Validaciones que bloquean inputs         │
│ spy + mockImplementation (no-op)  │ Verificar efectos secundarios sin ruido  │
└───────────────────────────────────┴──────────────────────────────────────────┘
```

### Tests de componente con `host` (`calculator-button.component.spec.ts`)

`CalculatorButtonComponent` aplica sus clases CSS directamente al elemento raíz usando la propiedad `host` del decorador — no al `<button>` interno del template. Esto cambia dónde se buscan las clases en el test.

#### `fixture.nativeElement` apunta al host, no al template

```
fixture.nativeElement
        │
        └── <calculator-button class="border-r border-b w-1/4">  ← HOST (clases de `host: {}`)
                  └── <button class="is-command is-pressed">      ← TEMPLATE interno
                          └── <ng-content />
```

Para verificar clases declaradas en `host: { ... }`, se lee `fixture.nativeElement` directamente. Para verificar clases del template interno, se usaría `fixture.nativeElement.querySelector('button')`.

#### `let` vs `const` — ciclos de vida distintos

```typescript
describe('CalculatorButtonComponent', () => {
  // let: scope del describe → asignados en beforeEach, accesibles en todos los it()
  let fixture: ComponentFixture<CalculatorButtonComponent>;
  let component: CalculatorButtonComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(...); // se (re)asigna antes de cada test
  });

  it('test 1', () => {
    const hostElement = fixture.nativeElement; // const: scope local del it()
    // hostElement solo existe dentro de este bloque
  });

  it('test 2', () => {
    const hostElement = fixture.nativeElement; // nueva const, independiente
  });
});
```

`fixture` se comparte porque `beforeEach` y los `it()` necesitan coordinarse. Las `const` locales son efímeras — se crean y destruyen con cada test.

#### `fixture.componentRef.setInput()` — cambiar inputs en tiempo de test

Para testear que el componente responde a distintos valores de un input signal, se usa `setInput`:

```typescript
it('should apply w-2/4 when isDoubleSize is true', () => {
  // Act: setInput ANTES de leer el DOM — detectChanges re-evalúa el host con el nuevo valor.
  fixture.componentRef.setInput('isDoubleSize', true);
  fixture.detectChanges(); // re-evalúa host: { '[class.w-2/4]': 'isDoubleSize()' }

  // Assert: el host ahora tiene 'w-2/4' en lugar de 'w-1/4'
  const hostElement = fixture.nativeElement as HTMLElement;
  expect(hostElement.classList.value).toContain('w-2/4');
});
```

El orden importa: si `const hostElement` se pusiera antes de `setInput`, capturaría el DOM con el estado anterior y el test fallaría aunque la lógica sea correcta.

```
Orden CORRECTO:
  1. setInput('isDoubleSize', true)  ← modifica el signal
  2. detectChanges()                 ← Angular re-evalúa el host
  3. const hostElement = ...         ← captura el DOM actualizado
  4. expect(...)                     ← verifica ✔

Orden INCORRECTO:
  1. const hostElement = ...         ← captura DOM con isDoubleSize=false
  2. setInput('isDoubleSize', true)
  3. detectChanges()
  4. expect(hostElement.classList...) ← sigue viendo el DOM viejo ✘
```

#### Test de template binding — clase en el componente interno

No todas las clases están en el `host`. Algunas se aplican dentro del template (en el `<button>` interno). Para verificarlas se usa `querySelector('button')`, no `fixture.nativeElement`:

```
fixture.nativeElement                    → <calculator-button class="border-r w-1/4">  ← HOST
  └── querySelector('button')           → <button class="is-command is-pressed">       ← TEMPLATE
```

```typescript
it('should apply is-command class when isCommand is true', () => {
  // Diferencia clave: is-command está en el <button> del template (no en el host).
  fixture.componentRef.setInput('isCommand', true);
  fixture.detectChanges();

  // Se busca en el elemento interno, no en fixture.nativeElement.
  const buttonElement = (fixture.nativeElement as HTMLElement).querySelector('button');
  expect(buttonElement?.classList.contains('is-command')).toBe(true);
});
```

Regla práctica: si la clase viene de `host: { '[class.X]': ... }` → buscar en `fixture.nativeElement`. Si viene de un binding en el template (`[class.X]="..."`) → buscar con `querySelector`.

#### Test de output — espiar la emisión de eventos

Para verificar que un componente emite el valor correcto por su `output()` signal, se espía el método `emit` directamente con `vi.spyOn`:

```typescript
it('should emit onClick when handleClick is called', () => {
  // Arrange: interceptamos el output sin necesitar un componente padre.
  const spy = vi.spyOn(component.onClick, 'emit');

  // Arrange: en tests de componente aislado no hay ng-content real,
  // así que asignamos textContent directamente. Los espacios verifican el trim().
  const buttonElement = (fixture.nativeElement as HTMLElement).querySelector('button');
  buttonElement!.textContent = ' 7 ';

  // Act: click nativo — dispara el evento (click) del template → handleClick()
  buttonElement?.click();

  // Assert: emit fue llamado con '7' (con trim aplicado, no ' 7 ').
  expect(spy).toHaveBeenCalledWith('7');
});
```

El flujo interno que este test verifica:

```
buttonElement.click()
  → (click)="handleClick()"              [template binding]
  → handleClick()
  → textContent?.trim()                  ['7']
  → this.onClick.emit('7')               [output()]
  → spy.toHaveBeenCalledWith('7') ✔
```

**Por qué `vi.spyOn` en lugar de `subscribe`:** `output()` en Angular 17+ no es un `Observable` — es un `OutputRef`. No tiene `.subscribe()` en el sentido de RxJS. Espiar `emit` directamente es la forma más directa de verificar que el output fue activado con el valor correcto.

#### Suite completa

```typescript
describe('CalculatorButtonComponent', () => {
  let component: CalculatorButtonComponent;
  let fixture: ComponentFixture<CalculatorButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalculatorButtonComponent] });
    fixture = TestBed.createComponent(CalculatorButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test de host binding
  it('should apply w-1/4 when isDoubleSize is false (default)', () => {
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.classList.value).toContain('w-1/4');
  });

  // Test de host binding con setInput
  it('should apply w-2/4 when isDoubleSize is true', () => {
    fixture.componentRef.setInput('isDoubleSize', true);
    fixture.detectChanges();
    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.classList.value).toContain('w-2/4');
  });

  // Test de template binding (clase en <button> interno, no en host)
  it('should apply is-command class when isCommand is true', () => {
    fixture.componentRef.setInput('isCommand', true);
    fixture.detectChanges();
    const buttonElement = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(buttonElement?.classList.contains('is-command')).toBe(true);
  });

  // Test de output: verifica la emisión con el valor correcto
  it('should emit onClick when handleClick is called', () => {
    const spy = vi.spyOn(component.onClick, 'emit');
    const buttonElement = (fixture.nativeElement as HTMLElement).querySelector('button');
    buttonElement!.textContent = ' 7 '; // espacios para verificar trim()
    buttonElement?.click();
    expect(spy).toHaveBeenCalledWith('7');
  });
});
```

#### Test de signal asíncrono — `viewChild` + `setTimeout`

Algunos métodos modifican un signal y luego lo revierten después de un delay con `setTimeout`. Para testear el estado final se necesita un test `async` que espere ese tiempo:

```typescript
it('should set isPressed to true and then false...', async () => {
  // contentValue() es el viewChild signal → da acceso directo al <button> nativo
  component.contentValue()!.nativeElement.textContent = '7';
  component.keyboardPressedStyle('7');

  expect(component.isPressed()).toBe(true); // inmediatamente después: true

  // keyboardPressedStyle usa setTimeout(100ms) internamente → esperamos 101ms
  await new Promise(resolve => setTimeout(resolve, 101));

  expect(component.isPressed()).toBe(false); // tras el timeout: reseteado a false
});
```

**`component.contentValue()`** — acceso directo al `viewChild` signal del componente. Es una alternativa a `querySelector` cuando necesitamos el `ElementRef` tipado que el componente ya expone internamente, no solo el elemento HTML.

**Patrón `async/await` vs `done`:** en Vitest, un test asíncrono debe usar **uno de los dos**, nunca ambos:

```typescript
// ✔ async/await — el runner espera a que el Promise se resuelva
it('...', async () => {
  await new Promise(resolve => setTimeout(resolve, 101));
  expect(...);
});

// ✔ done — el runner espera a que se llame done()
it('...', (done) => {
  setTimeout(() => {
    expect(...);
    done(); // ← obligatorio llamarlo
  }, 101);
});

// ✘ mezclar ambos — done nunca se llama → el test puede agotar el timeout
it('...', async (done) => { ... });
```

#### Test negativo — verificar que algo NO ocurre

Los tests negativos verifican que el sistema respeta sus guardas. Son tan importantes como los tests positivos:

```typescript
it('should NOT set isPressed if key does not match', () => {
  // el botón muestra '7' pero se presiona '8' → isPressed no debe activarse
  component.contentValue()!.nativeElement.textContent = '7';
  component.keyboardPressedStyle('8');

  expect(component.isPressed()).toBe(false);
});
```

#### Test de `ng-content` — proyección con `TestHostComponent`

`<ng-content />` no puede testearse en un fixture aislado porque requiere un componente padre que proyecte el contenido. La solución es un `TestHostComponent` que envuelve al componente bajo prueba:

```typescript
@Component({
  imports: [CalculatorButtonComponent],
  template: `
    <calculator-button>
      <span class="projected-content">7</span>
    </calculator-button>
  `,
})
class TestHostComponent {}

it('should display projected content', () => {
  // Se crea el fixture del HOST, no del componente bajo prueba
  const fixtureHost = TestBed.createComponent(TestHostComponent);
  fixtureHost.detectChanges();

  const hostElement = fixtureHost.nativeElement as HTMLElement;
  expect(hostElement.querySelector('.projected-content')?.textContent).toBe('7');
});
```

```
Sin TestHostComponent:
  fixture = createComponent(CalculatorButtonComponent)
  → <calculator-button></calculator-button>   ← sin contenido proyectado

Con TestHostComponent:
  fixture = createComponent(TestHostComponent)
  → <calculator-button>
       <span class="projected-content">7</span>   ← contenido proyectado ✔
     </calculator-button>
```

#### Resumen de tipos de test en componentes

```
┌─────────────────────────┬─────────────────────────────────────┬────────────────────────────────────┐
│ Tipo                    │ Qué verifica                        │ Cómo                               │
├─────────────────────────┼─────────────────────────────────────┼────────────────────────────────────┤
│ Creación                │ El componente instancia sin error   │ expect(component).toBeTruthy()     │
│ Host binding            │ Clase en el elemento raíz           │ fixture.nativeElement.classList    │
│ Template binding        │ Clase en elemento del template      │ querySelector('sel').classList     │
│ Output / emit           │ El output emite con valor correcto  │ vi.spyOn(component.out, 'emit')    │
│ Input + detectChanges   │ El componente reacciona al input    │ setInput() + detectChanges()       │
│ Signal asíncrono        │ Estado que cambia tras un delay     │ async + await new Promise(...)     │
│ Test negativo           │ Que algo NO ocurre                  │ expect(signal()).toBe(valorInicial) │
│ ng-content / proyección │ Contenido proyectado desde el padre │ TestHostComponent + createComponent│
└─────────────────────────┴─────────────────────────────────────┴────────────────────────────────────┘
```

---

### Tests de componente con dependencias (`calculator-view.component.spec.ts`)

Cuando un componente tiene hijos con lógica compleja o dependencias externas, se usa el patrón **mock + overrideComponent** para aislarlo y testar solo su comportamiento propio.

#### Patrón mock de componente hijo

Se define un componente mínimo con el **mismo selector** que el hijo real. Angular lo renderizará en su lugar durante el test:

```typescript
// MockCalculatorComponent reemplaza al CalculatorComponent real durante el test.
// Propósito: aislar CalculatorViewComponent de la lógica y dependencias de su hijo.
// Mismo selector ('calculator') → Angular lo renderiza en lugar del componente real.
@Component({
  selector: 'calculator',
  template: '<div>Mock Calculator</div>',
})
class MockCalculatorComponent {}
```

**Convención de nombre:** `Mock` + nombre del componente que se reemplaza (`MockCalculatorComponent`, no `MockCalculatorViewComponent`). El nombre del mock describe qué simula, no en qué test se usa.

#### `overrideComponent` — reemplazar dependencias en tiempo de test

Angular compila los templates de componentes standalone con sus `imports[]` declarados. Para sustituir uno de esos imports en el test se usa `overrideComponent`:

```typescript
TestBed.configureTestingModule({
  imports: [CalculatorViewComponent],    // registra el componente bajo prueba
}).overrideComponent(CalculatorViewComponent, {
  set: {
    imports: [MockCalculatorComponent],  // reemplaza CalculatorComponent por el mock
  }
});
```

```
Sin overrideComponent:
  CalculatorViewComponent
    └── CalculatorComponent (real → carga CalculatorService, signals, teclado...)

Con overrideComponent:
  CalculatorViewComponent
    └── MockCalculatorComponent (mock → solo renderiza <div>Mock Calculator</div>)
```

Esto hace que el test de `CalculatorViewComponent` solo verifique su propia estructura (el `<div>` wrapper y sus clases), sin depender del estado ni de los errores del componente hijo.

#### `fixture.detectChanges()` — primer ciclo de rendering

A diferencia del test de servicios, los tests de componentes **sí necesitan** `detectChanges()`:

```typescript
fixture = TestBed.createComponent(CalculatorViewComponent);
component = fixture.componentInstance;
// Dispara el primer ciclo de detección de cambios: ejecuta ngOnInit y
// sincroniza el template con el estado inicial del componente.
fixture.detectChanges();
```

Sin `detectChanges()`, el DOM del componente no tiene contenido — el template no se ha evaluado todavía.

#### Suite completa

```typescript
describe('CalculatorViewComponent', () => {
  let component: CalculatorViewComponent;
  let fixture: ComponentFixture<CalculatorViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalculatorViewComponent],
    }).overrideComponent(CalculatorViewComponent, {
      set: { imports: [MockCalculatorComponent] }
    });
    fixture = TestBed.createComponent(CalculatorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 1. Creación — el componente instancia sin errores.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // 2. Presencia del hijo en el DOM — el selector 'calculator' existe.
  it('should render calculator component', () => {
    const calculatorComponent = fixture.nativeElement.querySelector('calculator');
    expect(calculatorComponent).toBeTruthy();
  });

  // 3. Clases CSS robustas — classList.contains() resiste cambios de orden.
  it('should contain specific css classes', () => {
    const mustHaveClasses = 'w-full mx-auto rounded-xl bg-gray-100 shadow-xl text-gray-800 relative overflow-hidden'.split(' ');
    const div = (fixture.nativeElement as HTMLElement).querySelector('div');
    mustHaveClasses.forEach(cls => {
      expect(div?.classList.contains(cls)).toBe(true);
    });
  });
});
```

#### Resumen: componente simple vs componente con hijos

```
┌──────────────────────────────┬──────────────────────────────────────────────┐
│ Sin hijos complejos          │ Con hijos complejos                          │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ imports: [MiComponente]      │ imports: [MiComponente]                      │
│ (sin overrideComponent)      │ + overrideComponent(..., { set: { imports }})│
│                              │                                              │
│ Todos los hijos se renderizan│ Los hijos se reemplazan por mocks            │
│ con su lógica real           │ con templates mínimos                        │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

---

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

## Code Coverage

### ¿Qué es el code coverage?

El **code coverage** (cobertura de código) es una métrica que indica qué porcentaje del código fuente fue ejecutado durante los tests. Se mide en distintas dimensiones:

```
┌──────────────────────┬──────────────────────────────────────────────────────┐
│ Métrica              │ Qué mide                                             │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Statements           │ Sentencias individuales ejecutadas                   │
│ Branches             │ Ramas de if/else/switch cubiertas                    │
│ Functions            │ Funciones/métodos invocados                          │
│ Lines                │ Líneas de código alcanzadas                          │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

### Cómo generar el reporte

El proyecto usa `@vitest/coverage-v8`. El comando es:

```bash
ng test --coverage
```

El reporte HTML se genera en `coverage/zoneless-calculator/index.html`. Se puede abrir en cualquier navegador y muestra archivo por archivo qué líneas están cubiertas (verde) y cuáles no (rojo/amarillo).

### Coverage alto ≠ buenas pruebas

Este es el error más común al interpretar la métrica. Un 100% de cobertura solo garantiza que el código fue **ejecutado** — no que el comportamiento fue **verificado**.

```typescript
// Este test da 100% de coverage en la función...
it('cubre la línea', () => {
  service.constructNumber('5');
  // ...pero no tiene ningún expect — no verifica nada
});
```

La cobertura responde **¿qué código se ejecutó?**, no **¿se comporta correctamente?**

```
Coverage alto con malos tests:
  ✔ 100% lines covered
  ✘ No verifica el resultado de la suma
  ✘ No verifica el manejo de división por cero
  ✘ No verifica que el límite de caracteres funciona

Coverage 70% con buenos tests:
  ✔ Verifica todos los flujos críticos
  ✔ Verifica edge cases con expects precisos
  ✔ Detecta regresiones reales
```

### La ruta crítica — qué sí importa cubrir

La **ruta crítica** es el conjunto de funcionalidades cuyo fallo tiene mayor impacto en el usuario o en el negocio. Cubrir la ruta crítica con tests sólidos es más valioso que perseguir un porcentaje alto en código auxiliar.

En este proyecto la ruta crítica es:

```
CalculatorService.constructNumber()
  │
  ├── Entrada de números          → resultText se actualiza correctamente
  ├── Selección de operador       → lastOperator y subResultText se actualizan
  ├── Cálculo con '='             → resultado aritmético correcto
  ├── Borrado con 'C'             → reset completo del estado
  ├── Backspace                   → elimina último carácter sin romper signo
  ├── Punto decimal               → solo un punto por número
  ├── Cambio de signo '+/-'       → invierte el signo correctamente
  └── Validaciones                → max length e input inválido son ignorados
```

El código periférico (estilos, templates de views sin lógica, mocks) tiene menos prioridad. Un archivo como `calculator-view.component.ts` tiene 0 lógica propia — su test verifica estructura, no comportamiento.

### Criterio práctico

```
┌──────────────────────────────────────────────────────────────────────┐
│  Pregunta guía al escribir un test:                                  │
│                                                                      │
│  "Si este código falla en producción, ¿el test lo detectaría?"       │
│                                                                      │
│  Si la respuesta es NO → el test no aporta valor real,               │
│  aunque sume al porcentaje de coverage.                              │
└──────────────────────────────────────────────────────────────────────┘
```

Recomendaciones:

- Apuntar a **80–90%** en la ruta crítica con expectations precisos.
- Ignorar líneas de cobertura en código generado, interfaces y re-exports.
- Preferir tests que **fallarían** si se rompe la lógica real.
- Un test sin `expect()` (o con `expect(true).toBe(true)`) no es un test — es ruido.

---

*Guía generada con el código real del proyecto `01-zoneless-calculator`. Angular 22.0.0.*
