---
name: create-angular-feature
description: >-
  Implement Angular features based on specifications following project conventions.
  Generates folder structure, Signal Store with rxMethod, container and presentational
  components, and tests. Use when implementing a feature from a spec or dev plan,
  or when scaffolding a new Angular feature module.
disable-model-invocation: true
---

# Create Angular Feature

Generate Angular features following project conventions and best practices.

## When to Use

- Implementing a feature from a spec (after `extract-specs`)
- Following a development plan (after `create-dev-plan`)
- Scaffolding a new feature module
- Need consistent feature structure

## Prerequisites

Before generating code, ensure you understand:
1. The feature requirements (from spec)
2. The entities involved
3. The main use cases

## Project Conventions Reference

This skill follows the project's established rules. Read these files for details:
- `.cursor/rules/angular-patterns.mdc` - Component structure, signals, DI
- `.cursor/rules/state-management.mdc` - Signal Store patterns
- `.cursor/rules/testing.mdc` - Testing approach
- `.cursor/rules/typescript-best-practices.mdc` - Type safety
- `.cursor/rules/folder-structure.mdc` - File organization

## Feature Structure

Generate this folder structure:

```
src/app/features/[feature-name]/
├── components/
│   ├── [feature]-container/
│   │   ├── [feature]-container.component.ts
│   │   ├── [feature]-container.component.html
│   │   └── [feature]-container.component.scss
│   ├── [entity]-card/
│   │   ├── [entity]-card.component.ts
│   │   ├── [entity]-card.component.html
│   │   └── [entity]-card.component.scss
│   ├── [entity]-form/
│   │   └── ...
│   └── [entity]-list/
│       └── ...
├── store/
│   └── [feature].store.ts
├── models/
│   └── [feature].models.ts
├── services/
│   └── [feature]-api.service.ts (if needed)
└── [feature].routes.ts
```

## Generation Steps

### Step 1: Create Models

```typescript
// models/[feature].models.ts

export interface Entity {
  id: string;
  // properties from spec
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityDto {
  // required fields for creation (no id, timestamps)
}

export interface UpdateEntityDto {
  // partial fields for update
}

// Status/filter types if needed
export type EntityStatus = 'active' | 'inactive' | 'archived';
export type EntityFilter = 'all' | EntityStatus;
```

### Step 2: Create Signal Store

Follow `state-management.mdc` patterns:

```typescript
// store/[feature].store.ts
import { 
  signalStore, 
  withState, 
  withComputed, 
  withMethods, 
  patchState 
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { inject, computed } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';

interface FeatureState {
  entities: Entity[];
  selectedId: string | null;
  filter: EntityFilter;
  isLoading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  entities: [],
  selectedId: null,
  filter: 'all',
  isLoading: false,
  error: null
};

export const FeatureStore = signalStore(
  { providedIn: 'root' }, // or remove for feature-scoped
  withState(initialState),
  
  withComputed((store) => ({
    // Filtered list
    filteredEntities: computed(() => {
      const filter = store.filter();
      const entities = store.entities();
      if (filter === 'all') return entities;
      return entities.filter(e => e.status === filter);
    }),
    
    // Selected entity
    selectedEntity: computed(() => 
      store.entities().find(e => e.id === store.selectedId())
    ),
    
    // Counts
    entityCount: computed(() => store.entities().length),
    hasEntities: computed(() => store.entities().length > 0)
  })),
  
  withMethods((store, apiService = inject(ApiService)) => ({
    
    // Selection
    select(id: string | null) {
      patchState(store, { selectedId: id });
    },
    
    setFilter(filter: EntityFilter) {
      patchState(store, { filter });
    },
    
    // Async operations with rxMethod
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => apiService.getAll().pipe(
          tapResponse({
            next: (entities) => patchState(store, { 
              entities, 
              isLoading: false 
            }),
            error: (error: Error) => patchState(store, { 
              isLoading: false, 
              error: error.message || 'Failed to load'
            })
          })
        ))
      )
    ),
    
    create: rxMethod<CreateEntityDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((data) => apiService.create(data).pipe(
          tapResponse({
            next: (newEntity) => patchState(store, { 
              entities: [...store.entities(), newEntity],
              isLoading: false 
            }),
            error: (error: Error) => patchState(store, { 
              isLoading: false, 
              error: 'Failed to create'
            })
          })
        ))
      )
    ),
    
    // Optimistic delete with rollback
    delete: rxMethod<string>(
      pipe(
        tap((id) => {
          const previous = store.entities();
          patchState(store, { 
            entities: previous.filter(e => e.id !== id),
            _rollback: previous // store for rollback
          });
        }),
        switchMap((id) => apiService.delete(id).pipe(
          tapResponse({
            next: () => patchState(store, { _rollback: undefined }),
            error: () => patchState(store, { 
              entities: store._rollback?.() ?? [],
              _rollback: undefined,
              error: 'Failed to delete'
            })
          })
        ))
      )
    )
  }))
);
```

### Step 3: Create Container Component

Follow `angular-patterns.mdc` for smart components:

```typescript
// components/[feature]-container/[feature]-container.component.ts
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FeatureStore } from '../../store/feature.store';
// imports...

@Component({
  selector: 'app-feature-container',
  standalone: true,
  imports: [
    EntityListComponent,
    EntityFormComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './feature-container.component.html',
  styleUrl: './feature-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureContainerComponent implements OnInit {
  protected readonly store = inject(FeatureStore);
  
  ngOnInit() {
    this.store.load();
  }
  
  onCreate(data: CreateEntityDto) {
    this.store.create(data);
  }
  
  onDelete(id: string) {
    this.store.delete(id);
  }
  
  onSelect(id: string) {
    this.store.select(id);
  }
  
  onFilterChange(filter: EntityFilter) {
    this.store.setFilter(filter);
  }
}
```

Container template:

```html
<!-- [feature]-container.component.html -->
<div class="feature-container">
  <header class="d-flex justify-content-between align-items-center mb-3">
    <h1>Feature Title</h1>
    <button nz-button nzType="primary" (click)="showCreateForm = true">
      Add New
    </button>
  </header>

  @if (store.isLoading()) {
    <nz-spin nzSimple></nz-spin>
  } @else if (store.error(); as error) {
    <app-error-state 
      [message]="error" 
      (retry)="store.load()" 
    />
  } @else if (store.hasEntities()) {
    <app-entity-list
      [entities]="store.filteredEntities()"
      [selectedId]="store.selectedId()"
      (select)="onSelect($event)"
      (delete)="onDelete($event)"
    />
  } @else {
    <app-empty-state
      title="No items yet"
      description="Create your first item to get started"
      (action)="showCreateForm = true"
    />
  }
</div>
```

### Step 4: Create Presentational Components

Follow `angular-patterns.mdc` for dumb components with signal inputs/outputs:

```typescript
// components/[entity]-card/[entity]-card.component.ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Entity } from '../../models/feature.models';

@Component({
  selector: 'app-entity-card',
  standalone: true,
  imports: [NzCardModule, NzButtonModule],
  templateUrl: './entity-card.component.html',
  styleUrl: './entity-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityCardComponent {
  // Signal inputs
  entity = input.required<Entity>();
  selected = input(false);
  
  // Signal outputs
  select = output<string>();
  delete = output<string>();
  
  onSelect() {
    this.select.emit(this.entity().id);
  }
  
  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.entity().id);
  }
}
```

### Step 5: Create Routes

```typescript
// [feature].routes.ts
import { Routes } from '@angular/router';

export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/feature-container/feature-container.component')
        .then(m => m.FeatureContainerComponent),
    title: 'Feature Title'
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./components/entity-detail/entity-detail.component')
        .then(m => m.EntityDetailComponent),
    title: 'Entity Detail'
  }
];
```

### Step 6: Create Tests

Follow `testing.mdc` - focus on store and business logic:

```typescript
// store/[feature].store.spec.ts
import { TestBed } from '@angular/core/testing';
import { FeatureStore } from './feature.store';
import { of, throwError } from 'rxjs';

describe('FeatureStore', () => {
  let store: InstanceType<typeof FeatureStore>;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(() => {
    mockApiService = {
      getAll: jest.fn().mockReturnValue(of([])),
      create: jest.fn(),
      delete: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        FeatureStore,
        { provide: ApiService, useValue: mockApiService }
      ]
    });
    
    store = TestBed.inject(FeatureStore);
  });

  describe('initial state', () => {
    it('should have empty entities', () => {
      expect(store.entities()).toEqual([]);
    });

    it('should not be loading', () => {
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('computed: filteredEntities', () => {
    beforeEach(() => {
      // Setup test data
      patchState(store, { 
        entities: [
          { id: '1', status: 'active' },
          { id: '2', status: 'inactive' }
        ]
      });
    });

    it('should return all when filter is "all"', () => {
      store.setFilter('all');
      expect(store.filteredEntities().length).toBe(2);
    });

    it('should filter by status', () => {
      store.setFilter('active');
      expect(store.filteredEntities().length).toBe(1);
      expect(store.filteredEntities()[0].id).toBe('1');
    });
  });

  describe('load', () => {
    it('should load entities successfully', async () => {
      const mockEntities = [{ id: '1', name: 'Test' }];
      mockApiService.getAll.mockReturnValue(of(mockEntities));

      store.load();
      
      // Wait for async
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(store.entities()).toEqual(mockEntities);
      expect(store.isLoading()).toBe(false);
    });

    it('should handle load error', async () => {
      mockApiService.getAll.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      store.load();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(store.error()).toBe('Network error');
      expect(store.isLoading()).toBe(false);
    });
  });
});
```

## Checklist

Before completing feature generation:

- [ ] Models created with proper types
- [ ] Store has initial state, computed values, and methods
- [ ] Container component connects to store
- [ ] Presentational components use signal inputs/outputs
- [ ] Routes configured with lazy loading
- [ ] Basic store tests written
- [ ] All components use `ChangeDetectionStrategy.OnPush`
- [ ] No `@Input()` or `@Output()` decorators (use signals)
- [ ] NgZorro components used for UI

## Tips

1. **Start with models** - Clear types make everything easier
2. **Store first** - Build state management before UI
3. **Vertical slices** - Complete one entity end-to-end
4. **Test as you go** - Write store tests alongside implementation
5. **Use the rules** - Refer to `.cursor/rules/` for patterns

## Output

Generated files should be placed in:
```
src/app/features/[feature-name]/
```

Register routes in `app.routes.ts`:
```typescript
{
  path: '[feature-name]',
  loadChildren: () => import('./features/[feature-name]/[feature-name].routes')
    .then(m => m.FEATURE_ROUTES)
}
```
