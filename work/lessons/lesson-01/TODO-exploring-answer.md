# Todo Terminal Manager - Architecture Analysis Report

## Team Information
- **Team Name**: [Team Name]
- **Members**: [Member Names]
- **Date**: September 28, 2025

---

## Executive Summary

This document provides a comprehensive architectural analysis of the Todo Terminal Manager application, focusing on design patterns, architecture quality, and implementation details.

---

## Part 1: Understanding the Project Structure

### 1. Project Overview

The Todo Terminal Manager is a sophisticated TypeScript application that demonstrates advanced architectural patterns through dual interfaces:
- **Terminal UI**: Rich blessed-based multi-panel interface
- **CLI Interface**: Comprehensive command-line tool with multiple output formats

#### Key Architecture Features:
- **Dual Interface Architecture**: Both CLI and Terminal UI share the same business logic
- **Atomic File Operations**: Prevents data corruption with temporary file operations
- **Comprehensive Testing**: Three specialized test scripts for different layers
- **TypeScript Throughout**: Strong typing and interfaces across all components

#### Project Structure:
```
todo-terminal-app/
├── src/
│   ├── models/           # Business logic and data models
│   │   ├── Todo.ts       # Todo interface and validation
│   │   └── TodoModel.ts  # CRUD operations and data management
│   ├── views/            # Terminal UI components (Blessed)
│   │   ├── TerminalUIApp.ts        # Main UI coordinator
│   │   ├── BlessedUIFramework.ts   # Panel management system
│   │   ├── TodoListPanel.ts        # Todo list display
│   │   ├── TodoDetailsPanel.ts     # Todo details view
│   │   ├── CommandInputPanel.ts    # Command input handling
│   │   └── StatusBarPanel.ts       # Status and help display
│   ├── cli/              # Command-line interface
│   │   ├── types.ts      # Command definitions and schemas
│   │   ├── parser.ts     # Argument parsing and validation
│   │   ├── controller.ts # Command execution logic
│   │   ├── help.ts       # Help system
│   │   └── index.ts      # CLI application entry
│   ├── controllers/      # Application controllers
│   │   └── TodoController.ts # Terminal UI event handling
│   ├── utils/            # Utility functions
│   │   └── storage.ts    # Atomic file operations
│   ├── test-model.ts     # Model layer testing
│   ├── test-view.ts      # Terminal UI testing
│   ├── test-cli.ts       # CLI interface testing
│   ├── terminal-ui.ts    # Terminal UI entry point
│   └── todo-cli.ts       # CLI entry point
├── data/                 # JSON data storage
└── package.json          # Dependencies and scripts
```

### 2. Design Patterns Analysis

Through comprehensive code analysis, we identified six major design patterns implemented in the Todo Terminal Manager:

#### 2.1 Model-View-Controller (MVC) Pattern

**Implementation Location**: Throughout the application architecture

**Description**: Clear separation between data (Model), presentation (View), and control logic (Controller).

**Code Example**:
```typescript
// Model: TodoModel.ts - Pure business logic
export class TodoModel {
  add(title: string): Todo {
    // Validation and data manipulation
    const newTodo: Todo = {
      id: uuidv4(),
      title: sanitizedTitle,
      completed: false,
      createdAt: now,
      updatedAt: now
    };
    this.todos.push(newTodo);
    this.saveTodos();
    return newTodo;
  }
}

// View: TerminalUIApp.ts - UI presentation logic
// Controller: CLIController.ts - Handles user input and coordinates Model/View
```

**Benefits**: 
- Clean separation of concerns
- Easy to test each layer independently
- Both CLI and Terminal UI can share the same Model

#### 2.2 Command Pattern

**Implementation Location**: `src/cli/controller.ts` and `src/cli/types.ts`

**Description**: Encapsulates requests as objects with a standard execution interface.

**Code Example**:
```typescript
// Command definitions in types.ts
export const CLI_COMMANDS: Record<string, CLICommand> = {
  add: {
    name: 'add',
    description: 'Add a new todo item',
    usage: 'todo add <title> [options]',
    arguments: [/*...*/],
    options: [/*...*/]
  }
};

// Command execution in controller.ts
async execute(parsedCommand: ParsedCommand): Promise<CLIResult> {
  switch (parsedCommand.command) {
    case 'add':
      return this.handleAdd(parsedCommand.arguments, parsedCommand.options);
    case 'list':
      return this.handleList(parsedCommand.arguments, parsedCommand.options);
    // ... other commands
  }
}
```

**Benefits**:
- Easy to add new commands
- Uniform command handling interface
- Commands are self-documenting with metadata

#### 2.3 Strategy Pattern

**Implementation Location**: CLI output formatting and UI panel types

**Description**: Allows selecting algorithm behavior at runtime.

**Code Example**:
```typescript
// Multiple output format strategies in CLIController
private formatOutput(todos: Todo[], format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(todos, null, 2);
    case 'simple':
      return todos.map(t => `${t.completed ? '✓' : '○'} ${t.title}`).join('\n');
    case 'table':
    default:
      return this.formatAsTable(todos);
  }
}
```

**Benefits**:
- Easy to add new output formats
- Runtime format selection
- Clean separation of formatting logic

#### 2.4 Factory Pattern

**Implementation Location**: `TodoModel.add()` method

**Description**: Creates objects with standardized initialization and validation.

**Code Example**:
```typescript
add(title: string): Todo {
  // Validation factory logic
  if (!TodoValidation.isValidTitle(title)) {
    throw new Error(`Invalid title. Must be between ${TodoValidation.MIN_TITLE_LENGTH} and ${TodoValidation.MAX_TITLE_LENGTH} characters.`);
  }

  // Standardized object creation
  const now = new Date();
  const newTodo: Todo = {
    id: uuidv4(),           // Auto-generated UUID
    title: sanitizedTitle,   // Sanitized input
    description: undefined,
    completed: false,        // Default state
    createdAt: now,         // Auto timestamp
    updatedAt: now
  };
  
  return newTodo;
}
```

**Benefits**:
- Consistent Todo object creation
- Centralized validation
- Automatic UUID generation

#### 2.5 Template Method Pattern

**Implementation Location**: `src/views/BlessedUIFramework.ts` UIPanel interface

**Description**: Defines the skeleton of panel behavior with standardized methods.

**Code Example**:
```typescript
export interface UIPanel {
  element: blessed.Widgets.BoxElement;
  type: PanelType;
  title: string;
  focusable: boolean;
  visible: boolean;
  
  // Template methods that all panels must implement
  focus(): void;
  blur(): void;
  show(): void;
  hide(): void;
  refresh(): void;
}
```

**Benefits**:
- Standardized panel interface
- Easy to add new panel types
- Consistent behavior across panels

#### 2.6 Module Pattern

**Implementation Location**: TypeScript module structure throughout the project

**Description**: Encapsulates functionality in separate modules with clear interfaces.

**Code Example**:
```typescript
// models/ - Data models and business logic
export { Todo, TodoValidation } from './Todo';
export { TodoModel } from './TodoModel';

// cli/ - Command-line interface components  
export { CLIController } from './controller';
export { CommandParser } from './parser';

// views/ - UI components
export { TerminalUIApp } from './TerminalUIApp';
export { UIPanel } from './BlessedUIFramework';
```

**Benefits**:
- Clear module boundaries
- Easy dependency management
- Reusable components

#### 2.7 Patterns NOT Implemented

**Observer Pattern**: The project deliberately does NOT use automatic UI updates. UI refresh is manual and explicit, which provides better control over when updates occur.

**Singleton Pattern**: Multiple TodoModel instances are allowed, which supports testing and flexibility.

This design choice simplifies the architecture while maintaining full functionality.

---

## Part 2: Analyzing the Model Layer

### 1. Data Management and Validation

#### 1.1 TodoModel CRUD Operations Implementation

The TodoModel class provides comprehensive CRUD operations with robust error handling:

**Create Operation**:
```typescript
add(title: string): Todo {
  // Comprehensive validation
  if (!TodoValidation.isValidTitle(title)) {
    throw new Error(`Invalid title. Must be between ${TodoValidation.MIN_TITLE_LENGTH} and ${TodoValidation.MAX_TITLE_LENGTH} characters.`);
  }

  const sanitizedTitle = TodoValidation.sanitizeTitle(title);

  // Standardized object creation with auto-generated fields
  const now = new Date();
  const newTodo: Todo = {
    id: uuidv4(),           // UUID v4 for uniqueness
    title: sanitizedTitle,   // Sanitized user input
    description: undefined,  // Optional field
    completed: false,        // Default state
    createdAt: now,         // Creation timestamp
    updatedAt: now          // Last modification timestamp
  };

  this.todos.push(newTodo);
  this.saveTodos();  // Atomic save after each operation
  return newTodo;
}
```

**Read Operations**:
```typescript
// Defensive copying prevents external mutation
getAll(): Todo[] {
  return this.todos.map(todo => ({ ...todo }));
}

getById(id: string): Todo | null {
  const todo = this.todos.find(t => t.id === id);
  return todo ? { ...todo } : null;
}

getByStatus(completed: boolean): Todo[] {
  return this.todos
    .filter(todo => todo.completed === completed)
    .map(todo => ({ ...todo }));
}
```

**Update Operations**:
```typescript
toggleComplete(id: string): Todo | null {
  const todo = this.todos.find(t => t.id === id);
  if (!todo) return null;

  todo.completed = !todo.completed;
  todo.updatedAt = new Date();  // Automatic timestamp update
  this.saveTodos();             // Immediate persistence
  return todo;
}

updateTitle(id: string, newTitle: string): Todo | null {
  // Re-validation on update
  if (!TodoValidation.isValidTitle(newTitle)) {
    throw new Error(`Invalid title. Must be between ${TodoValidation.MIN_TITLE_LENGTH} and ${TodoValidation.MAX_TITLE_LENGTH} characters.`);
  }
  // ... update logic with timestamp management
}
```

**Delete Operation**:
```typescript
delete(id: string): boolean {
  const initialLength = this.todos.length;
  this.todos = this.todos.filter(todo => todo.id !== id);
  
  const wasDeleted = this.todos.length < initialLength;
  if (wasDeleted) {
    this.saveTodos();  // Only save if deletion occurred
  }
  return wasDeleted;
}
```

#### 1.2 Validation Rules and TodoValidation

The validation system is centralized and comprehensive:

```typescript
export const TodoValidation = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 100,
  
  isValidTitle(title: string): boolean {
    return typeof title === 'string' && 
           title.trim().length >= this.MIN_TITLE_LENGTH && 
           title.trim().length <= this.MAX_TITLE_LENGTH;
  },
  
  sanitizeTitle(title: string): string {
    return title.trim();  // Remove leading/trailing whitespace
  }
} as const;
```

**Validation Benefits**:
- Centralized validation rules
- Consistent error messages
- Input sanitization
- Type safety with TypeScript

#### 1.3 Data Integrity with Atomic Operations

**Atomic Save Strategy**:
- Every CRUD operation immediately calls `saveTodos()`
- No in-memory state without persistence
- Prevents data loss scenarios

**Todo Interface Design**:
```typescript
export interface Todo {
  id: string;           // UUID v4 - globally unique
  title: string;        // 1-100 characters, required
  description?: string; // Optional field for future extension
  completed: boolean;   // Simple boolean state
  createdAt: Date;      // Auto-managed creation time
  updatedAt: Date;      // Auto-updated on modifications
}
```

#### 1.4 Date Object Management

**Creation and Update Timestamps**:
```typescript
// On creation
const now = new Date();
const newTodo: Todo = {
  // ... other fields
  createdAt: now,
  updatedAt: now
};

// On updates
todo.updatedAt = new Date();
```

**Date Serialization Handling**: The Storage class properly handles Date object serialization/deserialization:
```typescript
// Load converts string dates back to Date objects
return parsed.todos.map(todo => ({
  ...todo,
  createdAt: new Date(todo.createdAt),
  updatedAt: new Date(todo.updatedAt)
}));
```

#### 1.5 UUID Management

**Unique Identifier Generation**:
```typescript
import { v4 as uuidv4 } from 'uuid';

// Each todo gets a globally unique identifier
id: uuidv4()
```

**Benefits of UUID Strategy**:
- Globally unique across all instances
- No collision risk
- Enables distributed systems
- Independent of sequential numbering

### 2. Storage and Persistence

#### 2.1 Atomic File Operations with Storage Class

The Storage class implements sophisticated atomic file operations to prevent data corruption:

**Atomic Write Strategy**:
```typescript
save(todos: Todo[]): void {
  try {
    // Prepare data in versioned format
    const data: TodoStorageFormat = {
      version: this.version,
      todos: todos
    };

    // Ensure directory exists
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    // ATOMIC OPERATION: Write to temporary file first
    const tempFile = `${this.filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    
    // ATOMIC OPERATION: Rename temp file to final file
    fs.renameSync(tempFile, this.filePath);
  } catch (error) {
    throw new Error(`Failed to save todos: ${error}`);
  }
}
```

**Why Atomic Operations Matter**:
- **Prevents Corruption**: If process crashes during write, original file remains intact
- **All-or-Nothing**: Either complete file is written or nothing changes
- **OS-Level Atomicity**: `fs.renameSync()` is atomic at filesystem level
- **Concurrent Access Safe**: Other processes won't read partial writes

#### 2.2 TodoStorageFormat Interface and Versioning

**Storage Format Structure**:
```typescript
interface TodoStorageFormat {
  version: string;  // Future schema evolution support
  todos: Todo[];
}

// Example JSON output:
{
  "version": "1.0.0",
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": undefined,
      "completed": false,
      "createdAt": "2025-09-28T10:30:00.000Z",
      "updatedAt": "2025-09-28T10:30:00.000Z"
    }
  ]
}
```

**Versioning Strategy Benefits**:
- Future schema migration support
- Backward compatibility checking
- Clear data format identification

#### 2.3 Error Scenario Handling

The Storage class handles multiple error scenarios:

**File Permission Errors**:
```typescript
canWrite(): boolean {
  try {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
```

**File Existence Checking**:
```typescript
exists(): boolean {
  try {
    fs.accessSync(this.filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
```

**Graceful Load Handling**:
```typescript
load(): Todo[] {
  try {
    if (!fs.existsSync(this.filePath)) {
      return [];  // New installation - empty array
    }

    const data = fs.readFileSync(this.filePath, 'utf-8');
    const parsed: TodoStorageFormat = JSON.parse(data);
    
    // Convert string dates back to Date objects
    return parsed.todos.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }));
  } catch (error) {
    console.warn('Failed to load todos from file:', error);
    return [];  // Graceful degradation
  }
}
```

#### 2.4 Date Serialization/Deserialization

**Challenge**: JavaScript Date objects don't serialize naturally to JSON

**Solution**: Explicit conversion during load/save:
```typescript
// During save - dates automatically become ISO strings
JSON.stringify(data, null, 2)

// During load - convert strings back to Date objects
return parsed.todos.map(todo => ({
  ...todo,
  createdAt: new Date(todo.createdAt),
  updatedAt: new Date(todo.updatedAt)
}));
```

#### 2.5 Path Resolution and Directory Creation

**Flexible Path Handling**:
```typescript
constructor(filePath: string = './data/todos.json') {
  this.filePath = path.resolve(filePath);  // Convert to absolute path
}
```

**Automatic Directory Creation**:
```typescript
const dir = path.dirname(this.filePath);
fs.mkdirSync(dir, { recursive: true });  // Create parent directories
```

#### 2.6 Dual Interface Storage Safety

**Shared Storage Strategy**:
- Both CLI and Terminal UI use the same Storage class
- Same TodoModel instantiation pattern
- Configurable storage paths for testing

**Example Usage**:
```typescript
// CLI Controller
const model = new TodoModel(storagePath);  // Optional path

// Terminal UI
const todoModel = new TodoModel();  // Default path

// Testing
const testModel = new TodoModel('./data/test-todos.json');
```

**Safety Guarantees**:
- No concurrent write conflicts (single-process)
- Atomic operations prevent partial writes
- Graceful fallback to empty state on corruption

### 3. Business Logic Separation

#### 3.1 TodoModel: Pure Business Logic

The TodoModel contains pure business logic without any UI dependencies:

**No UI Dependencies**:
```typescript
// TodoModel.ts - NO imports of UI libraries
import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoValidation } from './Todo';
import { Storage } from '../utils/storage';

// Pure business operations
export class TodoModel {
  add(title: string): Todo { /* pure logic */ }
  delete(id: string): boolean { /* pure logic */ }
  toggleComplete(id: string): Todo | null { /* pure logic */ }
  // No console.log, no UI updates, no user interaction
}
```

**Testable in Isolation**:
```typescript
// From test-model.ts - can test without UI
const model = new TodoModel('./data/test-todos.json');
const todo = model.add('Test todo');
assert(todo.title === 'Test todo');
assert(todo.completed === false);
```

#### 3.2 UI Controllers Handle UI-Specific Concerns

**CLI Controller Handles CLI Concerns**:
```typescript
// CLIController.ts - handles CLI-specific formatting and output
private handleAdd(args: Record<string, any>, options: Record<string, any>): CLIResult {
  try {
    const todo = this.model.add(args.title);  // Delegate to model
    
    // CLI-specific response formatting
    return {
      success: true,
      message: `Todo added successfully!`,
      data: {
        id: todo.id,
        title: todo.title,
        created: todo.createdAt.toLocaleString()  // UI formatting
      }
    };
  } catch (error) {
    // CLI-specific error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add todo'
    };
  }
}
```

**Terminal UI Handles Blessed-Specific Concerns**:
```typescript
// TerminalUIApp.ts - handles blessed UI updates
private async handleCommand(command: string): Promise<void> {
  try {
    if (cmd === 'add') {
      const title = args.join(' ');
      this.todoModel.add(title);  // Delegate to model
      
      // UI-specific updates
      this.refreshTodoList();
      this.statusBarPanel.showMessage(`Added todo: "${title}"`);
    }
  } catch (error) {
    // UI-specific error display
    this.statusBarPanel.showError(error.message);
  }
}
```

#### 3.3 Validation Error Propagation

**Model Throws Typed Errors**:
```typescript
add(title: string): Todo {
  if (!TodoValidation.isValidTitle(title)) {
    throw new Error(`Invalid title. Must be between ${TodoValidation.MIN_TITLE_LENGTH} and ${TodoValidation.MAX_TITLE_LENGTH} characters.`);
  }
  // ... rest of logic
}
```

**CLI Interface Handles Errors**:
```typescript
try {
  const todo = this.model.add(title);
  return { success: true, message: `Todo added successfully!` };
} catch (error) {
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Failed to add todo'
  };
}
```

**Terminal UI Handles Errors**:
```typescript
try {
  this.todoModel.add(title);
  this.statusBarPanel.showMessage(`Added todo: "${title}"`);
} catch (error) {
  this.statusBarPanel.showError(error.message);
}
```

#### 3.4 Storage Abstraction Layer

The Storage abstraction isolates persistence concerns:

**TodoModel Uses Storage Interface**:
```typescript
export class TodoModel {
  private storage: Storage;
  
  constructor(storagePath?: string) {
    this.storage = new Storage(storagePath);  // Dependency injection
  }
  
  private saveTodos(): void {
    this.storage.save(this.todos);  // Abstract storage operation
  }
}
```

**Easy to Replace Storage Implementation**:
```typescript
// Current: JSON file storage
class Storage {
  save(todos: Todo[]): void { /* JSON file operations */ }
  load(): Todo[] { /* JSON file operations */ }
}

// Future: Database storage
class DatabaseStorage {
  save(todos: Todo[]): void { /* Database operations */ }
  load(): Todo[] { /* Database operations */ }
}
```

#### 3.5 Database Migration Considerations

**What Would Change**:

**TodoModel**: Minimal changes
```typescript
// Only constructor would change
constructor(storage: StorageInterface) {
  this.storage = storage;  // Accept any storage implementation
}
```

**Storage Layer**: Complete replacement
```typescript
// New database storage implementation
class DatabaseStorage implements StorageInterface {
  constructor(private connectionString: string) {}
  
  async save(todos: Todo[]): Promise<void> {
    // Database persistence logic
  }
  
  async load(): Promise<Todo[]> {
    // Database query logic
  }
}
```

**Controllers**: No changes needed
```typescript
// Controllers remain unchanged - they only call TodoModel methods
const todo = this.model.add(title);  // Same interface
```

#### 3.6 Independent Model Validation

The test-model.ts demonstrates TodoModel independence:

```typescript
// Works without any UI framework
import { TodoModel } from './models/TodoModel';

const model = new TodoModel('./data/test-todos.json');
const todo1 = model.add('Buy groceries');
const todo2 = model.add('Write report');

console.log(`Total todos: ${model.getCount()}`);
console.log(`Completed: ${model.getCompletedCount()}`);

model.toggleComplete(todo1.id);
assert(model.getById(todo1.id)?.completed === true);
```

**This Independence Enables**:
- Unit testing without UI
- CLI and Terminal UI sharing the same logic
- Easy integration with future interfaces (web, mobile, API)
- Business logic reuse across different applications

---

## Part 3: Analyzing the Terminal UI (Blessed Interface)

### 1. Panel Architecture

#### 1.1 BlessedUIFramework: Central Coordination System

The BlessedUIFramework serves as the central coordinator for the multi-panel interface:

**Framework Initialization**:
```typescript
export class BlessedUIFramework {
  private screen!: blessed.Widgets.Screen;
  private panels: Map<PanelType, UIPanel> = new Map();
  private currentPanel: PanelType = PanelType.TODO_LIST;
  private layout!: LayoutConfig;
  private theme!: UITheme;

  constructor() {
    this.initializeTheme();
    this.initializeLayout();
    this.initializeScreen();
  }
}
```

**Panel Management System**:
```typescript
registerPanel(panel: UIPanel): void {
  this.panels.set(panel.type, panel);
  
  // Add panel element to screen
  this.screen.append(panel.element);
  
  // Set up panel-specific event handlers
  this.setupPanelEventHandlers(panel);
}
```

#### 1.2 UIPanel Interface: Standardized Panel Contract

All panels implement the UIPanel interface for consistency:

```typescript
export interface UIPanel {
  element: blessed.Widgets.BoxElement;
  type: PanelType;
  title: string;
  focusable: boolean;
  visible: boolean;
  
  // Standardized lifecycle methods
  focus(): void;
  blur(): void;
  show(): void;
  hide(): void;
  refresh(): void;
}
```

**Benefits of UIPanel Interface**:
- Uniform behavior across all panels
- Easy to add new panel types
- Consistent focus management
- Standardized lifecycle management

#### 1.3 Four Core Panels Implementation

**TodoListPanel - Main List Display**:
```typescript
export class TodoListPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.TODO_LIST;
  title: string = 'Todo List';
  focusable: boolean = true;
  visible: boolean = true;

  private list!: blessed.Widgets.ListElement;
  private todos: Todo[] = [];
  private selectedIndex: number = 0;
  
  // Rich display with scrolling and selection
  private initializeElement(): void {
    this.list = blessed.list({
      parent: this.element,
      items: [],
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█',
        style: { bg: theme.secondary }
      }
    });
  }
}
```

**TodoDetailsPanel - Detail View with Editing**:
```typescript
export class TodoDetailsPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.DETAILS;
  
  private currentTodo: Todo | null = null;
  private editMode: boolean = false;
  private editForm: {
    titleInput?: blessed.Widgets.TextareaElement;
    descriptionInput?: blessed.Widgets.TextareaElement;
    saveButton?: blessed.Widgets.BoxElement;
    cancelButton?: blessed.Widgets.BoxElement;
  } = {};
  
  // Supports both view and edit modes
  enterEditMode(): void {
    if (!this.currentTodo) return;
    this.editMode = true;
    this.renderEditForm();
  }
}
```

**CommandInputPanel - Interactive Command Input**:
```typescript
export class CommandInputPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.COMMAND_INPUT;
  
  private inputBox!: blessed.Widgets.TextboxElement;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  private onCommand?: (command: string) => void;
  
  // Command execution with history support
  private executeCommand(command: string): void {
    // Add to history
    if (this.commandHistory[this.commandHistory.length - 1] !== command) {
      this.commandHistory.push(command);
    }
    
    if (this.onCommand) {
      this.onCommand(command);
    }
  }
}
```

**StatusBarPanel - Status and Statistics Display**:
```typescript
export class StatusBarPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.STATUS;
  focusable: boolean = false;  // Status bar is not focusable
  
  private stats: {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
  } = { total: 0, completed: 0, pending: 0, percentage: 0 };
  
  updateStats(total: number, completed: number): void {
    this.stats = {
      total,
      completed,
      pending: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
    this.updateStatusDisplay();
  }
}
```

#### 1.4 TerminalUIApp: Application Coordinator

The TerminalUIApp coordinates all panels and provides the main application logic:

```typescript
export class TerminalUIApp {
  private framework: BlessedUIFramework;
  private todoModel: TodoModel;
  
  // Panels
  private todoListPanel: TodoListPanel;
  private detailsPanel: TodoDetailsPanel;
  private commandInputPanel: CommandInputPanel;
  private statusBarPanel: StatusBarPanel;

  constructor() {
    this.framework = new BlessedUIFramework();
    this.todoModel = new TodoModel();
    
    // Initialize panels
    this.todoListPanel = new TodoListPanel(this.framework);
    this.detailsPanel = new TodoDetailsPanel(this.framework);
    this.commandInputPanel = new CommandInputPanel(this.framework);
    this.statusBarPanel = new StatusBarPanel(this.framework);

    this.setupPanels();
    this.setupEventHandlers();
    this.loadInitialData();
  }
  
  private setupPanels(): void {
    this.framework.registerPanel(this.todoListPanel);
    this.framework.registerPanel(this.detailsPanel);
    this.framework.registerPanel(this.commandInputPanel);
    this.framework.registerPanel(this.statusBarPanel);

    // Set initial focus to todo list
    this.framework.switchToPanel(PanelType.TODO_LIST);
  }
}
```

#### 1.5 Panel Communication Patterns

**Inter-Panel Communication Through TerminalUIApp**:
```typescript
private setupEventHandlers(): void {
  // Todo list selection changes update details panel
  this.todoListPanel.onSelectionChanged((todo, index) => {
    this.detailsPanel.displayTodo(todo);
    if (todo) {
      this.statusBarPanel.showPanelInfo(
        `Todo ${index + 1}/${this.todoModel.getAll().length}`,
        `${todo.title} - Press 'e' to edit, space to toggle`
      );
    }
  });

  // Details panel updates refresh todo list
  this.detailsPanel.onTodoUpdate(() => {
    this.refreshAllData();
    this.statusBarPanel.showMessage('Todo updated successfully!', 'success');
  });

  // Command input executes business logic
  this.commandInputPanel.onCommandExecuted((command) => {
    this.handleCommand(command);
  });
}
```

#### 1.6 Focus Management System

**Automatic Focus Management**:
```typescript
switchToPanel(panelType: PanelType): void {
  const panel = this.panels.get(panelType);
  
  if (!panel || !panel.focusable) {
    return;
  }

  // Blur current panel
  const currentPanel = this.panels.get(this.currentPanel);
  if (currentPanel) {
    currentPanel.blur();
  }

  // Focus new panel
  this.currentPanel = panelType;
  panel.focus();
  this.updatePanelBorders();  // Visual feedback
  this.render();
}
```

**Keyboard Navigation**:
```typescript
// Tab and Shift+Tab for panel switching
this.screen.key(['tab'], () => {
  this.switchToNextPanel();
});

this.screen.key(['S-tab'], () => {
  this.switchToPreviousPanel();
});

// Function keys for direct panel access
this.screen.key(['f1'], () => {
  this.switchToPanel(PanelType.TODO_LIST);
});
```

### 2. Event Handling

#### 2.1 Multi-Layer Event Architecture

The Terminal UI uses a sophisticated multi-layer event handling system:

**Layer 1: Global Screen Events**
```typescript
// BlessedUIFramework - Global key handlers
private setupGlobalKeyHandlers(): void {
  // Application control
  this.screen.key(['C-c', 'q'], () => {
    this.quit();
  });

  // Panel navigation
  this.screen.key(['tab'], () => {
    this.switchToNextPanel();
  });

  this.screen.key(['S-tab'], () => {
    this.switchToPreviousPanel();
  });

  // Direct panel access
  this.screen.key(['f1'], () => {
    this.switchToPanel(PanelType.TODO_LIST);
  });
}
```

**Layer 2: Panel-Specific Events**
```typescript
// TodoListPanel - List-specific key handling
private setupEventHandlers(): void {
  // Item selection
  this.list.on('select', (item, index) => {
    this.selectedIndex = index;
    const todo = this.todos[index];
    if (this.onSelectionChange) {
      this.onSelectionChange(todo, index);
    }
  });

  // Action keys
  this.list.key(['space'], () => {
    const selectedTodo = this.getSelectedTodo();
    if (selectedTodo && this.onAction) {
      this.onAction('toggle', selectedTodo, this.selectedIndex);
    }
  });

  this.list.key(['d'], () => {
    const selectedTodo = this.getSelectedTodo();
    if (selectedTodo && this.onAction) {
      this.onAction('delete', selectedTodo, this.selectedIndex);
    }
  });
}
```

**Layer 3: Application Logic Events**
```typescript
// TerminalUIApp - Business logic event handling
private setupEventHandlers(): void {
  // Todo list events
  this.todoListPanel.onSelectionChanged((todo, index) => {
    this.detailsPanel.displayTodo(todo);
    this.updateStatusForSelection(todo, index);
  });

  this.todoListPanel.onActionTriggered((action, todo, index) => {
    this.handleTodoAction(action, todo, index);
  });

  // Command input events
  this.commandInputPanel.onCommandExecuted((command) => {
    this.handleCommand(command);
  });

  // Details panel events
  this.detailsPanel.onTodoUpdate((updatedTodo) => {
    this.refreshAllData();
    this.statusBarPanel.showMessage('Todo updated successfully!', 'success');
  });
}
```

#### 2.2 Event Flow: Key Press to Model Update

**Complete Event Flow Example - Toggle Todo Completion**:
```typescript
// 1. Global key handler captures space key
screen.key(['space'], () => {
  if (this.framework.getCurrentPanel() === PanelType.TODO_LIST) {
    const selectedTodo = this.todoListPanel.getSelectedTodo();
    if (selectedTodo) {
      this.toggleTodoCompletion(selectedTodo);  // Step 2
    }
  }
});

// 2. TerminalUIApp handles the business logic
private toggleTodoCompletion(todo: Todo): void {
  try {
    const updated = this.todoModel.toggleComplete(todo.id);  // Step 3: Model update
    if (updated) {
      this.refreshAllData();  // Step 4: UI refresh
      this.statusBarPanel.showMessage(
        `Todo "${updated.title}" marked as ${updated.completed ? 'completed' : 'pending'}`,
        'success'
      );
    }
  } catch (error) {
    this.statusBarPanel.showError(`Failed to toggle todo: ${error.message}`);
  }
}

// 3. Model update (atomic save)
toggleComplete(id: string): Todo | null {
  const todo = this.todos.find(t => t.id === id);
  if (!todo) return null;

  todo.completed = !todo.completed;
  todo.updatedAt = new Date();
  this.saveTodos();  // Immediate persistence
  return todo;
}

// 4. UI refresh across all panels
private refreshAllData(): void {
  const todos = this.todoModel.getAll();
  
  // Update todo list
  this.todoListPanel.setTodos(todos);
  
  // Update details if current todo changed
  const currentTodo = this.todoListPanel.getSelectedTodo();
  if (currentTodo) {
    const updated = this.todoModel.getById(currentTodo.id);
    if (updated) {
      this.detailsPanel.displayTodo(updated);
    }
  }
  
  // Update statistics
  this.statusBarPanel.updateStats(todos.length, todos.filter(t => t.completed).length);
  
  this.framework.render();
}
```

#### 2.3 Command Input Event Handling

**Command Processing Pipeline**:
```typescript
// CommandInputPanel - Command input processing
private setupEventHandlers(): void {
  // Command submission on Enter
  this.inputBox.key(['enter'], () => {
    const command = this.inputBox.getValue().trim();
    if (command) {
      this.executeCommand(command);  // Step 1
      this.inputBox.clearValue();
    }
  });

  // History navigation
  this.inputBox.key(['up'], () => {
    this.navigateHistory(-1);
  });

  this.inputBox.key(['down'], () => {
    this.navigateHistory(1);
  });

  // Tab completion
  this.inputBox.key(['tab'], () => {
    this.handleTabCompletion();
  });
}

// TerminalUIApp - Command execution
private async handleCommand(command: string): Promise<void> {
  try {
    this.statusBarPanel.showLoading('Executing command');
    
    // Simple command parsing and execution
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
      case 'add':
        if (args.length === 0) {
          throw new Error('Please provide a title for the todo');
        }
        const title = args.join(' ');
        this.todoModel.add(title);  // Model operation
        result = `Added todo: "${title}"`;
        break;
        
      case 'complete':
        const index = parseInt(args[0]) - 1;
        const todos = this.todoModel.getAll();
        if (index >= 0 && index < todos.length) {
          this.todoModel.toggleComplete(todos[index].id);
          result = `Completed todo: "${todos[index].title}"`;
        }
        break;
        
      // ... other commands
    }
    
    // Update UI after command execution
    this.refreshAllData();
    this.statusBarPanel.showMessage(result, 'success');
    
  } catch (error) {
    this.statusBarPanel.showError(`Command failed: ${error.message}`);
  }
}
```

#### 2.4 TodoController vs TerminalUIApp Event Handling

**TodoController (Simple UI)**:
```typescript
// TodoController.ts - Simple blessed UI with basic event handling
export class TodoController {
  private model: TodoModel;
  private view: TodoView;

  private setupEventHandlers(): void {
    const screen = this.view.getScreen();
    
    // Simple key mappings
    screen.key(['a'], () => {
      this.handleAdd();  // Direct method calls
    });

    screen.key(['d'], () => {
      this.handleDelete();
    });

    screen.key(['space'], () => {
      this.handleToggleComplete();
    });
  }
}
```

**TerminalUIApp (Advanced Multi-Panel UI)**:
```typescript
// TerminalUIApp.ts - Sophisticated event routing through panels
export class TerminalUIApp {
  private setupEventHandlers(): void {
    // Event delegation to appropriate panels
    this.todoListPanel.onSelectionChanged((todo, index) => {
      // Cross-panel communication
      this.detailsPanel.displayTodo(todo);
      this.statusBarPanel.showPanelInfo(/*...*/);
    });

    this.commandInputPanel.onCommandExecuted((command) => {
      // Command pattern execution
      this.handleCommand(command);
    });
    
    // Global key handlers coordinate with panel-specific handlers
    this.setupKeyBindings();
  }
}
```

**Key Differences**:
- **TodoController**: Direct method calls, simple key mappings
- **TerminalUIApp**: Event delegation, cross-panel communication, command pattern

### 3. State Synchronization

#### 3.1 Manual Refresh Pattern (No Observer Pattern)

The Terminal UI deliberately uses manual refresh patterns instead of automatic observation:

**Why Manual Refresh?**
- **Explicit Control**: Developers control exactly when UI updates occur
- **Performance**: No overhead from automatic change detection
- **Predictability**: Clear understanding of when and why UI updates
- **Simplicity**: No complex observer management or memory leaks

#### 3.2 UI Refresh After Data Changes

**Central Refresh Method**:
```typescript
// TerminalUIApp - Centralized data refresh
private refreshAllData(): void {
  const todos = this.todoModel.getAll();
  
  // Update all panels with fresh data
  this.todoListPanel.setTodos(todos);
  
  // Maintain current selection context
  const currentTodo = this.todoListPanel.getSelectedTodo();
  if (currentTodo) {
    const updated = this.todoModel.getById(currentTodo.id);
    if (updated) {
      this.detailsPanel.displayTodo(updated);
    } else {
      // Todo was deleted, clear details
      this.detailsPanel.showEmptyState();
    }
  }
  
  // Update statistics
  const completedCount = todos.filter(t => t.completed).length;
  this.statusBarPanel.updateStats(todos.length, completedCount);
  
  // Force screen re-render
  this.framework.render();
}
```

**Trigger Points for Refresh**:
```typescript
// After model operations
private async addTodo(title: string): Promise<void> {
  try {
    const newTodo = this.todoModel.add(title);  // Model change
    this.refreshAllData();                      // UI sync
    this.statusBarPanel.showMessage(`Added: "${newTodo.title}"`, 'success');
  } catch (error) {
    this.statusBarPanel.showError(`Failed to add todo: ${error.message}`);
  }
}

private deleteTodo(todo: Todo): void {
  try {
    const deleted = this.todoModel.delete(todo.id);  // Model change
    if (deleted) {
      this.refreshAllData();                          // UI sync
      this.statusBarPanel.showMessage(`Deleted: "${todo.title}"`, 'success');
    }
  } catch (error) {
    this.statusBarPanel.showError(`Failed to delete todo: ${error.message}`);
  }
}
```

#### 3.3 CLI vs Terminal UI Notification Differences

**CLI Interface Notifications**:
```typescript
// CLIController - Immediate output to console
private handleAdd(args: Record<string, any>): CLIResult {
  try {
    const todo = this.model.add(args.title);
    return {
      success: true,
      message: `Todo added successfully!`,
      data: {
        id: todo.id,
        title: todo.title,
        created: todo.createdAt.toLocaleString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add todo'
    };
  }
}
```

**Terminal UI Notifications**:
```typescript
// StatusBarPanel - Persistent visual feedback
showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
  const theme = this.framework.getTheme();
  const color = {
    info: theme.text,
    success: theme.success,
    warning: theme.warning,
    error: theme.error
  }[type];

  const content = `{${color}-fg}${message}{/${color}-fg}`;
  this.statusText.setContent(content);
  this.framework.render();

  // Auto-clear after delay for non-error messages
  if (type !== 'error') {
    setTimeout(() => {
      this.showDefaultStatus();
    }, 3000);
  }
}

showLoading(message: string): void {
  const content = `{yellow-fg}⏳ ${message}...{/yellow-fg}`;
  this.statusText.setContent(content);
  this.framework.render();
}
```

#### 3.4 Atomic File Storage Preventing Data Corruption

**Atomic Storage Operations**:
```typescript
// Storage.ts - Atomic write operations
save(todos: Todo[]): void {
  try {
    const data: TodoStorageFormat = {
      version: this.version,
      todos: todos
    };

    // Create directory if needed
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    // ATOMIC OPERATION: Write to temp file first
    const tempFile = `${this.filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    
    // ATOMIC OPERATION: Rename temp to final
    fs.renameSync(tempFile, this.filePath);
    
  } catch (error) {
    throw new Error(`Failed to save todos: ${error}`);
  }
}
```

**Data Corruption Prevention**:
- **Temporary File Strategy**: Write to `.tmp` file first
- **Atomic Rename**: `fs.renameSync()` is atomic at OS level
- **All-or-Nothing**: Either complete file is written or nothing changes
- **Process Crash Safety**: Original file remains intact if process crashes during write

#### 3.5 CommandInputPanel User Feedback

The CommandInputPanel provides rich user feedback:

**Command History Management**:
```typescript
private executeCommand(command: string): void {
  // Add to history (avoid duplicates)
  if (this.commandHistory[this.commandHistory.length - 1] !== command) {
    this.commandHistory.push(command);
    
    // Limit history size
    if (this.commandHistory.length > 100) {
      this.commandHistory.shift();
    }
  }
  this.historyIndex = -1;

  // Execute command
  if (this.onCommand) {
    this.onCommand(command);
  }

  // Show feedback
  this.showFeedback(`Executed: ${command}`);
}
```

**Interactive Feedback**:
```typescript
private showFeedback(message: string, duration: number = 2000): void {
  // Store original value and show feedback
  const originalValue = this.inputBox.getValue();
  this.inputBox.setValue(`[${message}]`);
  this.framework.render();

  setTimeout(() => {
    this.inputBox.setValue(originalValue);
    this.framework.render();
  }, duration);
}

private handleTabCompletion(): void {
  const currentValue = this.inputBox.getValue();
  const availableCommands = ['add', 'list', 'complete', 'remove', 'edit', 'stats', 'help'];
  
  const matches = availableCommands.filter(cmd => 
    cmd.startsWith(currentValue.toLowerCase())
  );
  
  if (matches.length === 1) {
    this.inputBox.setValue(matches[0] + ' ');
  } else if (matches.length > 1) {
    this.showCompletionOptions(matches);
  }
}
```

#### 3.6 Manual Refresh Patterns in Practice

**Refresh Triggers**:
```typescript
// 1. After every model operation
private async toggleTodoCompletion(todo: Todo): Promise<void> {
  const updated = this.todoModel.toggleComplete(todo.id);
  this.refreshAllData();  // Manual refresh
  // Show user feedback
}

// 2. After command execution
private async handleCommand(command: string): Promise<void> {
  // ... execute command
  this.refreshAllData();  // Manual refresh
  // Update status
}

// 3. On user request (F5 key)
screen.key(['f5'], () => {
  this.refreshAllData();
  this.statusBarPanel.showMessage('Data refreshed', 'info');
});

// 4. On panel focus changes (to ensure fresh data)
panel.element.on('focus', () => {
  this.currentPanel = panel.type;
  this.refreshPanelData(panel);  // Selective refresh
  this.updatePanelBorders();
  this.render();
});
```

**Benefits of Manual Refresh**:
- **Clear Intent**: Every refresh is intentional and documented
- **Performance Control**: No unnecessary updates
- **Debugging Ease**: Clear cause-and-effect relationship
- **Memory Efficiency**: No observer objects to manage

### 4. Component Composition

#### 4.1 UIPanel Interface Implementation Across Components

All four panels implement the UIPanel interface with specialized behavior:

**TodoListPanel Implementation**:
```typescript
export class TodoListPanel implements UIPanel {
  // Required UIPanel properties
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.TODO_LIST;
  title: string = 'Todo List';
  focusable: boolean = true;
  visible: boolean = true;

  // UIPanel lifecycle methods
  focus(): void {
    this.list.focus();
    this.element.style.border.fg = this.framework.getTheme().accent;
    this.framework.render();
  }

  blur(): void {
    this.element.style.border.fg = this.framework.getTheme().border;
    this.framework.render();
  }

  show(): void {
    this.visible = true;
    this.element.show();
    this.framework.render();
  }

  hide(): void {
    this.visible = false;
    this.element.hide();
    this.framework.render();
  }

  refresh(): void {
    this.updateTodoDisplay();
    this.framework.render();
  }
}
```

**TodoDetailsPanel Implementation**:
```typescript
export class TodoDetailsPanel implements UIPanel {
  // Required UIPanel properties
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.DETAILS;
  title: string = 'Todo Details';
  focusable: boolean = true;
  visible: boolean = true;

  // Specialized properties
  private editMode: boolean = false;
  private currentTodo: Todo | null = null;

  // UIPanel methods with editing context
  focus(): void {
    if (this.editMode) {
      this.editForm.titleInput?.focus();
    } else {
      this.element.focus();
    }
    this.updateBorderStyle('focused');
  }

  refresh(): void {
    if (this.currentTodo) {
      this.renderTodoDetails();
    } else {
      this.showEmptyState();
    }
    this.framework.render();
  }
}
```

**CommandInputPanel Implementation**:
```typescript
export class CommandInputPanel implements UIPanel {
  // Required UIPanel properties
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.COMMAND_INPUT;
  title: string = 'Command Input';
  focusable: boolean = true;
  visible: boolean = true;

  // Specialized properties
  private commandHistory: string[] = [];
  private historyIndex: number = -1;

  // UIPanel methods with input focus
  focus(): void {
    this.inputBox.focus();  // Focus on input textbox
    this.updateBorderStyle('focused');
  }

  blur(): void {
    this.inputBox.blur();
    this.updateBorderStyle('normal');
  }

  refresh(): void {
    this.inputBox.clearValue();
    this.framework.render();
  }
}
```

**StatusBarPanel Implementation**:
```typescript
export class StatusBarPanel implements UIPanel {
  // Required UIPanel properties
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.STATUS;
  title: string = 'Status';
  focusable: boolean = false;  // Status bar is not focusable
  visible: boolean = true;

  // UIPanel methods (simplified for status bar)
  focus(): void {
    // Status bar doesn't receive focus
  }

  blur(): void {
    // Status bar doesn't lose focus
  }

  show(): void {
    this.visible = true;
    this.element.show();
    this.framework.render();
  }

  hide(): void {
    this.visible = false;
    this.element.hide();
    this.framework.render();
  }

  refresh(): void {
    this.updateStatusDisplay();
    this.framework.render();
  }
}
```

#### 4.2 Standardized Properties and Methods

**Common Properties Across All Panels**:
```typescript
export interface UIPanel {
  // Core identification
  element: blessed.Widgets.BoxElement;  // Blessed widget reference
  type: PanelType;                      // Panel type identifier
  title: string;                        // Display title
  
  // Behavior flags
  focusable: boolean;                   // Can receive keyboard focus
  visible: boolean;                     // Currently visible on screen
  
  // Lifecycle methods
  focus(): void;                        // Handle gaining focus
  blur(): void;                         // Handle losing focus
  show(): void;                         // Make panel visible
  hide(): void;                         // Hide panel from view
  refresh(): void;                      // Update panel content
}
```

**Benefits of Standardization**:
- **Uniform Behavior**: All panels respond to lifecycle events consistently
- **Framework Integration**: BlessedUIFramework can manage any panel type
- **Easy Testing**: Standard interface enables consistent testing approaches
- **Type Safety**: TypeScript ensures all required methods are implemented

#### 4.3 BlessedUIFramework Panel Management

**Panel Registration and Coordination**:
```typescript
export class BlessedUIFramework {
  private panels: Map<PanelType, UIPanel> = new Map();
  private currentPanel: PanelType = PanelType.TODO_LIST;

  registerPanel(panel: UIPanel): void {
    this.panels.set(panel.type, panel);
    
    // Add panel element to screen
    this.screen.append(panel.element);
    
    // Set up panel-specific event handlers
    this.setupPanelEventHandlers(panel);
  }

  private setupPanelEventHandlers(panel: UIPanel): void {
    // Focus events
    panel.element.on('focus', () => {
      this.currentPanel = panel.type;
      this.updatePanelBorders();
      this.render();
    });

    // Key events for panel switching
    panel.element.key(['escape'], () => {
      if (panel.type !== PanelType.TODO_LIST) {
        this.switchToPanel(PanelType.TODO_LIST);
      }
    });
  }

  // Generic panel operations
  refreshAllPanels(): void {
    this.panels.forEach(panel => {
      if (panel.visible) {
        panel.refresh();
      }
    });
  }

  getCurrentPanel(): PanelType {
    return this.currentPanel;
  }
}
```

#### 4.4 PanelType Enum for Panel Identification

**Panel Type Enumeration**:
```typescript
export enum PanelType {
  TODO_LIST = 'todoList',
  DETAILS = 'details', 
  COMMAND_INPUT = 'commandInput',
  STATUS = 'status'
}
```

**Usage in Panel Management**:
```typescript
// Type-safe panel switching
switchToPanel(panelType: PanelType): void {
  const panel = this.panels.get(panelType);
  
  if (!panel || !panel.focusable) {
    return;
  }

  // Panel-specific focus logic
  switch (panelType) {
    case PanelType.TODO_LIST:
      this.focusTodoList();
      break;
    case PanelType.DETAILS:
      this.focusDetails();
      break;
    case PanelType.COMMAND_INPUT:
      this.focusCommandInput();
      break;
  }
}

// Panel navigation sequences
private switchToNextPanel(): void {
  const panelOrder = [
    PanelType.TODO_LIST,
    PanelType.DETAILS,
    PanelType.COMMAND_INPUT
  ];
  
  const currentIndex = panelOrder.indexOf(this.currentPanel);
  const nextIndex = (currentIndex + 1) % panelOrder.length;
  
  this.switchToPanel(panelOrder[nextIndex]);
}
```

#### 4.5 Adding a New Panel (Statistics Panel Example)

To add a new StatisticsPanel, implement the UIPanel interface:

```typescript
export class StatisticsPanel implements UIPanel {
  // Required UIPanel properties
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.STATISTICS;  // New panel type
  title: string = 'Statistics';
  focusable: boolean = true;
  visible: boolean = true;

  // Specialized properties
  private statsData: {
    totalTodos: number;
    completedTodos: number;
    pendingTodos: number;
    completionRate: number;
    todayAdded: number;
    todayCompleted: number;
  } = {
    totalTodos: 0,
    completedTodos: 0,
    pendingTodos: 0,
    completionRate: 0,
    todayAdded: 0,
    todayCompleted: 0
  };

  constructor(framework: BlessedUIFramework) {
    this.framework = framework;
    this.initializeElement();
    this.setupEventHandlers();
  }

  // UIPanel implementation
  focus(): void {
    this.element.focus();
    this.updateBorderStyle('focused');
  }

  blur(): void {
    this.updateBorderStyle('normal');
  }

  show(): void {
    this.visible = true;
    this.element.show();
    this.framework.render();
  }

  hide(): void {
    this.visible = false;
    this.element.hide();
    this.framework.render();
  }

  refresh(): void {
    this.updateStatistics();
    this.renderStatsDisplay();
    this.framework.render();
  }

  // Specialized methods
  updateStatistics(todos: Todo[]): void {
    const today = new Date().toDateString();
    
    this.statsData = {
      totalTodos: todos.length,
      completedTodos: todos.filter(t => t.completed).length,
      pendingTodos: todos.filter(t => !t.completed).length,
      completionRate: todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0,
      todayAdded: todos.filter(t => t.createdAt.toDateString() === today).length,
      todayCompleted: todos.filter(t => t.completed && t.updatedAt.toDateString() === today).length
    };
    
    this.refresh();
  }
}
```

**Registration in TerminalUIApp**:
```typescript
// Add to TerminalUIApp constructor
this.statisticsPanel = new StatisticsPanel(this.framework);

// Register with framework
this.framework.registerPanel(this.statisticsPanel);

// Add to panel navigation sequence
// Update PanelType enum and panel switching logic
```

#### 4.6 LayoutConfig Interface for Panel Positioning

**Layout Configuration Structure**:
```typescript
export interface LayoutConfig {
  todoList: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
  details: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
  commandInput: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
  status: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
}
```

**Current Layout Implementation**:
```typescript
private initializeLayout(): void {
  this.layout = {
    todoList: {
      left: 0,
      top: 0,
      width: '50%',        // Left half of screen
      height: '100%-3'     // Full height minus command input and status
    },
    details: {
      left: '50%',
      top: 0,
      width: '50%',        // Right half of screen
      height: '100%-3'
    },
    commandInput: {
      left: 0,
      top: '100%-3',       // Near bottom
      width: '100%',
      height: 3            // Fixed height for input
    },
    status: {
      left: 0,
      top: '100%-1',       // Bottom row
      width: '100%',
      height: 1            // Single line status
    }
  };
}
```

**Layout Benefits**:
- **Responsive Design**: Percentages adapt to terminal size
- **Consistent Spacing**: Standardized positioning logic
- **Easy Modification**: Centralized layout configuration
- **Panel Independence**: Each panel gets dedicated screen space

---

## Part 4: Analyzing the CLI Interface

### 1. Command Architecture

[待填充]

### 2. Help System

[待填充]

### 3. Output Formatting

[待填充]

### 4. Error Handling

[待填充]

---

## Part 5: Cross-Interface Integration

### 1. Shared Model Layer

[待填充]

### 2. Code Reusability

[待填充]

### 3. Testing Strategy

[待填充]

---

## Part 6: Architecture Quality Attributes

### 1. Maintainability

[待填充]

### 2. Extensibility

[待填充]

### 3. Performance

[待填充]

---

## Architecture Diagrams

[待添加架构图]

---

## Recommendations and Improvements

[待填充]

---

## Conclusion

[待填充]
