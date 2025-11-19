const wrapper = document.getElementById('selectWrapper');
const trigger = document.getElementById('selectTrigger');
const triggerText = document.getElementById('triggerText');
const options = document.querySelectorAll('.custom-option');

let currentBgId = "amsterdam"; // Default ID updated to first location

// 1. Toggle Dropdown
trigger.addEventListener('click', (e) => {
    wrapper.classList.toggle('open');
    e.stopPropagation();
});

// 2. Handle Option Selection
options.forEach(option => {
    option.addEventListener('click', function() {
        const newVal = this.getAttribute('data-value');
        const label = this.querySelector('.option-label').innerText;

        // If clicking the same one, just close
        if (newVal === currentBgId) {
            wrapper.classList.remove('open');
            return;
        }

        // Update Text
        triggerText.innerText = label;

        // Update Visual Selection State
        options.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');

        // Close Dropdown
        wrapper.classList.remove('open');

        // --- GSAP Background Animation Logic ---
        const oldBgId = currentBgId;
        currentBgId = newVal;

        const tl = gsap.timeline();

        // "bg" + "amsterdam" matches id="bgamsterdam"
        const nextBg = document.getElementById("bg" + currentBgId);
        const oldBg = document.getElementById("bg" + oldBgId);

        // Setup new BG
        gsap.set(nextBg, { zIndex: 2, opacity: 0 });
        gsap.set(oldBg, { zIndex: 1 });

        tl.to(nextBg, { opacity: 0.9, duration: 1 })
          .to(oldBg, { opacity: 0, duration: 1 }, "<") // Run at same time
          .set(nextBg, { zIndex: 1, className: "bgImg active" })
          .set(oldBg, { zIndex: 0, className: "bgImg" });
    });
});

// 3. Close if clicked outside
document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
    }
});