import { CLI_COMMANDS } from './types';

/**
 * CLI Help System
 * Provides formatted help documentation for commands
 */
export class HelpSystem {

  /**
   * Generate help text for all commands or a specific command
   * @param commandName - Optional specific command to get help for
   * @returns Formatted help text
   */
  getHelp(commandName?: string): string {
    if (commandName) {
      return this.getCommandHelp(commandName);
    } else {
      return this.getGeneralHelp();
    }
  }

  /**
   * Generate general help showing all available commands
   * @private
   * @returns General help text
   */
  private getGeneralHelp(): string {
    const lines: string[] = [];
    
    lines.push('Todo Manager CLI - Command Line Interface');
    lines.push('');
    lines.push('USAGE:');
    lines.push('  todo <command> [options]');
    lines.push('');
    lines.push('AVAILABLE COMMANDS:');
    lines.push('');

    // Group commands by category
    const mainCommands = ['add', 'list', 'complete', 'remove', 'edit'];
    const utilityCommands = ['clear', 'stats', 'help'];

    lines.push('  Main Commands:');
    mainCommands.forEach(cmdName => {
      const cmd = CLI_COMMANDS[cmdName];
      if (cmd) {
        lines.push(`    ${cmd.name.padEnd(12)} ${cmd.description}`);
      }
    });

    lines.push('');
    lines.push('  Utility Commands:');
    utilityCommands.forEach(cmdName => {
      const cmd = CLI_COMMANDS[cmdName];
      if (cmd) {
        lines.push(`    ${cmd.name.padEnd(12)} ${cmd.description}`);
      }
    });

    lines.push('');
    lines.push('GLOBAL OPTIONS:');
    lines.push('  --help, -h       Show help information');
    lines.push('  --version, -v    Show version information');
    lines.push('');
    lines.push('EXAMPLES:');
    lines.push('  todo add "Buy groceries"           Add a new todo');
    lines.push('  todo list                          List all todos');
    lines.push('  todo list --completed              List completed todos');
    lines.push('  todo complete 1                    Mark todo #1 as complete');
    lines.push('  todo remove 1                      Delete todo #1');
    lines.push('  todo help add                      Get help for add command');
    lines.push('');
    lines.push('For detailed help on any command, use: todo help <command>');

    return lines.join('\n');
  }

  /**
   * Generate help for a specific command
   * @private
   * @param commandName - Name of the command
   * @returns Command-specific help text
   */
  private getCommandHelp(commandName: string): string {
    const command = CLI_COMMANDS[commandName];
    
    if (!command) {
      return `Unknown command: ${commandName}\n\nUse 'todo help' to see available commands.`;
    }

    const lines: string[] = [];
    
    lines.push(`Command: ${command.name}`);
    lines.push(`Description: ${command.description}`);
    lines.push('');
    lines.push('USAGE:');
    lines.push(`  ${command.usage}`);
    lines.push('');

    // Arguments section
    if (command.arguments.length > 0) {
      lines.push('ARGUMENTS:');
      command.arguments.forEach(arg => {
        const required = arg.required ? '(required)' : '(optional)';
        const type = arg.type !== 'string' ? ` [${arg.type}]` : '';
        lines.push(`  ${arg.name.padEnd(15)} ${arg.description} ${required}${type}`);
      });
      lines.push('');
    }

    // Options section
    if (command.options.length > 0) {
      lines.push('OPTIONS:');
      command.options.forEach(option => {
        const shortFlag = option.short ? `-${option.short}, ` : '    ';
        const longFlag = `--${option.long}`.padEnd(15);
        const type = option.type !== 'flag' ? ` <${option.type}>` : '';
        const defaultVal = option.defaultValue !== undefined ? ` (default: ${option.defaultValue})` : '';
        lines.push(`  ${shortFlag}${longFlag}${type.padEnd(10)} ${option.description}${defaultVal}`);
      });
      lines.push('');
    }

    // Examples section
    if (command.examples.length > 0) {
      lines.push('EXAMPLES:');
      command.examples.forEach(example => {
        lines.push(`  ${example}`);
      });
      lines.push('');
    }

    // Command-specific additional help
    const additionalHelp = this.getAdditionalHelp(commandName);
    if (additionalHelp) {
      lines.push(additionalHelp);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get additional help text for specific commands
   * @private
   * @param commandName - Name of the command
   * @returns Additional help text or empty string
   */
  private getAdditionalHelp(commandName: string): string {
    switch (commandName) {
      case 'add':
        return `NOTES:
  - Todo titles must be between 1 and 100 characters
  - Use quotes around titles with spaces
  - Priority levels: low, medium, high`;

      case 'list':
        return `NOTES:
  - Default format is table view
  - Use --completed or --pending to filter by status
  - JSON format useful for scripting
  - Use --limit to restrict number of results`;

      case 'complete':
        return `NOTES:
  - You can use either the todo ID or its index number
  - Use --undo to mark a completed todo as incomplete
  - Todo indexes start from 1`;

      case 'remove':
        return `NOTES:
  - You can use either the todo ID or its index number
  - Use --force to skip the confirmation prompt
  - This action cannot be undone`;

      case 'edit':
        return `NOTES:
  - Currently only the 'title' field can be edited
  - Use --interactive for a guided edit experience
  - You can use either the todo ID or its index number`;

      case 'clear':
        return `NOTES:
  - Use --completed to clear only finished todos
  - Use --all to clear everything
  - Use --force to skip confirmation prompts
  - This action cannot be undone`;

      case 'stats':
        return `NOTES:
  - Shows total, completed, and pending todo counts
  - Use --format json for machine-readable output
  - Includes percentage completion statistics`;

      default:
        return '';
    }
  }

  /**
   * Generate usage summary for a command
   * @param commandName - Name of the command
   * @returns Brief usage string
   */
  getUsage(commandName: string): string {
    const command = CLI_COMMANDS[commandName];
    return command ? command.usage : `Usage: todo ${commandName}`;
  }

  /**
   * Generate command list for auto-completion or quick reference
   * @returns Array of command names
   */
  getCommandNames(): string[] {
    return Object.keys(CLI_COMMANDS);
  }

  /**
   * Check if a command has help available
   * @param commandName - Name of the command
   * @returns True if help is available
   */
  hasHelp(commandName: string): boolean {
    return commandName in CLI_COMMANDS;
  }

  /**
   * Format error message with helpful context
   * @param error - Error message
   * @param commandName - Optional command context
   * @returns Formatted error message with help hint
   */
  formatError(error: string, commandName?: string): string {
    const lines: string[] = [];
    
    lines.push(`Error: ${error}`);
    
    if (commandName && this.hasHelp(commandName)) {
      lines.push(`\nFor help with this command, use: todo help ${commandName}`);
    } else {
      lines.push('\nFor general help, use: todo help');
    }
    
    return lines.join('\n');
  }
}