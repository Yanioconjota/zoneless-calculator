---
name: migration-helper
description: >-
  Version migration workflow for Angular and related dependencies. Analyzes current
  versions, checks breaking changes, creates migration checklist, executes migrations,
  and verifies functionality. Use when the user mentions /migrate, upgrade, version
  update, or needs help updating Angular or dependencies.
---

# Migration Helper

Systematic migration workflow for Angular version upgrades.

## When to Use

- Upgrading Angular to a new major version
- Updating NgRx, RxJS, or other core dependencies
- Migrating from deprecated patterns
- Adopting new Angular features

## Session Initialization

When invoked, assess the situation:

```
I'll help you migrate your Angular project safely.

First, let me understand your situation:

1. **What are you migrating?**
   - [ ] Angular version (e.g., 18 → 19)
   - [ ] NgRx version
   - [ ] Other dependency
   - [ ] Pattern/API deprecation

2. **Current versions?** (I can check package.json)

3. **Target versions?**

4. **Any known blockers?**
   - [ ] Third-party libraries
   - [ ] Custom build setup
   - [ ] Large codebase concerns

Let me analyze your current setup.
```

## Migration Workflow

### Phase 1: Analyze Current Versions

**Goal:** Understand the starting point and scope.

**Analysis Actions:**

```bash
# Check current Angular version
ng version

# Check all dependencies
npm list --depth=0

# Check for outdated packages
npm outdated
```

**Version Analysis Template:**

```markdown
## Current State

### Core Dependencies
| Package | Current | Latest | Gap |
|---------|---------|--------|-----|
| @angular/core | 18.2.0 | 19.2.0 | 1 major |
| @ngrx/signals | 17.0.0 | 18.0.0 | 1 major |
| rxjs | 7.8.0 | 7.8.1 | patch |

### Peer Dependencies
| Package | Required By | Current | Needed |
|---------|-------------|---------|--------|
| typescript | @angular/core | 5.4.0 | 5.5+ |

### Third-Party Libraries
| Library | Current | Angular 19 Compatible |
|---------|---------|----------------------|
| ng-zorro-antd | 18.0.0 | ✅ 19.0.0 available |
| @angular/material | 18.0.0 | ✅ 19.0.0 available |
```

### Phase 2: Check Breaking Changes

**Goal:** Identify all changes that require code modifications.

**Resources to Check:**

1. **Angular Update Guide:** https://angular.dev/update-guide
2. **Release Notes:** Check GitHub releases
3. **Migration Schematics:** `ng update` automatic migrations

**Breaking Changes Template:**

```markdown
## Breaking Changes: Angular [Version]

### Must Address (Blocking)

#### BC-1: [Change Title]
**What Changed:** [Description]
**Impact:** [How it affects your code]
**Migration:**
```typescript
// Before
oldPattern();

// After
newPattern();
```
**Affected Files:** [List or pattern]

### Should Address (Deprecated)

#### BC-2: [Deprecation]
**What:** [What's deprecated]
**Timeline:** [When it will be removed]
**Migration:** [How to update]

### Optional (New Features)

#### NF-1: [New Feature]
**What:** [Description]
**Benefit:** [Why adopt]
**Adoption:** [How to use]
```

**Common Angular Breaking Changes:**

| Version | Major Changes |
|---------|---------------|
| 17 → 18 | Control flow stable, zoneless preview |
| 18 → 19 | Signal inputs stable, standalone default |
| 19 → 20 | [Check release notes] |

### Phase 3: Create Migration Checklist

**Goal:** Ordered list of all migration tasks.

**Checklist Structure:**

```markdown
## Migration Checklist: Angular [From] → [To]

### Pre-Migration
- [ ] Commit current state
- [ ] Create migration branch
- [ ] Ensure all tests pass
- [ ] Document current behavior for verification

### Phase 1: Update Dependencies
- [ ] Update Angular CLI: `ng update @angular/cli@[version]`
- [ ] Update Angular Core: `ng update @angular/core@[version]`
- [ ] Run automatic migrations
- [ ] Update peer dependencies (TypeScript, RxJS)

### Phase 2: Fix Breaking Changes
- [ ] [BC-1]: [Description]
- [ ] [BC-2]: [Description]

### Phase 3: Update Third-Party
- [ ] Update NgZorro: `npm install ng-zorro-antd@[version]`
- [ ] Update Material: `ng update @angular/material@[version]`
- [ ] Update NgRx: `npm install @ngrx/signals@[version]`

### Phase 4: Adopt New Features (Optional)
- [ ] [Feature 1]
- [ ] [Feature 2]

### Post-Migration
- [ ] Run full test suite
- [ ] Manual smoke test
- [ ] Check bundle size
- [ ] Update documentation
- [ ] Commit and create PR
```

### Phase 4: Execute Migrations

**Goal:** Perform migration steps safely.

**Execution Rules:**

```
Migration Rules:
1. One major dependency at a time
2. Run tests after each step
3. Commit working state frequently
4. Use ng update when available (runs schematics)
5. Manual changes after automatic migrations
```

**Step-by-Step Execution:**

```markdown
### Step 1: Update Angular CLI

**Command:**
```bash
ng update @angular/cli@19 --force
```

**Expected Output:** [What to look for]

**Verify:**
- [ ] `ng version` shows new version
- [ ] `ng serve` starts successfully

---

### Step 2: Update Angular Core

**Command:**
```bash
ng update @angular/core@19
```

**Automatic Migrations Applied:**
- [ ] [Migration 1]
- [ ] [Migration 2]

**Manual Changes Required:**
- [ ] [Change 1]

**Verify:**
- [ ] Application compiles
- [ ] Tests pass
```

### Phase 5: Verify Functionality

**Goal:** Confirm everything works after migration.

**Verification Checklist:**

```markdown
## Post-Migration Verification

### Automated
- [ ] `ng build` succeeds
- [ ] `ng test` all pass
- [ ] `ng lint` no new errors
- [ ] `ng e2e` passes (if applicable)

### Manual Testing
- [ ] Application starts
- [ ] Login/Auth works
- [ ] Core features work:
  - [ ] [Feature 1]
  - [ ] [Feature 2]
- [ ] No console errors

### Performance
- [ ] Bundle size similar or smaller
- [ ] Initial load time acceptable
- [ ] Runtime performance OK

### Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
```

## Common Migration Scenarios

### Angular 18 → 19

```markdown
## Angular 18 → 19 Quick Guide

### Automatic (via ng update)
- Standalone components default
- Signal input migrations
- Control flow migrations

### Manual Steps
1. Review new standalone defaults
2. Adopt signal inputs where beneficial
3. Update third-party libraries

### Command Sequence
```bash
# 1. Update CLI
ng update @angular/cli@19

# 2. Update Core
ng update @angular/core@19

# 3. Update Material (if used)
ng update @angular/material@19

# 4. Update other deps
npm update
```
```

### NgRx Store → Signal Store

```markdown
## NgRx Classic → Signal Store

### Why Migrate
- Less boilerplate
- Better TypeScript inference
- Signals integration
- Simpler mental model

### Step-by-Step
1. Create new Signal Store alongside existing
2. Migrate state shape
3. Migrate selectors → computed
4. Migrate reducers → methods
5. Migrate effects → rxMethod
6. Update components to use new store
7. Remove old store files

### Example Migration

**Before (Classic):**
```typescript
// actions
export const loadUsers = createAction('[Users] Load');
export const loadUsersSuccess = createAction('[Users] Load Success', props<{users: User[]}>());

// reducer
export const usersReducer = createReducer(
  initialState,
  on(loadUsersSuccess, (state, {users}) => ({...state, users}))
);

// selector
export const selectUsers = (state: AppState) => state.users.users;

// effect
loadUsers$ = createEffect(() => this.actions$.pipe(
  ofType(loadUsers),
  switchMap(() => this.api.getUsers()),
  map(users => loadUsersSuccess({users}))
));
```

**After (Signal Store):**
```typescript
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState({ users: [] as User[], isLoading: false }),
  withComputed((store) => ({
    userCount: computed(() => store.users().length)
  })),
  withMethods((store, api = inject(UsersApi)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => api.getUsers().pipe(
          tapResponse({
            next: (users) => patchState(store, { users, isLoading: false }),
            error: () => patchState(store, { isLoading: false })
          })
        ))
      )
    )
  }))
);
```
```

### RxJS 7 → 8 (When Released)

```markdown
## RxJS Migration Checklist

### Check Deprecations
- [ ] `toPromise()` → `firstValueFrom()` / `lastValueFrom()`
- [ ] Deprecated operators removed

### Update Imports
```typescript
// Before
import { map } from 'rxjs/operators';

// After (already supported)
import { map } from 'rxjs';
```
```

## Rollback Plan

Always have a rollback strategy:

```markdown
## Rollback Plan

### If Migration Fails

1. **Minor Issues:** Fix forward, don't rollback
2. **Major Blockers:** 
   ```bash
   git checkout main
   git branch -D migration-branch
   ```

### Keeping Old Version Working
- Tag current state before migration
- Document exact versions in package-lock.json
- Keep copy of node_modules if critical

### Partial Rollback
If only one library is problematic:
```bash
npm install package@previous-version
```
```

## Session Persistence

Save migration sessions to `sessions/migration/`:

**Filename:** `YYYY-MM-DD-[from]-to-[to].md`

Include:
- Starting versions
- Target versions
- Breaking changes identified
- Steps executed
- Issues encountered
- Final verification results
