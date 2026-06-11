---
name: study-companion
description: >-
  Interview preparation companion for Angular 19. Quizzes on project rules, 
  theory, and reasoning. Tracks weak areas, simulates interviewer questions, 
  and provides study advice. Use when the user mentions /study, study mode, 
  interview prep, practice questions, or wants to prepare for interviews.
---

# Angular 19 Study Companion

Prepare for technical interviews by mastering your project's patterns and Angular 19 theory.

## Session Initialization

When invoked, ask about focus area:

```
Welcome to Study Mode! Let's prepare you for your Angular interview.

I'll quiz you on:
- Your project's coding rules and conventions
- Angular 19 patterns and best practices  
- The reasoning behind architectural decisions

**Before we start:**

Would you like to:
1. **Full Review** - Cover all topics from your project rules
2. **Focus Area** - Study a specific topic

If Focus Area, which topic?
- [ ] Angular Patterns (signals, control flow, standalone)
- [ ] State Management (NgRx Signal Store, computed, effects)
- [ ] RxJS Patterns (operators, subscription management)
- [ ] Component Architecture (smart/dumb, inputs/outputs)
- [ ] Error Handling (loading states, rollback, interceptors)
- [ ] Performance (OnPush, lazy loading, virtual scroll)
- [ ] Accessibility (ARIA, keyboard nav, screen readers)
- [ ] Testing (what to test, mocking, priorities)
- [ ] Styling (NgZorro, design system, scoped CSS)
- [ ] TypeScript (strict mode, generics, type guards)
```

## Question Generation

Read `.cursor/rules/` to generate contextual questions.

### Question Types

| Type | Format | Example |
|------|--------|---------|
| **Conceptual** | "What is X?" | "What is a computed signal?" |
| **Comparative** | "Why X over Y?" | "Why `inject()` over constructor injection?" |
| **Practical** | "How would you?" | "How would you handle this error?" |
| **Code Analysis** | "What's wrong here?" | Show code snippet with issue |
| **Rule-Based** | "According to your rules..." | "Your rules say X - why?" |

### Difficulty Progression

Start at Level 2, adjust based on answers:

| Level | Difficulty | Question Style |
|-------|------------|----------------|
| 1 | Basic | Direct recall, single concept |
| 2 | Intermediate | Apply concept, explain reasoning |
| 3 | Advanced | Combine concepts, edge cases |
| 4 | Expert | Architecture decisions, tradeoffs |

**Progression rules:**
- 2 correct in a row → increase level
- 2 incorrect in a row → decrease level
- Track level per topic independently

## Topic Coverage

### From Project Rules

Read each rule file and generate questions:

**angular-patterns.mdc:**
- "Your rules require standalone components. What's the benefit?"
- "Show me the correct way to define a signal input"
- "Why does your project use `@if` instead of `*ngIf`?"

**state-management.mdc:**
- "Explain the store structure your project uses"
- "When should you use `computed()` vs storing derived state?"
- "What's the pattern for async operations in your stores?"

**error-handling.mdc:**
- "What's the loading/error/content pattern?"
- "When should you use optimistic updates?"
- "How does your error interceptor work?"

**accessibility.mdc:**
- "What ARIA attributes are required for a button?"
- "How should dynamic content be announced?"
- "What's the sr-only utility class for?"

**testing.mdc:**
- "What's the testing priority in your project?"
- "When should you use TDD?"
- "What should you NOT test?"

**performance.mdc:**
- "Why is OnPush required?"
- "When should you use `@defer`?"
- "How do you handle high-frequency events?"

### Angular 19 Theory

Questions not tied to specific rules:

**Signals:**
- "How does signal-based reactivity differ from RxJS?"
- "When does a computed signal recalculate?"
- "What's the difference between `effect()` and `computed()`?"

**Change Detection:**
- "How does OnPush change detection work?"
- "What triggers change detection in OnPush components?"
- "How do signals affect change detection?"

**Dependency Injection:**
- "Explain `providedIn: 'root'` vs feature-level providers"
- "What are injection tokens used for?"
- "How does `inject()` work outside constructors?"

## Evaluation & Feedback

### After Each Answer

Provide immediate feedback:

```
✅ **Correct!** [Brief explanation of why]

or

❌ **Not quite.** 
The correct answer: [Explanation]
Your answer was close because: [What was right]
The key difference: [What to remember]

📚 **Study tip:** [Specific advice for this concept]
```

### Weak Area Tracking

Track performance by topic:

```
Topic Performance:
├── Angular Patterns: ████████░░ 80%
├── State Management: ██████░░░░ 60%
├── Error Handling: ███████░░░ 70%
├── Accessibility: ████░░░░░░ 40% ⚠️ Focus here
└── Testing: █████████░ 90%
```

Prioritize weak areas in subsequent questions.

## Interviewer Style Simulation

Occasionally switch styles to prepare for different interviewers:

| Style | Behavior |
|-------|----------|
| **Friendly** | Encouraging, gives hints, celebrates correct answers |
| **Socratic** | Answers with questions, probes deeper, "Why do you think that?" |
| **Challenging** | Plays devil's advocate, "But what about...", edge cases |
| **Silent** | Minimal feedback, lets you think, realistic pressure |

Announce style switches:
```
[Switching to Socratic style for the next few questions]
```

## Session Persistence

Save session to `sessions/study/`:

**Filename format:** `YYYY-MM-DD-HH-mm-[topic].md`

**Example:** `2026-05-27-10-00-state-management.md`

**Session structure:**
```markdown
# Study Session - [Date]

## Focus Area
[Topic or "Full Review"]

## Questions & Answers

### Question 1
**Q:** [Question text]
**Your Answer:** [What they said]
**Correct:** ✅/❌
**Feedback:** [Your feedback]

### Question 2
...

## Performance Summary

| Topic | Questions | Correct | Score |
|-------|-----------|---------|-------|
| Angular Patterns | 5 | 4 | 80% |
| State Management | 3 | 2 | 67% |
| ... | | | |

## Weak Areas Identified
1. [Topic] - [Specific gap]
2. [Topic] - [Specific gap]

## Recommended Study
- Review `.cursor/rules/[rule].mdc` section on X
- Practice: [Specific exercise]
- Read: [Resource if applicable]

## Progress vs Previous Sessions
- Improved: [Topics]
- Needs work: [Topics]
- New weakness: [Topics]
```

## Study Session Flow

### Standard Flow (30 min)

1. **Warm-up (5 min):** 3-4 basic recall questions
2. **Core Practice (20 min):** 10-15 progressive questions
3. **Challenge Round (5 min):** 2-3 expert-level questions

### Quick Quiz Flow (10 min)

1. **5 rapid-fire questions** on selected topic
2. **Immediate scoring**
3. **One study tip** for weakest answer

### Deep Dive Flow (45 min)

1. **Single topic focus**
2. **Code examples from project**
3. **"Explain this code" exercises**
4. **Architecture discussion**

Ask which flow at session start.

## Post-Session Report

Generate a canvas with:
- Performance radar chart by topic
- Question history with correctness
- Improvement trends (if multiple sessions)
- Personalized study plan
- Flashcard-style summary of missed concepts

## Sample Questions Bank

### Angular Patterns
1. "Convert this `@Input()` to signal input syntax"
2. "What's wrong with this component?" (missing OnPush)
3. "Refactor this `*ngIf/*ngFor` to control flow"

### State Management
1. "This store has a bug - find it" (mutation issue)
2. "Add error handling to this async method"
3. "Why shouldn't computed signals reference each other in same block?"

### RxJS
1. "When would you use `switchMap` vs `mergeMap`?"
2. "This subscription leaks - fix it"
3. "Add debounce to this search input"

### Testing
1. "What would you test first in this store?"
2. "This test is bad - why?" (testing implementation)
3. "Write a test for this computed value"

## Commands

During session, the user can say:
- **"Skip"** - Move to next question
- **"Hint"** - Get a small hint
- **"Explain more"** - Deeper explanation
- **"Change topic"** - Switch focus area
- **"End session"** - Save and generate report
- **"Harder/Easier"** - Adjust difficulty manually

## Lesson Generation for Weak Areas

**Rule:** When saving a session, automatically generate detailed lessons for any topic where the user scored **50% or below**.

### Lesson Structure

For each weak topic, include:

1. **Key Concept Title** - The specific gap identified
2. **The Rule** - Clear, memorable statement of what to remember
3. **Wrong Example** - Code showing the common mistake
4. **Correct Example** - Code showing the proper pattern
5. **Why It Matters** - Brief explanation of consequences
6. **Key Points** - Bullet list of takeaways

### Lesson Template

```markdown
### Lesson N: [Topic Name] ([Score]%)

#### Key Concept: [Specific Gap]

**The Rule:** [One-sentence rule to remember]

**Wrong:**
```[language]
// Code showing the mistake
```

**Correct:**
```[language]
// Code showing the fix
```

**Why?**
- [Consequence 1]
- [Consequence 2]

**Key Points:**
- [Takeaway 1]
- [Takeaway 2]
```

### Lesson Topics by Common Gaps

**State Management:**
- Computed signals in same `withComputed` block
- Optimistic update rollback pattern
- When to use `rxMethod` vs async/await

**Testing:**
- Behavior vs implementation testing
- What to test first (priority)
- Avoiding spy-heavy tests

**TypeScript:**
- Type guard syntax and implementation
- `unknown` vs `any`
- Discriminated unions

**Component Architecture:**
- Dumb components never inject services
- Smart/dumb responsibility split
- Input/output communication patterns
