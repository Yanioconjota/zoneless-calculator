---
name: refactor-guide
description: >-
  Guided refactoring workflow for Angular code. Analyzes current code, proposes
  refactoring options with tradeoffs, executes step by step, and verifies behavior
  unchanged. Use when the user mentions /refactor, code improvement, cleanup,
  restructuring, or wants to improve code quality without changing behavior.
---

# Refactor Guide

Systematic refactoring workflow ensuring behavior preservation.

## When to Use

- Code works but needs improvement
- Technical debt cleanup
- Applying new project conventions
- Consolidating duplicate code
- Improving performance or readability

## Session Initialization

When invoked, understand the goal:

```
I'll help you refactor this code safely.

Before we start:

1. **What code needs refactoring?** (file, component, feature)
2. **What's the goal?** 
   - [ ] Apply project conventions
   - [ ] Improve readability
   - [ ] Reduce duplication
   - [ ] Improve performance
   - [ ] Extract reusable pieces
   - [ ] Other: ___

3. **Are there tests covering this code?**

Please share the code or point me to the files.
```

## Refactoring Workflow

### Phase 1: Analyze Current Code

**Goal:** Understand what exists and identify improvement opportunities.

**Analysis Checklist:**

```
Code Structure:
- [ ] Identify responsibilities (single responsibility?)
- [ ] Note dependencies (what does it use?)
- [ ] Find coupling points (what uses it?)
- [ ] Check current test coverage

Convention Compliance:
- [ ] Compare against .cursor/rules/
- [ ] Note deviations from project patterns
- [ ] Identify legacy patterns (decorators, *ngIf, etc.)

Quality Issues:
- [ ] Duplicate code
- [ ] Long methods/functions
- [ ] Deep nesting
- [ ] Complex conditionals
- [ ] Magic numbers/strings
- [ ] Poor naming
```

**Output Analysis Summary:**

```markdown
## Code Analysis: [File/Component Name]

### Current Structure
- **Purpose:** [What this code does]
- **Size:** [Lines, complexity metrics]
- **Dependencies:** [Services, stores, components used]

### Identified Issues
1. [Issue 1] - Severity: High/Medium/Low
2. [Issue 2] - Severity: High/Medium/Low

### Convention Violations
- [ ] [Rule]: [Specific violation]

### Test Coverage
- Existing tests: Yes/No/Partial
- Coverage areas: [What's tested]
```

### Phase 2: Propose Refactoring Options

**Goal:** Present options with clear tradeoffs.

**Option Template:**

```markdown
### Option A: [Name]

**Approach:** [Brief description]

**Changes Required:**
1. [Change 1]
2. [Change 2]

**Pros:**
- [Benefit 1]
- [Benefit 2]

**Cons:**
- [Drawback 1]
- [Risk 1]

**Effort:** Low | Medium | High
**Risk:** Low | Medium | High

**Recommended:** Yes/No - [Reason]
```

**Common Refactoring Options:**

| Goal | Options |
|------|---------|
| Apply conventions | Incremental (file by file) vs Batch (all at once) |
| Extract logic | New service vs Utility function vs Store method |
| Reduce duplication | Extract component vs Shared directive vs Utility |
| Improve structure | Split component vs Extract child vs Reorganize |

### Phase 3: Execute Step by Step

**Goal:** Make incremental changes, each preserving behavior.

**Execution Rules:**

```
Golden Rules:
1. One refactoring type at a time
2. Each step should compile and run
3. Commit/checkpoint after each step
4. Run tests after each change
5. No behavior changes mixed with refactoring
```

**Step Template:**

```markdown
### Step N: [Action]

**What:** [Specific change being made]
**Why:** [Reason for this step]
**Risk:** Low | Medium | High

**Before:**
```[language]
// Current code
```

**After:**
```[language]
// Refactored code
```

**Verify:** [How to confirm this step worked]
```

**Common Refactoring Steps:**

1. **Rename** - Variables, functions, files for clarity
2. **Extract** - Pull out method, component, service
3. **Inline** - Remove unnecessary abstraction
4. **Move** - Relocate to better home
5. **Replace** - Swap pattern for better one

### Phase 4: Verify Behavior Unchanged

**Goal:** Confirm refactoring didn't break anything.

**Verification Checklist:**

```
Automated Verification:
- [ ] All existing tests pass
- [ ] No new TypeScript errors
- [ ] No new linter errors
- [ ] Build succeeds

Manual Verification:
- [ ] Feature works as before
- [ ] Edge cases still handled
- [ ] Error states still work
- [ ] Performance not degraded

Regression Spots:
- [ ] [Specific area to check]
- [ ] [Another area]
```

### Phase 5: Update Tests If Needed

**Goal:** Ensure test coverage matches refactored code.

**Test Updates:**

```
When Tests Need Changes:
- Extracted method → Test the new method
- Renamed exports → Update imports in tests
- Split component → Tests for new component
- Changed interface → Update test data

When Tests Should NOT Change:
- Internal implementation changes
- Performance optimizations
- Code reorganization only
```

## Angular-Specific Refactorings

### Legacy Decorator → Signal Input

```typescript
// Before
@Input() data!: Data;
@Output() selected = new EventEmitter<string>();

// After
data = input.required<Data>();
selected = output<string>();
```

### *ngIf/*ngFor → Control Flow

```html
<!-- Before -->
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let item of items">{{ item.name }}</div>

<!-- After -->
@if (isLoading()) {
  <div>Loading...</div>
}
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

### Constructor DI → inject()

```typescript
// Before
constructor(
  private http: HttpClient,
  private store: FeatureStore
) {}

// After
private readonly http = inject(HttpClient);
private readonly store = inject(FeatureStore);
```

### Extract Store Computed

```typescript
// Before: Logic in component
get filteredItems() {
  return this.store.items().filter(i => i.status === this.filter);
}

// After: Logic in store
// store.ts
withComputed((store) => ({
  filteredItems: computed(() => {
    const filter = store.filter();
    return store.items().filter(i => i.status === filter);
  })
}))

// component.ts
filteredItems = this.store.filteredItems; // Just use store computed
```

### Extract Presentational Component

```typescript
// Before: All in container
@Component({
  template: `
    <div class="card" *ngFor="let item of items">
      <h3>{{ item.name }}</h3>
      <p>{{ item.description }}</p>
      <button (click)="onSelect(item.id)">Select</button>
    </div>
  `
})

// After: Extracted card component
// item-card.component.ts
@Component({
  selector: 'app-item-card',
  template: `
    <div class="card">
      <h3>{{ item().name }}</h3>
      <p>{{ item().description }}</p>
      <button (click)="onSelect()">Select</button>
    </div>
  `
})
export class ItemCardComponent {
  item = input.required<Item>();
  selected = output<string>();
  
  onSelect() {
    this.selected.emit(this.item().id);
  }
}

// container uses:
@for (item of items(); track item.id) {
  <app-item-card [item]="item" (selected)="onSelect($event)" />
}
```

## Refactoring Checklist by Type

### Applying Project Conventions

```
- [ ] Standalone components (standalone: true)
- [ ] Signal inputs/outputs (no @Input/@Output)
- [ ] Control flow (@if, @for, @switch)
- [ ] inject() function (no constructor DI)
- [ ] OnPush change detection
- [ ] NgZorro components (not Material equivalents)
```

### Improving Store Code

```
- [ ] Computed for derived state (not methods)
- [ ] rxMethod for async operations
- [ ] Proper error handling
- [ ] Optimistic updates with rollback
- [ ] Clear state shape
```

### Cleaning Up Components

```
- [ ] Smart/dumb separation
- [ ] Single responsibility
- [ ] Reasonable size (<200 lines)
- [ ] Clear input/output contracts
- [ ] No direct DOM manipulation
```

## Session Persistence

Save refactoring sessions to `sessions/refactor/`:

**Filename:** `YYYY-MM-DD-HH-mm-[scope]-[goal].md`

Include:
- Initial analysis
- Chosen approach
- Steps executed
- Verification results
- Before/after comparison
