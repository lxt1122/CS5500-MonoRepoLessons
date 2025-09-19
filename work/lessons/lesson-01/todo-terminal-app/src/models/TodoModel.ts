import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoValidation } from './Todo';
import { Storage } from '../utils/storage';

/**
 * TodoModel class implementing CRUD operations and data persistence
 * According to TODO-DESIGN.md specifications
 */
export class TodoModel {
  private todos: Todo[] = [];
  private storage: Storage;

  constructor(storagePath?: string) {
    this.storage = new Storage(storagePath);
    this.loadTodos();
  }

  /**
   * Load todos from storage on initialization
   * @private
   */
  private loadTodos(): void {
    try {
      this.todos = this.storage.load();
    } catch (error) {
      console.warn('Failed to load todos on initialization:', error);
      this.todos = [];
    }
  }

  /**
   * Save current todos to storage
   * @private
   */
  private saveTodos(): void {
    try {
      this.storage.save(this.todos);
    } catch (error) {
      throw new Error(`Failed to persist todos: ${error}`);
    }
  }

  /**
   * Add a new todo item
   * @param title - The title of the todo (will be validated and sanitized)
   * @returns The created todo item
   * @throws Error if title is invalid
   */
  add(title: string): Todo {
    // Validate and sanitize title
    if (!TodoValidation.isValidTitle(title)) {
      throw new Error(`Invalid title. Must be between ${TodoValidation.MIN_TITLE_LENGTH} and ${TodoValidation.MAX_TITLE_LENGTH} characters.`);
    }

    const sanitizedTitle = TodoValidation.sanitizeTitle(title);

    // Create new todo with auto-generated values
    const newTodo: Todo = {
      id: uuidv4(),
      title: sanitizedTitle,
      completed: false, // Default to false for new todos
      createdAt: new Date()
    };

    // Add to collection and save
    this.todos.push(newTodo);
    this.saveTodos();

    return newTodo;
  }

  /**
   * Delete a todo by ID
   * @param id - The ID of the todo to delete
   * @returns true if todo was found and deleted, false otherwise
   */
  delete(id: string): boolean {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter(todo => todo.id !== id);
    
    const wasDeleted = this.todos.length < initialLength;
    if (wasDeleted) {
      this.saveTodos();
    }
    
    return wasDeleted;
  }

  /**
   * Toggle the completion status of a todo
   * @param id - The ID of the todo to toggle
   * @returns The updated todo item, or null if not found
   */
  toggleComplete(id: string): Todo | null {
    const todo = this.todos.find(t => t.id === id);
    
    if (!todo) {
      return null;
    }

    todo.completed = !todo.completed;
    this.saveTodos();
    
    return todo;
  }

  /**
   * Get all todos
   * @returns Array of all todos (copy to prevent external mutation)
   */
  getAll(): Todo[] {
    // Return a deep copy to prevent external mutation
    return this.todos.map(todo => ({ ...todo }));
  }

  /**
   * Get a todo by ID
   * @param id - The ID of the todo to retrieve
   * @returns The todo item, or null if not found
   */
  getById(id: string): Todo | null {
    const todo = this.todos.find(t => t.id === id);
    return todo ? { ...todo } : null; // Return copy to prevent mutation
  }

  /**
   * Get todos filtered by completion status
   * @param completed - true for completed todos, false for incomplete
   * @returns Array of filtered todos
   */
  getByStatus(completed: boolean): Todo[] {
    return this.todos
      .filter(todo => todo.completed === completed)
      .map(todo => ({ ...todo })); // Return copies
  }

  /**
   * Update a todo's title
   * @param id - The ID of the todo to update
   * @param newTitle - The new title (will be validated and sanitized)
   * @returns The updated todo item, or null if not found
   * @throws Error if title is invalid
   */
  updateTitle(id: string, newTitle: string): Todo | null {
    if (!TodoValidation.isValidTitle(newTitle)) {
      throw new Error(`Invalid title. Must be between ${TodoValidation.MIN_TITLE_LENGTH} and ${TodoValidation.MAX_TITLE_LENGTH} characters.`);
    }

    const todo = this.todos.find(t => t.id === id);
    
    if (!todo) {
      return null;
    }

    todo.title = TodoValidation.sanitizeTitle(newTitle);
    this.saveTodos();
    
    return { ...todo }; // Return copy
  }

  /**
   * Get the total count of todos
   * @returns Total number of todos
   */
  getCount(): number {
    return this.todos.length;
  }

  /**
   * Get the count of completed todos
   * @returns Number of completed todos
   */
  getCompletedCount(): number {
    return this.todos.filter(todo => todo.completed).length;
  }

  /**
   * Get the count of incomplete todos
   * @returns Number of incomplete todos
   */
  getIncompleteCount(): number {
    return this.todos.filter(todo => !todo.completed).length;
  }

  /**
   * Clear all todos
   * @returns Number of todos that were removed
   */
  clear(): number {
    const count = this.todos.length;
    this.todos = [];
    this.saveTodos();
    return count;
  }

  /**
   * Check if storage is accessible and writable
   * @returns Object with storage status information
   */
  getStorageStatus(): { canRead: boolean; canWrite: boolean; filePath: string } {
    return {
      canRead: this.storage.exists(),
      canWrite: this.storage.canWrite(),
      filePath: this.storage.getFilePath()
    };
  }
}