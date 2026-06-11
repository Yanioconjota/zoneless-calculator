# Cursor Commands - Interview Survival Kit

These commands help when you freeze during an interview. Just type the command and describe what you need.

## Available Commands

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `/extract-requirements` | Got a ticket/question | Breaks down into entity, stories, API, components |
| `/unfreeze` | Mind went blank | Gives you 5 steps + first file to create |
| `/start-feature` | Starting from scratch | Scaffolds complete feature (model, service, store, components) |
| `/next-step` | Don't know what's next | Analyzes code, tells you ONE thing to do |
| `/add-to-feature` | Need to add capability | Generates code for filtering, forms, pagination, etc. |
| `/fix-this` | Got an error | Quick diagnosis and fix |
| `/explain-decision` | Interviewer asks "why?" | Confident answer with reasoning |

## How to Use

1. Open Cursor chat (Cmd/Ctrl + L)
2. Type the command name (e.g., `/unfreeze`)
3. Add your context after it
4. Press Enter

## Interview Flow with Commands

```
┌────────────────────────────────────────────┐
│  Interviewer gives you a task              │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│  /extract-requirements                      │
│  "Build a todo list with filters"          │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│  /start-feature                             │
│  "todo list - Task entity with title,      │
│   completed, priority"                      │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│  (coding...)                                │
│  Got stuck? → /next-step                    │
│  Got error? → /fix-this                     │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│  Interviewer: "Now add filtering"          │
│  → /add-to-feature "filter by status"      │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│  Interviewer: "Why did you use X?"         │
│  → /explain-decision "Why Signal Store?"   │
└────────────────────────────────────────────┘
```

## Panic Shortcuts

**Completely frozen:**
```
/unfreeze I need to build [thing] but I don't know where to start
```

**Got an error, no idea why:**
```
/fix-this [paste error message]
```

**Interviewer asked something, need quick answer:**
```
/explain-decision Why did I use OnPush change detection?
```

## Tips

1. **Don't overthink the prompt** - These commands are designed to work with minimal input
2. **Be specific about the entity** - "user with name, email, role" is better than just "user"
3. **Use /next-step often** - It keeps you moving forward
4. **It's okay to use these** - They help you demonstrate good patterns under pressure
