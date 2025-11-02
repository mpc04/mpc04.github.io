// --- Configuration and Constants ---

// NOTE: TMDB API Key is required for this to work. 
// Using the Authorization header structure provided in the prompt.
const TMDB_AUTHORIZATION_HEADER = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmEwYWIxNTMyYzlkYjFkNDBlZTBhZDBmOTI2YmFiNiIsIm5iZiI6MTc2MjEwOTg5Ni43NTAwMDAyLCJzdWI6IjY5MDdhOWM4ZjkyZTJlOTcyZmUxMmQ2MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vu9PzHiTuoPJY22R_ZLdEWzIr1OIJ6-pn5LQyltdwEY';
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const movieResultsDiv = document.getElementById('movieResults');
const statusMessageDiv = document.getElementById('statusMessage');
const favoritesListDiv = document.getElementById('favoritesList');
const noFavoritesMsg = document.getElementById('noFavoritesMsg');
const exportDataButton = document.getElementById('exportDataButton');
const clearDataButton = document.getElementById('clearDataButton');
const modal = document.getElementById('confirmationModal');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');

// --- Utility Functions ---

/**
 * Fetches data from the TMDB API with robust error handling.
 * @param {string} query The search term.
 */
async function fetchMovies(query) {
    if (!query.trim()) {
        showMessage('Please enter a search term.', 'yellow');
        return;
    }

    showMessage('Searching for movies...', 'blue', true);
    searchButton.disabled = true;
    movieResultsDiv.innerHTML = '';
    
    // Build URL with query parameter
    const url = `${TMDB_SEARCH_URL}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': TMDB_AUTHORIZATION_HEADER,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            // Handle HTTP error statuses
            throw new Error(`API returned status ${response.status}: ${response.statusText}. Check API key and network connection.`);
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            renderMovies(data.results);
            showMessage(`Found ${data.results.length} results for "${query}".`, 'green');
        } else {
            showMessage(`No movies found matching "${query}". Try a different search term.`, 'yellow');
        }

    } catch (error) {
        console.error("API Fetch Error:", error);
        showMessage(`Error fetching data: ${error.message}. Please check console for details.`, 'red');
    } finally {
        searchButton.disabled = false;
    }
}

/**
 * Displays a status message to the user.
 * @param {string} message The message to display.
 * @param {string} color Tailwind color prefix (e.g., 'red', 'green', 'blue').
 * @param {boolean} isLoading Whether to show a simple loading spinner.
 */
function showMessage(message, color, isLoading = false) {
    statusMessageDiv.className = `text-center text-lg mb-4 p-4 rounded-xl bg-${color}-100 border border-${color}-300 text-${color}-800 transition duration-300 flex items-center justify-center`;
    
    let loadingSpinner = '';
    if (isLoading) {
        loadingSpinner = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-${color}-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>`;
    }
    statusMessageDiv.innerHTML = loadingSpinner + `<span>${message}</span>`;
}

/**
 * Renders the movie results in the main area.
 * @param {Array<Object>} movies Array of movie objects from the API.
 */
function renderMovies(movies) {
    const favorites = getFavorites();
    movieResultsDiv.innerHTML = movies.map(movie => {
        const isFavorite = favorites.some(fav => fav.id === movie.id);
        const buttonClass = isFavorite 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800';
        
        const posterPath = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'https://placehold.co/500x750/cccccc/333333?text=No+Poster';
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

        return `
            <div class="movie-card bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <img src="${posterPath}" onerror="this.onerror=null; this.src='https://placehold.co/500x750/cccccc/333333?text=No+Poster';" alt="${movie.title} Poster" class="w-full h-72 object-cover">
                <div class="p-4">
                    <h3 class="text-xl font-bold text-gray-900 truncate">${movie.title}</h3>
                    <p class="text-sm text-gray-500 mb-3">Year: ${releaseYear} | Rating: ${movie.vote_average.toFixed(1)}/10</p>
                    <button data-movie-id="${movie.id}"
                            data-movie-title="${movie.title.replace(/"/g, '&quot;')}"
                            data-movie-year="${releaseYear}"
                            data-movie-poster="${posterPath}"
                            class="favorite-button w-full py-2 px-4 rounded-lg font-semibold transition duration-150 ${buttonClass}">
                        ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// --- Local Data Management (User Control Feature) ---

/**
 * Retrieves the list of favorite movies from local storage.
 * @returns {Array<Object>} The array of favorite movie objects.
 */
function getFavorites() {
    const favoritesJson = localStorage.getItem('movieFavorites');
    try {
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (e) {
        console.error("Error parsing local storage favorites:", e);
        return [];
    }
}

/**
 * Saves the list of favorite movies to local storage.
 * @param {Array<Object>} favorites The array of movie objects to save.
 */
function saveFavorites(favorites) {
    localStorage.setItem('movieFavorites', JSON.stringify(favorites));
}

/**
 * Toggles a movie's favorite status.
 * @param {number} id Movie ID.
 * @param {string} title Movie Title.
 * @param {string} year Movie Release Year.
 * @param {string} posterUrl Movie Poster URL.
 */
function toggleFavorite(id, title, year, posterUrl, buttonElement) {
    const favorites = getFavorites();
    const index = favorites.findIndex(fav => fav.id === id);
    const isFavorite = index !== -1;

    if (isFavorite) {
        favorites.splice(index, 1); // Remove
        if (buttonElement) {
            buttonElement.textContent = 'Add to Favorites';
            buttonElement.classList.replace('bg-red-500', 'bg-gray-200');
            buttonElement.classList.replace('hover:bg-red-600', 'hover:bg-gray-300');
            buttonElement.classList.replace('text-white', 'text-gray-800');
        }
    } else {
        const movie = { id, title, year, posterUrl, dateAdded: new Date().toISOString() };
        favorites.push(movie); // Add
        if (buttonElement) {
            buttonElement.textContent = 'Remove from Favorites';
            buttonElement.classList.replace('bg-gray-200', 'bg-red-500');
            buttonElement.classList.replace('hover:bg-gray-300', 'hover:bg-red-600');
            buttonElement.classList.replace('text-gray-800', 'text-white');
        }
    }
    
    saveFavorites(favorites);
    renderFavorites();
}

/**
 * Renders the favorites list in the right panel.
 */
function renderFavorites() {
    const favorites = getFavorites();
    favoritesListDiv.innerHTML = '';

    if (favorites.length === 0) {
        noFavoritesMsg.classList.remove('hidden');
        exportDataButton.disabled = true;
        clearDataButton.disabled = true;
        return;
    }

    noFavoritesMsg.classList.add('hidden');
    exportDataButton.disabled = false;
    clearDataButton.disabled = false;

    favorites.forEach(fav => {
        const favElement = document.createElement('div');
        favElement.className = 'flex items-center space-x-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-100';
        favElement.innerHTML = `
            <img src="${fav.posterUrl}" onerror="this.onerror=null; this.src='https://placehold.co/50x75?text=NA';" alt="${fav.title}" class="w-10 h-14 object-cover rounded shadow-sm">
            <div class="flex-grow min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">${fav.title}</p>
                <p class="text-xs text-gray-500">${fav.year}</p>
            </div>
            <button data-id="${fav.id}" 
                    class="remove-favorite-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-150" 
                    aria-label="Remove ${fav.title} from favorites">
                <!-- Icon: X -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        favoritesListDiv.appendChild(favElement);
    });
    
    // Re-attach listeners to removal buttons
    document.querySelectorAll('.remove-favorite-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            // Find the full movie object from current favorites to get all details for toggle
            const fav = favorites.find(f => f.id === id);
            if (fav) {
                 // Find the corresponding button in the main results to update its state too
                const resultButton = document.querySelector(`.favorite-button[data-movie-id="${id}"]`);
                toggleFavorite(id, fav.title, fav.year, fav.posterUrl, resultButton);
            }
        });
    });
}

/**
 * Exports the favorites data as a downloadable JSON file.
 */
function exportFavorites() {
    const favorites = getFavorites();
    if (favorites.length === 0) return;

    const filename = 'cinefinder_favorites.json';
    const jsonStr = JSON.stringify(favorites, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Favorites exported successfully as JSON!', 'green');
}

/**
 * Clears all favorites from local storage.
 */
function clearAllFavorites() {
    localStorage.removeItem('movieFavorites');
    renderFavorites();
    showMessage('All local favorites data has been deleted.', 'red');

    // Find all favorite buttons in results and reset their state
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.textContent = 'Add to Favorites';
        button.classList.replace('bg-red-500', 'bg-gray-200');
        button.classList.replace('hover:bg-red-600', 'hover:bg-gray-300');
        button.classList.replace('text-white', 'text-gray-800');
    });
}

// --- Event Listeners and Initial Load ---

// 1. Search Functionality
searchButton.addEventListener('click', () => fetchMovies(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchMovies(searchInput.value);
    }
});

// 2. Favorite Toggling (Delegation for dynamic buttons)
movieResultsDiv.addEventListener('click', (e) => {
    const button = e.target.closest('.favorite-button');
    if (button) {
        const id = parseInt(button.dataset.movieId);
        const title = button.dataset.movieTitle;
        const year = button.dataset.movieYear;
        const poster = button.dataset.moviePoster;
        toggleFavorite(id, title, year, poster, button);
    }
});

// 3. User Control: Export and Clear
exportDataButton.addEventListener('click', exportFavorites);

clearDataButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // Show modal for confirmation
});

confirmDeleteButton.addEventListener('click', () => {
    clearAllFavorites();
    modal.classList.add('hidden'); // Hide modal
});

cancelDeleteButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // Hide modal
});

// Initial load of favorites list
window.onload = renderFavorites;