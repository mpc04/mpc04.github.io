// --- Core State and Configuration ---
const STORAGE_KEY = 'aic_favorites_v1';
let favoritesData = []; // In-memory cache of favorites

// Helper function for robust session ID generation
const generateSessionId = () => {
    // Use crypto.randomUUID() if available (modern browser standard)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback for environments where randomUUID is not available
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Use a random ID to simulate a session, even though persistence is local
let currentUserId = generateSessionId(); 

// Initialization function run on page load
const setupLocalStorage = () => {
    // Display a shortened Session ID as a user identifier
    const userIdDisplay = document.getElementById('user-id-display');
    if (userIdDisplay) {
        userIdDisplay.textContent = `Local Session ID: ${currentUserId.substring(0, 8)}... (Data saved in browser)`;
    }
    loadFavorites();
};

// --- Local Storage Functions ---

const getFavorites = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        // Ensure that the loaded data is an array
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error reading from localStorage:", e);
        return [];
    }
};

const saveFavorites = (favorites) => {
    try {
        // Ensure favorites are sorted by timestamp (newest first) before saving
        favorites.sort((a, b) => b.timestamp - a.timestamp);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        favoritesData = favorites; // Update in-memory cache
        renderFavorites(favorites); // Refresh UI
    } catch (e) {
        // If localStorage is full (QuotaExceededError) or other issue
        console.error("Error writing to localStorage (Quota likely exceeded):", e);
        const statusMessage = document.getElementById('status-message');
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

// Expose functions globally for use in HTML onclick attributes
window.addFavorite = (artwork) => {
    const favorites = getFavorites();

    // Check if already exists
    if (favorites.some(fav => fav.id === artwork.id)) {
        console.warn("Artwork already favorited.");
        return;
    }

    // Add new favorite with necessary data and a timestamp
    favorites.push({ 
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist_display, // Data saved to 'artist' key
        image_id: artwork.image_id,
        width: artwork.width,
        height: artwork.height,
        timestamp: Date.now() // Use timestamp for sorting (newest first)
    });
    saveFavorites(favorites);
};

window.removeFavorite = (artworkId) => {
    let favorites = getFavorites();
    const initialLength = favorites.length;

    // FIX: Ensure artworkId is treated as a number for comparison
    favorites = favorites.filter(fav => fav.id !== Number(artworkId));

    if (favorites.length < initialLength) {
        saveFavorites(favorites);
    }
};


// --- AIC API Functions ---

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
        // Request fields: id, title, artist_display, image_id, width, height
        const url = `${BASE_API_URL}?q=${encodeURIComponent(queryText)}&fields=id,title,artist_display,image_id,dimensions,width,height&limit=24`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();

        if (data.data.length === 0) {
            resultsContainer.innerHTML = '<div class="col-span-full text-center p-8 text-gray-400">No artworks found for that query. Try something else!</div>';
        } else {
            renderSearchResults(data.data);
        }

    } catch (error) {
        console.error("Search failed:", error);
        statusMessage.textContent = `Search failed: ${error.message}.`;
        resultsContainer.innerHTML = '<div class="col-span-full text-center p-8 text-red-400">Could not connect to the AIC API.</div>';
    }
};

// --- Rendering Functions ---

const getImageUrl = (imageId) => {
    if (!imageId) return null;
    return `${IMAGE_BASE_URL}${imageId}/full/400,/0/default.jpg`;
};

const createArtworkCard = (artwork, isFavorite) => {
    const imageUrl = getImageUrl(artwork.image_id) || 'https://placehold.co/400x300/403F4C/E4E6C3?text=No+Image';
    const cardContainer = document.createElement('div');
    cardContainer.className = "card-container";

    // Determine frame orientation based on aspect ratio: horizontal if width > 1.1 * height
    const aspectRatio = artwork.width && artwork.height ? artwork.width / artwork.height : 1;
    const frameClass = aspectRatio >= 1.1 ? 'horizontal-frame' : 'vertical-frame';

    // FIX: Robust escaping for strings passed into the onclick attribute
    // 1. Escape backslashes (\\ to \\\\)
    // 2. Escape single quotes (' to \') since the property strings are single-quoted in the HTML
    const escapeString = (str) => {
        if (!str) return '';
        // Ensure to handle null/undefined and then perform robust escaping
        return str.toString().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    };

    const safeTitle = escapeString(artwork.title);
    
    // Determine the artist name to display (either 'artist' from favorites or 'artist_display' from search)
    const displayArtist = artwork.artist || artwork.artist_display || 'Unknown Artist';
    
    // Determine the artist name to pass to addFavorite (must be artist_display as addFavorite expects it)
    const saveArtist = artwork.artist_display || artwork.artist || 'Unknown Artist';
    const safeArtist = escapeString(saveArtist); 
    
    const safeImageId = artwork.image_id || '';
    const width = artwork.width || 0;
    const height = artwork.height || 0;


    cardContainer.innerHTML = `
        <div class="frame ${frameClass}"></div>
        <div class="artwork-card bg-gray-700 border border-gray-600 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-xl relative w-full h-full">
            <div class="artwork-image-wrapper h-48 sm:h-64 md:h-80 overflow-hidden">
                <img src="${imageUrl}" alt="${artwork.title}" class="object-contain max-w-full max-h-full" onerror="this.onerror=null;this.src='https://placehold.co/400x300/403F4C/E4E6C3?text=No+Image';">
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <h3 class="text-2xl font-bold mb-2 text-center">${artwork.title}</h3>
                <p class="text-sm mb-4 text-center">${displayArtist}</p>
                <div class="mt-auto">
                    ${isFavorite
                        ? `<button onclick="removeFavorite(${artwork.id})" class="custom-button w-full font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150">
                            Remove Favorite
                           </button>`
                        : `<button onclick="addFavorite({id: ${artwork.id}, title: '${safeTitle}', artist_display: '${safeArtist}', image_id: '${safeImageId}', width: ${width}, height: ${height}})" class="custom-button w-full font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150">
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
    // Use the in-memory cache populated by loadFavorites
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
            artist: artwork.artist || 'Unknown Artist', // Passed as 'artist' from saved data
            image_id: artwork.image_id,
            width: artwork.width,
            height: artwork.height
        }, true));
    });
};

window.onload = setupLocalStorage;