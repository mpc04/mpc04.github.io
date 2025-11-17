
const products = [
    { id: 1, title: 'Amazon Basics Electric Kettle', price: 25.00, reviewScore: 4.0, img: 'kettle.png', profitScore: 80, ethicalScore: 10 },
    { id: 2, title: 'Local Co. Hand-Made Ceramic Kettle', price: 45.00, reviewScore: 4.8, img: 'kettle.png', profitScore: 10, ethicalScore: 95 },
    { id: 3, title: 'MegaCorp Premium Kettle v2.0', price: 89.99, reviewScore: 4.6, img: 'kettle.png', profitScore: 65, ethicalScore: 40 },
    { id: 4, title: 'Budget Traveler Collapsible Kettle', price: 15.50, reviewScore: 3.5, img: 'kettle.png', profitScore: 90, ethicalScore: 5 },
    { id: 5, title: 'Sustainable Bamboo Hot Water Dispenser', price: 75.00, reviewScore: 4.9, img: 'kettle.png', profitScore: 20, ethicalScore: 85 },
    { id: 6, title: 'Mid-Range Stainless Steel Kettle', price: 35.00, reviewScore: 4.2, img: 'kettle.png', profitScore: 50, ethicalScore: 50 },
];


const resultsContainer = document.getElementById('search-results');
const toggleSwitch = document.getElementById('prioritization-toggle');
const analyzeBtn = document.getElementById('analyze-rank-btn');
const vizArea = document.getElementById('visualization-area');

/**
 * 
 * @param {number} score 
 */
const getStars = (score) => '⭐'.repeat(Math.floor(score)) + ` (${score.toFixed(1)})`;




/**
 * 
 * @param {string} sortKey - 'profit' or 'ethical'.
 * @param {Array<Object>} sortedProducts - The array to render.
 */
const renderProducts = (sortKey, sortedProducts = products) => {

    const showEthicalBadge = sortKey === 'ethical';

    
    const productHtml = sortedProducts.map(product => `
        <div class="product-card" 
             data-id="${product.id}" 
             data-profit-score="${product.profitScore}" 
             data-ethical-score="${product.ethicalScore}"
        >
            <img src="${product.img}" alt="${product.title}" class="product-image">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-ranking">
                <span class="review-score">${getStars(product.reviewScore)}</span>
            </div>
            <div class="ethical-badge ${showEthicalBadge && product.ethicalScore > 50 ? '' : 'hidden'}">
                Ethically Sourced!
            </div>
        </div>
    `).join('');

   
    resultsContainer.innerHTML = productHtml;
};


/**
 * 
 * @param {string} key - 'profit' or 'ethical'.
 * @returns {Array<Object>} - The sorted array.
 */
const sortProducts = (key) => {
    
    return products.slice().sort((a, b) => {
        const scoreA = key === 'profit' ? a.profitScore : a.ethicalScore;
        const scoreB = key === 'profit' ? b.profitScore : b.ethicalScore;
        return scoreB - scoreA;
    });
};


/**
 * 
 */
const analyzeRank = () => {
    const topCard = resultsContainer.querySelector('.product-card');
    if (!topCard) return; 


    const profit = topCard.getAttribute('data-profit-score');
    const ethical = topCard.getAttribute('data-ethical-score');


    vizArea.classList.add('visible');
    

    document.getElementById('viz-profit').textContent = `${profit}%`;
    document.getElementById('viz-ethical').textContent = `${ethical}%`;
    
    document.getElementById('profit-bar').style.width = `${profit}%`;
    document.getElementById('ethical-bar').style.width = `${ethical}%`;

 
    const isProfitSort = !toggleSwitch.checked; 
    const note = document.querySelector('.viz-note');
    if (isProfitSort) {
        note.innerHTML = 'The current rank is driven by EVIL PROFIT';
    } else {
        note.innerHTML = 'The current rank is driven by Ethics <3';
    }
};


const handleToggleChange = () => {
 
    const isEthicalMode = toggleSwitch.checked;
    const sortKey = isEthicalMode ? 'ethical' : 'profit';

    const sortedData = sortProducts(sortKey);


    renderProducts(sortKey, sortedData);

    analyzeRank(); 
};


const initialSort = sortProducts('profit');
renderProducts('profit', initialSort);


analyzeBtn.addEventListener('click', analyzeRank);
toggleSwitch.addEventListener('change', handleToggleChange);


analyzeRank();