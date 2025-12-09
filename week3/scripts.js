// This file is currently a placeholder for more advanced interactivity.
// The basic hover animation for the Home page is handled by CSS.

document.addEventListener('DOMContentLoaded', () => {
    // Example of a simple script to add a class on load if needed
    // const body = document.querySelector('body');
    // body.classList.add('loaded');
});
document.addEventListener('DOMContentLoaded', () => {
    // === GALLERY PAGE LOGIC ===

    const galleryWrap = document.querySelector('.gallery-wrap');
    if (galleryWrap) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        let isDown = false;
        let startX;
        let scrollLeft;

        // --- 1. Mouse Drag Scrolling ---

        galleryWrap.addEventListener('mousedown', (e) => {
            isDown = true;
            galleryWrap.classList.add('active');
            startX = e.pageX - galleryWrap.offsetLeft;
            scrollLeft = galleryWrap.scrollLeft;
            e.preventDefault(); // Prevents image dragging
        });

        galleryWrap.addEventListener('mouseleave', () => {
            isDown = false;
            galleryWrap.classList.remove('active');
        });

        galleryWrap.addEventListener('mouseup', () => {
            isDown = false;
            galleryWrap.classList.remove('active');
        });

        galleryWrap.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - galleryWrap.offsetLeft;
            const walk = (x - startX) * 2; // Scroll faster
            galleryWrap.scrollLeft = scrollLeft - walk;
        });

        // --- 2. Center Focus Effect ---

        const updateFocus = () => {
            const wrapCenter = galleryWrap.scrollLeft + galleryWrap.clientWidth / 2;

            galleryItems.forEach(item => {
                const itemCenter = item.offsetLeft + item.clientWidth / 2;
                const distance = Math.abs(wrapCenter - itemCenter);
                
                // Define the focus area (e.g., within 250px of the center)
                const threshold = 350; 

                if (distance < threshold) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
                
                // Optional: Implement a subtle scaling effect based on distance
                // The max scale is 1, and it reduces as distance increases.
                const scale = Math.max(0.9, 1 - distance / (threshold * 1.5));
                item.style.transform = `scale(${scale})`;
            });
        };

        // Update focus on initial load and whenever the gallery scrolls
        updateFocus();
        galleryWrap.addEventListener('scroll', updateFocus);
    }


    // === HOME PAGE ANIMATION LOGIC (Example from initial plan) ===
    const scatterImages = document.querySelectorAll('.scatter-image');

    scatterImages.forEach(image => {
        // Optional: Can add more complex JS hover effects here if CSS is not enough
    });
});