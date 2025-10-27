---
description: Add a new todo to the project
---

# Add New Todo

## Workflow

**Step 1: Ask user for ALL required information**
- Title (what needs to be done)
- Description (detailed explanation)
- Tags (comma-separated: frontend,backend,bugfix,etc)
- Expected time (30min, 2h, 1d, etc)

**Step 2: Use Bash tool to create the todo**
```bash
npx vtodo add "[Title]" -d "[Description]" -t [tags] -e [time] --detail
```
The output will show the TODO ID (e.g., "Added TODO #004")

**Step 3: IMMEDIATELY use Edit tool to open `todo/[ID]-todo.md`**

Replace the template with this comprehensive content:

```markdown
# [Title]

## Context
[Why is this needed? What problem does it solve? Background information]

## Acceptance Criteria
- [ ] Specific, measurable criterion 1
- [ ] Specific, measurable criterion 2
- [ ] Specific, measurable criterion 3

## Implementation Steps
1. Detailed step with specifics
2. Detailed step with specifics
3. Detailed step with specifics

## Technical Notes
- Key technical considerations
- Related files: /path/to/file.js
- Dependencies or constraints
- Performance/security concerns

## Resources
- [Documentation](url)
- [Related PR/issue](url)
```