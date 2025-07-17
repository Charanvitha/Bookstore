// Main application initialization and global utilities
class BookTreasuresApp {
    constructor() {
        this.books = [];
        this.filteredBooks = [];
        this.currentPage = 1;
        this.booksPerPage = 6;
        this.init();
    }

    async init() {
        try {
            await this.loadBooks();
            this.initializeEventListeners();
            this.renderBooks();
            this.updateCartCount();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load books. Please try again later.');
        }
    }

    async loadBooks() {
        // Replace with your book data source
        this.books = [
            {
                id: "1",
                title: "It Ends With Us",
                author: "Colleen Hoover",
                category: "fiction",
                price: "350",
                originalPrice: "499",
                discount: 30,
                rating: 4.5,
                reviewCount: 2847,
                image: "https://images-na.ssl-images-amazon.com/images/P/1501110365.01.L.jpg",
                description: "A powerful story about love, resilience, and courage.",
                inStock: true
            },
            // Add more books here...
        ];
        this.filteredBooks = [...this.books];
    }

    initializeEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
            });
        }

        // Category filter listeners
        const categoryLinks = document.querySelectorAll('[data-category]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterByCategory(category);
                
                // Update active state
                categoryLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBooks(e.target.value);
            });
        }

        // Price range filter
        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        
        if (priceRange && priceValue) {
            priceRange.addEventListener('input', (e) => {
                const value = e.target.value;
                priceValue.textContent = `₹${value}`;
                this.filterByPrice(parseInt(value));
            });
        }
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.filteredBooks = [...this.books];
        } else {
            this.filteredBooks = this.books.filter(book => 
                book.category && book.category.toLowerCase() === category.toLowerCase()
            );
        }
        this.renderBooks();
    }

    filterByPrice(maxPrice) {
        this.filteredBooks = this.books.filter(book => {
            const price = this.extractPrice(book.price);
            return price <= maxPrice;
        });
        this.renderBooks();
    }

    sortBooks(sortBy) {
        switch(sortBy) {
            case 'price-low':
                this.filteredBooks.sort((a, b) => this.extractPrice(a.price) - this.extractPrice(b.price));
                break;
            case 'price-high':
                this.filteredBooks.sort((a, b) => this.extractPrice(b.price) - this.extractPrice(a.price));
                break;
            case 'rating':
                this.filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
                this.filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        this.renderBooks();
    }

    extractPrice(priceString) {
        return parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
    }

    renderBooks() {
        const container = document.getElementById('bookContainer') || document.querySelector('.book-collection');
        if (!container) return;

        container.innerHTML = '';
        
        this.filteredBooks.forEach(book => {
            const bookElement = this.createBookElement(book);
            container.appendChild(bookElement);
        });
    }

    createBookElement(book) {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-item';
        bookDiv.dataset.bookId = book.id;

        const discount = book.discount || 0;
        const originalPrice = book.originalPrice || book.price;
        
        bookDiv.innerHTML = `
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}" loading="lazy">
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    ${this.generateStars(book.rating)}
                    <span class="rating-count">(${book.reviewCount || 0})</span>
                </div>
                <div class="book-price">
                    <span class="current-price">₹${book.price}</span>
                    ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                </div>
                <button class="add-to-cart" data-book-id="${book.id}">
                    Add to Cart
                </button>
            </div>
        `;

        return bookDiv;
    }

    generateStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star"></i>');
        }
        
        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt"></i>');
        }
        
        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push('<i class="far fa-star"></i>');
        }
        
        return stars.join('');
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount && window.cartManager) {
            cartCount.textContent = window.cartManager.cart.length;
        }
    }

    showError(message) {
        showNotification(message, 'error');
    }
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BookTreasuresApp();
});
// Search functionality
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchResults = [];
        this.init();
    }

    init() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => {
                this.performSearch(e.target.value);
            }, 300));
        }

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch(this.searchInput.value);
            });
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(this.searchInput.value);
                }
            });
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            if (window.app) {
                window.app.filteredBooks = [...window.app.books];
                window.app.renderBooks();
            }
            return;
        }

        if (window.app) {
            const results = window.app.books.filter(book => 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book.category.toLowerCase().includes(query.toLowerCase())
            );
            
            window.app.filteredBooks = results;
            window.app.renderBooks();
            this.updateSearchStats(query, results.length);
        }
    }

    updateSearchStats(query, resultCount) {
        let statsDiv = document.getElementById('searchStats');
        if (!statsDiv) {
            statsDiv = document.createElement('div');
            statsDiv.id = 'searchStats';
            statsDiv.style.cssText = `
                text-align: center;
                margin: 20px 0;
                color: #666;
                font-style: italic;
            `;
            
            const container = document.getElementById('bookContainer') || document.querySelector('.book-collection');
            if (container && container.parentNode) {
                container.parentNode.insertBefore(statsDiv, container);
            }
        }
        
        statsDiv.innerHTML = `Found ${resultCount} book${resultCount !== 1 ? 's' : ''} for "${query}"`;
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        if (window.app) {
            window.app.filteredBooks = [...window.app.books];
            window.app.renderBooks();
        }
        
        const statsDiv = document.getElementById('searchStats');
        if (statsDiv) {
            statsDiv.remove();
        }
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});
// Shopping cart functionality
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.cartModal = document.getElementById('cartModal');
        this.cartBtn = document.getElementById('cartBtn');
        this.cartCount = document.getElementById('cartCount');
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // Cart button click
        if (this.cartBtn) {
            this.cartBtn.addEventListener('click', () => {
                this.showCart();
            });
        }

        // Add to cart buttons (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const bookId = e.target.closest('.add-to-cart').dataset.bookId;
                this.addToCart(bookId);
            }
        });

        // Checkout button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'checkoutBtn') {
                this.proceedToCheckout();
            }
        });
    }

    addToCart(bookId) {
        const book = window.app?.books.find(b => b.id === bookId);
        if (!book) {
            showNotification('Book not found', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === bookId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: bookId,
                title: book.title,
                author: book.author,
                price: this.extractPrice(book.price),
                image: book.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        showNotification(`${book.title} added to cart!`, 'success');
    }

    removeFromCart(bookId) {
        this.cart = this.cart.filter(item => item.id !== bookId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    updateQuantity(bookId, quantity) {
        const item = this.cart.find(item => item.id === bookId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartCount();
            this.renderCart();
        }
    }

    showCart() {
        if (!this.cartModal) {
            this.createCartModal();
        }
        this.renderCart();
        this.cartModal.style.display = 'block';
    }

    createCartModal() {
        this.cartModal = document.createElement('div');
        this.cartModal.id = 'cartModal';
        this.cartModal.className = 'modal';
        this.cartModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Shopping Cart</h2>
                <div id="cartItems"></div>
                <div class="cart-total">
                    <h3>Total: ₹<span id="cartTotal">0</span></h3>
                </div>
                <button id="checkoutBtn" class="checkout-btn">Proceed to Checkout</button>
            </div>
        `;
        
        document.body.appendChild(this.cartModal);
        
        // Close modal functionality
        this.cartModal.querySelector('.close').addEventListener('click', () => {
            this.cartModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.cartModal.style.display = 'none';
            }
        });
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            cartTotal.textContent = '0';
            return;
        }

        let total = 0;
        cartItems.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <p>by ${item.author}</p>
                        <div class="quantity-controls">
                            <button onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="item-price">
                        <span>₹${itemTotal}</span>
                        <button onclick="window.cartManager.removeFromCart('${item.id}')" class="remove-btn">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        cartTotal.textContent = total.toLocaleString('en-IN');
    }

    updateCartCount() {
        if (this.cartCount) {
            this.cartCount.textContent = this.cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        showNotification('Proceeding to checkout...', 'success');
        // Add your checkout logic here
    }

    extractPrice(priceString) {
        return parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
// Newsletter subscription functionality
class NewsletterManager {
    constructor() {
        this.form = document.getElementById('newsletterForm');
        this.emailInput = document.getElementById('emailInput');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.subscribe();
            });
        }
    }

    subscribe() {
        const email = this.emailInput?.value.trim();
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Save to localStorage (replace with your backend logic)
        let subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        
        if (subscribers.includes(email)) {
            showNotification('You are already subscribed to our newsletter', 'error');
            return;
        }

        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));

        showNotification('Successfully subscribed to our newsletter!', 'success');
        this.emailInput.value = '';
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize newsletter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsletterManager = new NewsletterManager();
});
// Navigation functionality
class NavigationManager {
    constructor() {
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.mainNav = document.querySelector('.main-nav');
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateActiveLink();
    }

    bindEvents() {
        if (this.mobileMenuToggle && this.mainNav) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.mainNav?.classList.toggle('active');
    }

    closeMobileMenu() {
        this.mainNav?.classList.remove('active');
    }

    updateActiveLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});