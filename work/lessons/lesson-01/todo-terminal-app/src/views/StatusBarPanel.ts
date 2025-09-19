import * as blessed from 'blessed';
import { UIPanel, PanelType, BlessedUIFramework } from './BlessedUIFramework';

/**
 * Status Bar Panel
 * Displays application status, help information, and statistics
 */
export class StatusBarPanel implements UIPanel {
  element!: blessed.Widgets.BoxElement;
  type: PanelType = PanelType.STATUS;
  title: string = 'Status';
  focusable: boolean = false;
  visible: boolean = true;

  private statusText!: blessed.Widgets.BoxElement;
  private framework: BlessedUIFramework;
  private stats: {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
  } = { total: 0, completed: 0, pending: 0, percentage: 0 };

  constructor(framework: BlessedUIFramework) {
    this.framework = framework;
    this.initializeElement();
    this.showDefaultStatus();
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
      ...layout.status,
      style: {
        fg: 'white',
        bg: theme.primary
      },
      tags: true
    });

    // Status text
    this.statusText = blessed.box({
      parent: this.element,
      top: 0,
      left: 1,
      width: '100%-2',
      height: 1,
      style: {
        fg: 'white',
        bg: theme.primary
      },
      tags: true,
      content: ''
    });
  }

  /**
   * Show default status information
   * @private
   */
  private showDefaultStatus(): void {
    const theme = this.framework.getTheme();
    const statusContent = [
      `{white-fg}Todo Terminal App{/white-fg}`,
      `{gray-fg}•{/gray-fg}`,
      `{${theme.text}-fg}Tab/Shift+Tab: Switch panels{/${theme.text}-fg}`,
      `{gray-fg}•{/gray-fg}`,
      `{${theme.text}-fg}? for help{/${theme.text}-fg}`,
      `{gray-fg}•{/gray-fg}`,
      `{${theme.text}-fg}Ctrl+Q: Quit{/${theme.text}-fg}`
    ].join(' ');

    this.statusText.setContent(statusContent);
    this.framework.render();
  }

  /**
   * Update statistics display
   * @param total - Total number of todos
   * @param completed - Number of completed todos
   */
  updateStats(total: number, completed: number): void {
    this.stats.total = total;
    this.stats.completed = completed;
    this.stats.pending = total - completed;
    this.stats.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.updateStatusDisplay();
  }

  /**
   * Update the status display with current stats
   * @private
   */
  private updateStatusDisplay(): void {
    const theme = this.framework.getTheme();
    const { total, completed, pending, percentage } = this.stats;

    // Create progress bar
    const progressBarWidth = 20;
    const filledWidth = Math.round((percentage / 100) * progressBarWidth);
    const emptyWidth = progressBarWidth - filledWidth;
    const progressBar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);

    const statusContent = [
      `{white-fg}Todos:{/white-fg}`,
      `{${theme.completed}-fg}${completed}{/${theme.completed}-fg}`,
      `{gray-fg}/{/gray-fg}`,
      `{${theme.text}-fg}${total}{/${theme.text}-fg}`,
      `{gray-fg}({/gray-fg}{${theme.warning}-fg}${pending} pending{/${theme.warning}-fg}{gray-fg}){/gray-fg}`,
      `{gray-fg}•{/gray-fg}`,
      `{${theme.completed}-fg}${progressBar}{/${theme.completed}-fg}`,
      `{white-fg}${percentage}%{/white-fg}`,
      `{gray-fg}•{/gray-fg}`,
      `{gray-fg}Tab: Switch panels{/gray-fg}`
    ].join(' ');

    this.statusText.setContent(statusContent);
    this.framework.render();
  }

  /**
   * Show temporary message in status bar
   * @param message - Message to display
   * @param type - Message type (info, success, warning, error)
   * @param duration - Duration in milliseconds (default: 3000)
   */
  showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 3000): void {
    const colors = {
      info: 'cyan',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    };

    const color = colors[type];
    const statusContent = `{${color}-fg}${message}{/${color}-fg}`;
    
    this.statusText.setContent(statusContent);
    this.framework.render();

    // Restore previous status after duration
    setTimeout(() => {
      if (this.stats.total > 0) {
        this.updateStatusDisplay();
      } else {
        this.showDefaultStatus();
      }
    }, duration);
  }

  /**
   * Show help text in status bar
   * @param helpText - Help text to display
   */
  showHelp(helpText: string): void {
    const theme = this.framework.getTheme();
    const statusContent = `{${theme.text}-fg}${helpText}{/${theme.text}-fg}`;
    
    this.statusText.setContent(statusContent);
    this.framework.render();
  }

  /**
   * Show current panel information
   * @param panelName - Name of current panel
   * @param panelHelp - Help text for current panel
   */
  showPanelInfo(panelName: string, panelHelp: string): void {
    const theme = this.framework.getTheme();
    const statusContent = [
      `{white-fg}${panelName}{/white-fg}`,
      `{gray-fg}•{/gray-fg}`,
      `{${theme.text}-fg}${panelHelp}{/${theme.text}-fg}`
    ].join(' ');

    this.statusText.setContent(statusContent);
    this.framework.render();
  }

  /**
   * Show loading indicator
   * @param message - Loading message
   */
  showLoading(message: string): void {
    const statusContent = `{yellow-fg}⟳ ${message}...{/yellow-fg}`;
    this.statusText.setContent(statusContent);
    this.framework.render();
  }

  /**
   * Clear status and show default
   */
  clear(): void {
    if (this.stats.total > 0) {
      this.updateStatusDisplay();
    } else {
      this.showDefaultStatus();
    }
  }

  /**
   * Get current statistics
   * @returns Current todo statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  // UIPanel interface methods
  focus(): void {
    // Status bar is not focusable
  }

  blur(): void {
    // Status bar is not focusable
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
    this.clear();
  }
}