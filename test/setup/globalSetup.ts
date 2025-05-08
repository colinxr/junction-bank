// Basic Vitest global setup
export async function setup() {
    // Setup code here (database connection, etc.)
    console.log('Global test setup complete');
  }
  
  export async function teardown() {
    // Teardown code here (close connections, etc.)
    console.log('Global test teardown complete');
  }