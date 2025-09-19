#!/usr/bin/env ts-node

/**
 * Test script for TodoModel - Phase 1 testing
 * Tests the Model layer in isolation as specified in TODO-PLAN.md
 */

import { TodoModel } from './models/TodoModel';

console.log('🚀 Testing TodoModel - Phase 1\n');

// Test 1: Initialize TodoModel
console.log('Test 1: Initialize TodoModel');
const model = new TodoModel('./data/test-todos.json');
const status = model.getStorageStatus();
console.log('✓ Model initialized');
console.log(`  Storage path: ${status.filePath}`);
console.log(`  Can read: ${status.canRead}`);
console.log(`  Can write: ${status.canWrite}\n`);

// Test 2: Add todos
console.log('Test 2: Add todos');
try {
  const todo1 = model.add('Buy groceries');
  const todo2 = model.add('Write report');
  const todo3 = model.add('Call dentist');
  
  console.log('✓ Added 3 todos:');
  console.log(`  - ${todo1.title} (ID: ${todo1.id.substring(0, 8)}...)`);
  console.log(`  - ${todo2.title} (ID: ${todo2.id.substring(0, 8)}...)`);
  console.log(`  - ${todo3.title} (ID: ${todo3.id.substring(0, 8)}...)\n`);
} catch (error) {
  console.error('✗ Failed to add todos:', error);
}

// Test 3: Get all todos
console.log('Test 3: Get all todos');
const allTodos = model.getAll();
console.log(`✓ Retrieved ${allTodos.length} todos:`);
allTodos.forEach((todo, index) => {
  const status = todo.completed ? '[x]' : '[ ]';
  console.log(`  ${index + 1}. ${status} ${todo.title}`);
});
console.log();

// Test 4: Toggle completion
console.log('Test 4: Toggle completion');
if (allTodos.length > 0) {
  const firstTodo = allTodos[0];
  const updated = model.toggleComplete(firstTodo.id);
  if (updated) {
    console.log(`✓ Toggled completion for: ${updated.title}`);
    console.log(`  Status changed to: ${updated.completed ? 'completed' : 'incomplete'}\n`);
  } else {
    console.error('✗ Failed to toggle completion\n');
  }
}

// Test 5: Get counts
console.log('Test 5: Get counts');
console.log(`✓ Total todos: ${model.getCount()}`);
console.log(`✓ Completed: ${model.getCompletedCount()}`);
console.log(`✓ Incomplete: ${model.getIncompleteCount()}\n`);

// Test 6: Test validation
console.log('Test 6: Test validation');
try {
  model.add(''); // Should fail
  console.error('✗ Validation failed - empty title was accepted');
} catch (error) {
  console.log('✓ Validation working - empty title rejected');
}

try {
  model.add('a'.repeat(101)); // Should fail - too long
  console.error('✗ Validation failed - overly long title was accepted');
} catch (error) {
  console.log('✓ Validation working - overly long title rejected');
}

try {
  const validTodo = model.add('Valid todo title');
  console.log(`✓ Valid title accepted: ${validTodo.title}\n`);
} catch (error) {
  console.error('✗ Valid title was rejected:', error);
}

// Test 7: Delete todo
console.log('Test 7: Delete todo');
const todosBeforeDelete = model.getAll();
if (todosBeforeDelete.length > 0) {
  const todoToDelete = todosBeforeDelete[0];
  const deleted = model.delete(todoToDelete.id);
  if (deleted) {
    console.log(`✓ Deleted todo: ${todoToDelete.title}`);
    console.log(`✓ Todos remaining: ${model.getCount()}\n`);
  } else {
    console.error('✗ Failed to delete todo\n');
  }
}

// Test 8: Test persistence (create new model instance)
console.log('Test 8: Test persistence');
const model2 = new TodoModel('./data/test-todos.json');
const persistedTodos = model2.getAll();
console.log(`✓ Loaded ${persistedTodos.length} todos from file after creating new model instance`);
if (persistedTodos.length > 0) {
  console.log('✓ Data persisted successfully');
  persistedTodos.forEach((todo, index) => {
    const status = todo.completed ? '[x]' : '[ ]';
    console.log(`  ${index + 1}. ${status} ${todo.title}`);
  });
} else {
  console.log('  (No todos found - this may be expected if all were deleted)');
}
console.log();

// Test 9: Update title
console.log('Test 9: Update title');
const currentTodos = model2.getAll();
if (currentTodos.length > 0) {
  const todoToUpdate = currentTodos[0];
  const updated = model2.updateTitle(todoToUpdate.id, 'Updated title');
  if (updated) {
    console.log(`✓ Updated title from "${todoToUpdate.title}" to "${updated.title}"\n`);
  } else {
    console.error('✗ Failed to update title\n');
  }
}

// Final summary
console.log('🎉 Model testing complete!');
console.log('📊 Final state:');
console.log(`   Total todos: ${model2.getCount()}`);
console.log(`   Completed: ${model2.getCompletedCount()}`);
console.log(`   Incomplete: ${model2.getIncompleteCount()}`);
console.log();

// Show final todos
const finalTodos = model2.getAll();
if (finalTodos.length > 0) {
  console.log('📝 Current todos:');
  finalTodos.forEach((todo, index) => {
    const status = todo.completed ? '[x]' : '[ ]';
    const date = todo.createdAt.toLocaleDateString();
    console.log(`   ${index + 1}. ${status} ${todo.title} (created: ${date})`);
  });
} else {
  console.log('📝 No todos remaining');
}

console.log('\n✅ All Model tests completed - ready for Phase 2 (View layer)!');