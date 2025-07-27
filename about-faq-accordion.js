// About Page FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Setting up About page FAQ functionality...');
  
  // Add click event listeners to all FAQ questions
  const faqQuestions = document.querySelectorAll('.scl-faq-question-wraper');
  console.log('Found', faqQuestions.length, 'FAQ questions on About page');
  
  faqQuestions.forEach((question, index) => {
    question.addEventListener('click', function(e) {
      console.log('About page FAQ question clicked:', index);
      e.preventDefault();
      toggleAboutFAQ(this);
    });
  });
});

function toggleAboutFAQ(element) {
  console.log('toggleAboutFAQ called');
  const answerWrapper = element.nextElementSibling;
  const plusIcon = element.querySelector('.scl-faq-accordian-plus');
  
  console.log('Answer wrapper:', answerWrapper);
  console.log('Plus icon:', plusIcon);
  
  // Close all other FAQ items
  const allFAQItems = document.querySelectorAll('.scl-faq-ans-wraper');
  const allPlusIcons = document.querySelectorAll('.scl-faq-accordian-plus');
  
  allFAQItems.forEach(item => {
    if (item !== answerWrapper) {
      item.style.height = '0px';
    }
  });
  
  allPlusIcons.forEach(icon => {
    if (icon !== plusIcon) {
      icon.textContent = '+';
    }
  });
  
  // Toggle current FAQ item
  if (answerWrapper.style.height === '0px' || answerWrapper.style.height === '') {
    console.log('Opening About page FAQ item');
    // Calculate the height of the content with padding
    const content = answerWrapper.querySelector('.scl-faq-accordian-text');
    
    // Temporarily set height to auto to get the full content height
    answerWrapper.style.height = 'auto';
    const fullHeight = answerWrapper.scrollHeight;
    
    // Add extra padding to ensure all text is visible
    const finalHeight = fullHeight + 40; // Add 40px extra for padding/margins
    
    console.log('Content height:', fullHeight, 'Final height:', finalHeight);
    answerWrapper.style.height = finalHeight + 'px';
    plusIcon.textContent = '−';
  } else {
    console.log('Closing About page FAQ item');
    answerWrapper.style.height = '0px';
    plusIcon.textContent = '+';
  }
} 