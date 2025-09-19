import { 
  CLICommand, 
  ParsedCommand, 
  CLI_COMMANDS,
  CommandNotFoundError,
  InvalidArgumentError,
  ValidationError
} from './types';

/**
 * CLI Command Parser
 * Handles parsing command line arguments and validation
 */
export class CommandParser {
  
  /**
   * Parse command line arguments into a structured format
   * @param args - Array of command line arguments (excluding 'node' and script name)
   * @returns Parsed command object
   */
  parse(args: string[]): ParsedCommand {
    if (args.length === 0) {
      return { command: 'help', arguments: {}, options: {} };
    }

    const commandName = args[0];
    const command = CLI_COMMANDS[commandName];
    
    if (!command) {
      throw new CommandNotFoundError(commandName);
    }

    const restArgs = args.slice(1);
    const { arguments: parsedArgs, options } = this.parseArgsAndOptions(restArgs, command);
    
    this.validateCommand(command, parsedArgs, options);
    
    return {
      command: commandName,
      arguments: parsedArgs,
      options
    };
  }

  /**
   * Parse arguments and options from command line
   * @private
   */
  private parseArgsAndOptions(args: string[], command: CLICommand): { arguments: Record<string, any>, options: Record<string, any> } {
    const parsedArgs: Record<string, any> = {};
    const options: Record<string, any> = {};
    
    // Initialize options with default values
    command.options.forEach(option => {
      if (option.defaultValue !== undefined) {
        options[option.long] = option.defaultValue;
      }
    });

    let argIndex = 0;
    let i = 0;

    while (i < args.length) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        // Long option (--option)
        const optionName = arg.substring(2);
        const option = command.options.find(opt => opt.long === optionName);
        
        if (!option) {
          throw new InvalidArgumentError(`Unknown option: ${arg}`);
        }

        if (option.type === 'flag') {
          options[option.long] = true;
          i++;
        } else {
          if (i + 1 >= args.length) {
            throw new InvalidArgumentError(`Option ${arg} requires a value`);
          }
          options[option.long] = this.convertValue(args[i + 1], option.type);
          i += 2;
        }
      } else if (arg.startsWith('-')) {
        // Short option (-o)
        const optionName = arg.substring(1);
        const option = command.options.find(opt => opt.short === optionName);
        
        if (!option) {
          throw new InvalidArgumentError(`Unknown option: ${arg}`);
        }

        if (option.type === 'flag') {
          options[option.long] = true;
          i++;
        } else {
          if (i + 1 >= args.length) {
            throw new InvalidArgumentError(`Option ${arg} requires a value`);
          }
          options[option.long] = this.convertValue(args[i + 1], option.type);
          i += 2;
        }
      } else {
        // Positional argument
        if (argIndex < command.arguments.length) {
          const argDef = command.arguments[argIndex];
          parsedArgs[argDef.name] = this.convertValue(arg, argDef.type);
          argIndex++;
        } else {
          throw new InvalidArgumentError(`Unexpected argument: ${arg}`);
        }
        i++;
      }
    }

    return { arguments: parsedArgs, options };
  }

  /**
   * Convert string value to appropriate type
   * @private
   */
  private convertValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new InvalidArgumentError(`Invalid number: ${value}`);
        }
        return num;
      case 'boolean':
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') {
          return true;
        } else if (lower === 'false' || lower === 'no' || lower === '0') {
          return false;
        } else {
          throw new InvalidArgumentError(`Invalid boolean: ${value}`);
        }
      case 'string':
      default:
        return value;
    }
  }

  /**
   * Validate parsed command against command definition
   * @private
   */
  private validateCommand(command: CLICommand, args: Record<string, any>, options: Record<string, any>): void {
    // Check required arguments
    for (const argDef of command.arguments) {
      if (argDef.required && !(argDef.name in args)) {
        throw new ValidationError(`Missing required argument: ${argDef.name}`);
      }
    }

    // Validate specific command logic
    this.validateCommandSpecific(command.name, args, options);
  }

  /**
   * Command-specific validation logic
   * @private
   */
  private validateCommandSpecific(commandName: string, args: Record<string, any>, options: Record<string, any>): void {
    switch (commandName) {
      case 'add':
        if (args.title && (args.title.length < 1 || args.title.length > 100)) {
          throw new ValidationError('Todo title must be between 1 and 100 characters');
        }
        if (options.priority && !['low', 'medium', 'high'].includes(options.priority)) {
          throw new ValidationError('Priority must be one of: low, medium, high');
        }
        break;

      case 'list':
        if (options.completed && options.pending) {
          throw new ValidationError('Cannot use both --completed and --pending options');
        }
        if (options.limit && options.limit < 1) {
          throw new ValidationError('Limit must be a positive number');
        }
        if (options.format && !['table', 'json', 'simple'].includes(options.format)) {
          throw new ValidationError('Format must be one of: table, json, simple');
        }
        break;

      case 'complete':
      case 'remove':
      case 'edit':
        if (!args.id) {
          throw new ValidationError(`${commandName} command requires an ID`);
        }
        break;

      case 'edit':
        if (args.field && args.field !== 'title') {
          throw new ValidationError('Only "title" field can be edited');
        }
        if (args.field && !args.value && !options.interactive) {
          throw new ValidationError('Edit command requires a value or --interactive flag');
        }
        break;

      case 'clear':
        if (!options.completed && !options.all) {
          throw new ValidationError('Clear command requires --completed or --all flag');
        }
        break;
    }
  }

  /**
   * Get command definition by name
   * @param commandName - Name of the command
   * @returns Command definition or null if not found
   */
  getCommand(commandName: string): CLICommand | null {
    return CLI_COMMANDS[commandName] || null;
  }

  /**
   * Get all available commands
   * @returns Array of all command definitions
   */
  getAllCommands(): CLICommand[] {
    return Object.values(CLI_COMMANDS);
  }

  /**
   * Check if a command exists
   * @param commandName - Name of the command to check
   * @returns True if command exists
   */
  hasCommand(commandName: string): boolean {
    return commandName in CLI_COMMANDS;
  }
}