import * as blessed from 'blessed';

/**
 * Panel Types for the Multi-Panel Interface
 */
export enum PanelType {
  TODO_LIST = 'todoList',
  DETAILS = 'details', 
  COMMAND_INPUT = 'commandInput',
  STATUS = 'status'
}

/**
 * UI Panel Interface
 */
export interface UIPanel {
  element: blessed.Widgets.BoxElement;
  type: PanelType;
  title: string;
  focusable: boolean;
  visible: boolean;
  
  focus(): void;
  blur(): void;
  show(): void;
  hide(): void;
  refresh(): void;
}

/**
 * Layout Configuration
 */
export interface LayoutConfig {
  todoList: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
  details: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
  commandInput: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
  status: {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
  };
}

/**
 * UI Theme Configuration
 */
export interface UITheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  text: string;
  background: string;
  border: string;
  selected: string;
  completed: string;
}

/**
 * Main Blessed UI Framework
 * Manages the multi-panel terminal interface
 */
export class BlessedUIFramework {
  private screen!: blessed.Widgets.Screen;
  private panels: Map<PanelType, UIPanel> = new Map();
  private currentPanel: PanelType = PanelType.TODO_LIST;
  private layout!: LayoutConfig;
  private theme!: UITheme;

  constructor() {
    this.initializeTheme();
    this.initializeLayout();
    this.initializeScreen();
  }

  /**
   * Initialize the UI theme
   * @private
   */
  private initializeTheme(): void {
    this.theme = {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'magenta',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      text: 'white',
      background: 'black',
      border: 'gray',
      selected: 'blue',
      completed: 'green'
    };
  }

  /**
   * Initialize the layout configuration
   * @private
   */
  private initializeLayout(): void {
    this.layout = {
      todoList: {
        left: 0,
        top: 0,
        width: '50%',
        height: '100%-3'
      },
      details: {
        left: '50%',
        top: 0,
        width: '50%',
        height: '100%-3'
      },
      commandInput: {
        left: 0,
        top: '100%-3',
        width: '100%',
        height: 3
      },
      status: {
        left: 0,
        top: '100%-1',
        width: '100%',
        height: 1
      }
    };
  }

  /**
   * Initialize the main blessed screen
   * @private
   */
  private initializeScreen(): void {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Todo Manager - Multi Panel Interface',
      dockBorders: true,
      fullUnicode: true,
      autoPadding: true,
      cursor: {
        artificial: true,
        shape: 'line',
        blink: true,
        color: this.theme.accent
      }
    });

    // Global key handlers
    this.setupGlobalKeyHandlers();
  }

  /**
   * Set up global key handlers for panel switching and app control
   * @private
   */
  private setupGlobalKeyHandlers(): void {
    // Quit application
    this.screen.key(['C-c', 'q'], () => {
      this.quit();
    });

    // Panel switching with Tab and Shift+Tab
    this.screen.key(['tab'], () => {
      this.switchToNextPanel();
    });

    this.screen.key(['S-tab'], () => {
      this.switchToPreviousPanel();
    });

    // Direct panel access with function keys
    this.screen.key(['f1'], () => {
      this.switchToPanel(PanelType.TODO_LIST);
    });

    this.screen.key(['f2'], () => {
      this.switchToPanel(PanelType.DETAILS);
    });

    this.screen.key(['f3'], () => {
      this.switchToPanel(PanelType.COMMAND_INPUT);
    });

    // Help system
    this.screen.key(['f12', '?'], () => {
      this.showHelp();
    });

    // Refresh all panels
    this.screen.key(['f5'], () => {
      this.refreshAllPanels();
    });
  }

  /**
   * Register a UI panel with the framework
   * @param panel - Panel to register
   */
  registerPanel(panel: UIPanel): void {
    this.panels.set(panel.type, panel);
    
    // Add panel element to screen
    this.screen.append(panel.element);
    
    // Set up panel-specific event handlers
    this.setupPanelEventHandlers(panel);
  }

  /**
   * Set up event handlers for a panel
   * @private
   * @param panel - Panel to set up events for
   */
  private setupPanelEventHandlers(panel: UIPanel): void {
    // Focus events
    panel.element.on('focus', () => {
      this.currentPanel = panel.type;
      this.updatePanelBorders();
      this.render();
    });

    // Key events for panel switching
    panel.element.key(['escape'], () => {
      if (panel.type !== PanelType.TODO_LIST) {
        this.switchToPanel(PanelType.TODO_LIST);
      }
    });
  }

  /**
   * Switch to the next panel in sequence
   * @private
   */
  private switchToNextPanel(): void {
    const panelOrder = [
      PanelType.TODO_LIST,
      PanelType.DETAILS,
      PanelType.COMMAND_INPUT
    ];
    
    const currentIndex = panelOrder.indexOf(this.currentPanel);
    const nextIndex = (currentIndex + 1) % panelOrder.length;
    
    this.switchToPanel(panelOrder[nextIndex]);
  }

  /**
   * Switch to the previous panel in sequence
   * @private
   */
  private switchToPreviousPanel(): void {
    const panelOrder = [
      PanelType.TODO_LIST,
      PanelType.DETAILS,
      PanelType.COMMAND_INPUT
    ];
    
    const currentIndex = panelOrder.indexOf(this.currentPanel);
    const prevIndex = currentIndex === 0 ? panelOrder.length - 1 : currentIndex - 1;
    
    this.switchToPanel(panelOrder[prevIndex]);
  }

  /**
   * Switch to a specific panel
   * @param panelType - Type of panel to switch to
   */
  switchToPanel(panelType: PanelType): void {
    const panel = this.panels.get(panelType);
    
    if (!panel || !panel.focusable) {
      return;
    }

    // Blur current panel
    const currentPanel = this.panels.get(this.currentPanel);
    if (currentPanel) {
      currentPanel.blur();
    }

    // Focus new panel
    this.currentPanel = panelType;
    panel.focus();
    
    this.updatePanelBorders();
    this.render();
  }

  /**
   * Update panel borders to show focus
   * @private
   */
  private updatePanelBorders(): void {
    this.panels.forEach((panel, type) => {
      const isFocused = type === this.currentPanel;
      const borderStyle = panel.element.style.border;
      
      if (borderStyle) {
        borderStyle.fg = isFocused ? this.theme.primary : this.theme.border;
      }
    });
  }

  /**
   * Get the layout configuration
   * @returns Layout configuration object
   */
  getLayout(): LayoutConfig {
    return { ...this.layout };
  }

  /**
   * Get the theme configuration
   * @returns Theme configuration object
   */
  getTheme(): UITheme {
    return { ...this.theme };
  }

  /**
   * Get the blessed screen instance
   * @returns Blessed screen
   */
  getScreen(): blessed.Widgets.Screen {
    return this.screen;
  }

  /**
   * Get a registered panel by type
   * @param type - Panel type
   * @returns Panel or undefined if not found
   */
  getPanel(type: PanelType): UIPanel | undefined {
    return this.panels.get(type);
  }

  /**
   * Get the currently focused panel type
   * @returns Current panel type
   */
  getCurrentPanel(): PanelType {
    return this.currentPanel;
  }

  /**
   * Refresh all panels
   */
  refreshAllPanels(): void {
    this.panels.forEach(panel => {
      panel.refresh();
    });
    this.render();
  }

  /**
   * Show help dialog
   * @private
   */
  private showHelp(): void {
    const helpContent = [
      '{center}{bold}Todo Manager - Keyboard Shortcuts{/bold}{/center}',
      '',
      '{bold}Panel Navigation:{/bold}',
      '  Tab / Shift+Tab    Switch between panels',
      '  F1                 Focus Todo List',
      '  F2                 Focus Details Panel',
      '  F3                 Focus Command Panel',
      '  Escape             Return to Todo List',
      '',
      '{bold}Todo List:{/bold}',
      '  ↑/↓, j/k          Navigate todos',
      '  Enter             View details',
      '  Space             Toggle complete',
      '  n                 New todo',
      '  d                 Delete todo',
      '  e                 Edit todo',
      '',
      '{bold}Details Panel:{/bold}',
      '  e                 Edit mode',
      '  Enter             Save changes',
      '  Escape            Cancel editing',
      '',
      '{bold}Command Panel:{/bold}',
      '  Type commands     Execute CLI commands',
      '  Tab               Autocomplete',
      '  ↑/↓               Command history',
      '',
      '{bold}Global:{/bold}',
      '  F5                Refresh all panels',
      '  F12 / ?           Show this help',
      '  Ctrl+C / q        Quit application',
      '',
      'Press any key to close...'
    ].join('\n');

    const helpBox = blessed.box({
      parent: this.screen,
      label: ' Help ',
      content: helpContent,
      tags: true,
      width: 60,
      height: 25,
      top: 'center',
      left: 'center',
      border: {
        type: 'line'
      },
      style: {
        fg: this.theme.text,
        bg: this.theme.background,
        border: {
          fg: this.theme.primary
        }
      },
      keys: true,
      input: true,
      clickable: true
    });

    helpBox.key(['escape', 'enter', 'q', 'space'], () => {
      helpBox.destroy();
      this.render();
    });

    helpBox.focus();
  }

  /**
   * Render the screen
   */
  render(): void {
    this.screen.render();
  }

  /**
   * Clean up and quit the application
   */
  quit(): void {
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Handle terminal resize
   */
  onResize(): void {
    this.refreshAllPanels();
    this.render();
  }

  /**
   * Set up resize handling
   */
  setupResizeHandling(): void {
    process.on('SIGWINCH', () => {
      this.onResize();
    });
  }
}