
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmEwYWIxNTMyYzlkYjFkNDBlZTBhZDBmOTI2YmFiNiIsIm5iZiI6MTc2MjEwOTg5Ni43NTAwMDAyLCJzdWIiOiI2OTA3YTljOGY5MWUyZTk3MmZlMTJkNjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.vu9PzHiTuoPJY22R_ZLdEWzIr1OIJ6-pn5LQyltdwEY'
  }
};

fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));

const url = 'https://api.themoviedb.org/3/movie/popular'; 


const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiBearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmEwYWIxNTMyYzlkYjFkNDBlZTBhZDBmOTI2YmFiNiIsIm5iZiI6MTc2MjEwOTg5Ni43NTAwMDAyLCJzdWIiOiI2OTA3YTljOGY5MWUyZTk3MmZlMTJkNjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.vu9PzHiTuoPJY22R_ZLdEWzIr1OIJ6-pn5LQyltdwEY'
const imageBaseUrl = 'https://image.tmdb.org/t/p/w200';
const movieGrid = document.querySelector('.movie-grid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');


/**
 * @param {string} endpoint 
 * @param {string} query 
 */
async function fetchMovies(endpoint, query = '') {
   
    let url = `https://api.themoviedb.org/3/${endpoint}`;
    
    if (endpoint === 'search/movie' && query) {
        url += `?query=${encodeURIComponent(query)}`;
    }

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TMDB_TOKEN}`,
            'accept': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        displayMovies(data.results, endpoint);
    } catch (error) {
        console.error('Fetch error:', error);
        movieGrid.innerHTML = 
            `<p style="color: red; grid-column: 1 / -1; text-align: center;">
            Error loading movies: ${error.message}. Please check your token and network connection.
            </p>`;
    }
}


/**
 * @param {Array} movies 
 * @param {string} endpoint
 */
function displayMovies(movies, endpoint) {
    movieGrid.innerHTML = ''; 

    if (movies.length === 0) {
        movieGrid.innerHTML = `
            <h2>
                No Videos Found!
            </h2>
            <p style="grid-column: 1 / -1; text-align: center;">
                Sorry, we don't have that title in stock. Try another search!
            </p>
        `;
        return;
    }
    
    const headerText = endpoint === 'search/movie' 
        ? `Search Results for "${searchInput.value}"` 
        : 'New Releases Now Available!';
    
    movieGrid.innerHTML = `<h2>${headerText}</h2>`;

    movies.forEach(movie => {
        const posterUrl = movie.poster_path 
            ? `${imageBaseUrl}${movie.poster_path}` 
            : 'https://via.placeholder.com/200x300?text=No+Poster';
            
        const movieCardHTML = `
            <div class="movie-card" title="${movie.overview}">
                <img src="${posterUrl}" alt="${movie.title} Poster" style="width: 100%; height: auto; border-radius: 4px;">
                <p style="margin-top: 5px; font-size: 0.9em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${movie.title}</p>
            </div>
        `;
        movieGrid.innerHTML += movieCardHTML;
    });
}


/**
 */
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        fetchMovies('search/movie', query);
    } else {
        fetchMovies('movie/popular');
    }
}


searchButton.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

fetchMovies('movie/popular');
