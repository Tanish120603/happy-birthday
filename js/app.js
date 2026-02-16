
// ============================================
// MYNTRA BIRTHDAY — APP LOGIC
// ============================================

let currentTab = "home";
let searchQuery = "";

// Cart state: { friendId: true/false }
let cart = {};
let cartOpen = false;

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderProductGrid();
  renderVideoGrid();
  renderPhotoGrid();
  setupTabNavigation();
  setupSearch();
  setupModalEvents();
  updateCartUI();
});

// ============================================
// HEADER
// ============================================
function renderHeader() {
  const bannerEl = document.querySelector(".birthday-banner");
  if (bannerEl) {
    const person = BIRTHDAY_CONFIG.birthdayPerson;
    const tagline = BIRTHDAY_CONFIG.tagline;
    bannerEl.querySelector("h2").textContent = `🎉 Happy Birthday, ${person}! 🎉`;
    bannerEl.querySelector("p").textContent = tagline;
  }

  // Set celebration name
  const celName = document.getElementById("celebration-name");
  if (celName) celName.textContent = `${BIRTHDAY_CONFIG.birthdayPerson}!`;

  // Set celebration title
  const celTitle = document.querySelector(".celebration-title");
  if (celTitle) celTitle.textContent = `Happy ${BIRTHDAY_CONFIG.turningAge}${getOrdinal(BIRTHDAY_CONFIG.turningAge)} Birthday!`;

  // Set cart total
  const cartTotal = document.getElementById("cart-candle-total");
  if (cartTotal) cartTotal.textContent = BIRTHDAY_CONFIG.turningAge;

  updateResultsInfo();
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function updateResultsInfo() {
  const titleEl = document.getElementById("results-title");
  const breadcrumbEl = document.getElementById("breadcrumb-current");
  const count = BIRTHDAY_CONFIG.friends.length;

  if (currentTab === "home") {
    if (titleEl) titleEl.innerHTML = `Birthday Wishes <span class="results-count">- ${count} wishes</span>`;
    if (breadcrumbEl) breadcrumbEl.textContent = "Wishes from Friends";
  } else if (currentTab === "wishes") {
    if (titleEl) titleEl.innerHTML = `Video Wishes <span class="results-count">- ${count} videos</span>`;
    if (breadcrumbEl) breadcrumbEl.textContent = "Video Wishes";
  } else if (currentTab === "photos") {
    const totalPhotos = BIRTHDAY_CONFIG.friends.reduce((sum, f) => sum + (f.photos || []).length, 0);
    if (titleEl) titleEl.innerHTML = `Photo Gallery <span class="results-count">- ${totalPhotos} photos</span>`;
    if (breadcrumbEl) breadcrumbEl.textContent = "Photo Gallery";
  }
}

// ============================================
// TAB NAVIGATION
// ============================================
function setupTabNavigation() {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });
}

function switchTab(tabName) {
  currentTab = tabName;

  document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
  const activeTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add("active");

  document.querySelectorAll(".tab-content").forEach((tc) => tc.classList.remove("active"));
  const targetContent = document.getElementById(`tab-${tabName}`);
  if (targetContent) targetContent.classList.add("active");

  if (tabName !== "wishes") {
    document.querySelectorAll("#video-grid video").forEach((v) => v.pause());
  }

  updateResultsInfo();

  if (searchQuery) {
    applySearch(searchQuery);
  }
}

// ============================================
// SEARCH
// ============================================
function setupSearch() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear");

  if (input) {
    input.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applySearch(searchQuery);
      if (clearBtn) clearBtn.style.display = searchQuery ? "flex" : "none";
    });
  }

  if (clearBtn) {
    clearBtn.style.display = "none";
    clearBtn.addEventListener("click", () => {
      input.value = "";
      searchQuery = "";
      applySearch("");
      clearBtn.style.display = "none";
      input.focus();
    });
  }
}

function applySearch(query) {
  const noResults = document.getElementById("no-results");
  let hasAnyResults = false;

  document.querySelectorAll("#product-grid .product-card").forEach((card) => {
    const name = card.querySelector(".brand-name")?.textContent.toLowerCase() || "";
    const match = !query || name.includes(query);
    card.style.display = match ? "" : "none";
    if (match) hasAnyResults = true;
  });

  document.querySelectorAll("#video-grid .video-card").forEach((card) => {
    const name = card.getAttribute("data-name")?.toLowerCase() || "";
    const match = !query || name.includes(query);
    card.style.display = match ? "" : "none";
    if (match) hasAnyResults = true;
  });

  document.querySelectorAll("#photo-grid .photo-card").forEach((card) => {
    const name = card.getAttribute("data-name")?.toLowerCase() || "";
    const match = !query || name.includes(query);
    card.style.display = match ? "" : "none";
    if (match) hasAnyResults = true;
  });

  if (noResults) {
    noResults.style.display = query && !hasAnyResults ? "block" : "none";
  }
}

// ============================================
// HOME — PRODUCT GRID
// ============================================
function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = "";
  BIRTHDAY_CONFIG.friends.forEach((friend) => {
    grid.appendChild(createProductCard(friend));
  });
}

function createProductCard(friend) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-id", friend.id);

  const inCart = cart[friend.id];
  const candleEmojis = "🕯️".repeat(friend.candles);

  card.innerHTML = `
    <div class="card-image-wrapper">
      <img
        src="${friend.coverImage}"
        alt="${friend.name}'s wish"
        loading="lazy"
      />
      <button class="wishlist-btn" onclick="toggleWishlist(event, this)" aria-label="Wishlist">
        <svg viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <div class="rating-badge">
        <span class="star">★</span>
        <span>${friend.rating}</span>
        <span class="divider">|</span>
        <span class="count">${friend.ratingCount}</span>
      </div>
    </div>
    <div class="card-info">
      <div class="brand-name">${friend.name}</div>
      <div class="price-row">
        <span class="price-now">${friend.fakePrice}</span>
        <span class="price-discount">(${friend.fakeDiscount})</span>
      </div>
      <div class="candle-info">
        <span class="candle-count">${candleEmojis} ${friend.candles} candle${friend.candles > 1 ? "s" : ""}</span>
      </div>
      <button class="card-candle-btn ${inCart ? "added" : ""}" onclick="event.stopPropagation(); addCandle(${friend.id})" data-friend-id="${friend.id}" ${inCart ? "disabled" : ""}>
        ${inCart ? `✓ ${friend.name}'s Candles Added` : `🕯️ Add ${friend.name}'s Candles`}
      </button>
      <button class="card-open-btn" onclick="event.stopPropagation(); openDetailModal(BIRTHDAY_CONFIG.friends.find(f => f.id === ${friend.id}))">
        View Wishes 📸🎥
      </button>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest(".wishlist-btn")) return;
    if (e.target.closest(".card-open-btn")) return;
    if (e.target.closest(".card-candle-btn")) return;
    openDetailModal(friend);
  });

  return card;
}

// ============================================
// WISHES — VIDEO GRID
// ============================================
function renderVideoGrid() {
  const grid = document.getElementById("video-grid");
  if (!grid) return;

  grid.innerHTML = "";
  BIRTHDAY_CONFIG.friends.forEach((friend) => {
    if (!friend.video) return;

    const inCart = cart[friend.id];
    const card = document.createElement("div");
    card.className = "video-card";
    card.setAttribute("data-name", friend.name);

    card.innerHTML = `
      <div class="video-wrapper">
        <video controls playsinline preload="metadata" poster="${friend.coverImage}">
          <source src="${friend.video}" type="video/mp4" />
          Your browser does not support video.
        </video>
      </div>
      <div class="video-info">
        <div class="video-friend-name">${friend.name}</div>
        <div class="video-message">${friend.message}</div>
        <button class="card-candle-btn compact ${inCart ? "added" : ""}" onclick="event.stopPropagation(); toggleCandle(${friend.id})" data-friend-id="${friend.id}">
          ${inCart ? `✓ Candles Added` : `🕯️ Add ${friend.candles} Candle${friend.candles > 1 ? "s" : ""}`}
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ============================================
// PHOTOS — PHOTO GALLERY GRID
// ============================================
function renderPhotoGrid() {
  const grid = document.getElementById("photo-grid");
  if (!grid) return;

  grid.innerHTML = "";
  BIRTHDAY_CONFIG.friends.forEach((friend) => {
    (friend.photos || []).forEach((photo, index) => {
      const card = document.createElement("div");
      card.className = "photo-card";
      card.setAttribute("data-name", friend.name);

      card.innerHTML = `
        <div class="photo-wrapper">
          <img src="${photo}" alt="${friend.name}'s photo ${index + 1}" loading="lazy" />
          <div class="photo-overlay">
            <span class="photo-friend-label">${friend.name}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        openDetailModal(friend);
      });

      grid.appendChild(card);
    });
  });
}

// ============================================
// CANDLE CART LOGIC
// ============================================
function addCandle(friendId) {
  if (cart[friendId]) return; // Already added
  cart[friendId] = true;
  updateCartUI();
  updateCandleButtons();
}

function removeCandle(friendId) {
  if (!cart[friendId]) return;
  delete cart[friendId];
  updateCartUI();
  updateCandleButtons();
}

function addCandleFromModal(friendId) {
  if (cart[friendId]) return; // Already added
  cart[friendId] = true;
  updateCartUI();
  updateCandleButtons();
  // Update the modal button too
  const modalBtn = document.querySelector(".detail-candle-btn");
  if (modalBtn) {
    const friend = BIRTHDAY_CONFIG.friends.find(f => f.id === friendId);
    modalBtn.classList.add("added");
    modalBtn.disabled = true;
    modalBtn.innerHTML = `✓ ${friend.name}'s Candles Added`;
  }
}

function getCartCandleCount() {
  let total = 0;
  for (const fId in cart) {
    const friend = BIRTHDAY_CONFIG.friends.find(f => f.id === parseInt(fId));
    if (friend) total += friend.candles;
  }
  return total;
}

function updateCandleButtons() {
  // Update all candle buttons on cards
  document.querySelectorAll(".card-candle-btn[data-friend-id]").forEach((btn) => {
    const fId = parseInt(btn.dataset.friendId);
    const friend = BIRTHDAY_CONFIG.friends.find(f => f.id === fId);
    if (!friend) return;
    const inCart = !!cart[fId];

    if (btn.classList.contains("compact")) {
      btn.className = `card-candle-btn compact ${inCart ? "added" : ""}`;
      btn.innerHTML = inCart ? `✓ Candles Added` : `🕯️ Add ${friend.candles} Candle${friend.candles > 1 ? "s" : ""}`;
      btn.disabled = inCart;
    } else {
      btn.className = `card-candle-btn ${inCart ? "added" : ""}`;
      btn.innerHTML = inCart ? `✓ ${friend.name}'s Candles Added` : `🕯️ Add ${friend.name}'s Candles`;
      btn.disabled = inCart;
    }
  });
}

function updateCartUI() {
  const totalCandles = getCartCandleCount();
  const target = BIRTHDAY_CONFIG.turningAge;
  const itemCount = Object.keys(cart).length;

  // Badge
  const badge = document.getElementById("bag-badge");
  if (badge) {
    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? "flex" : "none";
  }

  // Progress
  const countEl = document.getElementById("cart-candle-count");
  if (countEl) countEl.textContent = totalCandles;

  const fillEl = document.getElementById("cart-progress-fill");
  if (fillEl) fillEl.style.width = Math.min((totalCandles / target) * 100, 100) + "%";

  // Checkout button
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  const hintEl = document.getElementById("cart-footer-hint");
  if (checkoutBtn) {
    const allAdded = totalCandles >= target;
    checkoutBtn.disabled = !allAdded;
    if (allAdded) {
      checkoutBtn.classList.add("ready");
      if (hintEl) hintEl.textContent = "🎉 All candles collected! Ready to celebrate!";
    } else {
      checkoutBtn.classList.remove("ready");
      if (hintEl) hintEl.textContent = `Add ${target - totalCandles} more candle${target - totalCandles !== 1 ? "s" : ""} to checkout`;
    }
  }

  // Render cart items
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const friendIds = Object.keys(cart).map(Number);

  if (friendIds.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-emoji">🕯️</span>
        <p>No candles added yet!</p>
        <p class="cart-empty-hint">Add candles from each friend's card to fill the birthday cake.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = friendIds.map((fId) => {
    const friend = BIRTHDAY_CONFIG.friends.find(f => f.id === fId);
    if (!friend) return "";
    const candleEmojis = "🕯️".repeat(friend.candles);
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${friend.coverImage}" alt="${friend.name}" />
        <div class="cart-item-details">
          <div class="cart-item-name">${friend.name}'s Candles</div>
          <div class="cart-item-candles">${candleEmojis} × ${friend.candles}</div>
          <div class="cart-item-price">Rs 0 <span class="cart-item-free">FREE</span></div>
        </div>
        <button class="cart-item-remove" onclick="removeCandle(${friend.id})" aria-label="Remove">✕</button>
      </div>
    `;
  }).join("");
}

// ============================================
// CART SIDEBAR TOGGLE
// ============================================
function toggleCart() {
  cartOpen = !cartOpen;
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");

  if (cartOpen) {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  } else {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// ============================================
// CHECKOUT & CELEBRATION
// ============================================
function handleCheckout() {
  toggleCart(); // Close cart
  showCelebration();
}

function showCelebration() {
  const modal = document.getElementById("celebration-modal");
  if (!modal) return;

  // Build candle row
  const candleRow = document.getElementById("celebration-candles");
  if (candleRow) {
    candleRow.innerHTML = "";
    for (let i = 0; i < BIRTHDAY_CONFIG.turningAge; i++) {
      const span = document.createElement("span");
      span.className = "cel-candle";
      span.textContent = "🕯️";
      span.style.animationDelay = (i * 0.08) + "s";
      candleRow.appendChild(span);
    }
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  // Start confetti
  launchConfetti();
}

function closeCelebration() {
  const modal = document.getElementById("celebration-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
  stopConfetti();
}

// ============================================
// CONFETTI ENGINE (Canvas-based)
// ============================================
let confettiAnimId = null;
let confettiPieces = [];

function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  confettiPieces = [];
  const colors = ["#ff3f6c", "#ff7094", "#ffb6c1", "#ffd700", "#ff905a", "#14958f", "#7b61ff", "#ff4081", "#00e5ff"];

  for (let i = 0; i < 200; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 2,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach((p) => {
      p.y += p.speed;
      p.x += p.drift;
      p.angle += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });

    confettiAnimId = requestAnimationFrame(animate);
  }

  animate();
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  const canvas = document.getElementById("confetti-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ============================================
// DETAIL MODAL
// ============================================
function openDetailModal(friend) {
  const modal = document.getElementById("detail-modal");
  if (!modal) return;

  const media = [];

  if (friend.video) {
    media.push({ type: "video", src: friend.video });
  }

  (friend.photos || []).forEach((photo) => {
    media.push({ type: "image", src: photo });
  });

  const totalSlides = media.length;

  const slidesHTML = media
    .map((item, i) => {
      if (item.type === "video") {
        return `
          <div class="detail-slide ${i === 0 ? "active" : ""}" data-index="${i}">
            <video controls playsinline preload="metadata">
              <source src="${item.src}" type="video/mp4" />
            </video>
          </div>`;
      } else {
        return `
          <div class="detail-slide ${i === 0 ? "active" : ""}" data-index="${i}">
            <img src="${item.src}" alt="${friend.name}'s photo" />
          </div>`;
      }
    })
    .join("");

  const dotsHTML =
    totalSlides > 1
      ? `<div class="detail-dots">
          ${media.map((_, i) => `<span class="detail-dot ${i === 0 ? "active" : ""}" data-index="${i}"></span>`).join("")}
        </div>`
      : "";

  const arrowsHTML =
    totalSlides > 1
      ? `<button class="detail-arrow detail-prev" aria-label="Previous">‹</button>
         <button class="detail-arrow detail-next" aria-label="Next">›</button>`
      : "";

  const inCart = cart[friend.id];
  const candleEmojis = "🕯️".repeat(friend.candles);

  modal.innerHTML = `
    <div class="detail-overlay" id="detail-overlay"></div>
    <div class="detail-content">
      <button class="detail-close" id="detail-close" aria-label="Close">✕</button>
      <div class="detail-layout">
        <div class="detail-media">
          <div class="detail-slider" id="detail-slider" data-current="0" data-total="${totalSlides}">
            ${slidesHTML}
            ${arrowsHTML}
            ${dotsHTML}
          </div>
        </div>
        <div class="detail-info">
          <div class="detail-brand">${friend.name}</div>
          <div class="detail-message">${friend.message}</div>
          <div class="detail-price-row">
            <span class="detail-price">${friend.fakePrice}</span>
            <span class="detail-discount">(${friend.fakeDiscount})</span>
          </div>
          <div class="detail-rating">
            <span class="star">★</span> ${friend.rating} <span class="detail-rating-count">| ${friend.ratingCount} ratings</span>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-candle-section">
            <div class="detail-candle-label">🕯️ Birthday Candles: ${candleEmojis} (${friend.candles})</div>
            <button class="detail-candle-btn ${inCart ? "added" : ""}" onclick="addCandleFromModal(${friend.id})">
              ${inCart ? `✓ ${friend.name}'s Candles Added` : `🕯️ Add ${friend.name}'s Candles`}
            </button>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-section-title">Birthday Wish from ${friend.name}</div>
          <p class="detail-description">
            This special wish was curated exclusively for <strong>${BIRTHDAY_CONFIG.birthdayPerson}</strong>'s birthday collection. 
            Watch the video message and browse through the memories! 🎂🎉
          </p>
          <div class="detail-actions">
            <button class="detail-btn detail-btn-secondary" onclick="toggleWishlist(event, this)">
              ♡ Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  setupDetailSlider();
  document.getElementById("detail-close").addEventListener("click", closeDetailModal);
  document.getElementById("detail-overlay").addEventListener("click", closeDetailModal);
}

function closeDetailModal() {
  const modal = document.getElementById("detail-modal");
  if (!modal) return;

  const video = modal.querySelector("video");
  if (video) video.pause();

  modal.classList.remove("open");
  document.body.style.overflow = "";
}

function setupDetailSlider() {
  const slider = document.getElementById("detail-slider");
  if (!slider) return;

  const total = parseInt(slider.dataset.total);
  if (total <= 1) return;

  const prevBtn = slider.querySelector(".detail-prev");
  const nextBtn = slider.querySelector(".detail-next");

  if (prevBtn) prevBtn.addEventListener("click", () => navigateDetailSlider(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => navigateDetailSlider(1));

  slider.querySelectorAll(".detail-dot").forEach((dot) => {
    dot.addEventListener("click", () => goToDetailSlide(parseInt(dot.dataset.index)));
  });
}

function navigateDetailSlider(direction) {
  const slider = document.getElementById("detail-slider");
  if (!slider) return;

  const current = parseInt(slider.dataset.current);
  const total = parseInt(slider.dataset.total);
  let next = current + direction;
  if (next < 0) next = total - 1;
  if (next >= total) next = 0;
  goToDetailSlide(next);
}

function goToDetailSlide(index) {
  const slider = document.getElementById("detail-slider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".detail-slide");
  const dots = slider.querySelectorAll(".detail-dot");

  slides.forEach((s) => {
    const video = s.querySelector("video");
    if (video) video.pause();
    s.classList.remove("active");
  });
  dots.forEach((d) => d.classList.remove("active"));

  slides[index].classList.add("active");
  if (dots[index]) dots[index].classList.add("active");
  slider.dataset.current = index;
}

// ============================================
// MODAL EVENTS (keyboard)
// ============================================
function setupModalEvents() {
  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("detail-modal");
    if (modal && modal.classList.contains("open")) {
      if (e.key === "Escape") closeDetailModal();
      else if (e.key === "ArrowLeft") navigateDetailSlider(-1);
      else if (e.key === "ArrowRight") navigateDetailSlider(1);
      return;
    }

    // Close cart on Escape
    if (cartOpen && e.key === "Escape") {
      toggleCart();
      return;
    }

    // Close celebration on Escape
    const celModal = document.getElementById("celebration-modal");
    if (celModal && celModal.classList.contains("open") && e.key === "Escape") {
      closeCelebration();
    }
  });
}

// ============================================
// HELPERS
// ============================================
function toggleWishlist(event, btn) {
  event.stopPropagation();
  btn.classList.toggle("active");

  if (btn.classList.contains("active")) {
    btn.style.transform = "scale(1.3)";
    setTimeout(() => {
      btn.style.transform = "scale(1)";
    }, 200);
  }
}
