# Extract Specs

Transform natural language descriptions into structured specifications.

## Usage

```
/extract-specs [paste or describe feature/project]
```

## Output Structure

Generate a specification document with:

```markdown
# [Feature Name] Specification

## Overview
- **Problem:** What this solves
- **Users:** Who will use it
- **Success:** How we know it works

## Functional Requirements

### FR-1: [Requirement]
**Priority:** Must Have | Should Have | Nice to Have
**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

## Entities

### [Entity Name]
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | Yes | Unique identifier |

**Relationships:**
- Has many [Related]
- Belongs to [Parent]

## Use Cases

### UC-1: [Action]
**Actor:** [Who]
**Flow:** [Steps]

## Out of Scope
- [What's NOT included]

## Open Questions
- [ ] [Clarifications needed]
```

## Process

1. **Identify core problem** - What does this solve? For whom?
2. **Extract actions** - Verbs: create, view, edit, delete, search, filter
3. **Find entities** - Nouns: User, Product, Order
4. **Define relationships** - One-to-many, many-to-many
5. **Note implicit requirements** - Auth, validation, performance

## Output Location

Save to: `specs/[feature-name].spec.md`
