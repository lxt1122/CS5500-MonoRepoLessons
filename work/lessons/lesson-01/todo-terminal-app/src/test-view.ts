#!/usr/bin/env ts-node

/**
 * Test script for TodoView - Phase 2 testing
 * Tests the View layer with mock data as specified in TODO-PLAN.md
 */

import { TodoView } from './views/TodoView';
import { Todo } from './models/Todo';

console.log('🚀 Starting TodoView test - Phase 2\n');

// Create mock todo data for testing
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Buy groceries',
    completed: false,
    createdAt: new Date('2025-09-18T10:00:00Z'),
    updatedAt: new Date('2025-09-18T10:00:00Z')
  },
  {
    id: '2', 
    title: 'Write report',
    completed: true,
    createdAt: new Date('2025-09-18T09:00:00Z'),
    updatedAt: new Date('2025-09-18T09:30:00Z')
  },
  {
    id: '3',
    title: 'Call dentist',
    completed: false,
    createdAt: new Date('2025-09-18T11:00:00Z'),
    updatedAt: new Date('2025-09-18T11:00:00Z')
  },
  {
    id: '4',
    title: 'Team meeting',
    completed: false,
    createdAt: new Date('2025-09-18T14:00:00Z'),
    updatedAt: new Date('2025-09-18T14:00:00Z')
  },
  {
    id: '5',
    title: 'Review code',
    completed: true,
    createdAt: new Date('2025-09-18T15:00:00Z'),
    updatedAt: new Date('2025-09-18T15:30:00Z')
  },
  {
    id: '6',
    title: 'Fix bug #42',
    completed: false,
    createdAt: new Date('2025-09-18T16:00:00Z'),
    updatedAt: new Date('2025-09-18T16:00:00Z')
  },
  {
    id: '7',
    title: 'Update documentation',
    completed: false,
    createdAt: new Date('2025-09-18T17:00:00Z'),
    updatedAt: new Date('2025-09-18T17:00:00Z')
  }
];

// Initialize the view
console.log('📺 Initializing TodoView...');
const view = new TodoView();

// Show welcome message
view.showMessage('Welcome to Todo Manager!', 'info');

// Display mock todos after a short delay
setTimeout(() => {
  console.log('📝 Loading mock todos...');
  view.updateTodos(mockTodos);
  view.showMessage('Mock todos loaded successfully!', 'success');
  
  // Test empty state after 5 seconds
  setTimeout(() => {
    view.updateTodos([]);
    view.showMessage('Testing empty state...', 'info');
    
    // Restore todos after 3 seconds
    setTimeout(() => {
      view.updateTodos(mockTodos);
      view.showMessage('Todos restored! Test complete.', 'success');
      
      // Show instructions
      setTimeout(() => {
        view.showMessage('Use arrow keys or j/k to navigate. Press q to quit.', 'info');
      }, 2500);
      
    }, 3000);
  }, 5000);
  
}, 1000);

console.log('\n📋 Mock Data Loaded:');
mockTodos.forEach((todo, index) => {
  const status = todo.completed ? '[x]' : '[ ]';
  console.log(`  ${index + 1}. ${status} ${todo.title}`);
});

console.log('\n🎮 UI Test Instructions:');
console.log('  - Use ↑/↓ arrow keys or j/k to navigate');
console.log('  - Status bar shows current selection and counts');
console.log('  - Completed todos show with strikethrough');
console.log('  - Press q to quit and return to terminal');
console.log('  - UI should be responsive and smooth');

console.log('\n✅ View layer test started!');
console.log('   If you see the blessed UI, Phase 2 is working correctly!');
console.log('   Check that:');
console.log('   - Title bar displays "Todo Manager v1.0"');
console.log('   - Todo list shows checkboxes and formatting');
console.log('   - Status bar shows shortcuts and counts');
console.log('   - Navigation works smoothly');
console.log('   - Empty state displays correctly');
console.log('\n   Press q in the UI to exit and continue...\n');