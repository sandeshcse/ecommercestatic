// Global variables
const VALID_USERNAME = "demo"
const VALID_PASSWORD = "12345"
let currentUser = null
let products = []
let cart = []
let currentProductId = null

// Check if user is logged in
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS animation library
  AOS.init({
    duration: 800,
    once: true,
  })

  // Initialize the application
  initApp()

  // Check current page and run page-specific code
  const currentPage = window.location.pathname.split("/").pop()

  switch (currentPage) {
    case "index.html":
    case "":
      setupLoginPage()
      break
    case "products.html":
      setupProductsPage()
      break
    case "cart.html":
      setupCartPage()
      break
    case "checkout.html":
      setupCheckoutPage()
      break
    case "success.html":
      setupSuccessPage()
      break
    case "new-arrivals.html":
      setupNewArrivalsPage()
      break
  }

  // Setup back to top button
  setupBackToTop()
})

// Initialize the application
function initApp() {
  // Check if user is logged in
  currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // If not logged in and not on login page, redirect to login
  if (!currentUser && window.location.pathname.split("/").pop() !== "index.html") {
    window.location.href = "index.html"
    return
  }

  // If logged in and on login page, redirect to products
  if (currentUser && window.location.pathname.split("/").pop() === "index.html") {
    window.location.href = "products.html"
    return
  }

  // If logged in, update user display and setup logout
  if (currentUser) {
    setupUserDisplay()
    setupLogout()
  }

  // Load cart from localStorage
  loadCart()

  // Update cart count badge
  updateCartCount()
}

// Setup login page
function setupLoginPage() {
  const loginForm = document.getElementById("loginForm")
  const loginError = document.getElementById("loginError")

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const username = document.getElementById("username").value
      const password = document.getElementById("password").value

      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        // Store user in localStorage
        currentUser = { username: username }
        localStorage.setItem("currentUser", JSON.stringify(currentUser))

        // Redirect to products page
        window.location.href = "products.html"
      } else {
        // Show error message
        loginError.classList.remove("d-none")
      }
    })
  }
}

// Setup products page
function setupProductsPage() {
  // Load and display products
  loadProducts()

  // Setup search functionality
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")
  const mobileSearchInput = document.getElementById("mobileSearchInput")
  const mobileSearchBtn = document.getElementById("mobileSearchBtn")

  if (searchInput && searchBtn) {
    searchBtn.addEventListener("click", () => {
      filterProducts()
    })

    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        filterProducts()
      }
    })
  }

  if (mobileSearchInput && mobileSearchBtn) {
    mobileSearchBtn.addEventListener("click", () => {
      const searchTerm = mobileSearchInput.value
      if (searchInput) searchInput.value = searchTerm
      filterProducts()
    })

    mobileSearchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const searchTerm = mobileSearchInput.value
        if (searchInput) searchInput.value = searchTerm
        filterProducts()
      }
    })
  }

  // Setup category filter
  const categoryFilter = document.getElementById("categoryFilter")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      filterProducts()
    })
  }

  // Setup sort filter
  const sortFilter = document.getElementById("sortFilter")
  if (sortFilter) {
    sortFilter.addEventListener("change", () => {
      filterProducts()
    })
  }

  // Setup category links in dropdown
  const categoryLinks = document.querySelectorAll("[data-category]")
  categoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const category = link.getAttribute("data-category")
      if (categoryFilter) {
        categoryFilter.value = category
        filterProducts()
        // Scroll to products section
        document.getElementById("products").scrollIntoView({ behavior: "smooth" })
      }
    })
  })

  // Initialize hero carousel with enhanced options
  if (document.querySelector(".hero-carousel")) {
    new Swiper(".hero-carousel", {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      effect: "fade",
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      speed: 1000, // Transition speed in milliseconds
      grabCursor: true,
      keyboard: {
        enabled: true,
      },
      on: {
        init: function () {
          AOS.init(); // Initialize AOS animations
        },
      },
    })
  }

  // Initialize testimonials slider
  if (document.querySelector(".testimonials-slider")) {
    new Swiper(".testimonials-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
    })
  }

  // Setup quick view modal
  setupQuickViewModal()
}

// Setup cart page
function setupCartPage() {
  displayCart()

  // Check if cart is empty
  if (cart.length === 0) {
    document.getElementById("emptyCart").classList.remove("d-none")
    document.getElementById("cartContent").classList.add("d-none")
  } else {
    document.getElementById("emptyCart").classList.add("d-none")
    document.getElementById("cartContent").classList.remove("d-none")
  }

  // Setup clear cart button
  const clearCartBtn = document.getElementById("clearCartBtn")
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your cart?")) {
        cart = []
        saveCart()
        displayCart()

        // Show toast notification
        showToast("Cart cleared successfully!", "danger")

        // Check if cart is empty
        document.getElementById("emptyCart").classList.remove("d-none")
        document.getElementById("cartContent").classList.add("d-none")
      }
    })
  }

  // Load related products
  loadRelatedProducts()
}

// Setup checkout page
function setupCheckoutPage() {
  // Display order summary
  displayOrderSummary()

  // If cart is empty, redirect to cart page
  if (cart.length === 0) {
    window.location.href = "cart.html"
    return
  }

  // Setup checkout form submission
  const checkoutForm = document.getElementById("checkoutForm")
  const placeOrderBtn = document.getElementById("placeOrderBtn")

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Validate form
      if (checkoutForm.checkValidity()) {
        // Show loading modal
        const loadingModal = new bootstrap.Modal(document.getElementById("loadingModal"))
        loadingModal.show()

        // Simulate processing (2 seconds)
        setTimeout(() => {
          // Store order details in localStorage for success page
          const orderDetails = {
            orderNumber: "ORD-" + Math.floor(10000 + Math.random() * 90000),
            date: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
            total: calculateTotal(),
            email: document.getElementById("email").value,
            name: document.getElementById("firstName").value + " " + document.getElementById("lastName").value,
            address: document.getElementById("address").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").options[document.getElementById("state").selectedIndex].text,
            zip: document.getElementById("zip").value,
            items: cart.length,
          }

          localStorage.setItem("lastOrder", JSON.stringify(orderDetails))

          // Clear cart
          cart = []
          saveCart()

          // Redirect to success page
          window.location.href = "success.html"
        }, 2000)
      } else {
        // Trigger form validation
        checkoutForm.reportValidity()
      }
    })
  }

  // Setup quantity controls in quick view modal
  const decreaseQuantity = document.getElementById("decreaseQuantity")
  const increaseQuantity = document.getElementById("increaseQuantity")
  const quantityInput = document.getElementById("quickViewQuantity")

  if (decreaseQuantity && increaseQuantity && quantityInput) {
    decreaseQuantity.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      if (quantity > 1) {
        quantityInput.value = quantity - 1
      }
    })

    increaseQuantity.addEventListener("click", () => {
      const quantity = Number.parseInt(quantityInput.value)
      quantityInput.value = quantity + 1
    })
  }
}

// Setup success page
function setupSuccessPage() {
  // Get order details from localStorage
  const orderDetails = JSON.parse(localStorage.getItem("lastOrder"))

  if (orderDetails) {
    document.getElementById("orderNumber").textContent = orderDetails.orderNumber
    document.getElementById("orderDate").textContent = orderDetails.date
    document.getElementById("orderTotal").textContent = formatCurrency(orderDetails.total)
    document.getElementById("customerEmail").textContent = orderDetails.email
    document.getElementById("customerName").textContent = orderDetails.name
    document.getElementById("shippingAddress").textContent =
      `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} - ${orderDetails.zip}`
    document.getElementById("itemCount").textContent = orderDetails.items
  }

  // Setup print receipt button
  const printReceiptBtn = document.getElementById("printReceiptBtn")

  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => {
      window.print()
    })
  }
}

// Setup user display and logout
function setupUserDisplay() {
  const userDisplay = document.getElementById("userDisplay")

  if (userDisplay && currentUser) {
    userDisplay.textContent = currentUser.username
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn")

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Clear user from localStorage
      localStorage.removeItem("currentUser")

      // Redirect to login page
      window.location.href = "index.html"
    })
  }
}

// Product functions
function loadProducts() {
  // Sample product data
  products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      description:
        "High-quality sound with active noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
      price: 7999,
      image: "images/PremiumWirelessHeadphones.jpg",
      category: "electronics",
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: "Smart Fitness Tracker",
      description:
        "Track your steps, heart rate, sleep, and more with this waterproof fitness band. Compatible with all smartphones.",
      price: 2499,
      image: "images/SmartFitnessTracker.jpg",
      category: "electronics",
      rating: 4.5,
      reviews: 89,
    },
    {
      id: 3,
      name: "Men's Cotton Casual Shirt",
      description:
        "Comfortable 100% cotton shirt with a modern fit, perfect for everyday wear. Available in multiple colors.",
      price: 1299,
      image: "images/Menscottonshirt.jpg",
      category: "clothing",
      rating: 4.3,
      reviews: 56,
    },
    {
      id: 4,
      name: "Women's Running Shoes",
      description:
        "Lightweight and breathable running shoes with excellent cushioning. Designed for maximum comfort during long runs.",
      price: 3499,
      image: "images/WomenRunningShoes.jpg",
      category: "clothing",
      rating: 4.7,
      reviews: 112,
    },
    {
      id: 5,
      name: "Stainless Steel Water Bottle",
      description:
        "Double-walled insulated bottle that keeps drinks cold for 24 hours or hot for 12 hours. Eco-friendly and BPA-free.",
      price: 899,
      image: "images/StainlessStellWaterBottle.jpg",
      category: "home",
      rating: 4.6,
      reviews: 78,
    },
    {
      id: 6,
      name: "Ceramic Coffee Mug Set",
      description:
        "Set of 4 stylish ceramic mugs, microwave and dishwasher safe. Perfect for your morning coffee or evening tea.",
      price: 1499,
      image: "images/CeramicCoffeeMugSet.jpg",
      category: "home",
      rating: 4.4,
      reviews: 45,
    },
    {
      id: 7,
      name: "Bestselling Fiction Novel",
      description:
        "The latest bestselling fiction novel that everyone is talking about. A thrilling story that will keep you engaged till the end.",
      price: 499,
      image: "images/BestsellingFictionNovel.jpg",
      category: "books",
      rating: 4.9,
      reviews: 203,
    },
    {
      id: 8,
      name: "Cookbook: Indian Cuisine",
      description:
        "Explore authentic Indian recipes with this comprehensive cookbook. From starters to desserts, everything is covered.",
      price: 799,
      image: "images/Cookbook.jpg",
      category: "books",
      rating: 4.7,
      reviews: 67,
    },
    {
      id: 9,
      name: "Infinix Note 40X 5G",
      description:
        "Latest smartphone with a stunning 108MP camera, 5G connectivity, and all-day battery life. Comes with 128GB storage.",
      price: 29999,
      image: "images/Smartphone.jpg",
      category: "electronics",
      rating: 4.6,
      reviews: 156,
    },
    {
      id: 10,
      name: "Leather Wallet for Men",
      description:
        "Genuine leather wallet with multiple card slots and RFID protection. Slim design fits perfectly in your pocket.",
      price: 1299,
      image: "images/LeatherWalletforMen.jpg",
      category: "clothing",
      rating: 4.5,
      reviews: 92,
    },
    {
      id: 11,
      name: "Scented Candle Set",
      description: "Set of 3 scented candles with natural essential oils. Creates a relaxing atmosphere in your home.",
      price: 999,
      image: "images/ScentedCandleSet.jpg",
      category: "home",
      rating: 4.8,
      reviews: 34,
    },
    {
      id: 12,
      name: "Self-Help Book",
      description: "Bestselling self-help book that will transform your mindset and help you achieve your goals.",
      price: 599,
      image: "images/SelfHelpBook.jpg",
      category: "books",
      rating: 4.7,
      reviews: 128,
    },
  ]

  displayProducts(products)
}

function displayProducts(productsToDisplay) {
  const productList = document.getElementById("productList")

  if (productList) {
    productList.innerHTML = ""

    if (productsToDisplay.length === 0) {
      productList.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="no-results">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h4>No Products Found</h4>
            <p class="text-muted">We couldn't find any products matching your criteria.</p>
            <button class="btn btn-outline-primary mt-2" onclick="resetFilters()">Reset Filters</button>
          </div>
        </div>
      `
      return
    }

    productsToDisplay.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.className = "col-md-6 col-lg-4 col-xl-3"
      productCard.setAttribute("data-aos", "fade-up")
      productCard.innerHTML = `
        <div class="card product-card h-100 border-0 shadow-sm">
          <div class="product-badge bg-primary text-white">New</div>
          <div class="product-wishlist">
            <button class="btn btn-sm btn-outline-dark rounded-circle">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-img-container p-3">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
          </div>
          <div class="card-body d-flex flex-column p-4">
            <div class="product-rating mb-1">
              ${generateRatingStars(product.rating)}
              <span class="text-muted small ms-2">(${product.reviews})</span>
            </div>
            <h5 class="card-title product-title">${product.name}</h5>
            <p class="card-text text-muted small product-description">${product.description.substring(0, 60)}...</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="card-text fw-bold mb-0">${formatCurrency(product.price)}</p>
                <button class="btn btn-sm btn-outline-primary quick-view" data-id="${product.id}">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <button class="btn btn-primary w-100 add-to-cart" data-id="${product.id}">
                <i class="fas fa-cart-plus me-2"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      `

      productList.appendChild(productCard)
    })

    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        addToCart(productId)

        // Show toast notification
        showToast("Item added to cart!", "success")
      })
    })

    // Add event listeners to "Quick View" buttons
    const quickViewButtons = document.querySelectorAll(".quick-view")
    quickViewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        openQuickViewModal(productId)
      })
    })
  }
}

function filterProducts() {
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const sortFilter = document.getElementById("sortFilter")

  let filteredProducts = [...products]

  // Filter by search term
  if (searchInput && searchInput.value.trim() !== "") {
    const searchTerm = searchInput.value.trim().toLowerCase()
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm),
    )
  }

  // Filter by category
  if (categoryFilter && categoryFilter.value !== "all") {
    const category = categoryFilter.value
    filteredProducts = filteredProducts.filter((product) => product.category === category)
  }

  // Sort products
  if (sortFilter) {
    const sortValue = sortFilter.value

    switch (sortValue) {
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Default sorting (featured)
        break
    }
  }

  // Display filtered products
  displayProducts(filteredProducts)
}

function resetFilters() {
  const searchInput = document.getElementById("searchInput")
  const categoryFilter = document.getElementById("categoryFilter")
  const sortFilter = document.getElementById("sortFilter")

  if (searchInput) searchInput.value = ""
  if (categoryFilter) categoryFilter.value = "all"
  if (sortFilter) sortFilter.value = "default"

  displayProducts(products)
}

function generateRatingStars(rating) {
  let starsHtml = ""
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<i class="fas fa-star text-warning"></i>'
  }

  // Add half star if needed
  if (halfStar) {
    starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>'
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<i class="far fa-star text-warning"></i>'
  }

  return starsHtml
}

// Cart functions
function loadCart() {
  const savedCart = localStorage.getItem("cart")

  if (savedCart) {
    cart = JSON.parse(savedCart)
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartCount()
}

function updateCartCount() {
  const cartCountElements = document.querySelectorAll("#cartCount")

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)

  cartCountElements.forEach((element) => {
    element.textContent = itemCount
  })
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId)

  if (product) {
    // Check if product is already in cart
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    }

    saveCart()
  }
}

function displayCart() {
  const cartItems = document.getElementById("cartItems")
  const subtotalElement = document.getElementById("subtotal")
  const shippingElement = document.getElementById("shipping")
  const taxElement = document.getElementById("tax")
  const discountElement = document.getElementById("discount")
  const totalElement = document.getElementById("total")

  if (cartItems) {
    cartItems.innerHTML = ""

    cart.forEach((item) => {
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td class="ps-4">
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${item.name}" class="img-thumbnail me-3" style="width: 60px; height: 60px; object-fit: contain;">
            <div>
              <h6 class="mb-0">${item.name}</h6>
            </div>
          </div>
        </td>
        <td>${formatCurrency(item.price)}</td>
        <td>
          <div class="input-group cart-quantity">
            <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
            <input type="number" class="form-control text-center" value="${item.quantity}" min="1" readonly>
            <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
        <td class="text-end pe-4">
          <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `

      cartItems.appendChild(tr)
    })

    // Add event listeners
    const decreaseButtons = document.querySelectorAll(".decrease-quantity")
    const increaseButtons = document.querySelectorAll(".increase-quantity")
    const removeButtons = document.querySelectorAll(".remove-item")

    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = Number.parseInt(this.getAttribute("data-id"))
        updateCartItemQuantity(itemId, -1)
      })
    })

    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = Number.parseInt(this.getAttribute("data-id"))
        updateCartItemQuantity(itemId, 1)
      })
    })

    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const itemId = Number.parseInt(this.getAttribute("data-id"))
        removeCartItem(itemId)

        // Show toast notification
        showToast("Item removed from cart!", "danger")
      })
    })

    // Calculate values
    const subtotal = calculateSubtotal()
    const shipping = subtotal > 1000 ? 0 : 99
    const tax = subtotal * 0.18 // 18% GST
    const discount = subtotal > 5000 ? subtotal * 0.05 : 0 // 5% discount for orders above ₹5000
    const total = subtotal + shipping + tax - discount

    // Update totals
    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(subtotal)
    }

    if (shippingElement) {
      shippingElement.textContent = shipping === 0 ? "Free" : formatCurrency(shipping)
    }

    if (taxElement) {
      taxElement.textContent = formatCurrency(tax)
    }

    if (discountElement) {
      discountElement.textContent = `-${formatCurrency(discount)}`
    }

    if (totalElement) {
      totalElement.textContent = formatCurrency(total)
    }

    // Load related products for cart page
    if (window.location.pathname.includes("cart.html")) {
      loadRelatedProducts()
    }
  }
}

function updateCartItemQuantity(itemId, change) {
  const item = cart.find((item) => item.id === itemId)

  if (item) {
    item.quantity += change

    if (item.quantity < 1) {
      item.quantity = 1
    }

    saveCart()
    displayCart()
  }
}

function removeCartItem(itemId) {
  cart = cart.filter((item) => item.id !== itemId)
  saveCart()

  // Redisplay cart
  displayCart()

  // Check if cart is empty
  if (cart.length === 0) {
    document.getElementById("emptyCart").classList.remove("d-none")
    document.getElementById("cartContent").classList.add("d-none")
  }
}

function calculateSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}

function calculateTotal() {
  const subtotal = calculateSubtotal()
  const shipping = subtotal > 1000 ? 0 : 99
  const tax = subtotal * 0.18 // 18% GST
  const discount = subtotal > 5000 ? subtotal * 0.05 : 0 // 5% discount for orders above ₹5000
  return subtotal + shipping + tax - discount
}

// Display order summary on checkout page
function displayOrderSummary() {
  const orderItems = document.getElementById("orderItems")
  const subtotalElement = document.getElementById("subtotal")
  const shippingElement = document.getElementById("shipping")
  const taxElement = document.getElementById("tax")
  const discountElement = document.getElementById("discount")
  const totalElement = document.getElementById("total")

  if (orderItems) {
    orderItems.innerHTML = ""

    cart.forEach((item) => {
      const itemDiv = document.createElement("div")
      itemDiv.className = "d-flex justify-content-between align-items-center mb-3"
      itemDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="img-thumbnail me-3" style="width: 50px; height: 50px; object-fit: contain;">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">Qty: ${item.quantity}</small>
          </div>
        </div>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      `

      orderItems.appendChild(itemDiv)
    })

    // Calculate values
    const subtotal = calculateSubtotal()
    const shipping = subtotal > 1000 ? 0 : 99
    const tax = subtotal * 0.18 // 18% GST
    const discount = subtotal > 5000 ? subtotal * 0.05 : 0 // 5% discount for orders above ₹5000
    const total = subtotal + shipping + tax - discount

    // Update totals
    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(subtotal)
    }

    if (shippingElement) {
      shippingElement.textContent = shipping === 0 ? "Free" : formatCurrency(shipping)
    }

    if (taxElement) {
      taxElement.textContent = formatCurrency(tax)
    }

    if (discountElement) {
      discountElement.textContent = `-${formatCurrency(discount)}`
    }

    if (totalElement) {
      totalElement.textContent = formatCurrency(total)
    }
  }
}

// Setup quick view modal
function setupQuickViewModal() {
  const quickViewModal = document.getElementById("quickViewModal")

  if (quickViewModal) {
    // Setup quantity controls
    const decreaseQuantity = document.getElementById("decreaseQuantity")
    const increaseQuantity = document.getElementById("increaseQuantity")
    const quantityInput = document.getElementById("quickViewQuantity")

    if (decreaseQuantity && increaseQuantity && quantityInput) {
      decreaseQuantity.addEventListener("click", () => {
        const quantity = Number.parseInt(quantityInput.value)
        if (quantity > 1) {
          quantityInput.value = quantity - 1
        }
      })

      increaseQuantity.addEventListener("click", () => {
        const quantity = Number.parseInt(quantityInput.value)
        quantityInput.value = quantity + 1
      })
    }

    // Setup add to cart button
    const quickViewAddToCart = document.getElementById("quickViewAddToCart")
    if (quickViewAddToCart) {
      quickViewAddToCart.addEventListener("click", () => {
        if (currentProductId) {
          const quantity = Number.parseInt(quantityInput.value)
          addToCartWithQuantity(currentProductId, quantity)

          // Close modal
          const modal = bootstrap.Modal.getInstance(quickViewModal)
          modal.hide()

          // Show toast notification
          showToast("Item added to cart!", "success")
        }
      })
    }
  }
}

function openQuickViewModal(productId) {
  const product = products.find((p) => p.id === productId)

  if (product) {
    currentProductId = productId

    // Update modal content
    document.getElementById("quickViewTitle").textContent = product.name
    document.getElementById("quickViewName").textContent = product.name
    document.getElementById("quickViewDescription").textContent = product.description
    document.getElementById("quickViewPrice").textContent = formatCurrency(product.price)
    document.getElementById("quickViewImage").src = product.image
    document.getElementById("quickViewImage").alt = product.name
    document.getElementById("quickViewQuantity").value = 1

    // Show modal
    const quickViewModal = new bootstrap.Modal(document.getElementById("quickViewModal"))
    quickViewModal.show()
  }
}

function addToCartWithQuantity(productId, quantity) {
  const product = products.find((p) => p.id === productId)

  if (product) {
    // Check if product is already in cart
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      })
    }

    saveCart()
  }
}

// Load related products for cart page
function loadRelatedProducts() {
  const relatedProductsContainer = document.getElementById("relatedProducts")

  if (relatedProductsContainer) {
    relatedProductsContainer.innerHTML = ""

    // Get random products (different from cart items)
    const cartProductIds = cart.map((item) => item.id)
    const availableProducts = products.filter((product) => !cartProductIds.includes(product.id))

    // Shuffle and take up to 6 products
    const shuffledProducts = availableProducts.sort(() => 0.5 - Math.random())
    const relatedProducts = shuffledProducts.slice(0, 6)

    relatedProducts.forEach((product) => {
      const productSlide = document.createElement("div")
      productSlide.className = "swiper-slide"
      productSlide.innerHTML = `
        <div class="card product-card h-100 border-0 shadow-sm">
          <div class="product-img-container p-3">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
          </div>
          <div class="card-body d-flex flex-column p-4">
            <h5 class="card-title product-title">${product.name}</h5>
            <div class="product-rating mb-1">
              ${generateRatingStars(product.rating)}
            </div>
            <p class="card-text fw-bold mb-3">${formatCurrency(product.price)}</p>
            <button class="btn btn-primary mt-auto add-to-cart" data-id="${product.id}">
              <i class="fas fa-cart-plus me-2"></i>Add to Cart
            </button>
          </div>
        </div>
      `

      relatedProductsContainer.appendChild(productSlide)
    })

    // Initialize swiper
    new Swiper(".related-products-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 4,
        },
      },
    })

    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = relatedProductsContainer.querySelectorAll(".add-to-cart")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        addToCart(productId)

        // Show toast notification
        showToast("Item added to cart!", "success")
      })
    })
  }
}

// Setup back to top button
function setupBackToTop() {
  const backToTopButton = document.getElementById("backToTop")

  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add("show")
      } else {
        backToTopButton.classList.remove("show")
      }
    })

    // Scroll to top when clicked
    backToTopButton.addEventListener("click", (e) => {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }
}

// Show toast notification
function showToast(message, type = "success") {
  const toastEl = document.getElementById("toastNotification")
  const toastHeader = toastEl.querySelector(".toast-header")
  const toastMessage = document.getElementById("toastMessage")

  // Set toast type
  toastHeader.className = "toast-header"
  if (type === "success") {
    toastHeader.classList.add("bg-success", "text-white")
    toastHeader.innerHTML = `<i class="fas fa-check-circle me-2"></i><strong class="me-auto">ShopVista</strong><button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>`
  } else if (type === "danger") {
    toastHeader.classList.add("bg-danger", "text-white")
    toastHeader.innerHTML = `<i class="fas fa-trash-alt me-2"></i><strong class="me-auto">ShopVista</strong><button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>`
  }

  // Set message
  toastMessage.textContent = message

  // Show toast
  const toast = new bootstrap.Toast(toastEl)
  toast.show()
}

// Helper functions
function formatCurrency(amount) {
  return "₹" + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
}

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Here you would typically send this data to your server
            // For now, we'll just show a success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
});

// Setup new arrivals page
function setupNewArrivalsPage() {
  // Load products
  loadProducts()

  // Setup category filter
  const categoryFilter = document.getElementById("categoryFilter")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      filterProducts()
    })
  }

  // Setup sort filter
  const sortFilter = document.getElementById("sortFilter")
  if (sortFilter) {
    sortFilter.addEventListener("change", () => {
      filterProducts()
    })
  }

  // Display products in new arrivals grid
  const newArrivalsGrid = document.getElementById("newArrivalsGrid")
  if (newArrivalsGrid) {
    newArrivalsGrid.innerHTML = ""
    products.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.className = "col-md-6 col-lg-4 col-xl-3"
      productCard.setAttribute("data-aos", "fade-up")
      productCard.innerHTML = `
        <div class="card product-card h-100 border-0 shadow-sm">
          <div class="product-badge bg-primary text-white">New</div>
          <div class="product-wishlist">
            <button class="btn btn-sm btn-outline-dark rounded-circle">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-img-container p-3">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
          </div>
          <div class="card-body d-flex flex-column p-4">
            <div class="product-rating mb-1">
              ${generateRatingStars(product.rating)}
              <span class="text-muted small ms-2">(${product.reviews})</span>
            </div>
            <h5 class="card-title product-title">${product.name}</h5>
            <p class="card-text text-muted small product-description">${product.description.substring(0, 60)}...</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="card-text fw-bold mb-0">${formatCurrency(product.price)}</p>
                <button class="btn btn-sm btn-outline-primary quick-view" data-id="${product.id}">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
              <button class="btn btn-primary w-100 add-to-cart" data-id="${product.id}">
                <i class="fas fa-cart-plus me-2"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      `
      newArrivalsGrid.appendChild(productCard)
    })

    // Hide loading spinner
    const loadingSpinner = document.getElementById("loadingSpinner")
    if (loadingSpinner) {
      loadingSpinner.style.display = "none"
    }

    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".add-to-cart")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        addToCart(productId)
        showToast("Item added to cart!", "success")
      })
    })

    // Add event listeners to "Quick View" buttons
    const quickViewButtons = document.querySelectorAll(".quick-view")
    quickViewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        openQuickViewModal(productId)
      })
    })
  }
}
