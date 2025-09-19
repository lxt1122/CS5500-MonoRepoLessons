# Todo Manager Implementation Plan

## Overview
This plan covers the implementation phases (Phases 3-6 from the lesson README.md).
We've already completed:
- ✅ Phase 1 (Lesson): Created TODO-DESIGN.md
- ✅ Phase 2 (Lesson): Created this TODO-PLAN.md

Now we implement the actual application:

## 1. Implementation Phases

### Implementation Phase 1: Project Setup & Model (2 hours)
*Corresponds to Lesson Phase 3*
**Goal**: Set up TypeScript project and implement data layer

**Tasks**:
1. Initialize npm project and TypeScript config
2. Install dependencies (blessed, uuid)
3. Create Model class with CRUD operations
4. Implement JSON file persistence
5. Test Model in isolation with simple script

**Success Criteria**:
- Can create, read, update, delete todos from code
- Data persists to `todos.json` file
- Model works independently of UI

**Complexity**: Low

---

### Implementation Phase 2: Basic Blessed UI (View) (2 hours)
*Corresponds to Lesson Phase 5 (modified order)*

**Goal**: Create minimal blessed interface with list display

**Note**: We build View BEFORE Controller because:
- View can be tested independently with mock data
- Controller needs both Model and View to connect
- Our simplified design has no separate CLI interface

**Tasks**:
1. Set up blessed screen and list widget
2. Display hardcoded todos in list
3. Implement keyboard navigation (up/down)
4. Add status bar with shortcuts
5. Handle quit command (q key)

**Success Criteria**:
- Terminal UI launches and displays
- Can navigate list with arrow keys
- Can cleanly exit application

**Complexity**: Low

---

### Implementation Phase 3: Controller Integration (2 hours)
*Corresponds to parts of Lesson Phase 4 & 6*

**Goal**: Connect Model and View through Controller

**Note**: In our simplified design, the Controller connects Model and View for the blessed UI.
We're NOT building a separate CLI interface as originally suggested in Lesson Phase 4.

**Tasks**:
1. Create Controller class
2. Load todos from Model into View
3. Implement add command (a key)
4. Implement delete command (d key)
5. Implement toggle complete (space key)

**Success Criteria**:
- All CRUD operations work through UI
- Changes persist to file
- UI updates reflect data changes

**Complexity**: Medium

---

### Implementation Phase 4: Input Handling (1 hour)
*Part of Lesson Phase 6 (Integration)*
**Goal**: Add user input for new todos

**Tasks**:
1. Create input prompt for adding todos
2. Add basic input validation
3. Handle escape/cancel in prompts
4. Implement confirmation for delete

**Success Criteria**:
- Can type todo titles when adding
- Can cancel operations
- Destructive actions have confirmation

**Complexity**: Low

---

### Implementation Phase 5: Polish & Error Handling (1 hour)
*Corresponds to Lesson Phase 6 (Polish)*
**Goal**: Make the app robust and user-friendly

**Tasks**:
1. Add error handling for file operations
2. Handle terminal resize
3. Add visual feedback (colors, borders)
4. Improve list item formatting
5. Add "no todos" empty state

**Success Criteria**:
- App handles errors gracefully
- UI looks polished
- Good user experience

**Complexity**: Low

**Total Estimated Time**: 8 hours

---

## Phase Mapping: Lesson vs Implementation

### Why Our Order Differs from README.md

The **lesson README.md** suggests building a full-featured todo manager with:
- Multiple panels (list, details, command input)
- CLI commands separate from the UI
- Complex Controller handling both CLI and UI

Our **simplified TODO-DESIGN.md** has:
- Single panel UI (just the list)
- No separate CLI interface
- Simple Controller connecting Model and View

### Phase Correspondence Table

| Lesson Phase (README.md) | Our Implementation Phase | What We Actually Build |
|--------------------------|-------------------------|------------------------|
| Phase 1: Design Doc | ✅ Complete | TODO-DESIGN.md |
| Phase 2: Plan Doc | ✅ Complete | TODO-PLAN.md (this doc) |
| Phase 3: Model | Implementation Phase 1 | Model + Storage |
| Phase 4: CLI Controller | *(Skip - no CLI)* | We don't build separate CLI |
| Phase 5: View (Blessed) | Implementation Phase 2 | Blessed UI |
| Phase 6: Integration | Implementation Phases 3-5 | Controller + Polish |

### Why We Build View Before Controller

**Original README.md Order** (for complex app):
1. Model → CLI Controller → Blessed View → Integration

**Our Simplified Order** (better for simple app):
1. Model → Blessed View → Controller → Polish

**Rationale**:
- ✅ **No CLI to build** - We simplified to just blessed UI
- ✅ **Controller needs both Model and View** - Can't connect what doesn't exist
- ✅ **View can be tested with mock data** - Easier to verify it works
- ✅ **Simpler mental model** - Build the pieces, then connect them

---

## 2. File Structure and Organization

```
todo-manager/
├── package.json
├── tsconfig.json
├── README.md
├── TODO-DESIGN.md
├── TODO-PLAN.md
├── .gitignore
├── src/
│   ├── index.ts           # Application entry point
│   ├── models/
│   │   ├── Todo.ts        # Todo interface/type
│   │   └── TodoModel.ts   # Model class with CRUD operations
│   ├── views/
│   │   └── TodoView.ts    # Blessed UI components
│   ├── controllers/
│   │   └── TodoController.ts  # Controller logic
│   └── utils/
│       └── storage.ts     # File I/O utilities
├── data/
│   └── todos.json         # Data storage (git ignored)
└── dist/                  # Compiled JavaScript (git ignored)
```

### File Naming Conventions
- **PascalCase** for classes: `TodoModel.ts`
- **camelCase** for utilities: `storage.ts`
- **kebab-case** for config files: `tsconfig.json`

### Module Organization
```typescript
// Each file has single responsibility
// Todo.ts - Just the type definition
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// TodoModel.ts - Just the Model class
export class TodoModel {
  // Model implementation
}

// TodoView.ts - Just the View class
export class TodoView {
  // View implementation
}

// TodoController.ts - Just the Controller
export class TodoController {
  // Controller implementation
}

// index.ts - Wire everything together
import { TodoModel } from './models/TodoModel';
import { TodoView } from './views/TodoView';
import { TodoController } from './controllers/TodoController';
// Bootstrap application
```

## 3. Implementation Strategy

### Build Order (Important!)

1. **Start with Model** (Phase 1)
   - Build and test in isolation
   - Can verify data persistence works
   - Foundation for everything else

2. **Then View** (Phase 2)
   - Build UI with fake data first
   - Test blessed widgets work
   - Ensure terminal rendering is correct

3. **Finally Controller** (Phase 3)
   - Connect the two existing pieces
   - Add event handling
   - Complete the MVC triangle

### Why This Order?
- Model can be tested without UI (easier debugging)
- View can be tested with mock data (visual verification)
- Controller is simplest when Model and View already work
- Each phase produces something testable

### Integration Approach

**Step 1**: Test each component independently
```typescript
// Test Model alone
const model = new TodoModel();
model.add('Test todo');
console.log(model.getAll()); // Verify it works

// Test View alone
const view = new TodoView();
view.render([
  { id: '1', title: 'Fake todo', completed: false, createdAt: new Date() }
]);
```

**Step 2**: Simple integration
```typescript
// Controller connects them
const model = new TodoModel();
const view = new TodoView();
const controller = new TodoController(model, view);
// Controller sets up all event listeners
```

**Step 3**: Add complexity gradually
- First: Display todos
- Then: Add todos
- Then: Delete/complete
- Finally: Polish

## 4. Technical Approach

### MVC Communication Pattern
```
User Input → View (blessed events) → Controller → Model → File
                ↑                                    ↓
                └────── Controller updates View ←────┘
```

### Blessed UI Structure
```typescript
// Simple blessed setup
class TodoView {
  private screen: blessed.Widgets.Screen;
  private list: blessed.Widgets.ListElement;
  private statusBar: blessed.Widgets.BoxElement;

  constructor() {
    // Screen is the root container
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Todo Manager'
    });

    // List takes most of the space
    this.list = blessed.list({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%-2',  // Leave 2 lines for status
      border: { type: 'line' },
      scrollable: true,
      keys: true,
      vi: true  // Enable vim keys
    });

    // Status bar at bottom
    this.statusBar = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      content: '[a]dd [d]elete [space]complete [q]uit'
    });
  }
}
```

### Data Persistence Strategy
```typescript
// Simple synchronous approach (fine for small datasets)
class Storage {
  private filePath = './data/todos.json';
  
  load(): Todo[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data).todos;
    } catch (error) {
      return []; // Return empty on error
    }
  }
  
  save(todos: Todo[]): void {
    const data = {
      version: '1.0.0',
      todos: todos
    };
    // Create directory if doesn't exist
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    // Write atomically by writing to temp then renaming
    const tempFile = `${this.filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    fs.renameSync(tempFile, this.filePath);
  }
}
```

## 5. Risk Mitigation Strategies

### Risk 1: Blessed Compatibility Issues
**Mitigation**: 
- Test early on your target terminal
- Have fallback to basic console.log output
- Keep UI simple (just list and status bar)

### Risk 2: File Permission Issues
**Mitigation**:
- Check write permissions on startup
- Fall back to memory-only mode if can't write
- Show clear error message

### Risk 3: TypeScript Complexity
**Mitigation**:
- Start with minimal types
- Use `any` if stuck, refactor later
- Can always compile to JS and run directly

### Risk 4: Event Handling Confusion
**Mitigation**:
- Log all events during development
- Start with one event at a time
- Use blessed's built-in key names

## 6. Testing Strategy

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] Can navigate list with arrow keys
- [ ] Can add new todo with 'a' key
- [ ] Can delete todo with 'd' key
- [ ] Can toggle completion with space
- [ ] Can quit with 'q' key
- [ ] Data persists between sessions
- [ ] Empty state displays correctly
- [ ] Long todo titles wrap correctly
- [ ] Scrolling works with many todos

### Development Testing Approach

**Phase 1 (Model)**: Test with simple Node.js script
```typescript
// test-model.ts
import { TodoModel } from './src/models/TodoModel';

const model = new TodoModel();
model.add('Test 1');
model.add('Test 2');
console.log('All todos:', model.getAll());
model.toggleComplete(model.getAll()[0].id);
console.log('After toggle:', model.getAll());
```

**Phase 2 (View)**: Visual testing
```typescript
// test-view.ts
import { TodoView } from './src/views/TodoView';

const view = new TodoView();
// Add fake todos to test rendering
view.render([
  { id: '1', title: 'Test Todo 1', completed: false, createdAt: new Date() },
  { id: '2', title: 'Test Todo 2', completed: true, createdAt: new Date() }
]);
```

**Phase 3-5**: Integration testing
- Run the full app
- Go through manual checklist
- Test edge cases (empty list, very long titles)

### Debugging Terminal UI

**Tip 1**: Use debug file
```typescript
// Write debug info to file instead of console
import fs from 'fs';
const debug = (msg: string) => {
  fs.appendFileSync('debug.log', `${new Date().toISOString()}: ${msg}\n`);
};
```

**Tip 2**: Add debug mode
```typescript
// Show key presses in status bar
if (DEBUG) {
  screen.key(['C-d'], () => {
    statusBar.setContent(`Last key: ${lastKey}`);
    screen.render();
  });
}
```

## 7. Development Workflow

### Initial Setup Commands
```bash
# 1. Create project
mkdir todo-manager
cd todo-manager

# 2. Initialize npm
npm init -y

# 3. Install dependencies
npm install blessed uuid
npm install -D typescript @types/node @types/blessed @types/uuid ts-node

# 4. Create TypeScript config
npx tsc --init

# 5. Create directory structure
mkdir -p src/models src/views src/controllers src/utils data

# 6. Add npm scripts to package.json
# "scripts": {
#   "build": "tsc",
#   "start": "node dist/index.js",
#   "dev": "ts-node src/index.ts"
# }
```

### Development Cycle
1. Write code in `src/`
2. Run with `npm run dev` for quick testing
3. Build with `npm run build` for production
4. Test each phase before moving to next

## 8. Success Metrics

### Phase Checkpoints
- **After Phase 1**: Can run `npm run dev` and see todos in console
- **After Phase 2**: Can see blessed UI with fake todos
- **After Phase 3**: Can add/delete todos through UI
- **After Phase 4**: Full interaction working
- **After Phase 5**: Polished, error-free experience

### Final Acceptance Criteria
1. ✅ All 5 operations work (add, delete, complete, navigate, quit)
2. ✅ Data persists to file
3. ✅ No crashes on normal use
4. ✅ Clean UI with clear instructions
5. ✅ Handles edge cases gracefully