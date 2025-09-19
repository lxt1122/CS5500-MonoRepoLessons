# Todo Terminal Manager

A terminal-based todo list manager built with Node.js, TypeScript, and blessed.

## Features

- ✅ Add, delete, and complete todos
- ✅ Rich terminal UI with keyboard navigation  
- ✅ Persistent storage to JSON file
- ✅ Real-time UI updates
- ✅ Input validation and error handling
- ✅ TypeScript for type safety
- ✅ **Full Command Line Interface (CLI)**
- ✅ Multiple output formats (table, JSON, simple)
- ✅ Comprehensive help system

## Development Status

### ✅ Phase 1: Model Layer (COMPLETED)
- [x] Project setup with TypeScript, blessed, and dependencies
- [x] Todo interface with validation
- [x] Storage utilities with atomic file operations
- [x] TodoModel class with CRUD operations
- [x] Comprehensive test suite for Model layer

### ✅ Phase 2: View Layer (COMPLETED)
- [x] Blessed UI components and layout
- [x] Todo list display with scrolling
- [x] Status bar with keyboard shortcuts
- [x] Basic keyboard navigation

### ✅ CLI Interface (COMPLETED)
- [x] Command line interface with full CRUD operations
- [x] Comprehensive command parser with validation
- [x] Multiple output formats (table, JSON, simple)
- [x] Built-in help system with examples
- [x] Error handling and user feedback

### 🔄 Phase 3: Controller Layer (NEXT)
- [ ] Event handling and user input for blessed UI
- [ ] Integration between Model and View
- [ ] Complete MVC architecture for terminal UI

## Installation

```bash
npm install
```

## Usage

### Test the Model Layer
```bash
npm run test
```

### Test the View Layer (Blessed UI)
```bash
npm run test-view
```

### Use the Command Line Interface
```bash
# Show help
npm run todo help

# Add todos
npm run todo add "Buy groceries"
npm run todo add "Write report"

# List todos
npm run todo list
npm run todo list --completed
npm run todo list --format json

# Complete todos
npm run todo complete 1

# Edit todos
npm run todo edit 1 --title "New title"

# Show statistics
npm run todo stats

# Remove todos
npm run todo remove 1 --force

# Get help for specific commands
npm run todo help add
```

### Test CLI functionality
```bash
npm run test-cli
```

### Build for Production
```bash
npm run build
npm start
```

## Architecture

This project follows the MVC (Model-View-Controller) architecture pattern:

- **Model** (`src/models/`): Data structures and business logic
- **View** (`src/views/`): Blessed UI components (coming in Phase 2)  
- **Controller** (`src/controllers/`): Event handling and coordination (coming in Phase 3)
- **Utils** (`src/utils/`): Storage and utility functions

## File Structure

```
todo-terminal-app/
├── src/
│   ├── models/
│   │   ├── Todo.ts           # Todo interface and validation
│   │   └── TodoModel.ts      # CRUD operations and data management
│   ├── views/
│   │   └── TodoView.ts       # Blessed UI components
│   ├── cli/
│   │   ├── types.ts          # CLI command definitions and types
│   │   ├── parser.ts         # Command line argument parser
│   │   ├── help.ts           # Help system and documentation
│   │   ├── controller.ts     # CLI command controller
│   │   └── index.ts          # CLI application entry point
│   ├── utils/
│   │   └── storage.ts        # File persistence with atomic writes
│   ├── test-model.ts         # Test script for Model layer
│   ├── test-view.ts          # Test script for View layer
│   ├── test-cli.ts           # Test script for CLI
│   └── todo-cli.ts           # CLI entry point
├── data/                     # JSON data storage
├── package.json
├── tsconfig.json
└── README.md
```

## Data Storage

Todos are stored in JSON format in the `data/` directory:

```json
{
  "version": "1.0.0", 
  "todos": [
    {
      "id": "uuid-here",
      "title": "Todo title",
      "completed": false,
      "createdAt": "2025-09-18T10:00:00Z"
    }
  ]
}
```

## Model API

The `TodoModel` class provides the following methods:

- `add(title: string): Todo` - Add a new todo
- `delete(id: string): boolean` - Delete a todo by ID  
- `toggleComplete(id: string): Todo | null` - Toggle completion status
- `getAll(): Todo[]` - Get all todos
- `getById(id: string): Todo | null` - Get todo by ID
- `updateTitle(id: string, newTitle: string): Todo | null` - Update todo title
- `getCount(): number` - Get total count
- `getCompletedCount(): number` - Get completed count
- `clear(): number` - Remove all todos

## CLI Commands

The Command Line Interface provides these commands:

### Main Commands
- `todo add <title>` - Add a new todo item
- `todo list [options]` - List todos with optional filtering
- `todo complete <id>` - Mark a todo as complete
- `todo remove <id>` - Delete a todo item
- `todo edit <id> [options]` - Edit a todo item

### Utility Commands
- `todo clear [options]` - Remove multiple todos
- `todo stats [options]` - Show todo statistics
- `todo help [command]` - Show help information

### Options
- `--completed` - Filter completed todos
- `--pending` - Filter pending todos
- `--format <type>` - Output format (table, json, simple)
- `--force` - Skip confirmation prompts
- `--title <text>` - Set/update title

### Examples
```bash
todo add "Buy groceries"           # Add new todo
todo list --completed              # List completed todos
todo complete 1                    # Complete todo #1
todo edit 1 --title "New title"    # Edit todo title
todo stats --format json           # JSON statistics
todo help add                      # Help for add command
```

## Testing

The Model layer has been thoroughly tested with `src/test-model.ts`. Run tests with:

```bash
npm run test
```

Test coverage includes:
- ✅ CRUD operations
- ✅ Data validation  
- ✅ File persistence
- ✅ Error handling
- ✅ Edge cases

## Next Steps

1. **Phase 2**: Implement blessed UI components for displaying todos
2. **Phase 3**: Add Controller layer for user interaction
3. **Phase 4**: Polish with input handling and confirmations
4. **Phase 5**: Error handling and UI improvements

## Dependencies

- `blessed` - Rich terminal UI library
- `uuid` - Unique ID generation
- `typescript` - Type safety and modern JavaScript features
- `ts-node` - TypeScript execution for development

## License

ISC