// ===== NASA API CONFIGURATION =====
const NASA_API_KEY = 'CPXED0boWaneuve1agNkgDOa5CRUpaSdQLDjz4eq';
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// ===== DOM ELEMENTS =====
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');
const placeholder = document.getElementById('placeholder');
const loadingState = document.getElementById('loadingState');
const imageCount = document.getElementById('imageCount');
const spaceFact = document.getElementById('spaceFact');

// Modal elements
const modalOverlay = document.getElementById('modalOverlay');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalCopyright = document.getElementById('modalCopyright');
const copyrightSection = document.getElementById('copyrightSection');
const modalClose = document.getElementById('modalClose');

// ===== RANDOM SPACE FACTS =====
const spaceFacts = [
    "Did you know? A day on Venus is longer than its year! Venus rotates so slowly that one day lasts 243 Earth days, while it only takes 225 Earth days to orbit the Sun.",
    "Did you know? Neutron stars are so dense that a teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
    "Did you know? The largest known star, UY Scuti, is so big that if it replaced our Sun, its surface would extend beyond the orbit of Jupiter.",
    "Did you know? There are more possible games of chess than there are atoms in the observable universe (10^120 vs 10^80).",
    "Did you know? Saturn's moon Titan has lakes and rivers of liquid methane and ethane, making it the only other body in our solar system with stable liquid on its surface.",
    "Did you know? The Milky Way galaxy is on a collision course with the Andromeda galaxy, but don't worry - they won't collide for another 4.5 billion years.",
    "Did you know? A single bolt of lightning is five times hotter than the surface of the Sun, reaching temperatures of about 30,000 Kelvin.",
    "Did you know? Jupiter's Great Red Spot is a storm that has been raging for over 400 years and is larger than Earth.",
    "Did you know? If you could drive a car to the Moon at highway speeds (60 mph), it would take you about 6 months of non-stop driving.",
    "Did you know? The footprints left by Apollo astronauts on the Moon will likely remain there for millions of years due to the lack of atmosphere and weather.",
    "Did you know? One million Earths could fit inside the Sun, but the Sun is considered a medium-sized star in cosmic terms.",
    "Did you know? Black holes don't actually 'suck' things in - objects fall into them the same way you'd fall into a pit, following curved spacetime.",
    "Did you know? The coldest place in the universe that we know of is the Boomerang Nebula, where temperatures drop to -458°F (-272°C).",
    "Did you know? Mars has the largest volcano in the solar system - Olympus Mons is about 13.6 miles high, nearly three times taller than Mount Everest.",
    "Did you know? There's a planet called HD 189733b where it rains molten glass sideways at 4,350 mph due to extreme winds."
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Setup date inputs using the existing dateRange.js functionality
    setupDateInputs(startInput, endInput);
    
    // Display random space fact
    displayRandomSpaceFact();
    
    // Set footer date
    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
    
    // Add event listeners
    fetchButton.addEventListener('click', handleFetchImages);
    document.getElementById('randomButton').addEventListener('click', setRandomDateRange);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', handleModalBackdropClick);
    
    // Keyboard accessibility
    document.addEventListener('keydown', handleKeydown);
    
    // Add staggered animation delay to existing elements
    addStaggeredAnimations();
});

// ===== SPACE FACT FUNCTIONALITY =====
function displayRandomSpaceFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    const fact = spaceFacts[randomIndex];
    
    // Animate the fact display
    spaceFact.style.opacity = '0';
    setTimeout(() => {
        spaceFact.textContent = fact;
        spaceFact.style.opacity = '1';
    }, 300);
}

// ===== MAIN FETCH FUNCTIONALITY =====
async function handleFetchImages() {
    const startDate = startInput.value;
    const endDate = endInput.value;
    
    if (!startDate || !endDate) {
        showError('Please select both start and end dates');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showError('Start date must be before end date');
        return;
    }
    
    showLoading();
    
    try {
        const images = await fetchNASAImages(startDate, endDate);
        displayGallery(images);
        updateImageCount(images.length);
    } catch (error) {
        console.error('Error fetching NASA images:', error);
        showError('Failed to fetch space images. Please try again.');
    } finally {
        hideLoading();
    }
}

// ===== NASA API FUNCTIONS =====
async function fetchNASAImages(startDate, endDate) {
    const url = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure we always return an array
    return Array.isArray(data) ? data : [data];
}

// ===== GALLERY DISPLAY FUNCTIONS =====
function displayGallery(images) {
    // Clear existing content
    gallery.innerHTML = '';
    
    // Hide placeholder
    placeholder.style.display = 'none';
    
    // Create gallery items with staggered animation
    images.forEach((image, index) => {
        const galleryItem = createGalleryItem(image, index);
        gallery.appendChild(galleryItem);
    });
}

function createGalleryItem(imageData, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${index * 0.1}s`;
    item.setAttribute('role', 'gridcell');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Open ${imageData.title} in modal`);
    
    // Check if it's a video or image
    const isVideo = imageData.media_type === 'video';
    
    if (isVideo) {
        item.innerHTML = createVideoGalleryItem(imageData);
    } else {
        item.innerHTML = createImageGalleryItem(imageData);
    }
    
    // Add click and keyboard event listeners
    item.addEventListener('click', () => openModal(imageData));
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(imageData);
        }
    });
    
    // Add hover zoom effect
    addHoverZoomEffect(item);
    
    return item;
}

function createImageGalleryItem(imageData) {
    return `
        <img src="${imageData.url}" alt="${imageData.title}" loading="lazy">
        <div class="gallery-item-content">
            <h3>${imageData.title}</h3>
            <div class="gallery-item-date">${formatDate(imageData.date)}</div>
        </div>
    `;
}

function createVideoGalleryItem(imageData) {
    // Extract video thumbnail if available, otherwise use a placeholder
    const thumbnailUrl = getVideoThumbnail(imageData.url);
    const videoId = extractYouTubeVideoId(imageData.url);
    
    // Create fallback chain for different thumbnail qualities
    const fallbackChain = videoId ? [
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/default.jpg`
    ] : [];
    
    const fallbackThumbnail = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMEIxNDI2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyNSIgcj0iMzAiIGZpbGw9IiM2MEE1RkEiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeD0iMTgwIiB5PSIxMDUiPgo8cGF0aCBkPSJNMTUgMTBMMjUgMjBMMTUgMzBWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
    
    return `
        <div class="video-container">
            <img src="${thumbnailUrl}" 
                 alt="${imageData.title}" 
                 loading="lazy"
                 data-fallbacks='${JSON.stringify(fallbackChain)}'
                 onerror="handleThumbnailError(this)">
            <div class="video-overlay">
                <div class="play-button">▶</div>
                <span class="video-label">VIDEO</span>
            </div>
        </div>
        <div class="gallery-item-content">
            <h3>${imageData.title}</h3>
            <div class="gallery-item-date">${formatDate(imageData.date)}</div>
        </div>
    `;
}

function getVideoThumbnail(videoUrl) {
    // Extract YouTube video ID and get thumbnail
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = extractYouTubeVideoId(videoUrl);
        if (videoId) {
            // Try maxresdefault first for best quality, will fallback via onerror
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
    }
    
    // Fallback to a space-themed placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMEIxNDI2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyNSIgcj0iMzAiIGZpbGw9IiM2MEE1RkEiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeD0iMTgwIiB5PSIxMDUiPgo8cGF0aCBkPSJNMTUgMTBMMjUgMjBMMTUgMzBWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
}

function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// ===== MODAL FUNCTIONS =====
function openModal(imageData) {
    modalTitle.textContent = imageData.title;
    modalDate.textContent = formatDate(imageData.date);
    modalExplanation.textContent = imageData.explanation;
    
    // Handle copyright information
    if (imageData.copyright) {
        modalCopyright.textContent = imageData.copyright;
        copyrightSection.style.display = 'block';
    } else {
        copyrightSection.style.display = 'none';
    }
    
    if (imageData.media_type === 'video') {
        // Handle video content
        modalImage.style.display = 'none';
        const videoContainer = createModalVideoContent(imageData);
        modalImage.parentNode.insertBefore(videoContainer, modalImage);
    } else {
        // Handle image content
        modalImage.src = imageData.hdurl || imageData.url;
        modalImage.alt = imageData.title;
        modalImage.style.display = 'block';
    }
    
    // Show modal with animation
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    
    // Focus management for accessibility
    modalClose.focus();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function createModalVideoContent(imageData) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'modal-video-container';
    
    const embedContainer = document.createElement('div');
    embedContainer.className = 'video-embed-container';
    
    const iframe = document.createElement('iframe');
    iframe.src = getEmbedUrl(imageData.url);
    iframe.title = imageData.title;
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'video-fallback';
    fallbackDiv.style.display = 'none'; // Hide by default
    fallbackDiv.innerHTML = `<p>Unable to embed video. <a href="${imageData.url}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>`;
    
    // Show fallback only if iframe fails to load
    iframe.addEventListener('error', () => {
        embedContainer.style.display = 'none';
        fallbackDiv.style.display = 'block';
    });
    
    // Also handle load timeout
    const timeoutId = setTimeout(() => {
        if (!iframe.contentDocument && !iframe.contentWindow) {
            embedContainer.style.display = 'none';
            fallbackDiv.style.display = 'block';
        }
    }, 5000);
    
    iframe.addEventListener('load', () => {
        clearTimeout(timeoutId);
    });
    
    embedContainer.appendChild(iframe);
    videoContainer.appendChild(embedContainer);
    videoContainer.appendChild(fallbackDiv);
    
    return videoContainer;
}

function getEmbedUrl(videoUrl) {
    const videoId = extractYouTubeVideoId(videoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    
    // Clean up video content if present
    const existingVideoContainer = document.querySelector('.modal-video-container');
    if (existingVideoContainer) {
        existingVideoContainer.remove();
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to the gallery item that opened the modal
    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList.contains('gallery-item')) {
        activeElement.focus();
    }
}

function handleModalBackdropClick(event) {
    if (event.target === modalOverlay) {
        closeModal();
    }
}

// ===== LOADING AND ERROR STATES =====
function showLoading() {
    loadingState.classList.add('active');
    loadingState.setAttribute('aria-hidden', 'false');
    fetchButton.disabled = true;
    fetchButton.textContent = 'Scanning...';
}

function hideLoading() {
    loadingState.classList.remove('active');
    loadingState.setAttribute('aria-hidden', 'true');
    fetchButton.disabled = false;
    fetchButton.innerHTML = '<span class="button-text">Explore Archives</span><span class="button-icon">🔭</span>';
}

function showError(message) {
    // Create or update error message
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'assertive');
        gallery.parentNode.insertBefore(errorElement, gallery);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }, 5000);
}

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateImageCount(count) {
    imageCount.textContent = count;
    
    // Animate the counter
    imageCount.style.transform = 'scale(1.2)';
    setTimeout(() => {
        imageCount.style.transform = 'scale(1)';
    }, 200);
}

function addHoverZoomEffect(element) {
    const img = element.querySelector('img');
    if (!img) return;
    
    element.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            img.style.transform = 'scale(1.05)';
        }
    });
    
    element.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
    });
}

function addStaggeredAnimations() {
    const animatedElements = document.querySelectorAll('.control-panel, .space-fact, .gallery-section');
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
        element.classList.add('fade-in');
    });
}

// ===== KEYBOARD ACCESSIBILITY =====
function handleKeydown(event) {
    // Close modal with Escape key
    if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
    
    // Handle Enter key on fetch button
    if (event.key === 'Enter' && event.target === fetchButton) {
        handleFetchImages();
    }
}

// ===== CSS ADDITIONS FOR VIDEO AND ERROR HANDLING =====
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Video Gallery Item Styles */
        .video-container {
            position: relative;
            overflow: hidden;
        }
        
        .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
            opacity: 0;
            transition: var(--transition);
        }
        
        .gallery-item:hover .video-overlay {
            opacity: 1;
        }
        
        .play-button {
            width: 60px;
            height: 60px;
            background: var(--accent-blue);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            box-shadow: var(--shadow-glow);
        }
        
        .video-label {
            background: var(--accent-cyan);
            color: var(--text-primary);
            padding: 0.25rem 0.75rem;
            border-radius: var(--border-radius);
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.05em;
        }
        
        /* Modal Video Styles */
        .modal-video-container {
            margin-bottom: 2rem;
        }
        
        .video-embed-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            border-radius: var(--border-radius);
        }
        
        .video-embed-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .video-fallback {
            margin-top: 1rem;
            padding: 1rem;
            background: var(--surface-bg);
            border-radius: var(--border-radius);
            text-align: center;
        }
        
        .video-fallback a {
            color: var(--accent-blue);
            text-decoration: none;
        }
        
        .video-fallback a:hover {
            text-decoration: underline;
        }
        
        /* Error Message Styles */
        .error-message {
            background: var(--error-color);
            color: white;
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            text-align: center;
            font-weight: 500;
            display: none;
        }
        
        /* Fade-in Animation */
        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== THUMBNAIL ERROR HANDLING =====
function handleThumbnailError(img) {
    const fallbacks = JSON.parse(img.getAttribute('data-fallbacks') || '[]');
    const currentSrc = img.src;
    
    // Find next fallback in the chain
    const currentIndex = fallbacks.indexOf(currentSrc);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbacks.length) {
        // Try next fallback
        img.src = fallbacks[nextIndex];
    } else {
        // Use final fallback placeholder
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMEIxNDI2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEyNSIgcj0iMzAiIGZpbGw9IiM2MEE1RkEiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeD0iMTgwIiB5PSIxMDUiPgo8cGF0aCBkPSJNMTUgMTBMMjUgMjBMMTUgMzBWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
        img.removeAttribute('onerror'); // Prevent infinite loop
    }
}

// Make function globally available
window.handleThumbnailError = handleThumbnailError;

// Add dynamic styles when DOM is loaded
document.addEventListener('DOMContentLoaded', addDynamicStyles);

// Random date range function for fun exploration
async function setRandomDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const randomButton = document.getElementById('randomButton');
    
    // Disable button during operation
    randomButton.disabled = true;
    const originalText = randomButton.querySelector('.button-text').textContent;
    randomButton.querySelector('.button-text').textContent = '🎲';
    
    // NASA APOD date range
    const minDate = new Date('1995-06-16');
    const maxDate = new Date();
    
    // Generate random start date
    const randomStart = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
    
    // Generate random end date (1-30 days after start date, but not beyond today)
    const maxEndDate = new Date(Math.min(
        randomStart.getTime() + (30 * 24 * 60 * 60 * 1000), // 30 days after start
        maxDate.getTime() // Today
    ));
    const minEndDate = new Date(randomStart.getTime() + (24 * 60 * 60 * 1000)); // At least 1 day after start
    
    const randomEnd = new Date(minEndDate.getTime() + Math.random() * (maxEndDate.getTime() - minEndDate.getTime()));
    
    // Format dates for input fields
    startDateInput.value = randomStart.toISOString().split('T')[0];
    endDateInput.value = randomEnd.toISOString().split('T')[0];
    
    // Show a fun fact about random exploration
    const spaceFact = document.getElementById('spaceFact');
    const randomFacts = [
        "🎲 Random exploration often leads to the most amazing cosmic discoveries!",
        "🌟 Serendipity is the astronomer's best friend - you never know what wonders await!",
        "🚀 Some of the greatest space discoveries were made by accident during random observations!",
        "🔭 Random date ranges can reveal hidden gems in NASA's vast archive!",
        "✨ The universe loves surprises - let's see what cosmic magic awaits!"
    ];
    spaceFact.textContent = randomFacts[Math.floor(Math.random() * randomFacts.length)];
    
    // Automatically fetch the data
    try {
        showLoading();
        const images = await fetchNASAImages(
            startDateInput.value, 
            endDateInput.value
        );
        displayGallery(images);
        updateImageCount(images.length);
    } catch (error) {
        console.error('Error fetching random NASA images:', error);
        showError('Failed to fetch random space images. Please try again.');
    } finally {
        hideLoading();
        // Restore button
        randomButton.querySelector('.button-text').textContent = originalText;
        randomButton.disabled = false;
    }
}
