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

// Add Carousel functionality
document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.carousel__viewport');
    const prevButtons = document.querySelectorAll('.carousel__prev');
    const nextButtons = document.querySelectorAll('.carousel__next');
    const slides = Array.from(document.querySelectorAll('.carousel__slide'));
    const indicators = document.querySelectorAll('.carousel__indicator');

    let currentIndex = 0; // Track the active slide

    function scrollToSlide(index) {
        currentIndex = index;
        const slideWidth = slides[0].clientWidth;
        carousel.scrollTo({left: slideWidth * index, behavior: 'smooth'});
        updateIndicators(index);
    }

    function updateIndicators(activeIndex) {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    }

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            scrollToSlide(prevIndex);
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % slides.length;
            scrollToSlide(nextIndex);
        });
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent unwanted jumping
            scrollToSlide(index);
        });
    });

    updateIndicators(0);
});


// Handle form submission
// document.getElementById('contact-form').addEventListener('submit', function (event) {
//     event.preventDefault(); // Prevent the form from submitting the traditional way
//
//     // Hide the form
//     const form = document.getElementById('contact-form');
//     form.classList.add('hidden'); // Add the 'hidden' class to the form
//
//     // Show the confirmation message
//     const confirmationMessage = document.getElementById('confirmation-message');
//     confirmationMessage.classList.remove('hidden'); // Remove the 'hidden' class from the confirmation message
//
//     // Submit the form data to Formspree
//     fetch(this.action, {
//         method: this.method,
//         body: new FormData(this),
//         headers: {
//             'Accept': 'application/json'
//         }
//     })
//         .then(response => {
//             if (response.ok) {
//                 console.log('Form submitted successfully!');
//             } else {
//                 console.error('Form submission failed.');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
// });
//
// document.getElementById('contact-form').addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent the default form submission
//
//     const form = event.target;
//     const formData = new FormData(form);
//
//     // Convert form data to JSON
//     const data = {};
//     formData.forEach((value, key) => {
//         data[key] = value;
//     });
//
//     try {
//         // Send the form data to the Netlify function
//         const response = await fetch(form.action, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(data),
//         });
//
//         if (response.ok) {
//             // Hide the form and show the confirmation message
//             form.classList.add('hidden');
//             document.getElementById('confirmation-message').classList.remove('hidden');
//         } else {
//             alert('Form submission failed. Please try again.');
//         }
//     } catch (error) {
//         alert('An error occurred. Please try again.');
//     }
// });
