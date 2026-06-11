# Fix This

Quick fix for errors or issues. Paste the error or describe the problem.

## Prompt

Fix this issue: **{{input}}**

## Steps:

### 1. IDENTIFY THE PROBLEM
What's actually wrong? (One sentence)

### 2. ROOT CAUSE
Why is this happening? (One sentence)

### 3. THE FIX
Exact code change needed. Show:
- File path
- What to change (before → after)

### 4. VERIFY
How to confirm it's fixed?

---

## Common Angular 19 Fixes:

**"Property X does not exist"** →
- Check interface definition
- Check if using `()` for signals: `store.items()` not `store.items`

**"Can't bind to X"** →
- Add component/directive to `imports` array
- Check if standalone component is imported

**"No provider for X"** →
- Add `providedIn: 'root'` to service
- Or add to `providers` in component/route

**"Expression has changed after checked"** →
- Wrap in `setTimeout()` or use signals
- Check for mutations in getters

**"track expression required"** →
- Add `track item.id` to `@for` loop

**"Type 'X' is not assignable"** →
- Check interface matches data
- Check for null/undefined handling

---

Keep fix minimal. Don't refactor unrelated code.
