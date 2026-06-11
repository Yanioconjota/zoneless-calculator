---
name: spec-to-devplan
description: >-
  Extract specifications from user stories, technical documents, or prompts and generate
  a development plan aligned with project rules. Detects conflicts between specs and 
  coding standards, consulting the user before proceeding. Use when the user mentions 
  /spec-to-devplan, wants to create a feature from requirements, needs a dev plan from 
  a story, or asks to analyze specs against project conventions.
---

# Spec to Dev Plan

Extracts specifications from text and generates a development plan that complies with project coding standards.

## Quick Start

```
/spec-to-devplan [paste your user story, technical spec, or prompt]
/spec-to-devplan --app-name=my-app [specs...]
```

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Parse input text
- [ ] Step 2: Extract technical specifications
- [ ] Step 3: Load project rules
- [ ] Step 4: Detect rule conflicts
- [ ] Step 5: Consult user on conflicts
- [ ] Step 6: Determine app vs feature
- [ ] Step 7: Generate compliant dev plan
```

---

## Step 1: Parse Input Text

Identify the type of input:

| Input Type | Indicators |
|------------|------------|
| **User Story** | "As a [role], I want [feature], so that [benefit]" |
| **Technical Spec** | Structured document with requirements, acceptance criteria |
| **Prompt/Description** | Freeform feature request or conversation |

Extract key elements:
- Feature name/purpose
- Functional requirements
- Technical requirements (explicit or implied)
- Acceptance criteria
- Constraints mentioned

---

## Step 2: Extract Technical Specifications

Categorize extracted specs into:

| Category | Keywords to Detect |
|----------|-------------------|
| **State Management** | "promesas", "localStorage", "state global", "cache", "redux", "store" |
| **UI Components** | "tabla", "modal", "formulario", "Material", "Bootstrap components" |
| **Data Flow** | "API", "HTTP", "real-time", "WebSocket", "polling", "GraphQL" |
| **Patterns** | "singleton", "factory", "observer", "service" |
| **Styling** | "Material design", "custom CSS", "animaciones", "theme" |
| **Auth** | "login", "JWT", "sesión", "permisos", "roles" |

**Output format:**

```markdown
## Extracted Specifications

### Functional Requirements
1. [Requirement]
2. [Requirement]

### Technical Requirements (Explicit)
- [Tech spec mentioned in text]

### Technical Requirements (Implied)
- [Inferred from functionality]

### Constraints
- [Any limitations mentioned]
```

---

## Step 3: Load Project Rules

Read rules from `.cursor/rules/` based on spec categories:

| Spec Category | Rules to Load |
|---------------|---------------|
| State Management | state-management.mdc, state-mutation-strategies.mdc |
| Components | angular-patterns.mdc, folder-structure.mdc |
| Forms | form-validation-ux.mdc, reactive-input-patterns.mdc |
| API/Data | rxjs-patterns.mdc, error-handling.mdc, consistent-return-contracts.mdc |
| UI | styling-conventions.mdc, accessibility.mdc |
| Routing | routing-patterns.mdc |
| Testing | testing.mdc |
| Types | typescript-best-practices.mdc |
| All | code-quality.mdc, performance.mdc |

---

## Step 4: Detect Rule Conflicts

Compare each extracted spec against loaded rules. See [conflict-resolution.md](conflict-resolution.md) for detailed patterns.

### Common Conflicts

| Spec Says | Rule Says | Conflict Type |
|-----------|-----------|---------------|
| "usar promesas para el store" | Use `rxMethod` with Observables | Pattern Conflict |
| "Material components" | NgZorro as primary DS | UI Library Conflict |
| "localStorage para state" | Use Signal Store | State Management Conflict |
| "@Input() decorator" | Use signal inputs | API Conflict |
| "*ngIf para condicionales" | Use @if control flow | Syntax Conflict |
| "any para tipos dinámicos" | No `any`, use proper types | Type Safety Conflict |
| "NgModule para organizar" | Standalone components | Architecture Conflict |

### Conflict Report Template

```markdown
## ⚠️ Spec-Rule Conflict Detected

### Conflict #N: [Category]

**Spec requests:**
> [Quote from spec]

**Project rule states:**
> [Quote from rule file]

**Rule source:** `.cursor/rules/[file].mdc`

**Why the rule exists:**
[Brief rationale from the rule]

**Documented exceptions:**
[If any exceptions apply, list them]

**Recommendation:**
🟢 Follow the rule: [Compliant approach to achieve same goal]
🟡 Exception may apply: [Explain why and conditions]
```

---

## Step 5: Consult User on Conflicts

**CRITICAL: Never proceed with rule violations without explicit user approval.**

Present conflicts and wait for response:

```markdown
I found N conflicts between the specs and project rules.

### Conflict 1: [Title]
[Conflict details]

**Options:**
A) ✅ Follow the rule (recommended) - [Brief compliant approach]
B) ⚠️ Document as exception - [Requires justification]
C) 💬 Discuss further - [If unclear]

Please select how to proceed for each conflict before I generate the dev plan.
```

**Wait for user response. Do not proceed until all conflicts are resolved.**

---

## Step 6: Determine App vs Feature

Ask the user if not clear from context:

```markdown
📦 **Project Scope**

Based on the specs, this could be:

**A) New Angular App**
- Creates a new folder at project root
- Full Angular 19 setup with all dependencies
- Independent app with its own package.json

**B) New Feature in Existing App**
- Adds to `src/app/features/[feature-name]/`
- Uses existing app infrastructure
- Integrates with current routing

Which approach should I use?
```

### App Naming (if new app)

If user doesn't specify a name, infer from functionality:

| Functionality | Suggested Name |
|---------------|----------------|
| task management, todo | `task-manager` |
| e-commerce, products, cart | `shop-app` |
| users, profiles, directory | `user-directory` |
| chat, messages | `chat-app` |
| dashboard, analytics | `analytics-dashboard` |
| inventory, stock | `inventory-system` |
| blog, posts | `blog-platform` |
| bookings, appointments | `booking-app` |

**Naming rules:**
- kebab-case
- No generic prefixes (app-, my-)
- Max 3 words
- Descriptive of main functionality

---

## Step 7: Generate Compliant Dev Plan

After resolving conflicts and determining scope, generate the plan.

### For New App

```markdown
# Development Plan: [App Name]

## Overview
[Brief description based on specs]

## Project Setup

### App Location
📁 **Root folder:** `[app-name]/`
📍 **Path:** `[workspace-root]/[app-name]/`

### Initialization

ng new [app-name] --standalone --style=scss --routing --skip-git
cd [app-name]
npm install ng-zorro-antd @ngrx/signals @angular/cdk
npm install -D @angular-eslint/schematics

### Post-Setup
- [ ] Copy `.eslintrc.json` and `.prettierrc` from parent
- [ ] Configure NgZorro in app.config.ts
- [ ] Set up path aliases in tsconfig.json

## App Structure

[app-name]/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── models/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── features/
│   │   │   └── [feature-folders]/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles/
│   ├── assets/
│   └── environments/
├── angular.json
├── package.json
└── tsconfig.json
```

### For Feature Only

```markdown
# Development Plan: [Feature Name]

## Overview
[Brief description based on specs]

## Feature Location
📁 **Path:** `src/app/features/[feature-name]/`

## Feature Structure

features/
└── [feature-name]/
    ├── components/
    │   ├── [feature]-container/
    │   │   ├── [feature]-container.component.ts
    │   │   └── [feature]-container.component.html
    │   └── [presentational-components]/
    ├── store/
    │   └── [feature].store.ts
    ├── services/
    │   └── [feature]-api.service.ts
    ├── models/
    │   └── [feature].models.ts
    └── [feature].routes.ts
```

### Common Sections (Both)

```markdown
## Specs Summary

| Requirement | Compliant Implementation |
|-------------|-------------------------|
| [Spec 1] | [How it follows rules] |
| [Spec 2] | [How it follows rules] |

## Resolved Conflicts

| Original Spec | Resolution | Justification |
|---------------|------------|---------------|
| [Conflict] | [Chosen approach] | [Why] |

## Implementation Checklist

### State Management
- [ ] Create store at `[path]/store/[name].store.ts`
- [ ] Define typed state interface
- [ ] Implement computed values for derived state
- [ ] Use `rxMethod` for async operations
- [ ] Add error handling with proper state updates

### Components
- [ ] Container (smart) with store injection
- [ ] Presentational (dumb) with signal inputs/outputs
- [ ] `@if`, `@for`, `@switch` control flow
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] `standalone: true`
- [ ] `inject()` for DI

### UI/Styling
- [ ] NgZorro components as primary
- [ ] Bootstrap utilities for layout only
- [ ] CSS custom properties for theming
- [ ] Component-scoped SCSS

### Forms (if applicable)
- [ ] Reactive forms with FormBuilder
- [ ] Validate on blur, show errors on touch
- [ ] ARIA attributes for accessibility
- [ ] Loading states on submit

### Routing
- [ ] Lazy-loaded routes
- [ ] Route guards if auth required
- [ ] Component input binding for params

### Testing
- [ ] Store computed values
- [ ] Store async methods
- [ ] Error handling paths

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation
- [ ] Focus management

## Files to Create

| File | Purpose |
|------|---------|
| `[path]/store/[name].store.ts` | Feature state management |
| `[path]/models/[name].models.ts` | TypeScript interfaces |
| `[path]/components/[name]-container/` | Smart component |
| `[path]/[name].routes.ts` | Feature routing |

## Estimated Complexity
- **Components:** N
- **Store methods:** N
- **API endpoints:** N
- **Effort:** Low | Medium | High
```

---

## Additional Resources

- For conflict resolution patterns, see [conflict-resolution.md](conflict-resolution.md)
- For rule checklist by category, see [rule-checklist.md](rule-checklist.md)

---

## Notes

- Always quote the specific rule being referenced
- Provide the rationale, not just the rule
- Suggest compliant alternatives that achieve the same goal
- Document approved exceptions in the dev plan
- **Never generate code that violates rules without explicit approval**
- When in doubt, ask the user
