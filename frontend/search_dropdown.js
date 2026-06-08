// ===========================================
//  🔍 LIVE SEARCH DROPDOWN SYSTEM
//  Shared across all pages
// ===========================================
const API_BASE = 'https://web-production-2a731.up.railway.app/api';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let suggestionsBox = document.getElementById('search-suggestions');
    if (!suggestionsBox) {
        // Dynamically create suggestions box if not found in HTML
        suggestionsBox = document.createElement('div');
        suggestionsBox.id = 'search-suggestions';
        suggestionsBox.className = 'search-suggestions-dropdown';
        
        // Wrap input in a container if it's not already wrapped
        const searchContainer = searchInput.closest('.nav-search-bar');
        if (searchContainer) {
            // We need to append the suggestions outside the hidden overflow, so we wrap nav-search-bar
            const wrapper = document.createElement('div');
            wrapper.className = 'nav-search-container';
            wrapper.style.cssText = 'position: relative; width: 40%; max-width: 500px; display: flex; align-items: center;';
            
            searchContainer.parentNode.insertBefore(wrapper, searchContainer);
            wrapper.appendChild(searchContainer);
            searchContainer.style.width = '100%';
            
            wrapper.appendChild(suggestionsBox);
        }
    }

    let debounceTimer;
    
    // We get API_BASE from global scope, fallback if not found
    const API_URL = window.API_BASE || 'https://web-production-2a731.up.railway.app';

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);
        
        if (query.length < 1) {
            suggestionsBox.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                // Fetch filtered products directly from the updated backend API
                const res = await fetch(`${API_URL}/api/products/?search=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('API Error');
                
                const data = await res.json();
                let products = data.results || data; // Handle paginated or non-paginated arrays

                if (!Array.isArray(products) || products.length === 0) {
                    const noResultsText = (typeof currentLang !== 'undefined' && currentLang === 'ar') 
                        ? (currentLang === 'ar' ? 'لا توجد منتجات مطابقة' : 'No matching products') 
                        : 'No matching products found';
                        
                    suggestionsBox.innerHTML = `<div style="padding: 15px; text-align: center; color: #888; font-weight: 500;">${noResultsText}</div>`;
                    suggestionsBox.style.display = 'flex';
                    return;
                }

                // Render top 5 suggestions
                suggestionsBox.innerHTML = products.slice(0, 5).map(p => {
                    // Extract full image URL if relative
                    let imgUrl = p.image;
                    if (imgUrl && !imgUrl.startsWith('http')) {
                        imgUrl = API_URL + imgUrl;
                    }
                    if (!imgUrl) imgUrl = 'https://via.placeholder.com/40';

                    return `
                        <a href="product.html?id=${p.id}" class="suggestion-item">
                            <img src="${imgUrl}" alt="${p.name}">
                            <div class="suggestion-item-info">
                                <span class="suggestion-item-title">${p.name}</span>
                                <span class="suggestion-item-price">${p.price} ${translations[currentLang].currency}</span>
                            </div>
                        </a>
                    `;
                }).join('');
                
                suggestionsBox.style.display = 'flex';
            } catch (err) {
                console.error("Search API Error:", err);
            }
        }, 300); // 300ms debounce
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-search-container')) {
            suggestionsBox.style.display = 'none';
        }
    });
    
    // Also, when user clicks on input again, show suggestions if there's text
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0 && suggestionsBox.innerHTML !== '') {
            suggestionsBox.style.display = 'flex';
        }
    });
});
