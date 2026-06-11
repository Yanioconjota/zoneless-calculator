# Add to Feature

Add a specific capability to an existing feature.

## Prompt

Add **{{input}}** to my current feature.

## Analyze First:
1. What feature am I working on? (look at open files)
2. What store/service exists?
3. What components exist?

## Then Generate:

### Store Changes (if needed)
- New state properties
- New computed values
- New methods

### Service Changes (if needed)
- New API methods

### Component Changes (if needed)
- New inputs/outputs
- Template updates

### New Components (if needed)
- Full component code

## Common "Add" Requests:

**"Add filtering"** →
- Add `filters` to store state
- Add `filteredItems` computed
- Add `setFilter()` method
- Create filter UI component

**"Add a form"** →
- Create form component with FormBuilder
- Add validation
- Add accessibility (aria-invalid, aria-describedby)
- Connect to store create/update method

**"Add pagination"** →
- Add `page`, `pageSize`, `totalItems` to state
- Add `paginatedItems`, `totalPages` computed
- Add `setPage()` method
- Add pagination UI

**"Add error handling"** →
- Ensure store has `error` state
- Add error display in template
- Add retry button

**"Add loading state"** →
- Ensure store has `isLoading` state
- Add spinner/skeleton in template
- Disable interactions while loading

---

Generate the minimal code changes needed. Show file paths and what to add/change.
