# ZonelessCalculator

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 22.0.0.

## Conceptos clave

### Zone.js vs Zoneless

#### ¿Qué es Zone.js?

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

Esto funciona, pero tiene costos:
- **Rendimiento:** se verifica todo el árbol tras cada evento asíncrono, incluso los no relacionados.
- **Tamaño del bundle:** Zone.js suma ~100 KB al bundle de la aplicación.
- **Depuración:** el parcheo de las APIs nativas dificulta la lectura de stack traces.
- **Compatibilidad:** algunas librerías de terceros entran en conflicto con los parches de Zone.js.

#### ¿Qué es Zoneless?

Una aplicación Angular Zoneless **elimina Zone.js por completo**. Los componentes solo se actualizan cuando un **Signal** notifica explícitamente a Angular que un valor cambió — sin parcheo global, sin verificación de todo el árbol.

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

#### Comparación lado a lado

```
┌──────────────────────┬────────────────────────────────────┐
│      Zone.js         │         Zoneless (Signals)          │
├──────────────────────┼────────────────────────────────────┤
│ Parchea APIs async   │ Sin parcheo — APIs nativas intactas │
│ Verifica todo el árbol│ Actualiza solo componentes afectados│
│ ~100 KB extra bundle │ Sin overhead de Zone                │
│ Implícito (mágico)   │ Explícito (el dev controla updates) │
│ Más fácil de migrar  │ Requiere adoptar Signals            │
│ Default Angular 2–18 │ Default Angular 18+ (opt-in)        │
└──────────────────────┴────────────────────────────────────┘
```

#### Cómo Angular sabe qué actualizar (Signals)

```
  const count = signal(0);          // declarar valor reactivo
        │
        │   count.set(1)            // escritura
        │       │
        │       ▼
        │   Angular rastrea qué
        │   templates leen count()
        │       │
        │       ▼
        └── Solo esos templates se re-renderizan
```

#### Analogía

Imaginá una **casa inteligente** con sensores de movimiento:

- **Zone.js (enfoque anterior):** Cada vez que *cualquier* puerta de la casa se abre, todas las luces de todos los cuartos parpadean brevemente para verificar si deben encenderse. Funciona, pero es ruidoso e ineficiente.

- **Zoneless (Signals):** Cada luz está conectada únicamente al sensor de su propio cuarto. Cuando el sensor del dormitorio se activa, solo la luz del dormitorio reacciona. El resto de la casa no hace nada.

#### Habilitar Zoneless en Angular 18+

```typescript
// app.config.ts
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
  ],
};
```

Y eliminar `zone.js` de `polyfills` en `angular.json`:

```json
"polyfills": []
```

> En este proyecto, Zoneless está habilitado desde el inicio. Todo el estado se gestiona mediante Signals y no se incluye ninguna dependencia de Zone.js en el bundle.

---

### Proyección de contenido

**Definición técnica:** La proyección de contenido (también conocida como transclusion) es un patrón donde un componente padre puede insertar contenido personalizado en slots designados (`<ng-content>`) dentro del template de un componente hijo. Esto permite crear componentes contenedores flexibles y reutilizables.

**Analogía:** Pensá en la proyección de contenido como un marco de cuadro:

- El **marco** (componente hijo) define la estructura, el borde y el estilo
- La **foto** (contenido proyectado) es lo que elijas poner adentro
- Al marco no le importa si insertás una foto familiar, una pintura o una entrada de concierto — simplemente provee el contenedor

Otra analogía: una caja de envío. El fabricante crea la caja con una forma y material específicos, pero no decide qué va adentro. Vos (el padre) elegís qué empacar. La caja (componente hijo) solo provee el contenedor, y `<ng-content>` es el "espacio abierto" donde van tus elementos.

```html
<!-- Template del padre -->
<app-card>
  <h2>Mi título personalizado</h2>
  <p>Cualquier contenido que quiera aquí</p>
</app-card>

<!-- Template del componente Card -->
<div class="card-wrapper">
  <ng-content></ng-content>  <!-- El "espacio abierto" para el contenido -->
</div>
```

---

### Alias de rutas (Path Aliases)

**Definición técnica:** Los alias de rutas son atajos definidos en `tsconfig.json` que mapean un prefijo personalizado a un directorio específico. Permiten importar módulos usando rutas limpias de estilo absoluto en lugar de rutas relativas largas.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/app/*"]
    }
  }
}
```

**El problema que resuelve:**

Sin alias, los imports en archivos muy anidados se vuelven difíciles de leer y mantener:

```typescript
// Sin alias — frágil y difícil de leer
import { CalculatorService } from '../../../shared/services/calculator.service';
import { ButtonComponent } from '../../../../components/button/button.component';
```

Con alias, todos los imports son limpios y consistentes sin importar la ubicación del archivo:

```typescript
// Con alias — limpio y estable
import { CalculatorService } from '@/shared/services/calculator.service';
import { ButtonComponent } from '@/components/button/button.component';
```

**Analogía:** Imaginá dar indicaciones para llegar a tu casa:

- **Sin alias (rutas relativas):** "Desde donde estés, retrocedé 3 cuadras, doblá a la izquierda, avanzá 2 cuadras, doblá a la derecha y es la 4ta casa." Las indicaciones cambian según el punto de partida.

- **Con alias (rutas absolutas):** "Mi dirección es Av. Principal 123." Sin importar dónde estés en la ciudad, esa dirección siempre apunta al mismo lugar.

**Beneficios:**

1. **Legibilidad:** los imports son más cortos y autodocumentados
2. **Seguridad al refactorizar:** mover un archivo no rompe sus imports (solo los archivos que lo importan necesitan actualizarse)
3. **Consistencia:** todos los desarrolladores usan el mismo estilo de import
4. **Soporte del IDE:** el autocompletado funciona mejor con rutas predecibles

---

### Host Bindings (`host` vs `@HostBinding`)

Angular provee dos formas de vincular clases, atributos o eventos al **elemento host** (el tag HTML personalizado que representa al componente, por ejemplo `<calculator-button>`).

#### Enfoque legacy: decorador `@HostBinding`

```typescript
import { Component, HostBinding } from '@angular/core';

@Component({ selector: 'calculator-button', ... })
export class CalculatorButton {
  @HostBinding('class.is-command') get commandStyle() {
    return this.isCommand();
  }
}
```

`@HostBinding` mapea un getter de clase a una propiedad del host. Funciona, pero es una **API legacy** desaconsejada en Angular 17+ para componentes standalone.

#### Enfoque moderno: `host` en el decorador `@Component`

El enfoque preferido en Angular 17+ declara todos los host bindings directamente en el decorador:

```typescript
@Component({
  selector: 'calculator-button',
  host: {
    class: 'border-r border-b border-indigo-400',   // clases estáticas
    '[class.is-command]': 'isCommand()',              // binding de clase dinámico
    '[class.w-2/4]': 'isDoubleSize()',               // binding de clase dinámico
  },
})
export class CalculatorButton { ... }
```

El objeto `host` acepta:
- **Valores string** para atributos/clases estáticas: `class: 'foo bar'`
- **Sintaxis con corchetes** para bindings dinámicos evaluados como expresiones: `'[class.nombre]': 'signal()'`
- **Sintaxis con paréntesis** para escuchar eventos: `'(click)': 'handler($event)'`

#### Cómo se usa en este proyecto (`CalculatorButton`)

El componente usa un **enfoque mixto** durante una fase de transición:

```typescript
host: {
  class: 'w-1/4 border-r border-b border-indigo-400',  // estático, siempre aplicado
},

// @HostBinding legacy comentado para is-command:
// @HostBinding('class.is-command') get commandStyle() { return this.isCommand(); }

// @HostBinding activo para el doble tamaño:
@HostBinding('class.w-2/4') get doubleSizeStyle() {
  return this.isDoubleSize();
}
```

> **Limitación conocida:** `w-1/4` (estático) y `w-2/4` (dinámico vía `@HostBinding`) coexisten en el host cuando `isDoubleSize` es verdadero. Tailwind resuelve esto según cuál clase aparece última en la hoja de estilos generada, lo que puede ser impredecible. La corrección recomendada es hacer el ancho completamente dinámico usando un signal `computed()` y un único binding `[class]`.

#### Forma final recomendada (basada en signals, sin decoradores legacy)

```typescript
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'calculator-button',
  host: {
    '[class]': 'hostClasses()',
    '[class.is-command]': 'isCommand()',
  },
})
export class CalculatorButton {
  isCommand = input(false, { transform: booleanAttribute });
  isDoubleSize = input(false, { transform: booleanAttribute });

  hostClasses = computed(() =>
    `border-r border-b border-indigo-400 ${this.isDoubleSize() ? 'w-2/4' : 'w-1/4'}`
  );
}
```

Esto elimina el import de `@HostBinding` por completo y garantiza que `w-1/4` y `w-2/4` nunca coexistan.

---

### Servicios globales: `@Service()` vs `@Injectable()`

#### Enfoque anterior (Angular ≤21)

En versiones anteriores de Angular, para que un servicio fuera un **singleton global** (una única instancia compartida en toda la aplicación) era necesario usar `@Injectable` con la opción `providedIn: 'root'` de forma explícita:

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CalculatorService { ... }
```

Sin el `providedIn: 'root'`, el servicio no se registraba en ningún injector y había que declararlo manualmente en el array `providers` de un módulo o componente.

#### Enfoque moderno (Angular 22+)

Angular 22 introduce el decorador `@Service()`, que **es global por defecto**. Ya no hace falta especificar `providedIn: 'root'`:

```typescript
import { Service, signal } from '@angular/core';

@Service()
export class CalculatorService {
  resultText = signal('10');
  subResultText = signal('20');
  lastOperator = signal('+');
}
```

`@Service()` sin parámetros equivale exactamente a `@Injectable({ providedIn: 'root' })`.

#### Comparación

```
┌──────────────────────────────────────┬──────────────────────────┐
│         Angular ≤21                  │       Angular 22+        │
├──────────────────────────────────────┼──────────────────────────┤
│ @Injectable({ providedIn: 'root' })  │ @Service()               │
│ Global, singleton                    │ Global, singleton        │
│ Requiere opción explícita            │ Por defecto              │
└──────────────────────────────────────┴──────────────────────────┘
```

#### ¿Cuándo usar scope diferente?

Si necesitás una instancia por componente en lugar de una global, podés optar por no registrarlo en root y declararlo en el componente:

```typescript
// Servicio sin scope global
@Service({ providedIn: null })
export class CalculatorService { ... }

// Componente que provee su propia instancia
@Component({
  providers: [CalculatorService],
})
export class CalculatorComponent { ... }
```

> En este proyecto, `CalculatorService` usa `@Service()` sin parámetros, por lo que es un singleton accesible desde cualquier componente de la aplicación sin necesidad de declararlo en ningún `providers`.

---

### Configuración del workspace (`.vscode/settings.json`)

El archivo `.vscode/settings.json` en la **raíz del monorepo** contiene configuración compartida del editor para todos los proyectos en `angular-22-plus`.

#### `angular-schematics.schematicsDefaultOptions`

Configura las opciones por defecto para la extensión [Angular Schematics](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics) al generar artefactos Angular:

```json
"angular-*": {
  "externalTemplate": true,
  "skipStyle": true
}
```

- **`externalTemplate: true`** — genera el template HTML como archivo separado en lugar de inline en el decorador del componente.
- **`skipStyle: true`** — omite la generación de un archivo de estilos vacío por defecto (los archivos de estilos se agregan manualmente cuando se necesitan).

#### `files.associations`

```json
"files.associations": {
  "*.css": "tailwindcss",
  "*.scss": "tailwindcss"
}
```

Asocia los archivos `.css` y `.scss` al **modo de lenguaje Tailwind CSS** en el editor. Esto es necesario porque Tailwind v4 introduce directivas como `@reference`, `@apply` y `@theme` que el servicio de lenguaje CSS/SCSS por defecto no reconoce, generando advertencias falsas de "regla at desconocida".

Al asociar estos tipos de archivo al modo `tailwindcss` (provisto por la extensión [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)), el editor:

1. Entiende las directivas específicas de Tailwind (`@reference`, `@apply`, `@layer`, etc.).
2. Suprime errores de lint falsos para sintaxis válida de Tailwind.
3. Habilita el autocompletado de clases utilitarias dentro de archivos SCSS de componentes.

> **Nota:** Esta configuración aplica a todos los proyectos del monorepo. Cada proyecto individual puede sobrescribirla con su propio `.vscode/settings.json`.

---

## Servidor de desarrollo

Para iniciar un servidor de desarrollo local, ejecutá:

```bash
ng serve
```

Una vez que el servidor esté corriendo, abrí el navegador y navegá a `http://localhost:4200/`. La aplicación se recargará automáticamente cada vez que modifiques algún archivo fuente.

## Generación de código

Angular CLI incluye herramientas de scaffolding. Para generar un nuevo componente, ejecutá:

```bash
ng generate component nombre-del-componente
```

Para ver la lista completa de schematics disponibles (como `components`, `directives` o `pipes`), ejecutá:

```bash
ng generate --help
```

## Build

Para compilar el proyecto, ejecutá:

```bash
ng build
```

Esto compilará el proyecto y almacenará los artefactos en el directorio `dist/`. Por defecto, el build de producción optimiza la aplicación para rendimiento y velocidad.

## Ejecución de tests unitarios

Para ejecutar los tests unitarios con [Vitest](https://vitest.dev/), usá el siguiente comando:

```bash
ng test
```

## Ejecución de tests end-to-end

Para los tests end-to-end (e2e), ejecutá:

```bash
ng e2e
```

Angular CLI no incluye un framework de testing e2e por defecto. Podés elegir el que mejor se adapte a tus necesidades.

## Recursos adicionales

Para más información sobre el uso de Angular CLI, incluyendo referencias detalladas de comandos, visitá la página [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
