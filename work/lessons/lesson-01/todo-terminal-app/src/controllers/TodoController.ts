import * as blessed from 'blessed';
import { TodoModel } from '../models/TodoModel';
import { TodoView } from '../views/TodoView';

/**
 * Controller class that connects Model and View
 * Handles all user interactions and business logic
 */
export class TodoController {
  private model: TodoModel;
  private view: TodoView;

  constructor(model: TodoModel, view: TodoView) {
    this.model = model;
    this.view = view;
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Initial display of todos
    this.refreshView();
  }

  /**
   * Set up all event handlers for the View
   * @private
   */
  private setupEventHandlers(): void {
    const screen = this.view.getScreen();
    const list = this.view.getList();

    // Handle 'a' key - Add new todo
    screen.key(['a'], () => {
      this.handleAdd();
    });

    // Handle 'd' key - Delete selected todo
    screen.key(['d'], () => {
      this.handleDelete();
    });

    // Handle 'space' key - Toggle completion
    screen.key(['space'], () => {
      this.handleToggleComplete();
    });

    // Handle Enter key on list - also toggle completion
    list.on('select', () => {
      this.handleToggleComplete();
    });
  }

  /**
   * Handle adding a new todo
   * @private
   */
  private handleAdd(): void {
    const screen = this.view.getScreen();
    
    // Create a simple prompt
    const prompt = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      height: 'shrink',
      width: 'half',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'cyan'
        }
      }
    });

    prompt.input('Enter new todo:', '', (err, value) => {
      if (!err && value && value.trim()) {
        try {
          // Add todo to model
          this.model.add(value.trim());
          
          // Update view
          this.refreshView();
          
          // Show success message
          this.view.showMessage('Todo added successfully!', 'success');
        } catch (error: any) {
          this.view.showMessage(error.message || 'Failed to add todo', 'error');
        }
      }
      
      // Refocus the list
      this.view.focusList();
      screen.render();
    });
  }

  /**
   * Handle deleting the selected todo
   * @private
   */
  private handleDelete(): void {
    const selectedTodo = this.view.getSelectedTodo();
    
    if (!selectedTodo) {
      this.view.showMessage('No todo selected', 'error');
      return;
    }

    const screen = this.view.getScreen();
    
    // Create confirmation dialog
    const question = blessed.question({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 'half',
      height: 'shrink',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'red'
        }
      }
    });

    question.ask(`Delete "${selectedTodo.title}"? (y/n)`, (err, value) => {
      if (!err && value && value.toLowerCase() === 'y') {
        try {
          // Delete from model
          const deleted = this.model.delete(selectedTodo.id);
          
          if (deleted) {
            // Update view
            this.refreshView();
            
            // Show success message
            this.view.showMessage('Todo deleted successfully!', 'success');
          } else {
            this.view.showMessage('Failed to delete todo', 'error');
          }
        } catch (error: any) {
          this.view.showMessage(error.message || 'Failed to delete todo', 'error');
        }
      }
      
      // Refocus the list
      this.view.focusList();
      screen.render();
    });
  }

  /**
   * Handle toggling completion status of selected todo
   * @private
   */
  private handleToggleComplete(): void {
    const selectedTodo = this.view.getSelectedTodo();
    
    if (!selectedTodo) {
      this.view.showMessage('No todo selected', 'error');
      return;
    }

    try {
      // Toggle in model
      const toggled = this.model.toggleComplete(selectedTodo.id);
      
      if (toggled) {
        // Update view
        this.refreshView();
        
        // Show feedback
        const status = !selectedTodo.completed ? 'completed' : 'uncompleted';
        this.view.showMessage(`Todo marked as ${status}!`, 'success');
      } else {
        this.view.showMessage('Failed to update todo', 'error');
      }
    } catch (error: any) {
      this.view.showMessage(error.message || 'Failed to update todo', 'error');
    }
  }

  /**
   * Refresh the view with current model data
   * @private
   */
  private refreshView(): void {
    const todos = this.model.getAll();
    this.view.updateTodos(todos);
  }
}