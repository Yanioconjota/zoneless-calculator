# Conflict Resolution Patterns

Detailed guide for resolving conflicts between user specifications and project rules.

## Conflict Categories

### 1. State Management Conflicts

#### Promise-based Store vs rxMethod

**Spec pattern:** "usar promesas", "async/await en el store", "Promise.all"

**Rule:** Use `rxMethod` with Observables (state-management.mdc)

**Why the rule exists:**
- Better composability with RxJS operators
- Built-in cancellation support
- Consistency with Angular's Observable ecosystem
- Easier error handling with `tapResponse`

**Compliant alternative:**
```typescript
// Instead of Promise-based
async loadItems() {
  const items = await firstValueFrom(this.api.getItems());
  patchState(store, { items });
}

// Use rxMethod
loadItems: rxMethod<void>(
  pipe(
    switchMap(() => api.getItems().pipe(
      tapResponse({
        next: (items) => patchState(store, { items }),
        error: (e) => patchState(store, { error: e.message })
      })
    ))
  )
)
```

**Exception conditions:** None standard. If user insists, document justification.

---

#### localStorage vs Signal Store

**Spec pattern:** "guardar en localStorage", "persistir en navegador", "cache local"

**Rule:** Use Signal Store for state (state-management.mdc)

**Why the rule exists:**
- Reactive updates across components
- Type safety
- DevTools integration
- Computed values support

**Compliant alternative (hybrid):**
```typescript
// Signal Store as source of truth + localStorage for persistence
export const FeatureStore = signalStore(
  withState(loadFromStorage() ?? initialState),
  withMethods((store) => ({
    saveItem(item: Item) {
      patchState(store, { items: [...store.items(), item] });
      saveToStorage(store); // Sync to localStorage
    }
  }))
);
```

**Exception conditions:** Acceptable for session persistence if Signal Store remains runtime source of truth.

---

### 2. UI Library Conflicts

#### Material vs NgZorro

**Spec pattern:** "usar Material", "mat-table", "MatDialog", "Angular Material"

**Rule:** NgZorro as primary DS (styling-conventions.mdc)

**Why the rule exists:**
- Single design language
- Smaller bundle (don't ship two component libraries)
- Consistent theming
- Team familiarity

**Compliant alternatives:**

| Material Component | NgZorro Equivalent |
|--------------------|-------------------|
| mat-table | nz-table |
| mat-dialog | nz-modal |
| mat-button | nz-button |
| mat-form-field | nz-form + nz-input |
| mat-select | nz-select |
| mat-datepicker | nz-date-picker |
| mat-menu | nz-dropdown |
| mat-tabs | nz-tabs |
| mat-stepper | nz-steps |
| mat-checkbox | nz-checkbox |
| mat-radio | nz-radio |
| mat-slider | nz-slider |

**Exception conditions:** Only when NgZorro lacks equivalent AND functionality is critical.

---

#### Bootstrap Components vs NgZorro

**Spec pattern:** "Bootstrap cards", "btn-primary", "Bootstrap modal"

**Rule:** Bootstrap for layout utilities only (styling-conventions.mdc)

**Why the rule exists:**
- Bootstrap components conflict with NgZorro styling
- Accessibility handled differently
- Inconsistent look and feel

**Compliant alternative:**
```html
<!-- Instead of Bootstrap component -->
<div class="card">
  <div class="card-body">Content</div>
</div>

<!-- Use NgZorro + Bootstrap layout -->
<nz-card>
  <div class="d-flex justify-content-between">
    Content
  </div>
</nz-card>
```

**Exception conditions:** None. Always use NgZorro components.

---

### 3. Angular API Conflicts

#### @Input/@Output vs Signal Inputs

**Spec pattern:** "@Input()", "@Output()", "EventEmitter"

**Rule:** Use signal inputs/outputs (angular-patterns.mdc)

**Why the rule exists:**
- Better type inference
- Simpler API
- Required inputs at compile time
- Consistent with signal-based architecture

**Compliant alternative:**
```typescript
// Instead of decorators
@Input() data!: Data;
@Output() selected = new EventEmitter<string>();

// Use signals
data = input.required<Data>();
selected = output<string>();
```

**Exception conditions:** Legacy library integration only.

---

#### *ngIf/*ngFor vs Control Flow

**Spec pattern:** "*ngIf", "*ngFor", "*ngSwitch", "structural directives"

**Rule:** Use @if, @for, @switch (angular-patterns.mdc)

**Why the rule exists:**
- Better performance
- Cleaner syntax
- Built into Angular (no imports needed)
- Better type narrowing

**Compliant alternative:**
```html
<!-- Instead of structural directives -->
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let item of items">{{ item.name }}</div>

<!-- Use control flow -->
@if (isLoading()) {
  <div>Loading...</div>
}
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

**Exception conditions:** None.

---

#### Constructor DI vs inject()

**Spec pattern:** "constructor injection", "private service: Service"

**Rule:** Use inject() function (angular-patterns.mdc)

**Why the rule exists:**
- Works in any injection context
- Cleaner component code
- Easier testing setup
- Consistent pattern

**Compliant alternative:**
```typescript
// Instead of constructor
constructor(private http: HttpClient) {}

// Use inject
private readonly http = inject(HttpClient);
```

**Exception conditions:** Token-based DI with specific options.

---

### 4. Type Safety Conflicts

#### any Type Usage

**Spec pattern:** "any para flexibilidad", "tipo dinámico", "sin tipar"

**Rule:** No any, use proper types (typescript-best-practices.mdc)

**Why the rule exists:**
- Type safety at compile time
- Better IDE support
- Catches bugs early
- Self-documenting code

**Compliant alternatives:**

| Instead of | Use |
|------------|-----|
| `any` | Proper interface |
| `any[]` | `T[]` with generic |
| `(data: any) => any` | Typed function signature |
| Dynamic object | `Record<string, T>` or `unknown` |
| API response | Define response interface |

```typescript
// Instead of any
function process(data: any): any { }

// Use proper types
function process<T extends ProcessableData>(data: T): ProcessResult<T> { }

// For truly unknown data
function handleResponse(data: unknown) {
  if (isValidResponse(data)) {
    // data is now typed
  }
}
```

**Exception conditions:** Third-party API with untyped returns (document reason).

---

### 5. Architecture Conflicts

#### NgModule vs Standalone

**Spec pattern:** "crear módulo", "NgModule", "SharedModule"

**Rule:** Standalone components (angular-patterns.mdc)

**Why the rule exists:**
- Simpler mental model
- Better tree-shaking
- No module management
- Angular recommended approach

**Compliant alternative:**
```typescript
// Instead of NgModule
@NgModule({
  declarations: [FeatureComponent],
  imports: [CommonModule]
})

// Use standalone
@Component({
  standalone: true,
  imports: [CommonModule, SharedComponent]
})
```

**Exception conditions:** None for new code.

---

#### Eager Loading vs Lazy Loading

**Spec pattern:** "cargar todo junto", "sin lazy loading"

**Rule:** Lazy load routes (performance.mdc)

**Why the rule exists:**
- Smaller initial bundle
- Faster first load
- Load on demand
- Better Core Web Vitals

**Compliant alternative:**
```typescript
// Instead of eager
{ path: 'feature', component: FeatureComponent }

// Use lazy
{ 
  path: 'feature', 
  loadComponent: () => import('./feature.component')
    .then(m => m.FeatureComponent)
}
```

**Exception conditions:** Critical path components only.

---

## Resolution Decision Tree

```
Spec conflicts with rule?
│
├─ Is there a documented exception?
│  ├─ YES → Does this case qualify?
│  │        ├─ YES → Apply exception, document in dev plan
│  │        └─ NO → Follow rule
│  │
│  └─ NO → Follow rule
│
├─ Can the same goal be achieved following the rule?
│  ├─ YES → Use compliant alternative
│  └─ NO → Ask user:
│          ├─ Modify requirements?
│          └─ Document as new exception?
│
└─ User insists on spec despite rule?
   → Document justification in dev plan
   → Mark as technical debt if applicable
```

## Conflict Severity Levels

| Severity | Criteria | Action |
|----------|----------|--------|
| 🔴 **Critical** | Type safety, security, accessibility | Must resolve before proceeding |
| 🟡 **Important** | Patterns, architecture, performance | Should resolve, discuss if complex |
| 🟢 **Minor** | Style preferences, naming | Can proceed with note |

## Documentation Template

When an exception is approved:

```markdown
## Exception: [Title]

**Spec requirement:** [What was requested]
**Rule violated:** [Rule name and source]
**Justification:** [Why exception is acceptable]
**Approved by:** User on [date]
**Technical debt:** Yes/No
**Review date:** [If applicable]
```
