# Cloudflare Worker Form Submission Handler

This Cloudflare Worker handles form submissions from your website, stores them in Cloudflare KV, and provides a robust API endpoint for your contact forms.

## Features

- ✅ Handles POST requests with JSON form data
- ✅ Stores submissions in Cloudflare KV with unique keys
- ✅ Comprehensive validation and error handling
- ✅ CORS support for cross-origin requests
- ✅ Automatic metadata collection (timestamp, IP, user agent)
- ✅ Configurable data expiration
- ✅ Detailed success/error responses

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace

```bash
# Create the main KV namespace
wrangler kv:namespace create "FORM_SUBMISSIONS"

# Create the preview KV namespace (for development)
wrangler kv:namespace create "FORM_SUBMISSIONS" --preview
```

### 4. Update Configuration

Edit `wrangler.toml` and replace the placeholder IDs with your actual KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "FORM_SUBMISSIONS"
id = "your-actual-kv-namespace-id"
preview_id = "your-actual-preview-kv-namespace-id"
```

### 5. Deploy the Worker

```bash
wrangler deploy
```

### 6. Test the Worker

```bash
# Test with curl
curl -X POST https://your-worker.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "companyName": "Test Company",
    "serviceRequired": "starter-ai",
    "projectBudget": "100-250",
    "message": "Test message",
    "automations": ["client-onboarding", "lead-follow-up"]
  }'
```

## Integration with Your Website

### Option 1: Replace the Submit Button (Recommended)

Update your contact form to use the Cloudflare Worker instead of the Calendly link:

```html
<!-- Replace the Calendly link with a regular submit button -->
<button type="submit" class="btn-submit">Submit</button>
```

Then include the integration script:

```html
<script src="form-integration.js"></script>
```

### Option 2: Submit Form Data + Redirect to Calendly

If you want to collect form data AND redirect to Calendly:

```html
<button type="button" class="btn-submit" onclick="submitFormAndRedirect(document.getElementById('contactForm'), 'https://calendly.com/hachhouchzakaria/30min')">
    Submit & Schedule Call
</button>
```

## API Endpoint

### POST / (Root endpoint)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "companyName": "Test Company",
  "serviceRequired": "starter-ai",
  "projectBudget": "100-250",
  "message": "I need help with automation",
  "automations": ["client-onboarding", "lead-follow-up"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Form submission received successfully",
  "submissionId": "submission_1703123456789_abc123",
  "timestamp": "2023-12-21T10:30:45.123Z",
  "data": { /* original form data */ }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Missing required field: email",
  "timestamp": "2023-12-21T10:30:45.123Z"
}
```

## Data Storage

Each submission is stored in KV with:

- **Key:** `submission_{timestamp}_{random_suffix}`
- **Value:** JSON string containing form data + metadata
- **Expiration:** 1 year (configurable)

### Metadata Included

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "_metadata": {
    "submittedAt": "2023-12-21T10:30:45.123Z",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "submissionId": "submission_1703123456789_abc123"
  }
}
```

## Validation Rules

The worker validates:

- ✅ Required fields: `firstName`, `lastName`, `email`
- ✅ Email format validation
- ✅ JSON structure validation
- ✅ Non-empty string values

## Customization

### Modify Validation Rules

Edit the `validateFormData()` function in `cloudflare-worker.js`:

```javascript
function validateFormData(data) {
  // Add your custom validation rules here
  const requiredFields = ['firstName', 'lastName', 'email', 'yourCustomField'];
  // ... rest of validation logic
}
```

### Change Data Expiration

Modify the `expirationTtl` in the KV put operation:

```javascript
await FORM_SUBMISSIONS.put(submissionKey, JSON.stringify(submissionData), {
  expirationTtl: 31536000 // 1 year in seconds
});
```

### Add GET Endpoint

Uncomment the GET endpoint code in `cloudflare-worker.js` to retrieve submissions:

```javascript
// Add authentication and uncomment the handleGetRequest function
```

## Security Considerations

- ✅ Input validation and sanitization
- ✅ CORS headers for cross-origin requests
- ✅ Error handling without exposing sensitive information
- ✅ Rate limiting (consider adding if needed)
- ✅ Authentication for admin endpoints (recommended)

## Monitoring and Debugging

### View Worker Logs

```bash
wrangler tail
```

### List KV Entries

```bash
wrangler kv:key list --binding=FORM_SUBMISSIONS
```

### Get Specific KV Entry

```bash
wrangler kv:key get --binding=FORM_SUBMISSIONS "submission_1703123456789_abc123"
```

## Troubleshooting

### Common Issues

1. **KV Namespace Not Found**
   - Ensure you've created the KV namespace
   - Check the namespace ID in `wrangler.toml`

2. **CORS Errors**
   - Verify the CORS headers are being sent
   - Check if your domain is allowed in the headers

3. **Validation Errors**
   - Check the required fields in your form
   - Ensure email format is valid

4. **Deployment Issues**
   - Run `wrangler whoami` to verify login
   - Check `wrangler.toml` syntax

## Support

For issues or questions:
- Check the Cloudflare Workers documentation
- Review the error logs with `wrangler tail`
- Ensure all configuration is correct

## License

This project is open source and available under the MIT License. 