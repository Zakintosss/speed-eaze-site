// Cloudflare Worker for handling form submissions
// This worker receives POST requests with JSON form data and stores them in KV

// Define the KV namespace binding (you'll need to create this in your Cloudflare dashboard)
// The actual binding name should match what you configure in your wrangler.toml
const TODO_LIST = TODO_LIST; // This will be bound to your KV namespace

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Helper function to generate a unique key for each submission
function generateSubmissionKey() {
  // Create a timestamp-based key with random suffix for uniqueness
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `submission_${timestamp}_${randomSuffix}`;
}

// Helper function to validate the incoming JSON data
function validateFormData(data) {
  // Check if data exists and is an object
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid form data: must be a JSON object' };
  }

  // Add your specific validation rules here
  // Example: Check for required fields
  const requiredFields = ['firstName', 'lastName', 'email'];
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate email format (basic validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

// Helper function to create a success response
function createSuccessResponse(submissionKey, data) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Form submission received successfully',
      submissionId: submissionKey,
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

    // Validate the form data
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return createErrorResponse(validation.error, 400);
    }

    // Generate a unique key for this submission
    const submissionKey = generateSubmissionKey();

    // Prepare the data to store (add metadata)
    const submissionData = {
      ...formData,
      _metadata: {
        submittedAt: new Date().toISOString(),
        userAgent: request.headers.get('User-Agent') || 'Unknown',
        ipAddress: request.headers.get('CF-Connecting-IP') || 'Unknown',
        submissionId: submissionKey
      }
    };

    // Store the submission in KV
    try {
      await TODO_LIST.put(submissionKey, JSON.stringify(submissionData), {
        // Optional: Set expiration time (e.g., 1 year from now)
        expirationTtl: 31536000 // 1 year in seconds
      });
    } catch (kvError) {
      console.error('KV storage error:', kvError);
      return createErrorResponse('Failed to store submission', 500);
    }

    // Return success response
    return createSuccessResponse(submissionKey, formData);

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Optional: Add a GET endpoint to retrieve submissions (for admin purposes)
// Uncomment this if you want to add a GET endpoint
/*
async function handleGetRequest(request) {
  try {
    // You might want to add authentication here
    const url = new URL(request.url);
    const submissionId = url.searchParams.get('id');
    
    if (!submissionId) {
      return createErrorResponse('Submission ID required', 400);
    }

    const submission = await FORM_SUBMISSIONS.get(submissionId);
    
    if (!submission) {
      return createErrorResponse('Submission not found', 404);
    }

    return new Response(submission, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('GET request error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
*/ 