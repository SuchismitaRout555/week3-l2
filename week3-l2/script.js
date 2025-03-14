// // import { createClient } from 'pexels';

// // const client = createClient('HLatilWP5EgXJkkS95SyN2oDZiGTuuqtctT5tNZ04FU7h1EbseEMmAyd');





const API_KEY = 'HLatilWP5EgXJkkS95SyN2oDZiGTuuqtctT5tNZ04FU7h1EbseEMmAyd';
const API_URL = 'https://api.pexels.com/v1/search';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const mainPhotoSection = document.getElementById('main-photo-section');
const similarPhotosGrid = document.getElementById('similar-photos-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const loadingIndicator = document.getElementById('loading-indicator');

// State
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentQuery = 'Laptop';

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    loadPhotos();

    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});

// Handle search
function handleSearch() {
    currentQuery = searchInput.value.trim();
    if (currentQuery) {
        loadPhotos();
    }
}

// Load photos from Pexels API
async function loadPhotos() {
    showLoading(true);

    try {
        // Fetch main photo
        const mainPhotoResponse = await fetchPhotos(currentQuery, 1, 1);
        if (mainPhotoResponse.photos && mainPhotoResponse.photos.length > 0) {
            renderMainPhoto(mainPhotoResponse.photos[0]);
        }

        // Fetch similar photos
        const similarPhotosResponse = await fetchPhotos(currentQuery, 4, 2);
        if (similarPhotosResponse.photos && similarPhotosResponse.photos.length > 0) {
            renderSimilarPhotos(similarPhotosResponse.photos);
        }

        // Render favorites
        renderFavorites();

    } catch (error) {
        console.error('Error loading photos:', error);
        alert('Failed to load photos. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Fetch photos from Pexels API
async function fetchPhotos(query, perPage, page = 1) {
    const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
}


// Render main photo
function renderMainPhoto(photo) {
    mainPhotoSection.innerHTML = `
        <div class="main-photo-container">
            <img src="${photo.src.large}" alt="${photo.alt}" class="main-photo">
        </div>
        <div class="main-photo-info">
            <h2>${photo.alt}</h2>
            <span class="photographer">Photographer: ${photo.photographer}</span>
            <a href="${photo.photographer_url}" target="_blank" class="explore-button">EXPLORE MORE</a>
        </div>
    `;
}

// Render similar photos
function renderSimilarPhotos(photos) {
    similarPhotosGrid.innerHTML = '';

    photos.forEach(photo => {
        const isFavorited = favorites.some(fav => fav.id === photo.id);

        similarPhotosGrid.innerHTML += `
            <div class="photo-card">
                <img src="${photo.src.medium}" alt="${photo.alt}">
                <div class="favorite-icon ${isFavorited ? 'active' : ''}" data-id="${photo.id}" 
                    onclick="toggleFavorite(${photo.id}, '${photo.src.medium}', '${photo.alt}', '${photo.photographer}')">
                    ${isFavorited ? '❤️' : '🤍'}
                </div>
                <div class="photo-info">
                    <div class="photo-title">${photo.alt}</div>
                    <div class="photographer-name">Photographer: ${photo.photographer}</div>
                </div>
            </div>
        `;
    });
}

// Render favorites
function renderFavorites() {
    favoritesGrid.innerHTML = '';

    favorites.forEach(photo => {
        favoritesGrid.innerHTML += `
            <div class="photo-card">
                <img src="${photo.src}" alt="${photo.alt}">
                <div class="favorite-icon active" data-id="${photo.id}" onclick="toggleFavorite(${photo.id})">
                    ❤️
                </div>
                <div class="photo-info">
                    <div class="photo-title">${photo.alt}</div>
                    <div class="photographer-name">Photographer: ${photo.photographer}</div>
                </div>
            </div>
        `;
    });
}


// Toggle favorite
function toggleFavorite(id, src, alt, photographer) {
    const existingIndex = favorites.findIndex(fav => fav.id === id);

    if (existingIndex >= 0) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
    } else {
        // Add to favorites with photographer name
        favorites.push({ id, src, alt, photographer });
    }

    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Re-render both sections
    const allFavoriteIcons = document.querySelectorAll(`.favorite-icon[data-id="${id}"]`);
    allFavoriteIcons.forEach(icon => {
        if (existingIndex >= 0) {
            icon.classList.remove('active');
            icon.innerHTML = '🤍';
        } else {
            icon.classList.add('active');
            icon.innerHTML = '❤️';
        }
    });

    renderFavorites();
}

// Get the sort dropdown element
const sortDropdown = document.querySelector('.sort-dropdown');

// Add event listener for sorting
sortDropdown.addEventListener('change', function () {
    const selectedOption = sortDropdown.value;

    if (selectedOption === 'Newest') {
        favorites.sort((a, b) => b.id - a.id); // Sort newest first
    } else if (selectedOption === 'Oldest') {
        favorites.sort((a, b) => a.id - b.id); // Sort oldest first
    }

    // Re-render the favorites section
    renderFavorites();
});

// Show/hide loading indicator
function showLoading(isLoading) {
    loadingIndicator.style.display = isLoading ? 'flex' : 'none';
}

// Make toggleFavorite accessible globally
window.toggleFavorite = toggleFavorite;

