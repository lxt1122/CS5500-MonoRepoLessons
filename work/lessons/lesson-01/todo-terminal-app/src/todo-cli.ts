#!/usr/bin/env ts-node

/**
 * Simple CLI Entry Point
 * Executes the Todo CLI directly with ts-node
 */

import { TodoCLI } from './cli/index';

const cli = new TodoCLI();
cli.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});