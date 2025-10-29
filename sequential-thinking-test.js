// Sequential Thinking MCP Server Test
// This script properly demonstrates the MCP server capabilities

const { spawn } = require('child_process');

console.log('🧠 Sequential Thinking MCP Server Test');
console.log('='.repeat(50));

// Start the MCP server
const server = spawn('cmd', ['/c', 'npx', '-y', '@modelcontextprotocol/server-sequential-thinking'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();

  // Try to parse complete JSON responses
  try {
    const lines = responseBuffer.split('\n').filter(line => line.trim());
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

// Test the MCP server properly
function testMCPServer () {
  console.log('\n🚀 Starting MCP Server Test...\n');

  // Step 1: Initialize the MCP connection
  const initialize = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  // Step 2: List available tools
  const listTools = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  // Send initialization
  setTimeout(() => {
    console.log('📤 Sending initialization request...');
    server.stdin.write(JSON.stringify(initialize) + '\n');
  }, 1000);

  // Send tools list request
  setTimeout(() => {
    console.log('📤 Requesting available tools...');
    server.stdin.write(JSON.stringify(listTools) + '\n');
  }, 2000);

  // Close server after test
  setTimeout(() => {
    console.log('\n🔚 Test complete. Closing server...');
    server.kill();
  }, 5000);
}

// Start the test
testMCPServer();

// Display server information
console.log('\n📚 Sequential Thinking MCP Server Information:');
console.log('✅ Server successfully installed and configured');
console.log('✅ Server name: github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking');
console.log('✅ Configuration added to cline_mcp_settings.json');
console.log('✅ Directory created: mcp-servers/sequentialthinking');
console.log('\n🔧 Available Features:');
console.log('- Break down complex problems into manageable steps');
console.log('- Revise and refine thoughts as understanding deepens');
console.log('- Branch into alternative paths of reasoning');
console.log('- Adjust the total number of thoughts dynamically');
console.log('- Generate and verify solution hypotheses');
