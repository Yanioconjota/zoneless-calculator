# Create Dev Plan

Transform specifications into phased development plans.

## Usage

```
/create-dev-plan [link to spec or paste spec content]
```

## Output Structure

```markdown
# [Feature] Development Plan

## Overview
**Based on:** [spec reference]
**Estimated:** X tasks, Y hours
**Timeline:** X weeks at Y hours/day

## Phase 1: Foundation
**Goal:** Core entities and state management
**Milestone:** Basic CRUD working

| ID | Task | Complexity | Hours | Dependencies |
|----|------|------------|-------|--------------|
| T-001 | Create folder structure | Simple | 0.5 | - |
| T-002 | Create models/interfaces | Simple | 0.5 | - |
| T-003 | Create Signal Store | Medium | 2 | T-002 |

## Phase 2: Core Features
**Goal:** Main user flows
**Milestone:** Full functionality

[Tasks table]

## Phase 3: Enhancement
**Goal:** UX polish
**Milestone:** Production-ready

[Tasks table]

## Phase 4: Optimization
**Goal:** Testing and edge cases

[Tasks table]

## Summary
| Phase | Tasks | Hours |
|-------|-------|-------|
| Foundation | X | Y |
| Total | X | Y |

## Risks
- [Risk]: [Mitigation]
```

## Complexity Scale

| Level | Description | Time |
|-------|-------------|------|
| Simple | Known pattern | 1-2h |
| Medium | Some decisions | 2-4h |
| Complex | New patterns | 4-8h |

## Task Granularity

- **Too big:** "Implement feature" ❌
- **Too small:** "Create id property" ❌
- **Right size:** "Create Entity Signal Store" ✅

## Output Location

Save to: `specs/[feature-name].plan.md`
