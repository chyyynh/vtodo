---
description: Add a new todo to the project
---

# Add New Todo

**Step 1**: Ask "What would you like to accomplish?"

**Step 2**: Auto-generate based on user input:
- Title
- Description (detailed explanation)
- Tags (frontend/backend/bugfix/feature/research/etc)
- Time estimate (30min/2h/1d based on complexity)

**Step 3**: Create todo:
```bash
npx vtodo add "[Title]" -d "[Description]" -t [tags] -e [time] --detail
```

**Step 4**: Edit `todo/[ID]-todo.md` with tailored content:
```markdown
# [Title]

## Context
[Why needed, problem it solves]

## Acceptance Criteria
- [ ] [Specific criterion 1]
- [ ] [Specific criterion 2]
- [ ] [Specific criterion 3]

## Implementation Steps
1. [Detailed step]
2. [Detailed step]
3. [Detailed step]

## Technical Notes
- [Key considerations]
- [Related files]
- [Dependencies]

## Resources
- [Relevant docs/links]
```

Generate all content specifically for the task, not generic placeholders.