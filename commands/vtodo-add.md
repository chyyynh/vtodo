---
description: Add a new todo to the project
---

# Add New Todo

⚠️ **ALL parameters REQUIRED - no exceptions**

## Usage

```bash
npx vtodo add "Title" --description "Description" --tags tag1,tag2 --expected 2h --detail
```

**Required fields (ask user if missing):**
- Title
- `--description` (what needs to be done)
- `--tags` (comma-separated: frontend,backend,bugfix,etc)
- `--expected` (30min, 2h, 1d, etc)
- `--detail` (ALWAYS include)

## Examples

```bash
npx vtodo add "Fix login bug" --description "Login fails on submit" --tags bugfix,auth --expected 2h --detail
npx vtodo add "Add user dashboard" --description "Dashboard with stats" --tags frontend,ui --expected 4h --detail
npx vtodo add "Optimize queries" --description "Improve DB performance" --tags backend,perf --expected 3h --detail
```

## Detail File Template

Populate the detail file with:

```markdown
# [Title]

## Context
[Why needed? Background?]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Implementation Steps
1. Step 1
2. Step 2

## Technical Notes
- Key considerations
- Related files

## Resources
- Links/references
```