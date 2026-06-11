# Zoneless Calculator

Proyecto generado con [Angular CLI](https://github.com/angular/angular-cli) versión 22.0.0.

Calculadora funcional que sirve como demostración práctica de las APIs modernas de Angular 22: Signals, modo Zoneless, componentes standalone y el nuevo decorador `@Service()`.

> Para la teoría completa de cada concepto con analogías, diagramas y ejemplos del código, ver la **[Guía de Estudio](./angular-study-guide-es.md)**.

---

## Stack

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Angular | 22.0.0 | Framework principal |
| TypeScript | ~6.0.2 | Lenguaje |
| Tailwind CSS | ^4.1.12 | Estilos utilitarios |
| Vitest | ^4.0.8 | Tests unitarios |

---

## Conceptos aplicados

- **Zoneless** con `provideZonelessChangeDetection()`
- **Signals** para manejo de estado (`signal`, `computed`)
- **`@Service()`** — singleton global sin `@Injectable`
- **`inject()`** — inyección de dependencias sin constructor
- **`input()` / `output()`** — reemplazo de `@Input` / `@Output`
- **`viewChild()` / `viewChildren()`** — señales de referencias del DOM
- **`host`** en el decorador — reemplazo de `@HostBinding` / `@HostListener`
- **Control flow nativo** — `@if`, `@for`, `@switch`
- **Proyección de contenido** — `<ng-content />`
- **Path aliases** — `@/` mapeado a `src/app/`

---

## Estructura del proyecto

```
src/app/
├── app.config.ts                          ← provideZonelessChangeDetection
├── app.routes.ts
├── calculator/
│   ├── components/
│   │   ├── calculator/                    ← componente principal
│   │   │   ├── calculator.ts
│   │   │   └── calculator.html
│   │   └── calculator-button/            ← botón reutilizable
│   │       ├── calculator-button.ts
│   │       ├── calculator-button.html
│   │       └── calculator-button.scss
│   ├── services/
│   │   └── calculator-service.ts         ← lógica y estado (Signals)
│   └── views/
│       └── calculator-view/
```

---

## Comandos

```bash
# Desarrollo
npm start          # ng serve → http://localhost:4200

# Build
npm run build      # ng build → dist/

# Tests
npm test           # vitest
```

---

## Recursos

- [Guía de Estudio del proyecto](./angular-study-guide-es.md)
- [Angular CLI — Referencia de comandos](https://angular.dev/tools/cli)
- [Angular Signals](https://angular.dev/guide/signals)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
