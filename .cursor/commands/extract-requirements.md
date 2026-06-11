# Extract Requirements

Parse a user story, ticket, or paragraph into clear, actionable requirements.

## Prompt

From the input below, extract:

## FEATURE SUMMARY
**One sentence** describing what we're building.

## REQUIREMENTS

| # | Requirement | Type | Priority |
|---|-------------|------|----------|
| 1 | [Clear, testable statement] | Functional / UI / Data | Must / Should / Nice |
| 2 | ... | ... | ... |

## DATA MODEL
```typescript
interface [EntityName] {
  id: string;
  // inferred fields from requirements
}
```

## KEY INTERACTIONS
- User can: [action 1]
- User can: [action 2]
- System should: [behavior]

## CLARIFYING QUESTIONS
> List anything ambiguous that needs clarification before starting.

---

**Guidelines:**
- Requirements must be **specific and testable** (not "make it nice")
- Infer reasonable defaults for unstated details
- Flag assumptions clearly
- Keep it concise - this feeds into implementation prompts

---

**INPUT:**

{{input}}
