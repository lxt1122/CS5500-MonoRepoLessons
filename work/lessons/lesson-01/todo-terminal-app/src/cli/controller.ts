import { TodoModel } from '../models/TodoModel';
import { Todo } from '../models/Todo';
import { ParsedCommand, CLIResult } from './types';
import { HelpSystem } from './help';

/**
 * CLI Controller
 * Connects CLI commands to Model operations and handles business logic
 */
export class CLIController {
  private model: TodoModel;
  private helpSystem: HelpSystem;

  constructor(storagePath?: string) {
    this.model = new TodoModel(storagePath);
    this.helpSystem = new HelpSystem();
  }

  /**
   * Execute a parsed CLI command
   * @param parsedCommand - The parsed command with arguments and options
   * @returns CLI result with success status and output
   */
  async execute(parsedCommand: ParsedCommand): Promise<CLIResult> {
    try {
      switch (parsedCommand.command) {
        case 'add':
          return this.handleAdd(parsedCommand.arguments, parsedCommand.options);
        
        case 'list':
          return this.handleList(parsedCommand.arguments, parsedCommand.options);
        
        case 'complete':
          return this.handleComplete(parsedCommand.arguments, parsedCommand.options);
        
        case 'remove':
          return this.handleRemove(parsedCommand.arguments, parsedCommand.options);
        
        case 'edit':
          return this.handleEdit(parsedCommand.arguments, parsedCommand.options);
        
        case 'clear':
          return this.handleClear(parsedCommand.arguments, parsedCommand.options);
        
        case 'stats':
          return this.handleStats(parsedCommand.arguments, parsedCommand.options);
        
        case 'help':
          return this.handleHelp(parsedCommand.arguments, parsedCommand.options);
        
        default:
          return {
            success: false,
            error: `Unknown command: ${parsedCommand.command}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Handle 'add' command
   * @private
   */
  private handleAdd(args: Record<string, any>, _options: Record<string, any>): CLIResult {
    const title = args.title;
    
    try {
      const todo = this.model.add(title);
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

  /**
   * Handle 'list' command
   * @private
   */
  private handleList(_args: Record<string, any>, options: Record<string, any>): CLIResult {
    let todos = this.model.getAll();
    
    // Apply filters
    if (options.completed) {
      todos = todos.filter(todo => todo.completed);
    } else if (options.pending) {
      todos = todos.filter(todo => !todo.completed);
    }
    
    // Apply limit
    if (options.limit && options.limit > 0) {
      todos = todos.slice(0, options.limit);
    }
    
    const format = options.format || 'table';
    const output = this.formatTodoList(todos, format);
    
    return {
      success: true,
      message: output,
      data: todos
    };
  }

  /**
   * Handle 'complete' command
   * @private
   */
  private handleComplete(args: Record<string, any>, options: Record<string, any>): CLIResult {
    const id = args.id;
    const todo = this.findTodoById(id);
    
    if (!todo) {
      return {
        success: false,
        error: `Todo not found: ${id}`
      };
    }
    
    try {
      const undo = options.undo || false;
      const updatedTodo = this.model.toggleComplete(todo.id);
      
      if (!updatedTodo) {
        return {
          success: false,
          error: 'Failed to update todo'
        };
      }
      
      const action = undo ? 'marked as incomplete' : 'completed';
      return {
        success: true,
        message: `Todo "${updatedTodo.title}" ${action}!`,
        data: updatedTodo
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update todo'
      };
    }
  }

  /**
   * Handle 'remove' command
   * @private
   */
  private handleRemove(args: Record<string, any>, options: Record<string, any>): CLIResult {
    const id = args.id;
    const todo = this.findTodoById(id);
    
    if (!todo) {
      return {
        success: false,
        error: `Todo not found: ${id}`
      };
    }
    
    // Confirmation (simplified for CLI)
    if (!options.force) {
      // In a real CLI, we'd prompt for confirmation here
      // For now, we'll just show a warning
    }
    
    try {
      const deleted = this.model.delete(todo.id);
      
      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete todo'
        };
      }
      
      return {
        success: true,
        message: `Todo "${todo.title}" deleted successfully!`,
        data: { deletedTodo: todo }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete todo'
      };
    }
  }

  /**
   * Handle 'edit' command
   * @private
   */
  private handleEdit(args: Record<string, any>, options: Record<string, any>): CLIResult {
    const id = args.id;
    const todo = this.findTodoById(id);
    
    if (!todo) {
      return {
        success: false,
        error: `Todo not found: ${id}`
      };
    }
    
    try {
      let newTitle: string;
      
      if (options.title) {
        newTitle = options.title;
      } else if (args.field === 'title' && args.value) {
        newTitle = args.value;
      } else {
        return {
          success: false,
          error: 'No new title provided. Use --title or provide field and value arguments.'
        };
      }
      
      const updatedTodo = this.model.updateTitle(todo.id, newTitle);
      
      if (!updatedTodo) {
        return {
          success: false,
          error: 'Failed to update todo'
        };
      }
      
      return {
        success: true,
        message: `Todo updated successfully!`,
        data: {
          oldTitle: todo.title,
          newTitle: updatedTodo.title,
          todo: updatedTodo
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update todo'
      };
    }
  }

  /**
   * Handle 'clear' command
   * @private
   */
  private handleClear(_args: Record<string, any>, options: Record<string, any>): CLIResult {
    try {
      let removedCount = 0;
      
      if (options.completed) {
        const completedTodos = this.model.getByStatus(true);
        completedTodos.forEach(todo => {
          this.model.delete(todo.id);
          removedCount++;
        });
      } else if (options.all) {
        removedCount = this.model.clear();
      }
      
      const message = removedCount > 0 
        ? `${removedCount} todo(s) cleared successfully!`
        : 'No todos to clear.';
      
      return {
        success: true,
        message,
        data: { removedCount }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear todos'
      };
    }
  }

  /**
   * Handle 'stats' command
   * @private
   */
  private handleStats(_args: Record<string, any>, options: Record<string, any>): CLIResult {
    const total = this.model.getCount();
    const completed = this.model.getCompletedCount();
    const pending = this.model.getIncompleteCount();
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const stats = {
      total,
      completed,
      pending,
      completionRate
    };
    
    const format = options.format || 'table';
    const output = this.formatStats(stats, format);
    
    return {
      success: true,
      message: output,
      data: stats
    };
  }

  /**
   * Handle 'help' command
   * @private
   */
  private handleHelp(args: Record<string, any>, _options: Record<string, any>): CLIResult {
    const commandName = args.command;
    const helpText = this.helpSystem.getHelp(commandName);
    
    return {
      success: true,
      message: helpText
    };
  }

  /**
   * Find todo by ID or index
   * @private
   */
  private findTodoById(id: string): Todo | null {
    // Try to find by exact ID first
    let todo = this.model.getById(id);
    
    if (!todo) {
      // Try to parse as index (1-based)
      const index = parseInt(id);
      if (!isNaN(index) && index > 0) {
        const todos = this.model.getAll();
        if (index <= todos.length) {
          todo = todos[index - 1];
        }
      }
    }
    
    return todo;
  }

  /**
   * Format todo list for display
   * @private
   */
  private formatTodoList(todos: Todo[], format: string): string {
    if (todos.length === 0) {
      return 'No todos found.';
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(todos, null, 2);
      
      case 'simple':
        return todos.map((todo, index) => {
          const status = todo.completed ? '[x]' : '[ ]';
          return `${index + 1}. ${status} ${todo.title}`;
        }).join('\n');
      
      case 'table':
      default:
        const lines = [
          '┌─────┬─────┬──────────────────────────────────────────────┬─────────────────────┐',
          '│ #   │ ✓   │ Title                                        │ Created             │',
          '├─────┼─────┼──────────────────────────────────────────────┼─────────────────────┤'
        ];
        
        todos.forEach((todo, index) => {
          const num = String(index + 1).padEnd(3);
          const status = todo.completed ? '✓' : ' ';
          const title = todo.title.length > 44 ? todo.title.substring(0, 41) + '...' : todo.title.padEnd(44);
          const created = todo.createdAt.toLocaleString().padEnd(19);
          
          lines.push(`│ ${num} │ ${status}   │ ${title} │ ${created} │`);
        });
        
        lines.push('└─────┴─────┴──────────────────────────────────────────────┴─────────────────────┘');
        
        return lines.join('\n');
    }
  }

  /**
   * Format stats for display
   * @private
   */
  private formatStats(stats: any, format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(stats, null, 2);
      
      case 'simple':
        return `Total: ${stats.total}, Completed: ${stats.completed}, Pending: ${stats.pending}, Completion: ${stats.completionRate}%`;
      
      case 'table':
      default:
        return [
          '┌─────────────────┬───────┐',
          '│ Statistic       │ Value │',
          '├─────────────────┼───────┤',
          `│ Total Todos     │ ${String(stats.total).padStart(5)} │`,
          `│ Completed       │ ${String(stats.completed).padStart(5)} │`,
          `│ Pending         │ ${String(stats.pending).padStart(5)} │`,
          `│ Completion Rate │ ${String(stats.completionRate + '%').padStart(5)} │`,
          '└─────────────────┴───────┘'
        ].join('\n');
    }
  }
}