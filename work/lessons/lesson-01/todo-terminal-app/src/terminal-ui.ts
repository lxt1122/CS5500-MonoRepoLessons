#!/usr/bin/env node

import { TerminalUIApp } from './views/TerminalUIApp';

/**
 * Terminal UI Entry Point
 * Starts the blessed-based terminal UI application
 */

function main() {
  try {
    console.log('Starting Todo Terminal UI...');
    
    // Create and start the terminal UI
    const app = new TerminalUIApp();
    app.start();
    
  } catch (error) {
    console.error('Failed to start Terminal UI:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Terminal UI...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Terminal UI...');
  process.exit(0);
});

// Start the application
if (require.main === module) {
  main();
}

export { main };