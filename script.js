// script.js
// Navigation toggle for mobile
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('nav .nav-links');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Dark mode toggle
const darkToggle = document.getElementById('darkmode-toggle');
if (darkToggle) {
    // Initialize based on localStorage
    if (localStorage.getItem('light-mode') === 'true') {
        document.body.classList.add('light-mode');
        darkToggle.textContent = '☀';
    }
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('light-mode', 'true');
            darkToggle.textContent = '☀';
        } else {
            localStorage.removeItem('light-mode');
            darkToggle.textContent = '🌙';
        }
    });
}

// (Optional) Highlight current page based on URL
// const current = window.location.pathname.split('/').pop();
// document.querySelectorAll('nav .nav-links a').forEach(link => {
//     if (link.getAttribute('href') === current) {
//         link.classList.add('active');
//     }
// });
