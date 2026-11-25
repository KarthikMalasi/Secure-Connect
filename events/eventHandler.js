const EventEmitter = require('events');

// Create a custom EventEmitter instance for application-wide events
const eventEmitter = new EventEmitter();

// Listener for new user registration
eventEmitter.on('userRegistered', (email) => {
  console.log(`[EVENT] New user registered: ${email}`);
});

// Listener for user login
eventEmitter.on('userLoggedIn', (email) => {
  console.log(`[EVENT] User logged in: ${email}`);
});

// Listener for note creation
eventEmitter.on('noteCreated', (title) => {
  console.log(`[EVENT] New note created: ${title}`);
});

// Listener for note deletion
eventEmitter.on('noteDeleted', () => {
  console.log('[EVENT] Note deleted successfully');
});

module.exports = eventEmitter;
