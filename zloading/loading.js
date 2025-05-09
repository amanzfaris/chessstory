document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Simulate loading time
    setTimeout(() => {
        // Fade out
        document.body.style.opacity = '0';
        
        // Redirect to game page after fade
        setTimeout(() => {
            window.location.href = '../nstory/introduction.html';
        }, 500);
    }, 4000); // Changed from 2000 to 5000 for 5 seconds loading time
});

