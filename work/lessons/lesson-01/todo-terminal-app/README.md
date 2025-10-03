# Todo Terminal Manager

A comprehensive terminal-based todo list manager built with Node.js, TypeScript, and Blessed UI. This application provides both a rich terminal interface and a complete command-line interface for managing tasks efficiently.

## ✨ Features

### Core Functionality
- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ Toggle completion status for todos
- ✅ Atomic file operations for data persistence
- ✅ UUID-based unique identifiers
- ✅ Comprehensive input validation
- ✅ TypeScript for enhanced type safety

### User Interfaces
- ✅ **Rich Terminal UI** - Interactive blessed-based interface with panels
- ✅ **Command Line Interface** - Full CLI with argument parsing and help system
- ✅ **Multiple Output Formats** - Table, JSON, and simple text formats
- ✅ **Context-Sensitive Help** - Built-in help system with examples

### Architecture & Quality
- ✅ **MVC Architecture** - Clean separation of concerns
- ✅ **Modular Design** - Reusable components and utilities
- ✅ **Comprehensive Testing** - Test scripts for all major components
- ✅ **Error Handling** - Robust error handling and user feedback

## 🏗️ Implementation Status

### ✅ Core Components (COMPLETED)
**Model Layer**
- [x] `Todo` interface with validation rules
- [x] `TodoModel` class with full CRUD operations
- [x] `Storage` utility with atomic file operations
- [x] Data persistence to JSON format

**View Layer**
- [x] Blessed UI framework with panel system
- [x] Todo list panel with scrolling
- [x] Todo details panel
- [x] Command input panel
- [x] Status bar with keyboard shortcuts
- [x] Complete terminal UI application

**CLI Interface**
- [x] Command parser with argument validation
- [x] CLI controller with business logic
- [x] Help system with command documentation
- [x] Multiple output formatters
- [x] Error handling and user feedback

**Controller Layer**
- [x] Terminal UI controller with event handling
- [x] Integration between Model and blessed View
- [x] Complete MVC architecture implementation

### ✅ Testing & Quality Assurance
- [x] Model layer testing (`test-model.ts`)
- [x] View layer testing (`test-view.ts`) 
- [x] CLI interface testing (`test-cli.ts`)
- [x] Error handling validation
- [x] Edge case testing

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Running the Applications

#### Terminal UI (Interactive Interface)
```bash
# Start the interactive terminal UI
npm run ui
# or
npm run dev
```

#### Command Line Interface
```bash
# Show available commands
npm run cli:dev help

# Quick examples
npm run cli:dev add "Buy groceries"
npm run cli:dev list
npm run cli:dev complete 1
npm run cli:dev stats
```

### Testing the Components
```bash
# Test the model layer
npm run test:model

# Test the view layer  
npm run test:view

# Test the CLI interface
npm run test:cli
```

### Production Build
```bash
npm run build
npm start
```

## 🖥️ User Interfaces

### Terminal UI (Blessed-based)
The main interactive interface built with the Blessed library, featuring:

- **Multi-panel layout** with todo list, details, input, and status panels
- **Keyboard navigation** with intuitive shortcuts
- **Real-time updates** as you modify todos
- **Rich visual feedback** with colors and formatting

**Key Controls:**
- `a` - Add new todo
- `d` - Delete selected todo  
- `Space` - Toggle completion status
- `Enter` - Toggle completion
- `q` - Quit application
- `↑/↓` - Navigate todo list

### Command Line Interface (CLI)
A comprehensive CLI for scripting and command-line usage:

#### Main Commands
```bash
npm run cli:dev add <title>              # Add a new todo
npm run cli:dev list [options]           # List todos with filtering
npm run cli:dev complete <id>            # Mark todo as complete
npm run cli:dev remove <id>              # Delete a todo
npm run cli:dev edit <id> [options]      # Edit todo properties
```

#### Utility Commands
```bash
npm run cli:dev clear [options]          # Remove multiple todos
npm run cli:dev stats [options]          # Show statistics
npm run cli:dev help [command]           # Show help information
```

#### Options & Formats
```bash
--completed                              # Filter completed todos only
--pending                                # Filter pending todos only  
--format table                           # Table format (default)
--format json                            # JSON output
--format simple                          # Simple text format
--force                                  # Skip confirmation prompts
--title "New Title"                      # Set/update title
```

#### CLI Examples
```bash
# Basic usage
npm run cli:dev add "Buy groceries"
npm run cli:dev list --completed
npm run cli:dev complete 1
npm run cli:dev edit 1 --title "Buy organic groceries"
npm run cli:dev remove 1 --force

# Advanced usage with formatting
npm run cli:dev list --format json
npm run cli:dev stats --format simple
npm run cli:dev clear --completed --force

# Get help
npm run cli:dev help
npm run cli:dev help add
```

## 🏛️ Architecture

This project implements a clean **MVC (Model-View-Controller)** architecture with additional layers:

### Core Architecture
```
┌─────────────────────────────────────────────┐
│                 Interfaces                   │
│                                             │
│  ┌─────────────┐    ┌─────────────────┐    │
│  │ Terminal UI │    │ CLI Interface   │    │
│  │ (Blessed)   │    │ (Command Line)  │    │
│  └─────────────┘    └─────────────────┘    │
│           │                   │             │
└───────────┼───────────────────┼─────────────┘
            │                   │
┌───────────┼───────────────────┼─────────────┐
│           ▼                   ▼             │
│  ┌─────────────┐    ┌─────────────────┐    │
│  │    UI       │    │      CLI        │    │
│  │ Controller  │    │   Controller    │    │
│  └─────────────┘    └─────────────────┘    │
│           │                   │             │
│           └───────────┬───────┘             │
└───────────────────────┼─────────────────────┘
                        │
┌───────────────────────┼─────────────────────┐
│                       ▼                     │
│            ┌─────────────────┐              │
│            │   TodoModel     │              │
│            │  (Business      │              │
│            │    Logic)       │              │
│            └─────────────────┘              │
│                       │                     │
│                       ▼                     │
│            ┌─────────────────┐              │
│            │    Storage      │              │
│            │   (JSON File    │              │
│            │  Persistence)   │              │
│            └─────────────────┘              │
└─────────────────────────────────────────────┘
```

### Component Structure

#### **Models** (`src/models/`)
- `Todo.ts` - Todo interface, validation rules, and type definitions  
- `TodoModel.ts` - Core business logic and CRUD operations

#### **Views** (`src/views/`)
- `TerminalUIApp.ts` - Main terminal application coordinator
- `BlessedUIFramework.ts` - UI framework and panel management
- `TodoListPanel.ts` - Todo list display component
- `TodoDetailsPanel.ts` - Todo details display
- `CommandInputPanel.ts` - Input handling panel
- `StatusBarPanel.ts` - Status and help display
- `TodoView.ts` - Basic blessed UI components

#### **Controllers** (`src/controllers/`)
- `TodoController.ts` - Terminal UI event handling and coordination

#### **CLI System** (`src/cli/`)
- `index.ts` - CLI application entry point
- `controller.ts` - CLI command execution and business logic
- `parser.ts` - Command-line argument parsing
- `help.ts` - Help system and documentation
- `types.ts` - CLI type definitions and command schemas

#### **Utilities** (`src/utils/`)
- `storage.ts` - File persistence with atomic operations

#### **Entry Points**
- `terminal-ui.ts` - Terminal UI application entry point
- `todo-cli.ts` - Simple CLI entry point wrapper

#### **Testing Scripts**
- `test-model.ts` - Model layer validation and testing
- `test-view.ts` - View layer testing with mock data  
- `test-cli.ts` - Comprehensive CLI testing suite

## 💾 Data Storage & Model

### Todo Data Structure
```typescript
interface Todo {
  id: string;              // UUID v4 unique identifier
  title: string;           // 1-100 characters, required
  description?: string;    // Optional description field
  completed: boolean;      // Completion status
  createdAt: Date;         // Auto-set on creation
  updatedAt: Date;         // Auto-updated on changes
}
```

### JSON Storage Format
Todos are persisted to `data/todos.json` with atomic file operations:
```json
{
  "version": "1.0.0",
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, eggs, and bread",
      "completed": false,
      "createdAt": "2025-09-28T10:00:00.000Z",
      "updatedAt": "2025-09-28T10:00:00.000Z"
    }
  ]
}
```

### TodoModel API
The `TodoModel` class provides comprehensive CRUD operations:

**Core Operations**
- `add(title: string, description?: string): Todo` - Add new todo
- `delete(id: string): boolean` - Delete todo by ID
- `toggleComplete(id: string): Todo | null` - Toggle completion status
- `updateTitle(id: string, newTitle: string): Todo | null` - Update title
- `updateDescription(id: string, newDescription?: string): Todo | null` - Update description

**Query Operations**  
- `getAll(): Todo[]` - Get all todos
- `getById(id: string): Todo | null` - Get todo by ID
- `getCompleted(): Todo[]` - Get completed todos only
- `getIncomplete(): Todo[]` - Get pending todos only

**Statistics**
- `getCount(): number` - Total todo count
- `getCompletedCount(): number` - Completed todo count
- `getIncompleteCount(): number` - Pending todo count

**Bulk Operations**
- `clear(): number` - Remove all todos
- `clearCompleted(): number` - Remove completed todos only

**Storage Management**
- `getStorageStatus(): StorageStatus` - Check file system status
- `save(): void` - Manual save (auto-save is default)
- `load(): void` - Reload from storage

## 🧪 Testing & Quality Assurance

This project includes comprehensive testing for all major components:

### Test Scripts

**Model Layer Testing** (`npm run test:model`)
```bash
# Tests core business logic and data persistence
npm run test:model
```
- ✅ CRUD operations validation
- ✅ Data validation and error handling  
- ✅ File persistence and atomic operations
- ✅ Edge cases and boundary conditions
- ✅ Storage status and file system integration

**View Layer Testing** (`npm run test:view`)
```bash
# Tests UI components with mock data
npm run test:view
```
- ✅ Blessed UI panel rendering
- ✅ Layout and visual formatting
- ✅ Mock data display
- ✅ Component initialization

**CLI Interface Testing** (`npm run test:cli`)
```bash
# Comprehensive CLI command testing
npm run test:cli
```
- ✅ All CRUD command operations
- ✅ Help system validation
- ✅ Output format testing (table, JSON, simple)
- ✅ Error handling and edge cases
- ✅ Command parsing and validation
- ✅ Integration with model layer

### Test Coverage
The test suite validates:
- **Functionality**: All features work as specified
- **Error Handling**: Graceful handling of invalid inputs
- **Data Integrity**: Persistence and data consistency  
- **User Experience**: Clear feedback and intuitive interfaces
- **Integration**: Components work together correctly

### Running All Tests
```bash
# Run all test suites
npm run test:model && npm run test:view && npm run test:cli
```

## 📁 Project Structure

```
todo-terminal-app/
├── 📄 README.md                    # Project documentation
├── 📄 package.json                 # Dependencies and scripts  
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 TODO-DESIGN.md               # Detailed design specification
├── 📄 TODO-PLAN.md                 # Implementation planning document
├── 
├── 📂 src/                         # Source code
│   ├── 📂 models/                  # Data models and business logic
│   │   ├── Todo.ts                 # Todo interface and validation
│   │   └── TodoModel.ts            # CRUD operations and data management
│   │   
│   ├── 📂 views/                   # UI components (Blessed-based)
│   │   ├── BlessedUIFramework.ts   # UI framework and panel management
│   │   ├── TerminalUIApp.ts        # Main terminal application
│   │   ├── TodoListPanel.ts        # Todo list display component
│   │   ├── TodoDetailsPanel.ts     # Todo details panel  
│   │   ├── CommandInputPanel.ts    # Input handling panel
│   │   ├── StatusBarPanel.ts       # Status and help display
│   │   └── TodoView.ts             # Basic UI components
│   │   
│   ├── 📂 controllers/             # Application controllers
│   │   └── TodoController.ts       # Terminal UI event handling
│   │   
│   ├── 📂 cli/                     # Command-line interface
│   │   ├── index.ts                # CLI application entry point
│   │   ├── controller.ts           # CLI command execution
│   │   ├── parser.ts               # Command argument parsing
│   │   ├── help.ts                 # Help system and documentation
│   │   └── types.ts                # CLI type definitions
│   │   
│   ├── 📂 utils/                   # Utility functions
│   │   └── storage.ts              # File persistence with atomic writes
│   │   
│   ├── 📄 terminal-ui.ts           # Terminal UI entry point
│   ├── 📄 todo-cli.ts              # CLI entry point wrapper
│   ├── 📄 test-model.ts            # Model layer testing script
│   ├── 📄 test-view.ts             # View layer testing script
│   └── 📄 test-cli.ts              # CLI testing script
│   
├── 📂 data/                        # JSON data storage
│   ├── todos.json                  # Main todo data file
│   └── test-todos.json             # Test data file
│   
└── 📂 dist/                        # Compiled JavaScript (after build)
    └── ...                         # TypeScript compilation output
```

## 🛠️ Development Scripts

The project provides comprehensive npm scripts for different development tasks:

```bash
# Development & Testing
npm run dev              # Start terminal UI in development mode
npm run ui               # Start interactive terminal UI
npm run cli:dev          # Run CLI commands in development mode

# Testing Scripts  
npm run test:model       # Test model layer with validation
npm run test:view        # Test view layer with mock data
npm run test:cli         # Test CLI with comprehensive suite

# Production Build
npm run build            # Compile TypeScript to JavaScript
npm start                # Build and run production version
```

## 🔧 Technology Stack

- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type safety and enhanced developer experience
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime environment
- **UI Library**: [Blessed](https://github.com/chjj/blessed) - Rich terminal interfaces and components
- **Architecture**: MVC (Model-View-Controller) with CLI interface layer
- **Storage**: JSON file-based persistence with atomic operations
- **Unique IDs**: UUID v4 for reliable unique identifiers
- **Build Tool**: TypeScript compiler with ts-node for development

### Dependencies
```json
{
  "dependencies": {
    "blessed": "^0.1.81",    // Terminal UI components
    "uuid": "^9.0.0"         // Unique ID generation
  },
  "devDependencies": {
    "@types/blessed": "^0.1.25",  // TypeScript definitions
    "@types/node": "^20.0.0",     // Node.js type definitions  
    "@types/uuid": "^9.0.0",      // UUID type definitions
    "ts-node": "^10.9.2",         // TypeScript execution
    "typescript": "^5.0.0"        // TypeScript compiler
  }
}
```

## 📚 Documentation

This project includes comprehensive documentation:

- **README.md** (this file) - Quick start and usage guide
- **TODO-DESIGN.md** - Detailed system design and specifications
- **TODO-PLAN.md** - Implementation phases and development planning
- **Inline Code Documentation** - TypeScript interfaces and JSDoc comments
- **Help System** - Built-in CLI help with `npm run cli:dev help`

## 🎯 Project Goals & Learning Outcomes

This project demonstrates:

1. **Clean Architecture** - MVC pattern with clear separation of concerns
2. **TypeScript Proficiency** - Interface design, type safety, and modern JavaScript
3. **Terminal UI Development** - Rich console applications with blessed
4. **CLI Development** - Command-line tools with argument parsing and help systems
5. **Testing Strategies** - Component testing and integration validation
6. **File I/O Operations** - Atomic file operations and data persistence
7. **Error Handling** - Graceful error handling and user feedback
8. **Modular Design** - Reusable components and clean interfaces

## 🤝 Contributing & Development

### Setting up Development Environment
```bash
# Clone and setup
git clone <repository>
cd todo-terminal-app
npm install

# Start developing
npm run dev                 # Terminal UI
npm run cli:dev help        # CLI interface
npm run test:model          # Run tests
```

### Code Organization
- Follow the MVC architecture pattern
- Keep components focused and single-purpose
- Add comprehensive TypeScript types
- Include tests for new functionality
- Document public APIs with JSDoc comments

## 📄 License

ISC License - See LICENSE file for details.

---

*Built with TypeScript, Node.js, and Blessed UI*