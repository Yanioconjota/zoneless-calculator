---
name: review-pr
description: Review Pull Requests against project coding standards defined in .cursor/rules/. Use when reviewing PRs, checking code quality, or when the user mentions /review-pr, PR review, or code review against rules.
---

# PR Review Against Project Rules

Review Pull Requests by checking code changes against the project's coding standards.

## Quick Start

```
/review-pr #123              # PR in current repo
/review-pr owner/repo#123    # PR in another repo
```

## Workflow

Copy this checklist and track progress:

```
Review Progress:
- [ ] Step 1: Fetch PR information
- [ ] Step 2: Get PR diff
- [ ] Step 3: Load relevant rules
- [ ] Step 4: Analyze against each rule
- [ ] Step 5: Generate review report
- [ ] Step 6: (Optional) Post review to PR
```

### Step 1: Fetch PR Information

Parse the PR reference and fetch metadata:

```bash
# For current repo
gh pr view 123 --json title,body,files,additions,deletions

# For external repo
gh pr view 123 --repo owner/repo --json title,body,files,additions,deletions
```

### Step 2: Get PR Diff

Fetch the full diff:

```bash
# Current repo
gh pr diff 123

# External repo
gh pr diff 123 --repo owner/repo
```

### Step 3: Load Relevant Rules

Read the applicable rules based on changed file types:

| File Type | Rules to Load |
|-----------|---------------|
| `*.ts` | angular-patterns.mdc, typescript-best-practices.mdc, state-management.mdc |
| `*.html` | angular-patterns.mdc, accessibility.mdc |
| `*.scss/css` | styling-conventions.mdc |
| `*.spec.ts` | testing.mdc |
| Any | code-quality.mdc, performance.mdc |

Rules location: `.cursor/rules/`

### Step 4: Analyze Against Rules

For each changed file, check violations against loaded rules:

**Angular Patterns** (angular-patterns.mdc):
- Standalone components with `standalone: true`
- `inject()` instead of constructor DI
- Signal inputs: `input()`, `input.required()`, `model()`, `output()`
- Control flow: `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`)
- `ChangeDetectionStrategy.OnPush`

**State Management** (state-management.mdc):
- NgRx Signal Store patterns
- `withState`, `withComputed`, `withMethods`
- `patchState()` for immutable updates
- `rxMethod` for async operations

**TypeScript** (typescript-best-practices.mdc):
- No `any` types
- Proper type guards
- Discriminated unions
- Utility types usage

**Testing** (testing.mdc):
- Tests for store computed values
- Tests for async store methods
- Service transformation tests
- Proper mocking patterns

**Accessibility** (accessibility.mdc):
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management

**Performance** (performance.mdc):
- OnPush change detection
- Lazy loaded routes
- `track` in `@for` loops
- `NgOptimizedImage` for images
- Virtual scrolling for large lists

**Code Quality** (code-quality.mdc):
- ESLint compliance
- Prettier formatting
- No console.log in production code

**Styling** (styling-conventions.mdc):
- NgZorro as primary DS
- Bootstrap for layout only
- CSS custom properties for theming
- Scoped component styles

### Step 5: Generate Review Report

Format the review using this template:

```markdown
# PR Review: #{number} - {title}

## Summary
Brief overview of changes and overall assessment.

## Files Reviewed
- `path/to/file1.ts` (additions: X, deletions: Y)
- `path/to/file2.html` (additions: X, deletions: Y)

## Findings

### 🔴 Critical (Must Fix)

#### [Rule: angular-patterns] Legacy decorator usage
**File:** `src/app/feature/component.ts:15`
```typescript
// Found
@Input() data: Data;

// Expected
data = input.required<Data>();
```
**Why:** Signal inputs are required per project standards.

---

### 🟡 Suggestions (Consider Improving)

#### [Rule: performance] Missing track in @for
**File:** `src/app/feature/template.html:42`
```html
<!-- Found -->
@for (item of items()) {

<!-- Expected -->
@for (item of items(); track item.id) {
```

---

### 🟢 Nice-to-Have (Optional)

#### [Rule: accessibility] Consider adding aria-label
**File:** `src/app/shared/button.html:8`
Icon-only button could benefit from `aria-label`.

---

## Checklist

- [ ] No `any` types
- [ ] Standalone components
- [ ] Signal inputs/outputs
- [ ] Control flow syntax
- [ ] OnPush change detection
- [ ] Proper error handling
- [ ] Tests included
- [ ] Accessibility checked

## Verdict

🟢 **Approve** | 🟡 **Request Changes** | 🔴 **Block**

[Explanation of verdict]
```

### Step 6: Post Review (Optional)

If the user wants to post the review to GitHub:

```bash
# Approve
gh pr review 123 --approve --body "Review body here"

# Request changes
gh pr review 123 --request-changes --body "Review body here"

# Comment only
gh pr review 123 --comment --body "Review body here"
```

To add inline comments on specific lines:

```bash
gh api repos/{owner}/{repo}/pulls/{pr}/reviews \
  --method POST \
  -f body="Overall review" \
  -f event="COMMENT" \
  -f comments[][path]="src/file.ts" \
  -f comments[][position]=10 \
  -f comments[][body]="Specific comment"
```

## Severity Guidelines

| Severity | Criteria | Action |
|----------|----------|--------|
| 🔴 **Critical** | Breaks build, violates strict rules (no `any`, standalone required), security issues, accessibility blockers | Must fix before merge |
| 🟡 **Suggestion** | Best practice violations, performance improvements, code clarity | Should address, discuss if disagreed |
| 🟢 **Nice-to-have** | Style preferences, minor optimizations, documentation | Optional, author's discretion |

## Rule Priority

When rules conflict, follow this priority:

1. TypeScript strict mode (type safety)
2. Angular patterns (framework standards)
3. Accessibility (legal/ethical requirement)
4. Performance (user experience)
5. Code quality (maintainability)
6. Styling (consistency)

## Notes

- Focus on **changed lines**, not entire files
- Consider **context** - new feature vs hotfix
- Be **constructive** - suggest solutions, not just problems
- Reference **specific rules** when citing violations
- If a pattern is new to the codebase, check if it's intentional
