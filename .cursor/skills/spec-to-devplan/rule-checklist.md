# Rule Checklist by Category

Quick reference for validating specs against project rules.

## Angular Patterns (angular-patterns.mdc)

### Must Have
- [ ] `standalone: true` on all components
- [ ] `inject()` for dependency injection
- [ ] Signal inputs: `input()`, `input.required()`, `model()`
- [ ] Signal outputs: `output()`
- [ ] Control flow: `@if`, `@for`, `@switch`
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] `takeUntilDestroyed()` for subscriptions

### Must NOT Have
- [ ] No `@Input()` decorator
- [ ] No `@Output()` decorator
- [ ] No `*ngIf`, `*ngFor`, `*ngSwitch`
- [ ] No constructor injection for services
- [ ] No NgModules for components

---

## State Management (state-management.mdc)

### Must Have
- [ ] NgRx Signal Store for state
- [ ] `withState()` for state definition
- [ ] `withComputed()` for derived state
- [ ] `withMethods()` for state mutations
- [ ] `patchState()` for immutable updates
- [ ] `rxMethod()` for async operations
- [ ] Typed state interface

### Must NOT Have
- [ ] No Promise-based store methods (use rxMethod)
- [ ] No direct signal mutation
- [ ] No duplicated derived state
- [ ] No BehaviorSubject for component state

### Scope Rules
| State Type | Scope |
|------------|-------|
| Feature data | Route-level provider |
| Auth/session | Root-level (`providedIn: 'root'`) |
| User preferences | Root-level |
| Shared between siblings | Parent route provider |

---

## State Mutation (state-mutation-strategies.mdc)

### Default: Pessimistic Updates
```typescript
// Wait for server confirmation
async create(data) {
  patchState(store, { isLoading: true });
  const result = await api.create(data);
  patchState(store, { items: [...items, result] });
}
```

### Exception: Optimistic Updates
Only when ALL conditions met:
- [ ] Operation is reversible
- [ ] Operation is idempotent
- [ ] No server-generated data needed
- [ ] Low failure rate expected

Must include rollback:
```typescript
const previous = store.items();
patchState(store, { items: filtered });
try { await api.delete(id); }
catch { patchState(store, { items: previous }); }
```

---

## TypeScript (typescript-best-practices.mdc)

### Must Have
- [ ] Strict mode enabled
- [ ] Explicit types for function parameters
- [ ] Type guards for narrowing
- [ ] Discriminated unions for state
- [ ] Proper utility types usage

### Must NOT Have
- [ ] No `any` type
- [ ] No implicit any
- [ ] No non-null assertions without validation
- [ ] No type assertions without guards

---

## Styling (styling-conventions.mdc)

### UI Library Priority
1. **NgZorro** - All standard components
2. **Angular Material** - Only when NgZorro lacks equivalent
3. **Bootstrap** - Layout/spacing utilities ONLY

### Must Have
- [ ] NgZorro for buttons, forms, tables, modals
- [ ] CSS custom properties for theming
- [ ] Component-scoped styles
- [ ] Design tokens from `_tokens.scss`

### Must NOT Have
- [ ] No Bootstrap components (cards, buttons, modals)
- [ ] No hardcoded colors
- [ ] No inline styles
- [ ] No `!important` without justification

---

## Forms (form-validation-ux.mdc)

### Must Have
- [ ] Reactive forms with FormBuilder
- [ ] Validate on blur
- [ ] Show errors only when touched
- [ ] ARIA attributes for accessibility
- [ ] Minimum 3 chars for search triggers
- [ ] Loading states on submit

### Must NOT Have
- [ ] No errors while typing
- [ ] No missing labels
- [ ] No generic error messages

---

## Performance (performance.mdc)

### Must Have
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] Lazy loaded routes
- [ ] `track` in `@for` loops
- [ ] `NgOptimizedImage` for images
- [ ] `debounceTime()` for text inputs
- [ ] `throttleTime()` for scroll/resize

### For Large Lists (100+ items)
- [ ] Virtual scrolling with CDK

### For Heavy Components
- [ ] `@defer` for below-fold content

### Must NOT Have
- [ ] No eager loaded feature routes
- [ ] No untracked loops
- [ ] No scroll handlers in Angular zone

---

## Accessibility (accessibility.mdc)

### Must Have
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Labels for all inputs
- [ ] `aria-label` for icon-only buttons
- [ ] `aria-live` for dynamic content
- [ ] `role="alert"` for errors
- [ ] Keyboard navigation support
- [ ] Visible focus indicators

### Must NOT Have
- [ ] No `<div>` with click handlers (use `<button>`)
- [ ] No missing alt text (or `aria-hidden` for decorative)
- [ ] No `outline: none` without replacement

---

## Error Handling (error-handling.mdc)

### Must Have
- [ ] Loading state tracking
- [ ] Error state tracking
- [ ] Proper error messages
- [ ] Retry mechanisms
- [ ] Rollback for optimistic updates

### Template Pattern
```html
@if (store.isLoading()) {
  <app-skeleton />
} @else if (store.error(); as error) {
  <app-error-state [message]="error" (retry)="reload()" />
} @else {
  <!-- Content -->
}
```

---

## RxJS (rxjs-patterns.mdc)

### Must Have
- [ ] `takeUntilDestroyed()` for cleanup
- [ ] `switchMap` for search/autocomplete
- [ ] `exhaustMap` for form submissions
- [ ] `debounceTime` + `distinctUntilChanged` for inputs
- [ ] `catchError` with proper handling

### Must NOT Have
- [ ] No unsubscribed observables
- [ ] No nested subscribes
- [ ] No public Subjects (use `.asObservable()`)

---

## Routing (routing-patterns.mdc)

### Must Have
- [ ] `loadComponent()` or `loadChildren()` for lazy loading
- [ ] `withComponentInputBinding()` in router config
- [ ] Functional guards (`CanActivateFn`)
- [ ] Functional resolvers (`ResolveFn`)

### Must NOT Have
- [ ] No eager component imports in routes
- [ ] No class-based guards

---

## Testing (testing.mdc)

### Priority Order
1. Store computed values
2. Store async methods
3. Service transformations
4. Container-Store wiring
5. Presentational components

### Must Have
- [ ] Tests for computed values
- [ ] Tests for error handling
- [ ] Proper mocking of dependencies

### Must NOT Have
- [ ] No testing implementation details
- [ ] No testing Angular internals
- [ ] No arbitrary timeouts (use fakeAsync)

---

## Folder Structure (folder-structure.mdc)

### Feature Structure
```
features/
└── [feature-name]/
    ├── components/
    │   ├── [feature]-container/    # Smart
    │   └── [feature]-card/         # Dumb
    ├── store/
    │   └── [feature].store.ts
    ├── services/
    │   └── [feature]-api.service.ts
    ├── models/
    │   └── [feature].models.ts
    └── [feature].routes.ts
```

### Naming Conventions
| Type | Pattern |
|------|---------|
| Component | `{name}.component.ts` |
| Store | `{name}.store.ts` |
| Service | `{name}.service.ts` |
| Model | `{name}.models.ts` |
| Routes | `{feature}.routes.ts` |

---

## Code Quality (code-quality.mdc)

### Must Have
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] No console.log in production
- [ ] Meaningful variable names

### Pre-commit
- [ ] lint-staged configured
- [ ] Husky hooks active

---

## Quick Validation Checklist

Before generating dev plan, verify:

```
Essential Checks:
- [ ] No @Input/@Output decorators → use signals
- [ ] No *ngIf/*ngFor → use @if/@for
- [ ] No any types → use proper interfaces
- [ ] No Material when NgZorro has equivalent
- [ ] No Bootstrap components → only utilities
- [ ] No Promise-based store → use rxMethod
- [ ] No eager routes → use loadComponent
- [ ] OnPush on all components
- [ ] Standalone on all components
- [ ] Track in all @for loops
```
