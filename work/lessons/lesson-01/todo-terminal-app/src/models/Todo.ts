/**
 * Todo item interface defining the structure of a todo item
 * According to TODO-DESIGN.md specifications
 */
export interface Todo {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Todo title (required, 1-100 characters) */
  title: string;
  
  /** Optional description for additional details */
  description?: string;
  
  /** Completion status (defaults to false for new todos) */
  completed: boolean;
  
  /** Creation timestamp (auto-set on creation) */
  createdAt: Date;
  
  /** Last update timestamp (auto-set on updates) */
  updatedAt: Date;
}

/**
 * Validation rules for Todo items
 */
export const TodoValidation = {
  /** Minimum title length */
  MIN_TITLE_LENGTH: 1,
  
  /** Maximum title length */
  MAX_TITLE_LENGTH: 100,
  
  /**
   * Validates a todo title
   * @param title - The title to validate
   * @returns true if valid, false otherwise
   */
  isValidTitle(title: string): boolean {
    return typeof title === 'string' && 
           title.trim().length >= this.MIN_TITLE_LENGTH && 
           title.trim().length <= this.MAX_TITLE_LENGTH;
  },
  
  /**
   * Sanitizes a todo title by trimming whitespace
   * @param title - The title to sanitize
   * @returns sanitized title
   */
  sanitizeTitle(title: string): string {
    return title.trim();
  }
} as const;