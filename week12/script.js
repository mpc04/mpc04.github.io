const STORAGE_KEY = 'aic_favorites_v1';
let favoritesData = [];

const generateSessionId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

let currentUserId = generateSessionId(); 

const setupLocalStorage = () => {

    const userIdDisplay = document.getElementById('user-id-display');
    if (userIdDisplay) {
        userIdDisplay.textContent = `Local Session ID: ${currentUserId.substring(0, 8)}... (Data saved in browser)`;
    }
    loadFavorites();
};


const getFavorites = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error reading from localStorage:", e);
        return [];
    }
};

const saveFavorites = (favorites) => {
    const statusMessage = document.getElementById('status-message');
    try {
        favorites.sort((a, b) => b.timestamp - a.timestamp);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        favoritesData = favorites; 
        renderFavorites(favorites);
        
        if (statusMessage) {
            statusMessage.textContent = ''; 
        }

    } catch (e) {
        console.error("Error writing to localStorage (Quota likely exceeded):", e);
        if (statusMessage) {
             statusMessage.textContent = 'Error: Failed to save favorite (Storage limit reached). Please remove old favorites.';
        }
    }
};

const loadFavorites = () => {
    const loaded = getFavorites();
    favoritesData = loaded;
    renderFavorites(loaded);
};

window.addFavorite = (artwork) => {
    const favorites = getFavorites();
    const statusMessage = document.getElementById('status-message');

    if (favorites.some(fav => fav.id === artwork.id)) {
        console.warn("Artwork already favorited.");
        if (statusMessage) statusMessage.textContent = `${artwork.title} is already saved in your favorites.`;
        return;
    }

    favorites.push({ 
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist_display, 
        image_id: artwork.image_id,
        width: artwork.width,
        height: artwork.height,
        timestamp: Date.now() 
    });
    saveFavorites(favorites);
    if (statusMessage) statusMessage.textContent = `${artwork.title} successfully added to favorites.`;
};

window.removeFavorite = (artworkId) => {
    let favorites = getFavorites();
    const initialLength = favorites.length;
    const statusMessage = document.getElementById('status-message');

    const artworkToRemove = favorites.find(fav => fav.id === Number(artworkId));
    
    favorites = favorites.filter(fav => fav.id !== Number(artworkId));

    if (favorites.length < initialLength) {
        saveFavorites(favorites);
        if (artworkToRemove && statusMessage) {
            statusMessage.textContent = `${artworkToRemove.title} successfully removed from favorites.`;
        }
    } else if (statusMessage) {
        statusMessage.textContent = "Error: Artwork could not be found to remove.";
    }
};

const BASE_API_URL = "https://api.artic.edu/api/v1/artworks/search";
const IMAGE_BASE_URL = "https://www.artic.edu/iiif/2/";

window.searchArtworks = async () => {
    const queryText = document.getElementById('search-input').value.trim();
    const resultsContainer = document.getElementById('search-results');
    const statusMessage = document.getElementById('status-message');

    if (!queryText) {
        statusMessage.textContent = 'Please enter a search term.';
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = '<div class="col-span-full text-center p-8 text-gray-400">Searching...</div>';
    statusMessage.textContent = ''; 

    try {
        const url = `${BASE_API_URL}?q=${encodeURIComponent(queryText)}&fields=id,title,artist_display,image_id,dimensions,width,height&limit=24`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();

        if (data.data.length === 0) {
            resultsContainer.innerHTML = '<div class="col-span-full text-center p-8 text-gray-400">No artworks found for that query. Try something else!</div>';
            statusMessage.textContent = 'Search returned no results.';
        } else {
            renderSearchResults(data.data);
            statusMessage.textContent = `Search complete. ${data.data.length} results found.`;
        }

    } catch (error) {
        console.error("Search failed:", error);
        statusMessage.textContent = `Search failed: ${error.message}. Could not connect to the AIC API.`;
        resultsContainer.innerHTML = '<div class="col-span-full text-center p-8 text-red-400">Could not connect to the AIC API.</div>';
    }
};

const getImageUrl = (imageId) => {
    if (!imageId) return null;
    return `${IMAGE_BASE_URL}${imageId}/full/400,/0/default.jpg`;
};

const createArtworkCard = (artwork, isFavorite) => {
    const imageUrl = getImageUrl(artwork.image_id) || 'https://placehold.co/400x300/403F4C/E4E6C3?text=No+Image';
    const cardContainer = document.createElement('div');
    cardContainer.className = "card-container";

    const aspectRatio = artwork.width && artwork.height ? artwork.width / artwork.height : 1;
    const frameClass = aspectRatio >= 1.1 ? 'horizontal-frame' : 'vertical-frame';

    const escapeString = (str) => {
        if (!str) return '';
        return str.toString().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    };

    const safeTitle = escapeString(artwork.title);
    
    const displayArtist = artwork.artist || artwork.artist_display || 'Unknown Artist';
    const saveArtist = artwork.artist_display || artwork.artist || 'Unknown Artist';
    const safeArtist = escapeString(saveArtist); 
    
    const safeImageId = artwork.image_id || '';
    const width = artwork.width || 0;
    const height = artwork.height || 0;
    
    const altText = `Image of ${artwork.title} by ${displayArtist}.`;


    cardContainer.innerHTML = `
        <div class="frame ${frameClass}"></div>
        <div class="artwork-card bg-gray-700 border border-gray-600 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-xl relative w-full h-full">
            <div class="artwork-image-wrapper h-48 sm:h-64 md:h-80 overflow-hidden">
                <img src="${imageUrl}" alt="${altText}" class="object-contain max-w-full max-h-full" onerror="this.onerror=null;this.src='https://placehold.co/400x300/403F4C/E4E6C3?text=No+Image';this.alt='Placeholder image for artwork with no available image.';">
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <h3 class="text-2xl font-bold mb-2 text-center">${artwork.title}</h3>
                <p class="text-sm mb-4 text-center">${displayArtist}</p>
                <div class="mt-auto">
                    ${isFavorite
                        ? `<button onclick="removeFavorite(${artwork.id})" class="custom-button w-full font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150" aria-label="Remove ${artwork.title} from favorites">
                            Remove Favorite
                           </button>`
                        : `<button onclick="addFavorite({id: ${artwork.id}, title: '${safeTitle}', artist_display: '${safeArtist}', image_id: '${safeImageId}', width: ${width}, height: ${height}})" class="custom-button w-full font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150" aria-label="Save ${artwork.title} by ${displayArtist} as favorite">
                            Save Favorite
                           </button>`
                    }
                </div>
            </div>
        </div>
    `;
    return cardContainer;
};


const renderSearchResults = (artworks) => {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    const favoritesIds = new Set(favoritesData.map(fav => fav.id));

    artworks.forEach(artwork => {
        if (artwork.id && artwork.title) {
            const isFavorite = favoritesIds.has(artwork.id);
            container.appendChild(createArtworkCard({
                id: artwork.id,
                title: artwork.title,
                artist_display: artwork.artist_display || 'Unknown Artist',
                image_id: artwork.image_id,
                width: artwork.width,
                height: artwork.height
            }, isFavorite));
        }
    });
};

const renderFavorites = (favorites) => {
    const container = document.getElementById('favorites-list');
    container.innerHTML = '';

    if (favorites.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center p-8 text-gray-400 border border-dashed border-gray-600 rounded-xl">You have no saved favorites yet.</div>';
        document.getElementById('favorites-title').textContent = 'Your Saved Favorites (0)';
        return;
    }

    document.getElementById('favorites-title').textContent = `Your Saved Favorites (${favorites.length})`;

    favorites.forEach(artwork => {
        container.appendChild(createArtworkCard({
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist || 'Unknown Artist', 
            image_id: artwork.image_id,
            width: artwork.width,
            height: artwork.height
        }, true));
    });
};

window.onload = setupLocalStorage;