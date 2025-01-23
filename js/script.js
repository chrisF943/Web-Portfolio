// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

// Check user preference from localStorage
if (localStorage.getItem('dark-mode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark mode
} else {
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light mode
}

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // Change icon based on mode
    if (body.classList.contains('dark-mode')) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark mode
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light mode
        localStorage.setItem('dark-mode', 'disabled');
    }
});

// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Hide the form
    const form = document.getElementById('contact-form');
    form.classList.add('hidden'); // Add the 'hidden' class to the form

    // Show the confirmation message
    const confirmationMessage = document.getElementById('confirmation-message');
    confirmationMessage.classList.remove('hidden'); // Remove the 'hidden' class from the confirmation message

    // Submit the form data to Formspree
    fetch(this.action, {
        method: this.method,
        body: new FormData(this),
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                console.log('Form submitted successfully!');
            } else {
                console.error('Form submission failed.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
