# Todo Terminal Manager

A terminal-based todo list manager built with Node.js, TypeScript, and blessed.

## Features

- ✅ Add, delete, and complete todos
- ✅ Rich terminal UI with keyboard navigation  
- ✅ Persistent storage to JSON file
- ✅ Real-time UI updates
- ✅ Input validation and error handling
- ✅ TypeScript for type safety

## Development Status

### ✅ Phase 1: Model Layer (COMPLETED)
- [x] Project setup with TypeScript, blessed, and dependencies
- [x] Todo interface with validation
- [x] Storage utilities with atomic file operations
- [x] TodoModel class with CRUD operations
- [x] Comprehensive test suite for Model layer

### 🚧 Phase 2: View Layer (NEXT)
- [ ] Blessed UI components and layout
- [ ] Todo list display with scrolling
- [ ] Status bar with keyboard shortcuts
- [ ] Basic keyboard navigation

### 🔄 Phase 3: Controller Layer (PLANNED)
- [ ] Event handling and user input
- [ ] Integration between Model and View
- [ ] Complete MVC architecture

## Installation

```bash
npm install
```

## Usage

### Test the Model Layer
```bash
npm run test
```

### Development Mode (when UI is ready)
```bash
npm run dev
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
│   ├── utils/
│   │   └── storage.ts        # File persistence with atomic writes
│   └── test-model.ts         # Test script for Model layer
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