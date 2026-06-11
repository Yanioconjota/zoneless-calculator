# Add Test

Generate test file for current file following project testing conventions.

## Usage

```
/add-test [path to file or current file]
```

## Test Templates

### For Signal Store

```typescript
// [store].store.spec.ts
import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of, throwError } from 'rxjs';

describe('[Entity]Store', () => {
  let store: InstanceType<typeof [Entity]Store>;
  let mockApi: jest.Mocked<[Entity]ApiService>;

  beforeEach(() => {
    mockApi = {
      getAll: jest.fn().mockReturnValue(of([])),
      create: jest.fn(),
      delete: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        [Entity]Store,
        { provide: [Entity]ApiService, useValue: mockApi }
      ]
    });
    
    store = TestBed.inject([Entity]Store);
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
    it('should return all when filter is "all"', () => {
      patchState(store, { 
        entities: [{ id: '1', status: 'active' }, { id: '2', status: 'inactive' }]
      });
      store.setFilter('all');
      expect(store.filteredEntities().length).toBe(2);
    });

    it('should filter by status', () => {
      patchState(store, { 
        entities: [{ id: '1', status: 'active' }, { id: '2', status: 'inactive' }]
      });
      store.setFilter('active');
      expect(store.filteredEntities().length).toBe(1);
    });
  });

  describe('load', () => {
    it('should load successfully', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      mockApi.getAll.mockReturnValue(of(mockData));

      store.load();
      await tick();
      
      expect(store.entities()).toEqual(mockData);
      expect(store.isLoading()).toBe(false);
    });

    it('should handle error', async () => {
      mockApi.getAll.mockReturnValue(throwError(() => new Error('Network error')));

      store.load();
      await tick();
      
      expect(store.error()).toBeTruthy();
      expect(store.isLoading()).toBe(false);
    });
  });
});

async function tick() {
  await new Promise(resolve => setTimeout(resolve, 0));
}
```

### For Service

```typescript
// [service].service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('[Service]Service', () => {
  let service: [Service]Service;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        [Service]Service,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject([Service]Service);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', (done) => {
    const mockData = [{ id: '1' }];

    service.getAll().subscribe(data => {
      expect(data).toEqual(mockData);
      done();
    });

    const req = httpMock.expectOne('/api/endpoint');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

### For Presentational Component

```typescript
// [component].component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('[Component]Component', () => {
  let fixture: ComponentFixture<[Component]Component>;
  let component: [Component]Component;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[Component]Component]
    }).compileComponents();

    fixture = TestBed.createComponent([Component]Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit select with item id', () => {
    const item = { id: '123', name: 'Test' };
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();

    const selectSpy = jest.fn();
    component.select.subscribe(selectSpy);

    component.onSelect();

    expect(selectSpy).toHaveBeenCalledWith('123');
  });
});
```

## Testing Priority

1. **Always test:** Store computed values, async methods
2. **Test when complex:** Container-store wiring
3. **Test outputs:** Presentational component events
4. **Skip:** Simple UI rendering, framework behavior
