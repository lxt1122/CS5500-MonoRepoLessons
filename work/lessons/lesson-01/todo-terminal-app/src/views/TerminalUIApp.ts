import * as blessed from 'blessed';
import { TodoModel } from '../models/TodoModel';
import { BlessedUIFramework, PanelType } from './BlessedUIFramework';
import { TodoListPanel } from './TodoListPanel';
import { TodoDetailsPanel } from './TodoDetailsPanel';
import { CommandInputPanel } from './CommandInputPanel';
import { StatusBarPanel } from './StatusBarPanel';
import { Todo } from '../models/Todo';

/**
 * Terminal UI Application
 * Main application that coordinates all panels and provides full terminal UI experience
 */
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
    this.setupKeyBindings();
    this.loadInitialData();
  }

  /**
   * Set up panels in the framework
   * @private
   */
  private setupPanels(): void {
    this.framework.registerPanel(this.todoListPanel);
    this.framework.registerPanel(this.detailsPanel);
    this.framework.registerPanel(this.commandInputPanel);
    this.framework.registerPanel(this.statusBarPanel);

    // Set initial focus to todo list
    this.framework.switchToPanel(PanelType.TODO_LIST);
  }

  /**
   * Set up panel event handlers
   * @private
   */
  private setupEventHandlers(): void {
    // Todo list panel events
    this.todoListPanel.onSelectionChanged((todo, index) => {
      this.detailsPanel.displayTodo(todo);
      if (todo) {
        this.statusBarPanel.showPanelInfo(
          `Todo ${index + 1}/${this.todoModel.getAll().length}`,
          `${todo.title} - Press 'e' to edit, space to toggle`
        );
      }
    });

    this.todoListPanel.onActionTriggered((action, todo, index) => {
      this.handleTodoAction(action, todo, index);
    });

    // Details panel events
    this.detailsPanel.onTodoUpdate((_updatedTodo) => {
      this.refreshAllData();
      this.statusBarPanel.showMessage('Todo updated successfully!', 'success');
    });

    // Command input panel events
    this.commandInputPanel.onCommandExecuted((command) => {
      this.handleCommand(command);
    });

    // Update status when panels are switched manually
    // Note: We'll check current panel in event handlers since onPanelSwitch doesn't exist yet
  }

  /**
   * Set up global key bindings
   * @private
   */
  private setupKeyBindings(): void {
    const screen = this.framework.getScreen();

    // Global quit
    screen.key(['C-c', 'C-q'], () => {
      this.quit();
    });

    // Help
    screen.key(['?', 'f1'], () => {
      this.showHelp();
    });

    // Refresh
    screen.key(['f5'], () => {
      this.refreshAllData();
      this.statusBarPanel.showMessage('Data refreshed', 'info');
    });

    // Quick actions
    screen.key(['space'], () => {
      if (this.framework.getCurrentPanel() === PanelType.TODO_LIST) {
        const selectedTodo = this.todoListPanel.getSelectedTodo();
        if (selectedTodo) {
          this.toggleTodoCompletion(selectedTodo);
        }
      }
    });

    // Panel navigation with status updates
    screen.key(['tab'], () => {
      // Tab is handled by framework, but we update status after
      setTimeout(() => {
        this.updateStatusForCurrentPanel();
      }, 10);
    });

    screen.key(['S-tab'], () => {
      // Shift+Tab is handled by framework, but we update status after
      setTimeout(() => {
        this.updateStatusForCurrentPanel();
      }, 10);
    });
  }

  /**
   * Update status for the currently active panel
   * @private
   */
  private updateStatusForCurrentPanel(): void {
    const currentPanel = this.framework.getCurrentPanel();
    this.updateStatusForPanel(currentPanel);
  }

  /**
   * Handle todo actions from the list panel
   * @private
   * @param action - Action to perform
   * @param todo - Todo item (may be null for some actions)
   * @param index - Index of todo in list
   */
  private handleTodoAction(action: string, todo: Todo | null, index: number): void {
    switch (action) {
      case 'view':
        if (todo) {
          this.detailsPanel.displayTodo(todo);
          this.framework.switchToPanel(PanelType.DETAILS);
        }
        break;

      case 'toggle':
        if (todo) {
          this.toggleTodoCompletion(todo);
        }
        break;

      case 'new':
        this.framework.switchToPanel(PanelType.COMMAND_INPUT);
        this.commandInputPanel.setInputValue('add ');
        this.commandInputPanel.focusInput();
        break;

      case 'delete':
        if (todo) {
          this.deleteTodo(todo, index);
        }
        break;

      case 'edit':
        if (todo) {
          this.detailsPanel.displayTodo(todo);
          this.framework.switchToPanel(PanelType.DETAILS);
          // The details panel will enter edit mode automatically
        }
        break;

      case 'refresh':
        this.refreshAllData();
        this.statusBarPanel.showMessage('Todos refreshed', 'info');
        break;
    }
  }

  /**
   * Handle commands from the command input panel
   * @private
   * @param command - Command string to execute
   */
  private async handleCommand(command: string): Promise<void> {
    try {
      this.statusBarPanel.showLoading('Executing command');
      
      // Simple command parsing and execution
      const parts = command.trim().split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      let result = '';
      
      switch (cmd) {
        case 'add':
          if (args.length === 0) {
            throw new Error('Please provide a title for the todo');
          }
          const title = args.join(' ');
          this.todoModel.add(title);
          result = `Added todo: "${title}"`;
          break;
          
        case 'list':
          const todos = this.todoModel.getAll();
          result = `Found ${todos.length} todos`;
          break;
          
        case 'complete':
          if (args.length === 0) {
            throw new Error('Please provide a todo ID');
          }
          const completeId = args[0];
          const completedTodo = this.todoModel.toggleComplete(completeId);
          if (completedTodo) {
            result = `Todo marked as ${completedTodo.completed ? 'completed' : 'pending'}`;
          } else {
            throw new Error('Todo not found');
          }
          break;
          
        case 'remove':
        case 'delete':
          if (args.length === 0) {
            throw new Error('Please provide a todo ID');
          }
          const deleteId = args[0];
          this.todoModel.delete(deleteId);
          result = 'Todo deleted successfully';
          break;
          
        case 'clear':
          this.todoModel.clear();
          result = 'All todos cleared';
          break;
          
        case 'stats':
          const allTodos = this.todoModel.getAll();
          const completed = allTodos.filter(t => t.completed).length;
          result = `Stats: ${allTodos.length} total, ${completed} completed, ${allTodos.length - completed} pending`;
          break;
          
        case 'help':
          result = 'Available commands: add, list, complete, remove, clear, stats, help';
          break;
          
        default:
          throw new Error(`Unknown command: ${cmd}`);
      }
      
      // Show result
      if (result.trim()) {
        this.statusBarPanel.showMessage(result, 'success', 2000);
      }
      
      // Refresh data after command execution
      this.refreshAllData();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command failed';
      this.statusBarPanel.showMessage(errorMessage, 'error', 3000);
    }
  }

  /**
   * Toggle completion status of a todo
   * @private
   * @param todo - Todo to toggle
   */
  private toggleTodoCompletion(todo: Todo): void {
    try {
      const updated = this.todoModel.toggleComplete(todo.id);
      if (updated) {
        this.refreshAllData();
        const status = updated.completed ? 'completed' : 'pending';
        this.statusBarPanel.showMessage(`Todo marked as ${status}`, 'success');
      }
    } catch (error) {
      this.statusBarPanel.showMessage('Failed to update todo', 'error');
    }
  }

  /**
   * Delete a todo with confirmation
   * @private
   * @param todo - Todo to delete
   * @param index - Index of todo in list
   */
  private deleteTodo(todo: Todo, index: number): void {
    // Show confirmation
    const confirmBox = blessed.question({
      parent: this.framework.getScreen(),
      top: 'center',
      left: 'center',
      width: 60,
      height: 7,
      label: ' Confirm Delete ',
      content: `Are you sure you want to delete:\n\n"${todo.title}"?\n\nPress Enter to confirm, Escape to cancel.`,
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'red'
        }
      }
    });

    confirmBox.ask('', (err, confirmed) => {
      confirmBox.destroy();
      
      if (!err && confirmed) {
        try {
          this.todoModel.delete(todo.id);
          this.refreshAllData();
          this.statusBarPanel.showMessage('Todo deleted successfully', 'success');
          
          // Adjust selection
          const todos = this.todoModel.getAll();
          if (todos.length > 0) {
            const newIndex = Math.min(index, todos.length - 1);
            this.todoListPanel.selectTodo(newIndex);
          } else {
            this.detailsPanel.displayTodo(null);
          }
        } catch (error) {
          this.statusBarPanel.showMessage('Failed to delete todo', 'error');
        }
      }
      
      this.framework.render();
    });
  }

  /**
   * Update status bar for current panel
   * @private
   * @param panelType - Current panel type
   */
  private updateStatusForPanel(panelType: PanelType): void {
    switch (panelType) {
      case PanelType.TODO_LIST:
        this.statusBarPanel.showPanelInfo(
          'Todo List',
          '↑/↓: Navigate • Enter: View • Space: Toggle • n: New • e: Edit • d: Delete'
        );
        break;

      case PanelType.DETAILS:
        this.statusBarPanel.showPanelInfo(
          'Todo Details',
          'e: Edit • Escape: Back to list • Tab: Switch panels'
        );
        break;

      case PanelType.COMMAND_INPUT:
        this.statusBarPanel.showPanelInfo(
          'Command Input',
          'Enter: Execute • ↑/↓: History • Tab: Autocomplete • Ctrl+L: Clear'
        );
        break;

      default:
        this.statusBarPanel.clear();
        break;
    }
  }

  /**
   * Load initial data and refresh all panels
   * @private
   */
  private loadInitialData(): void {
    this.refreshAllData();
    this.statusBarPanel.showMessage('Todo Terminal UI ready!', 'success', 2000);
  }

  /**
   * Refresh all data and update all panels
   * @private
   */
  private refreshAllData(): void {
    const todos = this.todoModel.getAll();
    const selectedTodo = this.todoListPanel.getSelectedTodo();
    
    // Update todo list
    this.todoListPanel.updateTodos(todos);
    
    // Update statistics
    const completed = todos.filter(t => t.completed).length;
    this.statusBarPanel.updateStats(todos.length, completed);
    
    // Update details if a todo is selected
    if (selectedTodo) {
      const updatedTodo = todos.find(t => t.id === selectedTodo.id);
      this.detailsPanel.displayTodo(updatedTodo || null);
    }
    
    this.framework.render();
  }

  /**
   * Show help dialog
   * @private
   */
  private showHelp(): void {
    const helpContent = [
      '{bold}Todo Terminal UI Help{/bold}',
      '',
      '{bold}Global Keys:{/bold}',
      '  Tab / Shift+Tab  - Switch between panels',
      '  F1 / ?           - Show this help',
      '  F5               - Refresh data',
      '  Ctrl+C / Ctrl+Q  - Quit application',
      '',
      '{bold}Todo List Panel:{/bold}',
      '  ↑ / ↓            - Navigate todos',
      '  Enter            - View selected todo details',
      '  Space            - Toggle todo completion',
      '  n                - New todo',
      '  e                - Edit selected todo',
      '  d / Delete       - Delete selected todo',
      '  r                - Refresh list',
      '',
      '{bold}Details Panel:{/bold}',
      '  e                - Enter edit mode',
      '  Escape           - Exit edit mode',
      '  Ctrl+S           - Save changes (in edit mode)',
      '  Tab              - Navigate form fields (in edit mode)',
      '',
      '{bold}Command Input Panel:{/bold}',
      '  Enter            - Execute command',
      '  ↑ / ↓            - Navigate command history',
      '  Tab              - Autocomplete commands',
      '  Ctrl+L           - Clear input',
      '',
      '{bold}Available Commands:{/bold}',
      '  add <title>      - Add new todo',
      '  list             - List all todos',
      '  complete <id>    - Mark todo as complete',
      '  remove <id>      - Delete todo',
      '  edit <id>        - Edit todo',
      '  clear            - Clear all todos',
      '  stats            - Show statistics',
      '  help             - Show command help',
      '',
      'Press Escape to close this help.'
    ].join('\n');

    const helpBox = blessed.box({
      parent: this.framework.getScreen(),
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      label: ' Help ',
      content: helpContent,
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'cyan'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      input: true
    });

    helpBox.key(['escape', 'q'], () => {
      helpBox.destroy();
      this.framework.render();
    });

    helpBox.focus();
    this.framework.render();
  }

  /**
   * Start the terminal UI application
   */
  start(): void {
    this.framework.render();
    console.log('Todo Terminal UI started. Press Ctrl+C to quit.');
  }

  /**
   * Quit the application
   */
  quit(): void {
    // Use the screen destroy method instead
    this.framework.getScreen().destroy();
    process.exit(0);
  }

  /**
   * Get the framework instance (for testing or advanced usage)
   */
  getFramework(): BlessedUIFramework {
    return this.framework;
  }

  /**
   * Get the todo model instance (for testing or advanced usage)
   */
  getTodoModel(): TodoModel {
    return this.todoModel;
  }
}