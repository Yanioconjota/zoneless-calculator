# Explain Decision

When interviewer asks "Why did you do X?" - get a quick, confident answer.

## Prompt

The interviewer asked: **{{input}}**

Give me a confident, concise answer (3-4 sentences max) that:
1. States the reason clearly
2. Mentions the benefit
3. Acknowledges alternatives briefly

---

## Quick Reference for Common Questions:

### "Why Signal Store instead of classic NgRx?"
"Signal Store reduces boilerplate significantly - no separate action, reducer, and effect files. Direct method calls are more intuitive than dispatching actions. It integrates naturally with Angular's signal system for reactive updates. Classic NgRx is better for very large apps with complex state dependencies."

### "Why OnPush change detection?"
"OnPush improves performance by only checking the component when inputs change or signals update. It works perfectly with our signal-based architecture. It also enforces immutable patterns which makes state predictable."

### "Why input() instead of @Input decorator?"
"The new signal-based input() provides better type inference and compile-time checking for required inputs. It integrates with Angular's signal system for automatic change detection. The syntax is also more concise."

### "Why standalone components?"
"Standalone components don't need NgModules, which reduces complexity and improves tree-shaking. Each component explicitly declares its dependencies in the imports array. It's the recommended approach in Angular 17+."

### "Why @if/@for instead of *ngIf/*ngFor?"
"The built-in control flow has better performance - no directive overhead. The syntax is cleaner and supports features like @empty for empty states. It's the modern Angular 17+ approach that will eventually replace structural directives."

### "Why inject() instead of constructor injection?"
"The inject() function works in any injection context, not just constructors. It enables better composition with functions and reduces boilerplate. The code is more explicit about dependencies."

### "How would you test this?"
"For the store, I'd test each method independently - call the method, check the resulting state. For components, I'd use TestBed with setInput() for signal inputs and spy on outputs. I'd mock the store for component tests to isolate concerns."

---

Format my answer to sound natural and confident, not rehearsed.
