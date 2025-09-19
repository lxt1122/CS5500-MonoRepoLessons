import * as blessed from 'blessed';
import { Todo } from '../models/Todo';
import { UIPanel, PanelType, BlessedUIFramework } from './BlessedUIFramework';

/**
 * Todo Details Panel
 * Displays detailed information about a selected todo with editing capabilities
 */
export class TodoDetailsPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.DETAILS;
  title: string = 'Todo Details';
  focusable: boolean = true;
  visible: boolean = true;

  private contentBox!: blessed.Widgets.BoxElement;
  private currentTodo: Todo | null = null;
  private framework: BlessedUIFramework;
  private editMode: boolean = false;
  private editForm: {
    titleBox?: blessed.Widgets.BoxElement;
    descriptionBox?: blessed.Widgets.BoxElement;
    titleInput?: blessed.Widgets.TextareaElement;
    descriptionInput?: blessed.Widgets.TextareaElement;
    saveButton?: blessed.Widgets.BoxElement;
    cancelButton?: blessed.Widgets.BoxElement;
  } = {};
  private onUpdate?: (todo: Todo) => void;

  constructor(framework: BlessedUIFramework) {
    this.framework = framework;
    this.initializeElement();
    this.setupEventHandlers();
    this.showEmptyState();
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
      ...layout.details,
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
      clickable: true,
      scrollable: true,
      alwaysScroll: true
    });

    // Content area
    this.contentBox = blessed.box({
      parent: this.element,
      top: 0,
      left: 0,
      width: '100%-2',
      height: '100%-2',
      style: {
        fg: theme.text
      },
      tags: true,
      scrollable: true
    });
  }

  /**
   * Set up event handlers for the panel
   * @private
   */
  private setupEventHandlers(): void {
    // Edit mode toggle
    this.element.key(['e'], () => {
      if (this.currentTodo && !this.editMode) {
        this.enterEditMode();
      }
    });

    // Exit edit mode
    this.element.key(['escape'], () => {
      if (this.editMode) {
        this.exitEditMode();
      }
    });

    // Save in edit mode
    this.element.key(['C-s'], () => {
      if (this.editMode) {
        this.saveChanges();
      }
    });

    // Mouse support
    this.element.on('click', () => {
      this.focus();
    });
  }

  /**
   * Display a todo in the details panel
   * @param todo - Todo to display
   */
  displayTodo(todo: Todo | null): void {
    this.currentTodo = todo;
    this.exitEditMode(); // Exit edit mode if active
    
    if (!todo) {
      this.showEmptyState();
      return;
    }

    this.showTodoDetails(todo);
    this.updateTitle(todo);
    this.framework.render();
  }

  /**
   * Show todo details in view mode
   * @private
   * @param todo - Todo to display
   */
  private showTodoDetails(todo: Todo): void {
    const theme = this.framework.getTheme();
    
    // Status line
    const statusIcon = todo.completed ? '✓' : '○';
    const statusColor = todo.completed ? theme.completed : theme.text;
    const statusText = todo.completed ? 'Completed' : 'Pending';
    
    // Dates
    const createdDate = todo.createdAt.toLocaleString();
    const updatedDate = todo.updatedAt.toLocaleString();
    
    const content = [
      `{bold}Title:{/bold}`,
      `  ${todo.title}`,
      '',
      `{bold}Status:{/bold}`,
      `  {${statusColor}-fg}${statusIcon} ${statusText}{/${statusColor}-fg}`,
      '',
      `{bold}Description:{/bold}`,
      ...(todo.description 
        ? todo.description.split('\n').map((line: string) => `  ${line}`)
        : ['  {gray-fg}No description{/gray-fg}']
      ),
      '',
      `{bold}Created:{/bold}`,
      `  {gray-fg}${createdDate}{/gray-fg}`,
      '',
      `{bold}Last Updated:{/bold}`,
      `  {gray-fg}${updatedDate}{/gray-fg}`,
      '',
      '{gray-fg}Press \'e\' to edit, \'space\' to toggle completion{/gray-fg}'
    ].join('\n');

    this.contentBox.setContent(content);
  }

  /**
   * Show empty state when no todo is selected
   * @private
   */
  private showEmptyState(): void {
    const theme = this.framework.getTheme();
    
    this.contentBox.setContent([
      '{center}{bold}No Todo Selected{/bold}{/center}',
      '',
      `{center}{${theme.text}-fg}Select a todo from the list{/${theme.text}-fg}{/center}`,
      `{center}{${theme.text}-fg}to view its details here{/${theme.text}-fg}{/center}`,
      '',
      '{center}{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}{/center}',
      '',
      '{center}{gray-fg}Keyboard shortcuts:{/gray-fg}{/center}',
      '{center}{gray-fg}↑/↓ - Navigate todos{/gray-fg}{/center}',
      '{center}{gray-fg}Enter - View details{/gray-fg}{/center}',
      '{center}{gray-fg}Space - Toggle completion{/gray-fg}{/center}',
      '{center}{gray-fg}n - New todo{/gray-fg}{/center}',
      '{center}{gray-fg}e - Edit todo{/gray-fg}{/center}',
      '{center}{gray-fg}d - Delete todo{/gray-fg}{/center}'
    ].join('\n'));

    this.element.setLabel(` ${this.title} `);
  }

  /**
   * Enter edit mode for the current todo
   * @private
   */
  private enterEditMode(): void {
    if (!this.currentTodo) return;

    this.editMode = true;
    this.createEditForm();
    this.updateTitle(this.currentTodo);
  }

  /**
   * Create the edit form
   * @private
   */
  private createEditForm(): void {
    if (!this.currentTodo) return;

    const theme = this.framework.getTheme();
    
    // Clear content
    this.contentBox.setContent('');

    // Title section
    this.editForm.titleBox = blessed.box({
      parent: this.contentBox,
      top: 0,
      left: 0,
      width: '100%',
      height: 4,
      content: '{bold}Title:{/bold}',
      tags: true,
      style: {
        fg: theme.text
      }
    });

    this.editForm.titleInput = blessed.textarea({
      parent: this.contentBox,
      top: 1,
      left: 2,
      width: '100%-4',
      height: 3,
      value: this.currentTodo.title,
      keys: true,
      input: true,
      border: {
        type: 'line'
      },
      style: {
        fg: theme.text,
        bg: theme.background,
        border: {
          fg: theme.border
        },
        focus: {
          border: {
            fg: theme.selected
          }
        }
      }
    });

    // Description section
    this.editForm.descriptionBox = blessed.box({
      parent: this.contentBox,
      top: 5,
      left: 0,
      width: '100%',
      height: 2,
      content: '{bold}Description:{/bold}',
      tags: true,
      style: {
        fg: theme.text
      }
    });

    this.editForm.descriptionInput = blessed.textarea({
      parent: this.contentBox,
      top: 6,
      left: 2,
      width: '100%-4',
      height: 8,
      value: this.currentTodo.description || '',
      keys: true,
      input: true,
      scrollable: true,
      border: {
        type: 'line'
      },
      style: {
        fg: theme.text,
        bg: theme.background,
        border: {
          fg: theme.border
        },
        focus: {
          border: {
            fg: theme.selected
          }
        }
      }
    });

    // Buttons
    this.editForm.saveButton = blessed.box({
      parent: this.contentBox,
      top: 15,
      left: 2,
      width: 12,
      height: 3,
      content: '{center}{bold}Save{/bold}{/center}',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'green',
        border: {
          fg: 'green'
        }
      },
      clickable: true,
      keys: true,
      input: true
    });

    this.editForm.cancelButton = blessed.box({
      parent: this.contentBox,
      top: 15,
      left: 16,
      width: 12,
      height: 3,
      content: '{center}{bold}Cancel{/bold}{/center}',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'red',
        border: {
          fg: 'red'
        }
      },
      clickable: true,
      keys: true,
      input: true
    });

    // Button event handlers
    this.editForm.saveButton.on('click', () => this.saveChanges());
    this.editForm.cancelButton.on('click', () => this.exitEditMode());

    this.editForm.saveButton.key(['enter'], () => this.saveChanges());
    this.editForm.cancelButton.key(['enter'], () => this.exitEditMode());

    // Tab navigation
    this.editForm.titleInput.key(['tab'], () => {
      this.editForm.descriptionInput?.focus();
    });

    this.editForm.descriptionInput.key(['tab'], () => {
      this.editForm.saveButton?.focus();
    });

    this.editForm.saveButton.key(['tab'], () => {
      this.editForm.cancelButton?.focus();
    });

    this.editForm.cancelButton.key(['tab'], () => {
      this.editForm.titleInput?.focus();
    });

    // Focus the title input
    this.editForm.titleInput.focus();
  }

  /**
   * Save changes from edit form
   * @private
   */
  private saveChanges(): void {
    if (!this.currentTodo || !this.editForm.titleInput || !this.editForm.descriptionInput) {
      return;
    }

    const newTitle = this.editForm.titleInput.getValue().trim();
    const newDescription = this.editForm.descriptionInput.getValue().trim();

    if (!newTitle) {
      this.showMessage('Title cannot be empty!', 'error');
      return;
    }

    // Update the todo
    this.currentTodo.title = newTitle;
    this.currentTodo.description = newDescription || undefined;
    this.currentTodo.updatedAt = new Date();

    if (this.onUpdate) {
      this.onUpdate(this.currentTodo);
    }

    this.exitEditMode();
    this.displayTodo(this.currentTodo);
    this.showMessage('Todo updated successfully!', 'success');
  }

  /**
   * Exit edit mode and return to view mode
   * @private
   */
  private exitEditMode(): void {
    this.editMode = false;
    
    // Clean up edit form
    Object.values(this.editForm).forEach(element => {
      if (element) {
        element.destroy();
      }
    });
    this.editForm = {};

    if (this.currentTodo) {
      this.showTodoDetails(this.currentTodo);
      this.updateTitle(this.currentTodo);
    } else {
      this.showEmptyState();
    }
  }

  /**
   * Update the panel title
   * @private
   */
  private updateTitle(_todo: Todo): void {
    const mode = this.editMode ? ' (Editing)' : '';
    const title = `Todo Details${mode}`;
    this.element.setLabel(` ${title} `);
  }

  /**
   * Show a temporary message
   * @private
   * @param message - Message to show
   * @param type - Message type (success/error)
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    const color = type === 'success' ? 'green' : 'red';
    
    const messageBox = blessed.box({
      parent: this.framework.getScreen(),
      top: 'center',
      left: 'center',
      width: message.length + 4,
      height: 3,
      content: `{center}{${color}-fg}${message}{/${color}-fg}{/center}`,
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: color
        }
      }
    });

    this.framework.render();
    
    setTimeout(() => {
      messageBox.destroy();
      this.framework.render();
    }, 2000);
  }

  /**
   * Set update callback
   * @param callback - Function to call when todo is updated
   */
  onTodoUpdate(callback: (todo: Todo) => void): void {
    this.onUpdate = callback;
  }

  // UIPanel interface methods
  focus(): void {
    if (this.editMode && this.editForm.titleInput) {
      this.editForm.titleInput.focus();
    } else {
      this.element.focus();
    }
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
    if (this.currentTodo) {
      this.displayTodo(this.currentTodo);
    }
  }
}