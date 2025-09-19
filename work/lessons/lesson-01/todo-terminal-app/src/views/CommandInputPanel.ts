import * as blessed from 'blessed';
import { UIPanel, PanelType, BlessedUIFramework } from './BlessedUIFramework';

/**
 * Command Input Panel
 * Provides command line interface within the terminal UI
 */
export class CommandInputPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.COMMAND_INPUT;
  title: string = 'Command Input';
  focusable: boolean = true;
  visible: boolean = true;

  private inputBox!: blessed.Widgets.TextboxElement;
  private framework: BlessedUIFramework;
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  private onCommand?: (command: string) => void;
  private autoCompleteOptions: string[] = [
    'add',
    'list',
    'complete',
    'remove',
    'edit',
    'clear',
    'stats',
    'help',
    'exit',
    'quit'
  ];

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
      ...layout.commandInput,
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

    // Command input textbox
    this.inputBox = blessed.textbox({
      parent: this.element,
      top: 0,
      left: 2,
      width: '100%-4',
      height: 1,
      keys: true,
      input: true,
      style: {
        fg: theme.text,
        bg: theme.background
      }
    });
  }

  /**
   * Set up event handlers for the panel
   * @private
   */
  private setupEventHandlers(): void {
    // Command submission
    this.inputBox.key(['enter'], () => {
      const command = this.inputBox.getValue().trim();
      if (command) {
        this.executeCommand(command);
        this.inputBox.clearValue();
      }
    });

    // Command history navigation
    this.inputBox.key(['up'], () => {
      this.navigateHistory(-1);
    });

    this.inputBox.key(['down'], () => {
      this.navigateHistory(1);
    });

    // Tab completion
    this.inputBox.key(['tab'], () => {
      this.handleTabCompletion();
    });

    // Clear input
    this.inputBox.key(['C-l'], () => {
      this.inputBox.clearValue();
    });

    // Mouse support
    this.element.on('click', () => {
      this.focus();
    });

    // Auto-focus when visible
    this.inputBox.on('focus', () => {
      this.element.style.border!.fg = this.framework.getTheme().selected;
      this.framework.render();
    });

    this.inputBox.on('blur', () => {
      this.element.style.border!.fg = this.framework.getTheme().border;
      this.framework.render();
    });
  }

  /**
   * Execute a command
   * @private
   * @param command - Command to execute
   */
  private executeCommand(command: string): void {
    // Add to history
    if (this.commandHistory[this.commandHistory.length - 1] !== command) {
      this.commandHistory.push(command);
      
      // Limit history size
      if (this.commandHistory.length > 100) {
        this.commandHistory.shift();
      }
    }
    this.historyIndex = -1;

    // Execute command
    if (this.onCommand) {
      this.onCommand(command);
    }

    // Show command in input temporarily
    this.showFeedback(`Executed: ${command}`);
  }

  /**
   * Navigate command history
   * @private
   * @param direction - Direction to navigate (-1 for up, 1 for down)
   */
  private navigateHistory(direction: number): void {
    if (this.commandHistory.length === 0) return;

    if (direction === -1) {
      // Navigate up (older commands)
      if (this.historyIndex === -1) {
        this.historyIndex = this.commandHistory.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      // Navigate down (newer commands)
      if (this.historyIndex === -1) return;
      
      this.historyIndex++;
      if (this.historyIndex >= this.commandHistory.length) {
        this.historyIndex = -1;
        this.inputBox.clearValue();
        return;
      }
    }

    if (this.historyIndex >= 0) {
      this.inputBox.setValue(this.commandHistory[this.historyIndex]);
    }
  }

  /**
   * Handle tab completion
   * @private
   */
  private handleTabCompletion(): void {
    const currentInput = this.inputBox.getValue();
    const words = currentInput.split(' ');
    const lastWord = words[words.length - 1];

    if (words.length === 1) {
      // Complete command names
      const matches = this.autoCompleteOptions.filter(cmd => 
        cmd.startsWith(lastWord.toLowerCase())
      );

      if (matches.length === 1) {
        this.inputBox.setValue(matches[0] + ' ');
      } else if (matches.length > 1) {
        this.showCompletionOptions(matches);
      }
    }
  }

  /**
   * Show completion options
   * @private
   * @param options - Available completion options
   */
  private showCompletionOptions(options: string[]): void {
    const message = `Available: ${options.join(', ')}`;
    this.showFeedback(message, 3000);
  }

  /**
   * Show temporary feedback message
   * @private
   * @param message - Message to show
   * @param duration - Duration in milliseconds (default: 2000)
   */
  private showFeedback(message: string, duration: number = 2000): void {
    // Store original value and show feedback
    const originalValue = this.inputBox.getValue();
    this.inputBox.setValue(`[${message}]`);
    this.framework.render();

    setTimeout(() => {
      this.inputBox.setValue(originalValue);
      this.framework.render();
    }, duration);
  }

  /**
   * Set command handler
   * @param callback - Function to call when command is executed
   */
  onCommandExecuted(callback: (command: string) => void): void {
    this.onCommand = callback;
  }

  /**
   * Get command history
   * @returns Array of command history
   */
  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = [];
    this.historyIndex = -1;
  }

  /**
   * Add custom auto-complete option
   * @param option - Option to add
   */
  addAutoCompleteOption(option: string): void {
    if (!this.autoCompleteOptions.includes(option.toLowerCase())) {
      this.autoCompleteOptions.push(option.toLowerCase());
    }
  }

  /**
   * Set placeholder text
   * @param text - Placeholder text
   */
  setPlaceholder(text: string): void {
    // Show placeholder as a temporary message
    this.showFeedback(`Placeholder: ${text}`, 1000);
  }

  /**
   * Focus the input box
   */
  focusInput(): void {
    this.inputBox.focus();
  }

  /**
   * Get current input value
   * @returns Current input value
   */
  getCurrentInput(): string {
    return this.inputBox.getValue();
  }

  /**
   * Set input value
   * @param value - Value to set
   */
  setInputValue(value: string): void {
    this.inputBox.setValue(value);
  }

  /**
   * Clear current input
   */
  clearInput(): void {
    this.inputBox.clearValue();
  }

  // UIPanel interface methods
  focus(): void {
    this.inputBox.focus();
  }

  blur(): void {
    // Focus is handled by blessed automatically when switching panels
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
    this.framework.render();
  }
}