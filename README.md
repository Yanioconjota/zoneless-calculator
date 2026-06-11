# ZonelessCalculator

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.0.

## Key Concepts

### Zone.js vs Zoneless

#### What is Zone.js?

Zone.js is a library that **patches every async operation in the browser** (setTimeout, Promise, XHR, event listeners, etc.) so Angular knows when something might have changed and triggers a check of the entire component tree.

```
┌─────────────────────────────────────────────────┐
│                  ZONE.JS MODEL                  │
│                                                 │
│  User clicks button                             │
│       │                                         │
│       ▼                                         │
│  Zone.js intercepts the event                   │
│       │                                         │
│       ▼                                         │
│  Angular: "something happened, check everything"│
│       │                                         │
│       ▼                                         │
│  ┌────────────────────────────┐                 │
│  │   Change Detection (CD)    │                 │
│  │   Root                     │                 │
│  │   ├── ComponentA  ← check  │                 │
│  │   │   ├── ComponentB ← check│                │
│  │   │   └── ComponentC ← check│                │
│  │   ├── ComponentD  ← check  │                 │
│  │   └── ComponentE  ← check  │                 │
│  └────────────────────────────┘                 │
│   Even if only ComponentB actually changed!     │
└─────────────────────────────────────────────────┘
```

This works, but it has costs:
- **Performance:** the entire tree is checked after every async event, even unrelated ones.
- **Bundle size:** Zone.js adds ~100 KB to the app bundle.
- **Debugging:** the patching of native APIs makes stack traces harder to read.
- **Compatibility:** some third-party libraries fight with Zone.js patches.

#### What is Zoneless?

A Zoneless Angular app **removes Zone.js entirely**. Components only update when a **Signal** explicitly notifies Angular that a value changed — no global patching, no tree-wide checks.

```
┌─────────────────────────────────────────────────┐
│                 ZONELESS MODEL                  │
│                                                 │
│  signal.set(newValue)                           │
│       │                                         │
│       ▼                                         │
│  Angular: "signal changed, notify consumers"   │
│       │                                         │
│       ▼                                         │
│  ┌────────────────────────────┐                 │
│  │   Targeted re-render       │                 │
│  │   Root                     │                 │
│  │   ├── ComponentA  ← skip   │                 │
│  │   │   ├── ComponentB ← ✔  │                 │
│  │   │   └── ComponentC ← skip│                │
│  │   ├── ComponentD  ← skip   │                 │
│  │   └── ComponentE  ← skip   │                 │
│  └────────────────────────────┘                 │
│   Only ComponentB subscribed to that signal!    │
└─────────────────────────────────────────────────┘
```

#### Side-by-side comparison

```
┌──────────────────────┬────────────────────────────────────┐
│      Zone.js         │           Zoneless (Signals)        │
├──────────────────────┼────────────────────────────────────┤
│ Patches async APIs   │ No patching — native APIs untouched │
│ Checks entire tree   │ Updates only affected components    │
│ ~100 KB extra bundle │ Zero overhead from Zone             │
│ Implicit (magic)     │ Explicit (you control updates)      │
│ Easier to migrate    │ Requires Signals adoption           │
│ Angular 2–18 default │ Default in Angular 18+ (opt-in)     │
└──────────────────────┴────────────────────────────────────┘
```

#### How Angular knows what to update (Signals)

```
  const count = signal(0);          // declare reactive value
        │
        │   count.set(1)            // write
        │       │
        │       ▼
        │   Angular graph tracks
        │   which templates read count()
        │       │
        │       ▼
        └── Only those templates re-render
```

#### Analogy

Imagine a **smart home** with motion sensors:

- **Zone.js (old approach):** Every time *any* door in the house opens, every single light in every room flickers briefly to check if it should be on. Works, but noisy and wasteful.

- **Zoneless (Signals):** Each light is connected only to the sensor in its own room. When the bedroom sensor triggers, only the bedroom light reacts. The rest of the house does nothing.

#### Enabling Zoneless in Angular 18+

```typescript
// app.config.ts
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
  ],
};
```

And remove `zone.js` from `polyfills` in `angular.json`:

```json
"polyfills": []
```

> In this project, zoneless is enabled from the start. All state is managed through Signals, and no Zone.js dependency is included in the bundle.

### Content Projection

**Technical definition:** Content projection (also known as transclusion) is a pattern where a parent component can insert custom content into designated slots (`<ng-content>`) inside a child component's template. This allows creating flexible, reusable wrapper components.

**Analogy for non-devs:** Think of content projection like a picture frame:

- The **frame** (child component) defines the structure, border, and style
- The **photo** (projected content) is whatever you choose to put inside
- The frame doesn't care if you insert a family photo, a painting, or a concert ticket — it just provides the container

Another analogy: A shipping box. The box manufacturer creates the box with a specific shape and material, but they don't decide what goes inside. You (the parent) choose what to pack. The box (child component) just provides the container with `<ng-content>` being the "open space" where your items go.

```html
<!-- Parent template -->
<app-card>
  <h2>My Custom Title</h2>
  <p>Any content I want here!</p>
</app-card>

<!-- Card component template -->
<div class="card-wrapper">
  <ng-content></ng-content>  <!-- The "open space" for your content -->
</div>
```

### Path Aliases

**Technical definition:** Path aliases are shortcuts defined in `tsconfig.json` that map a custom prefix to a specific directory. This allows importing modules using clean, absolute-style paths instead of long relative paths.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/app/*"]
    }
  }
}
```

**The problem it solves:**

Without aliases, imports in deeply nested files become hard to read and maintain:

```typescript
// Without aliases - fragile and ugly
import { CalculatorService } from '../../../shared/services/calculator.service';
import { ButtonComponent } from '../../../../components/button/button.component';
```

With aliases, every import is clean and consistent regardless of file location:

```typescript
// With aliases - clean and stable
import { CalculatorService } from '@/shared/services/calculator.service';
import { ButtonComponent } from '@/components/button/button.component';
```

**Analogy for non-devs:** Imagine giving directions to your house:

- **Without aliases (relative paths):** "From wherever you are, go back 3 blocks, turn left, go forward 2 blocks, turn right, then it's the 4th house." The directions change depending on where the person starts.

- **With aliases (absolute paths):** "My address is 123 Main Street." No matter where you are in the city, this address always points to the same place.

**Benefits:**

1. **Readability:** Imports are shorter and self-documenting
2. **Refactoring safety:** Moving a file doesn't break its imports (only files that import it need updating)
3. **Consistency:** All developers use the same import style
4. **IDE support:** Autocompletion works better with predictable paths

### Host Bindings (`host` vs `@HostBinding`)

Angular provides two ways to bind classes, attributes, or events to the **host element** (the custom HTML tag that represents the component, e.g. `<calculator-button>`).

#### Legacy approach: `@HostBinding` decorator

```typescript
import { Component, HostBinding } from '@angular/core';

@Component({ selector: 'calculator-button', ... })
export class CalculatorButton {
  @HostBinding('class.is-command') get commandStyle() {
    return this.isCommand();
  }
}
```

`@HostBinding` maps a class getter to a host property. It works, but it is a **legacy API** discouraged in Angular 17+ for standalone components.

#### Modern approach: `host` in the `@Component` decorator

The preferred Angular 17+ approach declares all host bindings directly in the decorator:

```typescript
@Component({
  selector: 'calculator-button',
  host: {
    class: 'border-r border-b border-indigo-400',   // static classes
    '[class.is-command]': 'isCommand()',              // dynamic class binding
    '[class.w-2/4]': 'isDoubleSize()',               // dynamic class binding
  },
})
export class CalculatorButton { ... }
```

The `host` object accepts:
- **String values** for static attributes/classes: `class: 'foo bar'`
- **Bracket syntax** for dynamic bindings evaluated as expressions: `'[class.name]': 'signal()'`
- **Parenthesis syntax** for event listeners: `'(click)': 'handler($event)'`

#### How it is used in this project (`CalculatorButton`)

The component uses a **mixed approach** during a transition phase:

```typescript
host: {
  class: 'w-1/4 border-r border-b border-indigo-400',  // static, always applied
},

// legacy @HostBinding still present (commented out for is-command):
// @HostBinding('class.is-command') get commandStyle() { return this.isCommand(); }

// active @HostBinding for double size:
@HostBinding('class.w-2/4') get doubleSizeStyle() {
  return this.isDoubleSize();
}
```

> **Known limitation:** `w-1/4` (static) and `w-2/4` (dynamic via `@HostBinding`) coexist on the host when `isDoubleSize` is true. Tailwind resolves this by whichever class appears last in the generated stylesheet, which can be unpredictable. The recommended fix is to make the width fully dynamic using a `computed()` signal and a single `[class]` binding.

#### Recommended final form (signal-based, no legacy decorators)

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

This eliminates the `@HostBinding` import entirely and ensures `w-1/4` and `w-2/4` never coexist.

---

### Workspace Settings (`.vscode/settings.json`)

The `.vscode/settings.json` at the **monorepo root** contains shared editor configuration for all projects in `angular-22-plus`.

#### `angular-schematics.schematicsDefaultOptions`

Configures default options for the [Angular Schematics](https://marketplace.visualstudio.com/items?itemName=cyrilletuzi.angular-schematics) extension when generating Angular artifacts:

```json
"angular-*": {
  "externalTemplate": true,
  "skipStyle": true
}
```

- **`externalTemplate: true`** — generates the HTML template as a separate file instead of inline in the component decorator.
- **`skipStyle: true`** — skips generating an empty style file by default (style files are added manually when needed).

#### `files.associations`

```json
"files.associations": {
  "*.css": "tailwindcss",
  "*.scss": "tailwindcss"
}
```

Maps `.css` and `.scss` files to the **Tailwind CSS language mode** in the editor. This is required because Tailwind v4 introduces directives like `@reference`, `@apply`, and `@theme` that the default CSS/SCSS language service does not recognize, producing false-positive "unknown at-rule" warnings.

By associating these file types with the `tailwindcss` language mode (provided by the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension), the editor:

1. Understands Tailwind-specific directives (`@reference`, `@apply`, `@layer`, etc.).
2. Suppresses false lint errors for valid Tailwind syntax.
3. Enables autocomplete for utility classes inside SCSS component files.

> **Note:** This setting applies to all projects in the monorepo. Each individual project can override it with its own `.vscode/settings.json`.

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
