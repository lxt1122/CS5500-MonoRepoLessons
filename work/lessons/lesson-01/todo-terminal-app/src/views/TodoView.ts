import * as blessed from 'blessed';
import { Todo } from '../models/Todo';

/**
 * TodoView class implementing the blessed UI components
 * According to TODO-DESIGN.md specifications
 */
export class TodoView {
  private screen: blessed.Widgets.Screen;
  private list: blessed.Widgets.ListElement;
  private statusBar: blessed.Widgets.BoxElement;
  private title: blessed.Widgets.BoxElement;
  private todos: Todo[] = [];

  constructor() {
    // Initialize the main screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Todo Manager',
      dockBorders: true,
      fullUnicode: true,
      autoPadding: true
    });

    // Create title bar
    this.title = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '{center}{bold}Todo Manager v1.0{/bold}{/center}',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'blue',
        border: {
          fg: 'blue'
        }
      }
    });

    // Create main todo list
    this.list = blessed.list({
      parent: this.screen,
      label: ' Todos ',
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-5', // Leave room for title (3) and status bar (2)
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'cyan'
        },
        selected: {
          bg: 'blue',
          fg: 'white'
        },
        item: {
          fg: 'white'
        }
      },
      keys: true,
      vi: true, // Enable vim-style navigation
      mouse: false,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        style: {
          bg: 'blue'
        }
      },
      items: []
    });

    // Create status bar at bottom
    this.statusBar = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      content: '',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'yellow'
        }
      }
    });

    // Set up key handlers
    this.setupKeyHandlers();
    
    // Initial render
    this.updateStatusBar();
    this.screen.render();
  }

  /**
   * Set up keyboard event handlers
   * @private
   */
  private setupKeyHandlers(): void {
    // Quit on 'q' or Ctrl+C
    this.screen.key(['q', 'C-c'], () => {
      this.quit();
    });

    // List navigation is handled automatically by blessed list widget
    // but we can listen for selection changes
    this.list.on('select', (_item, index) => {
      this.onSelectTodo(index);
    });

    // Focus the list by default
    this.list.focus();
  }

  /**
   * Handle todo selection
   * @private
   * @param _index - Index of selected todo (unused in Phase 2)
   */
  private onSelectTodo(_index: number): void {
    // This will be expanded in Phase 3 when we add Controller
    // For now, just update status bar to show selection
    this.updateStatusBar();
  }

  /**
   * Update the list of todos displayed
   * @param todos - Array of todos to display
   */
  updateTodos(todos: Todo[]): void {
    this.todos = [...todos]; // Store copy for reference
    
    // Format todos for display
    const items = todos.map(todo => this.formatTodoItem(todo));
    
    // Update list items
    this.list.setItems(items);
    
    // Update status bar
    this.updateStatusBar();
    
    // Re-render screen
    this.screen.render();
  }

  /**
   * Format a todo item for display in the list
   * @private
   * @param todo - Todo item to format
   * @returns Formatted string for display
   */
  private formatTodoItem(todo: Todo): string {
    const checkbox = todo.completed ? '[x]' : '[ ]';
    const style = todo.completed ? '{strikethrough}' : '';
    const endStyle = todo.completed ? '{/strikethrough}' : '';
    
    return `${checkbox} ${style}${todo.title}${endStyle}`;
  }

  /**
   * Update the status bar with current information
   * @private
   */
  private updateStatusBar(): void {
    const totalCount = this.todos.length;
    const completedCount = this.todos.filter(t => t.completed).length;
    const selectedIndex = (this.list as any).selected || 0; // Type assertion for blessed property
    
    // Format status information
    const countsText = `${totalCount} todos (${completedCount} completed)`;
    const selectionText = totalCount > 0 ? ` | Selected: ${selectedIndex + 1}/${totalCount}` : '';
    const shortcutsText = '[a]dd [d]elete [space]complete [q]uit';
    
    const statusContent = `{center}${shortcutsText} | ${countsText}${selectionText}{/center}`;
    
    this.statusBar.setContent(statusContent);
  }

  /**
   * Get the currently selected todo
   * @returns The selected todo or null if none selected
   */
  getSelectedTodo(): Todo | null {
    const selectedIndex = (this.list as any).selected || 0; // Type assertion for blessed property
    if (selectedIndex >= 0 && selectedIndex < this.todos.length) {
      return this.todos[selectedIndex];
    }
    return null;
  }

  /**
   * Get the index of the currently selected todo
   * @returns Selected index or -1 if none selected
   */
  getSelectedIndex(): number {
    return (this.list as any).selected || 0; // Type assertion for blessed property
  }

  /**
   * Focus the todo list for keyboard navigation
   */
  focusList(): void {
    this.list.focus();
  }

  /**
   * Show a message in the title bar (for notifications)
   * @param message - Message to display
   * @param type - Message type for styling ('info', 'success', 'error')
   */
  showMessage(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const originalContent = this.title.getContent();
    
    // Style based on type
    let styledMessage: string;
    switch (type) {
      case 'success':
        styledMessage = `{center}{green-fg}{bold}✓ ${message}{/bold}{/green-fg}{/center}`;
        break;
      case 'error':
        styledMessage = `{center}{red-fg}{bold}✗ ${message}{/bold}{/red-fg}{/center}`;
        break;
      default:
        styledMessage = `{center}{yellow-fg}{bold}ℹ ${message}{/bold}{/yellow-fg}{/center}`;
    }
    
    this.title.setContent(styledMessage);
    this.screen.render();
    
    // Restore original content after 2 seconds
    setTimeout(() => {
      this.title.setContent(originalContent);
      this.screen.render();
    }, 2000);
  }

  /**
   * Handle empty state when no todos exist
   * @private
   */
  private showEmptyState(): void {
    this.list.setItems(['{center}{dim}No todos yet. Press "a" to add your first todo!{/dim}{/center}']);
    this.screen.render();
  }

  /**
   * Refresh the entire display
   */
  refresh(): void {
    if (this.todos.length === 0) {
      this.showEmptyState();
    } else {
      this.updateTodos(this.todos);
    }
  }

  /**
   * Clean up and quit the application
   */
  quit(): void {
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Get the blessed screen instance (for advanced usage)
   * @returns The blessed screen
   */
  getScreen(): blessed.Widgets.Screen {
    return this.screen;
  }

  /**
   * Get the blessed list widget (for advanced usage)
   * @returns The blessed list widget
   */
  getList(): blessed.Widgets.ListElement {
    return this.list;
  }
}