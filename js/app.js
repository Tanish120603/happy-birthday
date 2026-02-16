
// ============================================
// MYNTRA BIRTHDAY — APP LOGIC
// ============================================

let currentTab = "home";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderProductGrid();
  renderVideoGrid();
  renderPhotoGrid();
  setupTabNavigation();
  setupSearch();
  setupModalEvents();
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

  updateResultsInfo();
}

function updateResultsInfo() {
  const titleEl = document.getElementById("results-title");
  const breadcrumbEl = document.getElementById("breadcrumb-current");
  const countEl = document.querySelector(".results-count");
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

  // Update nav active state
  document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
  const activeTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add("active");

  // Show/hide tab content
  document.querySelectorAll(".tab-content").forEach((tc) => tc.classList.remove("active"));
  const targetContent = document.getElementById(`tab-${tabName}`);
  if (targetContent) targetContent.classList.add("active");

  // Pause all videos when switching away from wishes
  if (tabName !== "wishes") {
    document.querySelectorAll("#video-grid video").forEach((v) => v.pause());
  }

  updateResultsInfo();

  // Re-apply search filter
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

  // Filter product cards (Home tab)
  document.querySelectorAll("#product-grid .product-card").forEach((card) => {
    const name = card.querySelector(".brand-name")?.textContent.toLowerCase() || "";
    const match = !query || name.includes(query);
    card.style.display = match ? "" : "none";
    if (match) hasAnyResults = true;
  });

  // Filter video cards (Wishes tab)
  document.querySelectorAll("#video-grid .video-card").forEach((card) => {
    const name = card.getAttribute("data-name")?.toLowerCase() || "";
    const match = !query || name.includes(query);
    card.style.display = match ? "" : "none";
    if (match) hasAnyResults = true;
  });

  // Filter photo cards (Photos tab)
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
      <div class="product-name">${friend.message}</div>
      <div class="price-row">
        <span class="price-now">${friend.fakePrice}</span>
        <span class="price-discount">(${friend.fakeDiscount})</span>
      </div>
      <button class="card-open-btn" onclick="event.stopPropagation(); openDetailModal(BIRTHDAY_CONFIG.friends.find(f => f.id === ${friend.id}))">
        View Wishes 📸🎥
      </button>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest(".wishlist-btn")) return;
    if (e.target.closest(".card-open-btn")) return;
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

      // Click to open detail modal for this friend
      card.addEventListener("click", () => {
        openDetailModal(friend);
      });

      grid.appendChild(card);
    });
  });
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
    if (!modal || !modal.classList.contains("open")) return;

    if (e.key === "Escape") closeDetailModal();
    else if (e.key === "ArrowLeft") navigateDetailSlider(-1);
    else if (e.key === "ArrowRight") navigateDetailSlider(1);
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
