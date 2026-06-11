# Scaffold Component

Generate an Angular component following project conventions.

## Usage

```
/scaffold-component [name] [type: container|card|form|list]
```

## Component Types

### Container (Smart)

```typescript
// [name]-container.component.ts
@Component({
  selector: 'app-[name]-container',
  standalone: true,
  imports: [/* child components */],
  templateUrl: './[name]-container.component.html',
  styleUrl: './[name]-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [Name]ContainerComponent implements OnInit {
  protected readonly store = inject([Name]Store);
  
  ngOnInit() {
    this.store.load();
  }
  
  onCreate(data: Create[Entity]Dto) {
    this.store.create(data);
  }
  
  onDelete(id: string) {
    this.store.delete(id);
  }
}
```

### Card (Presentational)

```typescript
// [name]-card.component.ts
@Component({
  selector: 'app-[name]-card',
  standalone: true,
  imports: [NzCardModule, NzButtonModule],
  templateUrl: './[name]-card.component.html',
  styleUrl: './[name]-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [Name]CardComponent {
  item = input.required<[Entity]>();
  selected = input(false);
  
  select = output<string>();
  delete = output<string>();
  
  onSelect() {
    this.select.emit(this.item().id);
  }
  
  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.item().id);
  }
}
```

### Form (Presentational)

```typescript
// [name]-form.component.ts
@Component({
  selector: 'app-[name]-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
  templateUrl: './[name]-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [Name]FormComponent {
  initialData = input<[Entity] | null>(null);
  isSubmitting = input(false);
  
  submitted = output<Create[Entity]Dto>();
  cancelled = output<void>();
  
  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    name: ['', Validators.required],
    // add fields from entity
  });
  
  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.getRawValue());
    }
  }
}
```

### List (Presentational)

```typescript
// [name]-list.component.ts
@Component({
  selector: 'app-[name]-list',
  standalone: true,
  imports: [[Name]CardComponent],
  template: `
    @for (item of items(); track item.id) {
      <app-[name]-card
        [item]="item"
        [selected]="item.id === selectedId()"
        (select)="select.emit($event)"
        (delete)="delete.emit($event)"
      />
    } @empty {
      <ng-content select="[empty]" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class [Name]ListComponent {
  items = input.required<[Entity][]>();
  selectedId = input<string | null>(null);
  
  select = output<string>();
  delete = output<string>();
}
```

## Conventions Applied

- ✅ Standalone component
- ✅ OnPush change detection
- ✅ Signal inputs (`input()`, `input.required()`)
- ✅ Signal outputs (`output()`)
- ✅ `inject()` for DI
- ✅ NgZorro components
