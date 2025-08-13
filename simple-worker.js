// Simplified Cloudflare Worker for form submissions (without KV for testing)
// This worker receives POST requests with JSON form data and logs them

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Helper function to create a success response
function createSuccessResponse(data) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Form submission received successfully',
      submissionId: 'submission_' + Date.now(),
      timestamp: new Date().toISOString(),
      data: data
    }),
    {
      status: 200,
      headers: corsHeaders
    }
  );
}

// Helper function to create an error response
function createErrorResponse(message, statusCode = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }),
    {
      status: statusCode,
      headers: corsHeaders
    }
  );
}

// Main event handler for the Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed. Only POST requests are accepted.', 405);
    }

    // Parse the JSON data from the request body
    let formData;
    try {
      formData = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Log the submission (for debugging)
    console.log('Form submission received:', JSON.stringify(formData, null, 2));
    
    // Add metadata
    const submissionData = {
      ...formData,
      _metadata: {
        submittedAt: new Date().toISOString(),
        userAgent: request.headers.get('User-Agent') || 'Unknown',
        ipAddress: request.headers.get('CF-Connecting-IP') || 'Unknown',
        submissionId: 'submission_' + Date.now()
      }
    };

    // Log the complete submission data
    console.log('Complete submission data:', JSON.stringify(submissionData, null, 2));

    // For now, just return success without storing in KV
    // You can add KV storage later once the binding is fixed
    return createSuccessResponse(formData);

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error:', error);
    return createErrorResponse('Internal server error: ' + error.message, 500);
  }
} 