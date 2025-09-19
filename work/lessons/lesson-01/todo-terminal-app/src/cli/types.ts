/**
 * CLI Command Types and Interfaces
 * Defines the structure for CLI commands and their arguments
 */

export interface CLICommand {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  arguments: CLIArgument[];
  options: CLIOption[];
}

export interface CLIArgument {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
}

export interface CLIOption {
  short: string;
  long: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'flag';
  defaultValue?: any;
}

export interface ParsedCommand {
  command: string;
  arguments: Record<string, any>;
  options: Record<string, any>;
}

export interface CLIResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * CLI Command Definitions
 */
export const CLI_COMMANDS: Record<string, CLICommand> = {
  add: {
    name: 'add',
    description: 'Add a new todo item',
    usage: 'todo add <title> [options]',
    examples: [
      'todo add "Buy groceries"',
      'todo add "Meeting with team" --priority high',
      'todo add "Fix bug" -p medium'
    ],
    arguments: [
      {
        name: 'title',
        description: 'The title of the todo item',
        required: true,
        type: 'string'
      }
    ],
    options: [
      {
        short: 'p',
        long: 'priority',
        description: 'Set priority (low, medium, high)',
        type: 'string',
        defaultValue: 'medium'
      }
    ]
  },

  list: {
    name: 'list',
    description: 'List todo items with optional filtering',
    usage: 'todo list [options]',
    examples: [
      'todo list',
      'todo list --completed',
      'todo list --pending',
      'todo list -c',
      'todo list --limit 5'
    ],
    arguments: [],
    options: [
      {
        short: 'c',
        long: 'completed',
        description: 'Show only completed todos',
        type: 'flag'
      },
      {
        short: 'p',
        long: 'pending',
        description: 'Show only pending todos',
        type: 'flag'
      },
      {
        short: 'l',
        long: 'limit',
        description: 'Limit number of results',
        type: 'number'
      },
      {
        short: 'f',
        long: 'format',
        description: 'Output format (table, json, simple)',
        type: 'string',
        defaultValue: 'table'
      }
    ]
  },

  complete: {
    name: 'complete',
    description: 'Mark a todo item as complete',
    usage: 'todo complete <id>',
    examples: [
      'todo complete 1',
      'todo complete abc123',
      'todo complete --id abc123'
    ],
    arguments: [
      {
        name: 'id',
        description: 'The ID or index of the todo item',
        required: true,
        type: 'string'
      }
    ],
    options: [
      {
        short: 'u',
        long: 'undo',
        description: 'Mark as incomplete instead',
        type: 'flag'
      }
    ]
  },

  remove: {
    name: 'remove',
    description: 'Delete a todo item',
    usage: 'todo remove <id>',
    examples: [
      'todo remove 1',
      'todo remove abc123',
      'todo remove --id abc123 --force'
    ],
    arguments: [
      {
        name: 'id',
        description: 'The ID or index of the todo item',
        required: true,
        type: 'string'
      }
    ],
    options: [
      {
        short: 'f',
        long: 'force',
        description: 'Skip confirmation prompt',
        type: 'flag'
      }
    ]
  },

  edit: {
    name: 'edit',
    description: 'Edit a todo item',
    usage: 'todo edit <id> [field] [value]',
    examples: [
      'todo edit 1 title "New title"',
      'todo edit abc123 --title "Updated title"',
      'todo edit 1 --interactive'
    ],
    arguments: [
      {
        name: 'id',
        description: 'The ID or index of the todo item',
        required: true,
        type: 'string'
      },
      {
        name: 'field',
        description: 'The field to edit (title)',
        required: false,
        type: 'string'
      },
      {
        name: 'value',
        description: 'The new value for the field',
        required: false,
        type: 'string'
      }
    ],
    options: [
      {
        short: 't',
        long: 'title',
        description: 'Set new title',
        type: 'string'
      },
      {
        short: 'i',
        long: 'interactive',
        description: 'Interactive edit mode',
        type: 'flag'
      }
    ]
  },

  clear: {
    name: 'clear',
    description: 'Remove all todo items',
    usage: 'todo clear [options]',
    examples: [
      'todo clear --completed',
      'todo clear --all --force',
      'todo clear -c'
    ],
    arguments: [],
    options: [
      {
        short: 'c',
        long: 'completed',
        description: 'Clear only completed todos',
        type: 'flag'
      },
      {
        short: 'a',
        long: 'all',
        description: 'Clear all todos',
        type: 'flag'
      },
      {
        short: 'f',
        long: 'force',
        description: 'Skip confirmation prompt',
        type: 'flag'
      }
    ]
  },

  stats: {
    name: 'stats',
    description: 'Show todo statistics',
    usage: 'todo stats [options]',
    examples: [
      'todo stats',
      'todo stats --format json',
      'todo stats -f simple'
    ],
    arguments: [],
    options: [
      {
        short: 'f',
        long: 'format',
        description: 'Output format (table, json, simple)',
        type: 'string',
        defaultValue: 'table'
      }
    ]
  },

  help: {
    name: 'help',
    description: 'Show help information',
    usage: 'todo help [command]',
    examples: [
      'todo help',
      'todo help add',
      'todo help list'
    ],
    arguments: [
      {
        name: 'command',
        description: 'Get help for specific command',
        required: false,
        type: 'string'
      }
    ],
    options: []
  }
};

/**
 * Error types for CLI operations
 */
export class CLIError extends Error {
  constructor(message: string, public code: string = 'CLI_ERROR') {
    super(message);
    this.name = 'CLIError';
  }
}

export class CommandNotFoundError extends CLIError {
  constructor(command: string) {
    super(`Command '${command}' not found. Use 'todo help' to see available commands.`, 'COMMAND_NOT_FOUND');
  }
}

export class InvalidArgumentError extends CLIError {
  constructor(message: string) {
    super(message, 'INVALID_ARGUMENT');
  }
}

export class ValidationError extends CLIError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}