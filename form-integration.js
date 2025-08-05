// JavaScript to integrate your contact form with the Cloudflare Worker
// Add this to your contact.html file or include it as a separate script

// Cloudflare Worker URL for form submissions
const WORKER_URL = 'https://form-submission-handler.hachhouchzakaria.workers.dev';

// Function to collect form data and send to Cloudflare Worker
async function submitFormToWorker(formElement) {
    try {
        // Show loading state
        const submitButton = formElement.querySelector('.btn-submit');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        // Collect form data
        const formData = new FormData(formElement);
        const jsonData = {};

        // Convert FormData to JSON object
        for (const [key, value] of formData.entries()) {
            // Handle checkbox arrays
            if (key.endsWith('[]')) {
                const baseKey = key.slice(0, -2);
                if (!jsonData[baseKey]) {
                    jsonData[baseKey] = [];
                }
                jsonData[baseKey].push(value);
            } else {
                jsonData[key] = value;
            }
        }

        // Add selected automations
        const selectedAutomations = [];
        const automationCheckboxes = formElement.querySelectorAll('input[name="automations[]"]:checked');
        automationCheckboxes.forEach(checkbox => {
            selectedAutomations.push(checkbox.value);
        });
        jsonData.automations = selectedAutomations;

        // Send data to Cloudflare Worker
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success - show success message
            showSuccessMessage(formElement, result);
        } else {
            // Error - show error message
            showErrorMessage(formElement, result.error || 'Submission failed');
        }

    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage(formElement, 'Network error. Please try again.');
    } finally {
        // Reset button state
        const submitButton = formElement.querySelector('.btn-submit');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Function to show success message
function showSuccessMessage(formElement, result) {
    const successMessage = formElement.parentElement.querySelector('.success-message');
    if (successMessage) {
        successMessage.innerHTML = `
            <p>✅ Thank you! Your message has been sent successfully.</p>
            <p><strong>Submission ID:</strong> ${result.submissionId}</p>
            <p>We'll get back to you within 2 hours.</p>
        `;
        successMessage.classList.add('show');
        
        // Hide the form
        formElement.style.display = 'none';
        
        // Reset form after 5 seconds (for demo purposes)
        setTimeout(() => {
            formElement.style.display = 'block';
            successMessage.classList.remove('show');
            formElement.reset();
        }, 5000);
    }
}

// Function to show error message
function showErrorMessage(formElement, errorMessage) {
    const successMessage = formElement.parentElement.querySelector('.success-message');
    if (successMessage) {
        successMessage.innerHTML = `
            <p>❌ Error: ${errorMessage}</p>
            <p>Please try again or contact us directly.</p>
        `;
        successMessage.style.background = 'rgba(220, 38, 38, 0.1)';
        successMessage.style.border = '1px solid rgba(220, 38, 38, 0.3)';
        successMessage.classList.add('show');
        
        // Reset styling after 5 seconds
        setTimeout(() => {
            successMessage.style.background = 'rgba(16, 185, 129, 0.1)';
            successMessage.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            successMessage.classList.remove('show');
        }, 5000);
    }
}

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Replace the existing form submission handler
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitFormToWorker(this);
        });
    }
});

// Alternative: If you want to keep the Calendly link and also submit form data
function submitFormAndRedirect(formElement, calendlyUrl) {
    // First submit the form data
    submitFormToWorker(formElement).then(() => {
        // Then redirect to Calendly
        window.open(calendlyUrl, '_blank');
    });
} 