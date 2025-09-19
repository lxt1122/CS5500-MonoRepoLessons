#!/usr/bin/env node

/**
 * CLI Entry Point for Todo Manager
 * Handles command line execution and output formatting
 */

import { CommandParser } from './parser';
import { CLIController } from './controller';
import { HelpSystem } from './help';
import { CLIError } from './types';

/**
 * Main CLI Application Class
 */
class TodoCLI {
  private parser: CommandParser;
  private controller: CLIController;
  private helpSystem: HelpSystem;

  constructor() {
    this.parser = new CommandParser();
    this.controller = new CLIController();
    this.helpSystem = new HelpSystem();
  }

  /**
   * Main entry point for CLI execution
   * @param argv - Command line arguments
   */
  async run(argv: string[] = process.argv): Promise<void> {
    try {
      // Remove 'node' and script name from arguments
      const args = argv.slice(2);
      
      // Handle global options
      if (this.hasGlobalOption(args, ['--version', '-v'])) {
        this.showVersion();
        return;
      }
      
      if (this.hasGlobalOption(args, ['--help', '-h']) && args.length === 1) {
        console.log(this.helpSystem.getHelp());
        return;
      }
      
      // Parse command
      const parsedCommand = this.parser.parse(args);
      
      // Execute command
      const result = await this.controller.execute(parsedCommand);
      
      // Output result
      this.outputResult(result);
      
      // Set exit code
      process.exit(result.success ? 0 : 1);
      
    } catch (error) {
      this.handleError(error);
      process.exit(1);
    }
  }

  /**
   * Check for global options
   * @private
   */
  private hasGlobalOption(args: string[], options: string[]): boolean {
    return args.some(arg => options.includes(arg));
  }

  /**
   * Show version information
   * @private
   */
  private showVersion(): void {
    const packageInfo = this.getPackageInfo();
    console.log(`Todo Manager CLI v${packageInfo.version}`);
    console.log(`Node.js ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
  }

  /**
   * Get package information
   * @private
   */
  private getPackageInfo(): { version: string; name: string } {
    try {
      // In a real implementation, we'd read from package.json
      return { name: 'todo-terminal-app', version: '1.0.0' };
    } catch {
      return { name: 'todo-terminal-app', version: 'unknown' };
    }
  }

  /**
   * Output command result
   * @private
   */
  private outputResult(result: any): void {
    if (result.success) {
      if (result.message) {
        console.log(result.message);
      }
    } else {
      const errorMessage = this.helpSystem.formatError(
        result.error || 'Unknown error occurred'
      );
      console.error(errorMessage);
    }
  }

  /**
   * Handle errors during execution
   * @private
   */
  private handleError(error: unknown): void {
    if (error instanceof CLIError) {
      console.error(this.helpSystem.formatError(error.message));
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
  }
}

/**
 * Execute CLI if this file is run directly
 */
if (require.main === module) {
  const cli = new TodoCLI();
  cli.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { TodoCLI };