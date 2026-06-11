# Start Feature

Quickly scaffold a complete Angular 19 feature. Just name it and describe the entity.

## Prompt

Create a complete Angular 19 feature for: **{{input}}**

## Generate These Files:

### 1. Entity Model (`models/[name].model.ts`)
```typescript
export interface [Entity] {
  id: string;
  // infer fields from description
}
```

### 2. HTTP Service (`services/[name].service.ts`)
- `getAll(): Observable<Entity[]>`
- `getById(id: string): Observable<Entity>`
- `create(data): Observable<Entity>`
- `update(id, data): Observable<Entity>`
- `delete(id): Observable<void>`

### 3. Signal Store (`store/[name].store.ts`)
```typescript
signalStore(
  withState({ items: [], selectedId: null, isLoading: false, error: null }),
  withComputed(...),
  withMethods(...)
)
```
Include: loadAll, select, add, update, delete methods

### 4. Container Component (`components/[name]-container/`)
- Injects store
- Calls `store.loadAll()` on init
- Template with loading/error/empty/list states

### 5. Card/Item Component (`components/[name]-card/`)
- `item = input.required<Entity>()`
- `select = output<string>()`
- `delete = output<string>()`

### 6. Routes (`[name].routes.ts`)
```typescript
export const [NAME]_ROUTES: Routes = [
  { path: '', component: [Name]ContainerComponent }
];
```

## Rules:
- All standalone components
- OnPush change detection
- Signal inputs/outputs
- Control flow syntax (@if, @for)
- Proper TypeScript types (no any)

Generate all files now.
