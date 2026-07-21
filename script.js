// Navigation toggle for mobile
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('nav .nav-links');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Dark mode toggle
const darkToggle = document.getElementById('darkmode-toggle');
if (darkToggle) {
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

// Highlight the current navigation page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav .nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
        link.classList.add('active');
    }
});
