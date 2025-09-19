# Todo Manager System Design

## 1. Executive Summary

### Project Overview
A terminal-based todo list manager built with Node.js, TypeScript, and the blessed library. The application provides a rich terminal UI with multiple panels for managing tasks efficiently from the command line.

### Key Features
- Add, delete, and complete todos
- Simple terminal UI with keyboard navigation
- Persistent storage to JSON file
- Real-time UI updates

### Technology Stack
- **Language**: TypeScript (type safety and better developer experience)
- **Runtime**: Node.js
- **UI Library**: Blessed (rich terminal interfaces)
- **Architecture**: MVC (Model-View-Controller)
- **Storage**: JSON file-based persistence

## 2. System Architecture

### MVC Architecture with Blessed Integration
```
┌─────────────────────────────────────────────┐
│                   View                       │
│          (Blessed UI Components)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ List     │ │ Form     │ │ Box      │    │
│  │ Widget   │ │ Widget   │ │ Widget   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
│  Blessed Features Leveraged:                 │
│  • Built-in scrolling & selection            │
│  • Form validation & input handling          │
│  • Event emitters for user actions           │
│  • Automatic focus management                │
└─────────────────┬───────────────────────────┘
                  │ Blessed Events
┌─────────────────▼───────────────────────────┐
│                Controller                    │
│         (Event-Driven Mediator)              │
│   - Listen to blessed widget events          │
│   - Coordinate Model and View                │
│   - Emit custom application events           │
└─────────────────┬───────────────────────────┘
                  │ Data Operations
┌─────────────────▼───────────────────────────┐
│                  Model                       │
│             (Todo Data Layer)                │
│   - Todo items and validation                │
│   - File persistence                         │
│   - Emit change events for View updates      │
└──────────────────────────────────────────────┘
```

### Blessed-Aware Architecture Benefits

**Event-Driven Communication**:
- Blessed widgets emit events naturally (select, submit, cancel)
- Controller subscribes to widget events instead of polling
- Model emits change events that View widgets can listen to
- Loose coupling through event system

**Widget Reusability**:
- Each panel is a self-contained blessed widget
- Widgets can be composed and nested
- Built-in features reduce custom code

### Component Responsibilities

**Model**:
- Define todo data structure (id, title, completed, createdAt)
- Handle file I/O operations (load/save JSON)
- Provide CRUD operations (add, delete, toggle)

**View**:
- Render single blessed list widget
- Display todos with completion status
- Handle keyboard events
- Show status bar with shortcuts

**Controller**:
- Process keyboard commands (a, d, space, q)
- Call Model methods based on user input
- Update View when Model changes
- Handle application lifecycle (startup, shutdown)

## 3. User Interface Design

### Terminal Layout with Blessed Widgets
```
┌─────────────────────────────────────────────────────────┐
│                    Todo Manager v1.0                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    Todo List (100%)                      │
│                   [blessed.list()]                       │
│                                                          │
│  [ ] Buy groceries                                      │
│  [x] Write report                                       │
│  [ ] Call dentist                                       │
│  > [ ] Team meeting                                     │
│  [ ] Review code                                        │
│  [ ] Fix bug #42                                        │
│  [ ] Update documentation                               │
│                                                          │
│  ▼ (3 more items)                                       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [a]dd [d]elete [space]complete [q]uit | 10 todos        │
└──────────────────────────────────────────────────────────┘
```

### Blessed Widget Mapping

1. **Todo List** - `blessed.list()`
   - **Built-in Features We Get Free**:
     - Automatic scrolling with scrollbar
     - Item selection with highlighting
     - Keyboard navigation (up/down/pgup/pgdn)
   - **Custom Rendering**:
     - Checkbox prefix for completion status

2. **Status Bar** - `blessed.box()`
   - Simple text display with keyboard shortcuts
   - Todo count display

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑/↓` or `j/k` | Navigate todo list |
| `a` | Add new todo (opens prompt) |
| `d` | Delete selected todo |
| `Space` | Toggle complete status |
| `q` | Quit application |

## 4. Data Model

### Todo Item Structure
```typescript
interface Todo {
  id: string;           // Unique identifier (UUID)
  title: string;        // Todo title (required)
  completed: boolean;   // Completion status
  createdAt: Date;      // Creation timestamp
}
```

### Data Validation Rules
- Title: Required, 1-100 characters
- Completed: Default to false for new todos
- ID: Auto-generated UUID v4
- CreatedAt: Auto-set on creation

### Storage Format
```json
{
  "version": "1.0.0",
  "todos": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Buy groceries",
      "completed": false,
      "createdAt": "2024-01-10T10:00:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "title": "Write report",
      "completed": true,
      "createdAt": "2024-01-09T14:30:00Z"
    }
  ]
}
```

## 5. Technical Specifications

### Dependencies
```json
{
  "dependencies": {
    "blessed": "^0.1.81",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/blessed": "^0.1.22",
    "@types/uuid": "^9.0.0",
    "ts-node": "^10.9.0"
  }
}
```

### Performance Requirements
- Instant UI response (< 50ms for user actions)
- Support up to 1000 todos without lag
- Smooth scrolling in todo list

### Cross-Platform Considerations
- Use path.join() for file paths
- Handle different terminal sizes (min 80x24)
- Graceful degradation for limited terminal capabilities

## 6. Why Blessed Makes This Simple

### What Blessed Handles For Us

| Feature | With Blessed | Without Blessed |
|---------|--------------|-----------------|
| **Scrolling** | `scrollable: true` | Manually track viewport, implement scroll logic |
| **Selection** | `list.select(index)` | Track cursor position, handle highlighting |
| **Layout** | `width: '100%'` | Calculate terminal dimensions manually |
| **Resize** | Automatic | Listen to SIGWINCH, recalculate |
| **Colors** | `fg: 'blue'` | Manage ANSI color codes |
| **Input** | `blessed.textbox()` | Handle cursor, insert/delete |

### Built-in Features We Use

1. **List Widget**
   - Automatic scrolling with keyboard navigation
   - Selection highlighting
   - Item management (add/remove items)

2. **Screen Management**
   - Terminal size detection
   - Automatic redraws
   - Clean exit handling

3. **Event System**
   - Keyboard event handling
   - Built-in key bindings
   - Event bubbling

### Architecture Benefits from Blessed

**Reduced Code Complexity**:
- No manual cursor management
- No manual screen buffer handling
- No ANSI escape sequence management
- Built-in widget state management

**Event-Driven by Default**:
```javascript
// Blessed provides this pattern naturally:
todoList.on('select', (item, index) => {
  controller.selectTodo(index);
});

// Instead of manual polling or complex state tracking
```

**Progressive Enhancement**:
- Start with basic blessed widgets
- Add custom rendering only where needed
- Fallback to simpler widgets on limited terminals

### Example: How Blessed Simplifies Our MVC

```typescript
// MODEL: Simple todo data
class TodoModel {
  private todos: Todo[] = [];
  
  add(title: string): void {
    this.todos.push({
      id: uuid(),
      title,
      completed: false,
      createdAt: new Date()
    });
    this.save();
  }
  
  toggle(id: string): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
    this.save();
  }
  
  delete(id: string): void {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }
}

// VIEW: Single list widget
class TodoView {
  private list: blessed.List;
  
  constructor(screen: blessed.Screen) {
    this.list = blessed.list({
      parent: screen,
      width: '100%',
      height: '100%-2',  // Leave room for status bar
      items: [],
      scrollable: true,
      keys: true,
      style: {
        selected: { bg: 'blue' }
      }
    });
  }
  
  updateTodos(todos: Todo[]) {
    const items = todos.map(t => 
      `[${t.completed ? 'x' : ' '}] ${t.title}`
    );
    this.list.setItems(items);
    this.list.screen.render();
  }
}

// CONTROLLER: Simple event handling
class TodoController {
  constructor(view: TodoView, model: TodoModel) {
    // 'a' key adds todo
    view.on('key a', async () => {
      const title = await view.prompt('New todo:');
      if (title) {
        model.add(title);
        view.updateTodos(model.getAllTodos());
      }
    });
    
    // Space toggles completion
    view.on('key space', () => {
      const selected = view.getSelectedId();
      model.toggle(selected);
      view.updateTodos(model.getAllTodos());
    });
  }
}
```

## 7. Risk Assessment

### Potential Challenges

1. **Terminal Compatibility**
   - Risk: Blessed may not work on all terminals
   - Mitigation: Test on major terminals (Windows Terminal, iTerm2, standard Linux terminals)

2. **File Corruption**
   - Risk: JSON file could be corrupted during write
   - Mitigation: Write to temp file first, then rename (atomic operation)

3. **Large Data Sets**
   - Risk: Performance issues with many todos
   - Mitigation: Virtual scrolling in blessed list widget

### Alternative Approaches
- If blessed fails: Use simpler readline interface
- If file storage insufficient: Add SQLite later