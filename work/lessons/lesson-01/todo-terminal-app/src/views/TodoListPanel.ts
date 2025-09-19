import * as blessed from 'blessed';
import { Todo } from '../models/Todo';
import { UIPanel, PanelType, BlessedUIFramework } from './BlessedUIFramework';

/**
 * Todo List Panel
 * Advanced scrollable list with selection, highlighting, and rich display
 */
export class TodoListPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.TODO_LIST;
  title: string = 'Todo List';
  focusable: boolean = true;
  visible: boolean = true;

  private list!: blessed.Widgets.ListElement;
  private todos: Todo[] = [];
  private selectedIndex: number = 0;
  private framework: BlessedUIFramework;
  private onSelectionChange?: (todo: Todo | null, index: number) => void;
  private onAction?: (action: string, todo: Todo | null, index: number) => void;

  constructor(framework: BlessedUIFramework) {
    this.framework = framework;
    this.initializeElement();
    this.setupEventHandlers();
  }

  /**
   * Initialize the panel element
   * @private
   */
  private initializeElement(): void {
    const layout = this.framework.getLayout();
    const theme = this.framework.getTheme();

    // Main container
    this.element = blessed.box({
      parent: this.framework.getScreen(),
      label: ` ${this.title} `,
      ...layout.todoList,
      border: {
        type: 'line'
      },
      style: {
        fg: theme.text,
        bg: theme.background,
        border: {
          fg: theme.border
        }
      },
      tags: true,
      keys: true,
      input: true,
      clickable: true
    });

    // Todo list widget
    this.list = blessed.list({
      parent: this.element,
      top: 0,
      left: 0,
      width: '100%-2',
      height: '100%-2',
      items: [],
      keys: true,
      vi: true,
      mouse: false,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█',
        style: {
          bg: theme.secondary
        }
      },
      style: {
        fg: theme.text,
        selected: {
          bg: theme.selected,
          fg: 'white',
          bold: true
        },
        item: {
          fg: theme.text
        }
      }
    });
  }

  /**
   * Set up event handlers for the panel
   * @private
   */
  private setupEventHandlers(): void {
    // Selection change
    this.list.on('select', (_, index) => {
      this.selectedIndex = index;
      const todo = this.todos[index] || null;
      
      if (this.onSelectionChange) {
        this.onSelectionChange(todo, index);
      }
    });

    // Key handlers for actions
    this.list.key(['enter'], () => {
      const todo = this.getSelectedTodo();
      if (todo && this.onAction) {
        this.onAction('view', todo, this.selectedIndex);
      }
    });

    this.list.key(['space'], () => {
      const todo = this.getSelectedTodo();
      if (todo && this.onAction) {
        this.onAction('toggle', todo, this.selectedIndex);
      }
    });

    this.list.key(['n'], () => {
      if (this.onAction) {
        this.onAction('new', null, -1);
      }
    });

    this.list.key(['d', 'delete'], () => {
      const todo = this.getSelectedTodo();
      if (todo && this.onAction) {
        this.onAction('delete', todo, this.selectedIndex);
      }
    });

    this.list.key(['e'], () => {
      const todo = this.getSelectedTodo();
      if (todo && this.onAction) {
        this.onAction('edit', todo, this.selectedIndex);
      }
    });

    this.list.key(['r', 'f5'], () => {
      if (this.onAction) {
        this.onAction('refresh', null, -1);
      }
    });

    // Mouse support
    this.list.on('click', () => {
      this.focus();
    });
  }

  /**
   * Update the todos displayed in the list
   * @param todos - Array of todos to display
   */
  updateTodos(todos: Todo[]): void {
    this.todos = [...todos];
    
    // Format todos for display
    const items = todos.map((todo, index) => this.formatTodoItem(todo, index));
    
    // Preserve selection if possible
    const wasEmpty = (this.list as any).items.length === 0;
    this.list.setItems(items);
    
    // Handle selection
    if (todos.length === 0) {
      this.selectedIndex = -1;
      this.showEmptyState();
    } else {
      // Adjust selection if it's out of bounds
      if (this.selectedIndex >= todos.length) {
        this.selectedIndex = todos.length - 1;
      }
      
      if (this.selectedIndex < 0) {
        this.selectedIndex = 0;
      }
      
      this.list.select(this.selectedIndex);
      
      if (wasEmpty) {
        // First time loading, trigger selection event
        const todo = this.todos[this.selectedIndex];
        if (this.onSelectionChange && todo) {
          this.onSelectionChange(todo, this.selectedIndex);
        }
      }
    }
    
    this.updateTitle();
    this.framework.render();
  }

  /**
   * Format a todo item for display
   * @private
   * @param todo - Todo item to format
   * @param index - Index in the list
   * @returns Formatted string
   */
  private formatTodoItem(todo: Todo, index: number): string {
    const theme = this.framework.getTheme();
    const number = String(index + 1).padStart(2, ' ');
    const checkbox = todo.completed ? '✓' : '○';
    const checkboxColor = todo.completed ? `{${theme.completed}-fg}` : `{${theme.text}-fg}`;
    
    // Title formatting
    let title = todo.title;
    if (title.length > 35) {
      title = title.substring(0, 32) + '...';
    }
    
    // Completion styling
    const titleStyle = todo.completed 
      ? `{${theme.completed}-fg}{strikethrough}${title}{/strikethrough}{/${theme.completed}-fg}`
      : title;
    
    // Date formatting
    const date = todo.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    return `${number}. ${checkboxColor}${checkbox}{/${checkboxColor.split('-')[0]}-fg} ${titleStyle} {gray-fg}(${date}){/gray-fg}`;
  }

  /**
   * Show empty state message
   * @private
   */
  private showEmptyState(): void {
    const theme = this.framework.getTheme();
    this.list.setItems([
      `{center}{${theme.text}-fg}No todos yet{/${theme.text}-fg}{/center}`,
      `{center}{gray-fg}Press 'n' to create your first todo{/gray-fg}{/center}`
    ]);
  }

  /**
   * Update the panel title with todo count
   * @private
   */
  private updateTitle(): void {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    this.element.setLabel(` Todo List (${pending}/${total}) `);
  }

  /**
   * Get the currently selected todo
   * @returns Selected todo or null
   */
  getSelectedTodo(): Todo | null {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.todos.length) {
      return this.todos[this.selectedIndex];
    }
    return null;
  }

  /**
   * Get the selected index
   * @returns Selected index or -1
   */
  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  /**
   * Set selection change callback
   * @param callback - Function to call when selection changes
   */
  onSelectionChanged(callback: (todo: Todo | null, index: number) => void): void {
    this.onSelectionChange = callback;
  }

  /**
   * Set action callback
   * @param callback - Function to call when an action is triggered
   */
  onActionTriggered(callback: (action: string, todo: Todo | null, index: number) => void): void {
    this.onAction = callback;
  }

  /**
   * Select a specific todo by index
   * @param index - Index to select
   */
  selectTodo(index: number): void {
    if (index >= 0 && index < this.todos.length) {
      this.selectedIndex = index;
      this.list.select(index);
      
      const todo = this.todos[index];
      if (this.onSelectionChange) {
        this.onSelectionChange(todo, index);
      }
    }
  }

  /**
   * Scroll to a specific todo
   * @param index - Index to scroll to
   */
  scrollToTodo(index: number): void {
    if (index >= 0 && index < this.todos.length) {
      this.list.select(index);
      this.selectedIndex = index;
    }
  }

  /**
   * Search and highlight todos matching a query
   * @param query - Search query
   * @returns Number of matches found
   */
  searchTodos(query: string): number {
    if (!query.trim()) {
      this.updateTodos(this.todos);
      return this.todos.length;
    }

    const matches = this.todos.filter(todo =>
      todo.title.toLowerCase().includes(query.toLowerCase())
    );

    this.updateTodos(matches);
    return matches.length;
  }

  // UIPanel interface methods
  focus(): void {
    this.list.focus();
  }

  blur(): void {
    // Blur is handled by blessed automatically
  }

  show(): void {
    this.element.show();
    this.visible = true;
  }

  hide(): void {
    this.element.hide();
    this.visible = false;
  }

  refresh(): void {
    // Refresh is handled by updateTodos
  }
}