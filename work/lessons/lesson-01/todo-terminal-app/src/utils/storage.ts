import * as fs from 'fs';
import * as path from 'path';
import { Todo } from '../models/Todo';

/**
 * Storage format for the JSON file according to TODO-DESIGN.md
 */
interface TodoStorageFormat {
  version: string;
  todos: Todo[];
}

/**
 * Storage utility class for handling file I/O operations
 * Implements atomic writes and error handling as specified in TODO-DESIGN.md
 */
export class Storage {
  private readonly filePath: string;
  private readonly version = '1.0.0';

  constructor(filePath: string = './data/todos.json') {
    this.filePath = path.resolve(filePath);
  }

  /**
   * Load todos from JSON file
   * @returns Array of todos, empty array if file doesn't exist or on error
   */
  load(): Todo[] {
    try {
      // Check if file exists
      if (!fs.existsSync(this.filePath)) {
        return [];
      }

      // Read and parse file
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const parsed: TodoStorageFormat = JSON.parse(data);

      // Validate format and return todos
      if (parsed.todos && Array.isArray(parsed.todos)) {
        // Convert createdAt strings back to Date objects
        return parsed.todos.map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : new Date(todo.createdAt)
        }));
      }

      return [];
    } catch (error) {
      console.warn('Failed to load todos from file:', error);
      return []; // Return empty array on any error
    }
  }

  /**
   * Save todos to JSON file with atomic write operation
   * @param todos - Array of todos to save
   * @throws Error if write operation fails
   */
  save(todos: Todo[]): void {
    try {
      // Prepare data in storage format
      const data: TodoStorageFormat = {
        version: this.version,
        todos: todos
      };

      // Create directory if it doesn't exist
      const dir = path.dirname(this.filePath);
      fs.mkdirSync(dir, { recursive: true });

      // Atomic write: write to temporary file first, then rename
      const tempFile = `${this.filePath}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      
      // Atomic operation: rename temp file to final file
      fs.renameSync(tempFile, this.filePath);
    } catch (error) {
      throw new Error(`Failed to save todos: ${error}`);
    }
  }

  /**
   * Check if the storage file exists and is readable
   * @returns true if file exists and is readable
   */
  exists(): boolean {
    try {
      fs.accessSync(this.filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check write permissions for the storage directory
   * @returns true if directory is writable
   */
  canWrite(): boolean {
    try {
      const dir = path.dirname(this.filePath);
      // Try to create directory if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
      // Check write permissions
      fs.accessSync(dir, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the absolute path to the storage file
   * @returns absolute file path
   */
  getFilePath(): string {
    return this.filePath;
  }
}