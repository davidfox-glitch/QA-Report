# Data Structure Redesign Plan

## Goal Description

Migrate the application's single-project architecture to a hierarchical structure capable of managing multiple projects under a client, with each project containing multiple modules, and test points grouped inside those modules.

The requested hierarchy is:
`Client -> Project -> Module -> Test Points -> Reports`

## User Review Required

> [!IMPORTANT]
> This is a major architectural change that affects how all data is stored. Existing single-project data will need to be migrated to the new schema. Please review the proposed data models and UI flow below.

## Open Questions

1. **Multiple Clients?** Should the application support multiple **Clients**, or just a single global Client that contains multiple Projects?
2. **Current Data Migration:** Since we are moving from a single project model (where you just had `moduleName` on rows) to a strict hierarchy, do you want us to automatically wrap your existing test points into a "Default Project" under a "Default Client"?
3. **Master Report:** Do you want the "Master Report" at the Project level (combining all modules in that project) or at the Client level (combining all projects)?

## Proposed Changes

### 1. Data Schema Updates (`src/store/useStore.ts`)

We will introduce new entities to the Zustand state:

- **Clients**: `{ id, name, logo }`
- **Projects**: `{ id, clientId, name, description }`
- **Modules**: `{ id, projectId, name }`

**Row Updates**:
- `TestRow` will be updated to include `moduleId` (and implicitly belong to a Project and Client), replacing the free-text `moduleName`.

**State Selection**:
- Add global state for:
  - `activeClientId: string | null`
  - `activeProjectId: string | null`
  - `activeModuleId: string | null`
- Filtering rows across the dashboard and table will be based on the currently selected Project/Module.

### 2. UI & Navigation (`src/App.tsx`, `src/components/ui/Sidebar.tsx`)

- **Sidebar Redesign**: The sidebar will now represent the hierarchy.
  - Top level dropdown/selector for **Client**.
  - Secondary dropdown/selector for **Project**.
  - List of **Modules** as navigation items within the selected Project.
  - Adding "View Master Report" at the project level.

### 3. Modals and Views
- Add **Create Project** and **Create Module** modals.
- Update the **RowModal** (Add Test Point) so it automatically assigns the test to the currently selected Module, or provides a dropdown to select a Module.
- Update **AnalyticsView** and **PrintReportView** to aggregate data either at the Module level or Project level (Master Report).

## Verification Plan

### Automated Tests
- Validate that adding a client, project, and module correctly creates the hierarchy.
- Validate that adding a test point correctly associates it with the active module.

### Manual Verification
- We will provide a Walkthrough of creating a Client -> Project -> Website Module -> Login Points.
- We will verify that reports can be generated for an individual module and a master report for the entire project.

---
**Next Steps:** Please confirm if this approach aligns with your vision, and answer the Open Questions above so we can begin execution!
