// Common Scripts for SpeedEaze Site

// Add floating CTA button to all pages
document.addEventListener('DOMContentLoaded', function() {
    // Create floating CTA button
    const floatingCta = document.createElement('a');
    floatingCta.href = 'contact.html';
    floatingCta.className = 'floating-cta';
    floatingCta.textContent = 'Book a Free Strategy Call';
    floatingCta.setAttribute('aria-label', 'Book a Free Strategy Call');
    
    // Add to body
    document.body.appendChild(floatingCta);
    
    // Add smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Force www domain redirect
if (window.location.hostname === 'speedeaze.com') {
    window.location.href = 'https://www.speedeaze.com' + window.location.pathname + window.location.search + window.location.hash;
} 