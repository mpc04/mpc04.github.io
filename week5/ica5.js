const expandBtn = document.querySelector('.expand-btn');
const details = document.querySelector('.details');

expandBtn.addEventListener('click', () => {
  details.classList.toggle('show');

  if (details.classList.contains('show')) {
    expandBtn.textContent = "−"; // minus sign
    expandBtn.setAttribute('aria-label', 'Collapse card');
  } else {
    expandBtn.textContent = "+"; 
    expandBtn.setAttribute('aria-label', 'Expand card');
  }
});
