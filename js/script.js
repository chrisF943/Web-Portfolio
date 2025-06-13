// DOM Elements
const darkModeToggle = document.getElementById("dark-mode-toggle")
const body = document.body
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
const mobileMenu = document.querySelector(".mobile-menu")
const mobileLinks = document.querySelectorAll(".mobile-link")
const projectSlides = document.querySelectorAll(".project-slide")
const prevButton = document.querySelector(".carousel-btn.prev")
const nextButton = document.querySelector(".carousel-btn.next")
const indicators = document.querySelectorAll(".indicator")
const navbar = document.querySelector(".navbar")
const contactForm = document.getElementById("contact-form")
const confirmationMessage = document.getElementById("confirmation-message")

// Dark Mode Toggle
function initDarkMode() {
    // Check user preference from localStorage
    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark-mode")
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>' // Sun icon for dark mode
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>' // Moon icon for light mode
    }

    // Toggle dark mode
    darkModeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode")

        // Change icon based on mode
        if (body.classList.contains("dark-mode")) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>' // Sun icon for dark mode
            localStorage.setItem("dark-mode", "enabled")
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>' // Moon icon for light mode
            localStorage.setItem("dark-mode", "disabled")
        }
    })
}

// Mobile Menu Toggle
function initMobileMenu() {
    mobileMenuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("active")
        mobileMenuToggle.innerHTML = mobileMenu.classList.contains("active")
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>'
    })

    // Close mobile menu when a link is clicked
    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("active")
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>'
        })
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
        if (
            !mobileMenu.contains(e.target) &&
            !mobileMenuToggle.contains(e.target) &&
            mobileMenu.classList.contains("active")
        ) {
            mobileMenu.classList.remove("active")
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>'
        }
    })
}

// Project Carousel
function initProjectCarousel() {
    let currentSlide = 0

    function showSlide(index) {
        projectSlides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index)
        })

        indicators.forEach((indicator, i) => {
            indicator.classList.toggle("active", i === index)
        })

        currentSlide = index
    }

    // Next slide
    nextButton.addEventListener("click", () => {
        const nextIndex = (currentSlide + 1) % projectSlides.length
        showSlide(nextIndex)
    })

    // Previous slide
    prevButton.addEventListener("click", () => {
        const prevIndex = (currentSlide - 1 + projectSlides.length) % projectSlides.length
        showSlide(prevIndex)
    })

    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener("click", () => {
            showSlide(index)
        })
    })

    // Auto-advance slides every 5 seconds
    let slideInterval = setInterval(() => {
        const nextIndex = (currentSlide + 1) % projectSlides.length
        showSlide(nextIndex)
    }, 5000)

    // Pause auto-advance when hovering over carousel
    const carousel = document.querySelector(".project-carousel")
    carousel.addEventListener("mouseenter", () => {
        clearInterval(slideInterval)
    })

    carousel.addEventListener("mouseleave", () => {
        slideInterval = setInterval(() => {
            const nextIndex = (currentSlide + 1) % projectSlides.length
            showSlide(nextIndex)
        }, 5000)
    })
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "var(--shadow-md)"
            navbar.style.backdropFilter = "blur(10px)"
            navbar.style.backgroundColor = body.classList.contains("dark-mode")
                ? "rgba(15, 23, 42, 0.9)"
                : "rgba(255, 255, 255, 0.9)"
        } else {
            navbar.style.boxShadow = "var(--shadow-sm)"
            navbar.style.backdropFilter = "none"
            navbar.style.backgroundColor = body.classList.contains("dark-mode") ? "var(--bg-color)" : "var(--bg-color)"
        }
    })
}

// Skills hover for touch devices
function initSkillsTouch() {
    const skillCards = document.querySelectorAll(".skill-card");

    // Remove touch class when clicking outside
    document.addEventListener("click", function(e) {
        if (!e.target.closest(".skill-card")) {
            skillCards.forEach(card => card.classList.remove("touch"));
        }
    });

    skillCards.forEach((card) => {
        card.addEventListener("click", function(e) {
            // First remove touch class from all other cards
            skillCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove("touch");
                }
            });
            
            // Toggle touch class on this card
            this.classList.toggle("touch");
            e.stopPropagation();
        });
    });
}

// Contact Form
function initContactForm() {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault() // Prevent the default form submission

        const formData = new FormData(contactForm)
        const data = {}
        formData.forEach((value, key) => {
            data[key] = value
        })

        try {
            // Send the form data to the Netlify function
            const response = await fetch(contactForm.action, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            })

            if (response.ok) {
                // Hide the form and show the confirmation message
                contactForm.classList.add("hidden")
                confirmationMessage.classList.remove("hidden")
            } else {
                alert("Form submission failed. Please try again.")
            }
        } catch (error) {
            alert("An error occurred. Please try again.")
        }
    })
}

// Check if images are loading properly
function checkImages() {
    const images = document.querySelectorAll("img")

    images.forEach((img) => {
        img.onerror = function () {
            console.error(`Failed to load image: ${img.src}`)
            // Add a fallback or placeholder
            this.src = "https://via.placeholder.com/150?text=Image+Not+Found"
        }
    })
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initDarkMode()
    initMobileMenu()
    initProjectCarousel()
    initNavbarScroll()
    initSkillsTouch()
    initContactForm()
    checkImages() // Add this line
})
