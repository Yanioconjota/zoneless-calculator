---
name: debug-assistant
description: >-
  Multi-step debugging workflow for Angular applications. Guides through 
  reproducing issues, investigating context, forming hypotheses, implementing 
  fixes, and verifying solutions. Use when the user mentions /debug, debugging,
  bug investigation, or needs help troubleshooting an issue.
---

# Debug Assistant

Systematic debugging workflow for Angular applications.

## When to Use

- User reports a bug or unexpected behavior
- Error messages or stack traces need investigation
- Something "doesn't work" and cause is unknown
- Performance issues need diagnosis

## Session Initialization

When invoked, gather context:

```
I'll help you debug this issue systematically.

First, let me understand the problem:

1. **What's happening?** (actual behavior)
2. **What should happen?** (expected behavior)
3. **When does it happen?** (steps to reproduce)
4. **Any error messages?** (console, network, etc.)

Please describe the issue or share the error.
```

## Debugging Workflow

### Phase 1: Reproduce the Issue

**Goal:** Confirm and isolate the problem.

```
Reproduction Checklist:
- [ ] Can reproduce consistently
- [ ] Identified minimal steps to trigger
- [ ] Determined scope (one component, feature-wide, app-wide)
- [ ] Checked if issue is environment-specific
```

**Actions:**
1. Ask user to demonstrate or describe steps
2. Check if issue occurs in dev/prod/both
3. Identify if recent changes could be related
4. Note any patterns (timing, user actions, data states)

### Phase 2: Investigate & Gather Context

**Goal:** Collect evidence about the root cause.

**Investigation Checklist:**

```
Code Analysis:
- [ ] Read relevant component/store code
- [ ] Check recent git changes to affected files
- [ ] Review related service/API calls
- [ ] Examine state management flow

Error Analysis:
- [ ] Parse error message and stack trace
- [ ] Identify error origin (component, service, store)
- [ ] Check for common patterns (null access, async timing)

State Analysis:
- [ ] Review store state shape
- [ ] Check signal/computed dependencies
- [ ] Look for race conditions
- [ ] Verify data flow
```

**Key Questions:**
- What data is involved?
- What triggers the code path?
- Are there async operations involved?
- Is state being mutated correctly?

### Phase 3: Form Hypotheses

**Goal:** Develop testable theories about the cause.

Structure each hypothesis:

```markdown
### Hypothesis 1: [Brief description]

**Theory:** [What you think is happening]

**Evidence For:**
- [Supporting observation 1]
- [Supporting observation 2]

**Evidence Against:**
- [Contradicting observation]

**Test:** [How to verify this hypothesis]

**Confidence:** Low | Medium | High
```

**Common Bug Patterns in Angular:**

| Pattern | Symptoms | Likely Cause |
|---------|----------|--------------|
| Data not updating | UI stale | Missing OnPush trigger, signal not updating |
| Undefined errors | Runtime crash | Async timing, null safety |
| Memory leaks | Performance degradation | Unsubscribed observables |
| Infinite loops | Browser freeze | Effect triggering its own dependency |
| Stale closures | Wrong values | Captured non-signal value in callback |

### Phase 4: Implement Fix

**Goal:** Apply targeted fix based on verified hypothesis.

**Fix Checklist:**

```
Before Implementing:
- [ ] Hypothesis verified through testing
- [ ] Understand why the bug exists
- [ ] Know the minimal change needed

Implementation:
- [ ] Make smallest possible change
- [ ] Follow project conventions (.cursor/rules/)
- [ ] Add defensive checks if appropriate
- [ ] Consider edge cases

Code Quality:
- [ ] No new TypeScript errors
- [ ] No new linter warnings
- [ ] Changes are backwards compatible
```

**Fix Documentation:**

```typescript
// BUG: [Brief description of what was wrong]
// FIX: [What the change does]
// WHY: [Root cause explanation]
```

### Phase 5: Verify Solution

**Goal:** Confirm fix works and doesn't break other things.

**Verification Checklist:**

```
Direct Verification:
- [ ] Original issue no longer occurs
- [ ] All reproduction steps now work correctly
- [ ] Edge cases handled

Regression Check:
- [ ] Related features still work
- [ ] No new console errors
- [ ] No new TypeScript errors
- [ ] Existing tests pass

Stress Test:
- [ ] Works with different data
- [ ] Works with rapid interactions
- [ ] Works after page refresh
```

### Phase 6: Document Findings

**Goal:** Prevent similar bugs and share knowledge.

**Session Summary Template:**

```markdown
# Debug Session: [Issue Title]

## Issue
**Reported:** [Original description]
**Actual Behavior:** [What happened]
**Expected Behavior:** [What should happen]

## Root Cause
[Explanation of why the bug occurred]

## Solution
**File(s) Changed:** [List files]
**Change Summary:** [What was fixed]

## Prevention
- [ ] Add test for this case
- [ ] Update documentation if needed
- [ ] Consider adding to project rules

## Lessons Learned
- [Insight that could help future debugging]
```

## Quick Debug Commands

During a session, user can say:

- **"Show me the code"** - Display relevant code sections
- **"Check the store"** - Analyze state management
- **"Look at recent changes"** - Review git history
- **"Test hypothesis X"** - Focus on specific theory
- **"Skip to fix"** - If cause is obvious, go to implementation

## Common Angular Debugging Patterns

### Signal Not Updating UI

```typescript
// Problem: Computed not recalculating
filteredItems = computed(() => {
  return this.items.filter(i => i.status === this.filter);
  //                                        ^^^^^^^^
  // If `this.filter` is not a signal, changes won't trigger
});

// Fix: Ensure all dependencies are signals
filter = signal<string>('all');
filteredItems = computed(() => {
  return this.items().filter(i => i.status === this.filter());
});
```

### Subscription Memory Leak

```typescript
// Problem: No cleanup
ngOnInit() {
  this.dataService.getData().subscribe(data => {
    this.data = data;
  });
}

// Fix: Use takeUntilDestroyed
private destroyRef = inject(DestroyRef);

ngOnInit() {
  this.dataService.getData().pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(data => {
    this.data.set(data);
  });
}
```

### Effect Infinite Loop

```typescript
// Problem: Effect modifies its own dependency
effect(() => {
  const count = this.counter();
  this.counter.set(count + 1); // Infinite loop!
});

// Fix: Separate read and write, or use different trigger
effect(() => {
  const count = this.counter();
  // Only log, don't modify
  console.log('Count changed:', count);
});
```

## Session Persistence

Save debug sessions to `sessions/debug/`:

**Filename:** `YYYY-MM-DD-HH-mm-[issue-summary].md`

Include:
- Issue description
- Investigation steps
- Hypotheses tested
- Final solution
- Time spent per phase
