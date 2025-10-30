// Sequential Thinking MCP Server Demonstration
// This script demonstrates the capabilities of the sequential_thinking tool

const { spawn } = require('child_process');

console.log('🧠 Sequential Thinking MCP Server Demonstration');
console.log('='.repeat(50));

// Start the MCP server using the full path
const server = spawn('cmd', ['/c', 'npx', '-y', '@modelcontextprotocol/server-sequential-thinking'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();

  // Try to parse complete JSON responses
  try {
    const lines = responseBuffer.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const parsed = JSON.parse(line);
        console.log('📝 Server Response:', JSON.stringify(parsed, null, 2));
        responseBuffer = '';
      }
    }
  } catch (e) {
    // Incomplete JSON, wait for more data
  }
});

server.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n🏁 Server process exited with code ${code}`);
});

// Demonstrate the sequential_thinking tool
function demonstrateSequentialThinking() {
  console.log('\n🚀 Starting Sequential Thinking Demonstration...\n');

  // Example 1: Problem-solving sequence
  const example1 = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'sequential_thinking',
      arguments: {
        thought: 'I need to solve a complex programming problem. Let me break it down into manageable steps.',
        nextThoughtNeeded: true,
        thoughtNumber: 1,
        totalThoughts: 5
      }
    }
  };

  // Example 2: Revision of previous thought
  const example2 = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'sequential_thinking',
      arguments: {
        thought: 'Actually, let me revise my approach. The problem requires a different strategy.',
        nextThoughtNeeded: true,
        thoughtNumber: 2,
        totalThoughts: 5,
        isRevision: true,
        revisesThought: 1
      }
    }
  };

  // Example 3: Branching into alternative reasoning
  const example3 = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'sequential_thinking',
      arguments: {
        thought: 'Let me explore an alternative approach using a different algorithm.',
        nextThoughtNeeded: true,
        thoughtNumber: 3,
        totalThoughts: 5,
        branchFromThought: 2,
        branchId: 'alternative-solution'
      }
    }
  };

  // Send examples to the server
  setTimeout(() => {
    console.log('📤 Sending Example 1: Initial problem breakdown');
    server.stdin.write(`${JSON.stringify(example1)}\n`);
  }, 1000);

  setTimeout(() => {
    console.log('📤 Sending Example 2: Revision of previous thought');
    server.stdin.write(`${JSON.stringify(example2)}\n`);
  }, 3000);

  setTimeout(() => {
    console.log('📤 Sending Example 3: Branching into alternative reasoning');
    server.stdin.write(`${JSON.stringify(example3)}\n`);
  }, 5000);

  // Close server after demonstration
  setTimeout(() => {
    console.log('\n🔚 Demonstration complete. Closing server...');
    server.kill();
  }, 7000);
}

// Start the demonstration
demonstrateSequentialThinking();

// Display tool information
console.log('\n📚 Sequential Thinking Tool Information:');
console.log('- Break down complex problems into manageable steps');
console.log('- Revise and refine thoughts as understanding deepens');
console.log('- Branch into alternative paths of reasoning');
console.log('- Adjust the total number of thoughts dynamically');
console.log('- Generate and verify solution hypotheses');
console.log('\n🔧 Tool Parameters:');
console.log('- thought (string): The current thinking step');
console.log('- nextThoughtNeeded (boolean): Whether another thought step is needed');
console.log('- thoughtNumber (integer): Current thought number');
console.log('- totalThoughts (integer): Estimated total thoughts needed');
console.log('- isRevision (boolean, optional): Whether this revises previous thinking');
console.log('- revisesThought (integer, optional): Which thought is being reconsidered');
console.log('- branchFromThought (integer, optional): Branching point thought number');
console.log('- branchId (string, optional): Branch identifier');
console.log('- needsMoreThoughts (boolean, optional): If more thoughts are needed');
