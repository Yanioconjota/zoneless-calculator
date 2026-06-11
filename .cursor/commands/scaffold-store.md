# Scaffold Store

Generate a NgRx Signal Store from an interface.

## Usage

```
/scaffold-store [EntityName] [optional: path to interface]
```

## Generated Output

```typescript
// store/[entity].store.ts
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

interface EntityState {
  entities: Entity[];
  selectedId: string | null;
  filter: 'all' | EntityStatus;
  isLoading: boolean;
  error: string | null;
}

const initialState: EntityState = {
  entities: [],
  selectedId: null,
  filter: 'all',
  isLoading: false,
  error: null
};

export const EntityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  withComputed((store) => ({
    filteredEntities: computed(() => {
      const filter = store.filter();
      if (filter === 'all') return store.entities();
      return store.entities().filter(e => e.status === filter);
    }),
    selectedEntity: computed(() => 
      store.entities().find(e => e.id === store.selectedId())
    ),
    hasEntities: computed(() => store.entities().length > 0)
  })),
  
  withMethods((store, api = inject(EntityApiService)) => ({
    select(id: string | null) {
      patchState(store, { selectedId: id });
    },
    
    setFilter(filter: 'all' | EntityStatus) {
      patchState(store, { filter });
    },
    
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => api.getAll().pipe(
          tapResponse({
            next: (entities) => patchState(store, { entities, isLoading: false }),
            error: (e: Error) => patchState(store, { isLoading: false, error: e.message })
          })
        ))
      )
    ),
    
    create: rxMethod<CreateEntityDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((data) => api.create(data).pipe(
          tapResponse({
            next: (entity) => patchState(store, { 
              entities: [...store.entities(), entity],
              isLoading: false 
            }),
            error: (e: Error) => patchState(store, { isLoading: false, error: e.message })
          })
        ))
      )
    ),
    
    delete: rxMethod<string>(
      pipe(
        tap((id) => {
          // Optimistic delete with rollback
          patchState(store, { 
            _previous: store.entities(),
            entities: store.entities().filter(e => e.id !== id)
          });
        }),
        switchMap((id) => api.delete(id).pipe(
          tapResponse({
            next: () => patchState(store, { _previous: undefined }),
            error: () => patchState(store, { 
              entities: store._previous?.() ?? [],
              _previous: undefined,
              error: 'Failed to delete'
            })
          })
        ))
      )
    )
  }))
);
```

## Customization

Specify options after entity name:
- `--no-filter` - Skip filter computed
- `--no-crud` - Only state, no async methods
- `--feature` - Feature-scoped (remove providedIn)
