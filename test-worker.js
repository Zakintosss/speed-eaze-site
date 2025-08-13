// Simple test worker to verify KV namespace binding
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // Test KV access
    const testKey = 'test_' + Date.now();
    const testValue = 'Hello from KV test at ' + new Date().toISOString();
    
    console.log('Testing KV with key:', testKey);
    
    // Try to write to KV
    await TODO_LIST.put(testKey, testValue);
    console.log('Successfully wrote to KV');
    
    // Try to read from KV
    const readValue = await TODO_LIST.get(testKey);
    console.log('Successfully read from KV:', readValue);
    
    // Clean up test data
    await TODO_LIST.delete(testKey);
    console.log('Successfully deleted test data');
    
    return new Response(JSON.stringify({
      success: true,
      message: 'KV test successful',
      testKey: testKey,
      readValue: readValue,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('KV test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 