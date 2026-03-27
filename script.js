// --- Atmospheric Storm & Lightning Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let lightning = [];
let rain = [];
const rainCount = 100;
let flashOpacity = 0;

class Rain {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.vy = Math.random() * 10 + 15;
        this.len = Math.random() * 20 + 10;
        this.opacity = Math.random() * 0.2 + 0.1;
    }
    draw() {
        ctx.strokeStyle = `rgba(0, 243, 255, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.len);
        ctx.stroke();

        this.y += this.vy;
        if (this.y > height) this.reset();
    }
}

class Lightning {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = 0;
        this.path = [{ x: this.x, y: this.y }];
        this.branches = [];
        this.opacity = 1;
        this.createPath(this.x, this.y, 40, 0);
        flashOpacity = 0.15; // Trigger subtle screen flash
    }
    createPath(x, y, segments, angle) {
        for (let i = 0; i < segments; i++) {
            const nextX = x + (Math.random() - 0.5) * 50;
            const nextY = y + Math.random() * 30;
            this.path.push({ x: nextX, y: nextY });

            // Random branching
            if (Math.random() < 0.1 && segments > 5) {
                this.branches.push(this.createBranch(nextX, nextY, 10));
            }
            x = nextX;
            y = nextY;
            if (y > height) break;
        }
    }
    createBranch(x, y, segments) {
        const branchPath = [{ x, y }];
        for (let i = 0; i < segments; i++) {
            x += (Math.random() - 0.5) * 30;
            y += Math.random() * 20;
            branchPath.push({ x, y });
        }
        return branchPath;
    }
    draw() {
        ctx.strokeStyle = `rgba(200, 240, 255, ${this.opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 243, 255, 0.8)';
        ctx.lineWidth = 2;

        // Draw main bolt
        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.stroke();

        // Draw branches
        ctx.lineWidth = 1;
        this.branches.forEach(branch => {
            ctx.beginPath();
            ctx.moveTo(branch[0].x, branch[0].y);
            for (let i = 1; i < branch.length; i++) {
                ctx.lineTo(branch[i].x, branch[i].y);
            }
            ctx.stroke();
        });

        ctx.shadowBlur = 0;
        this.opacity -= 0.02;
    }
}

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    rain = [];
    for (let i = 0; i < rainCount; i++) {
        rain.push(new Rain());
    }
}

function animate() {
    // Background clear with slight trail
    ctx.fillStyle = `rgba(5, 5, 5, ${1 - flashOpacity})`;
    ctx.fillRect(0, 0, width, height);

    // Screen Flash effect
    if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(0, 243, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, width, height);
        flashOpacity -= 0.01;
    }

    // Draw Rain
    rain.forEach(r => r.draw());

    // Random Lightning - reduced frequency
    if (Math.random() < 0.003 && lightning.length < 1) {
        lightning.push(new Lightning());
    }

    lightning.forEach((l, index) => {
        l.draw();
        if (l.opacity <= 0) lightning.splice(index, 1);
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', init);
init();
animate();

// --- Scroll Restoration (F5) ---
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
// window.scrollTo(0, 0); // Removed to allow hash-based scroll

// --- Click Particle Effect ---
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = document.createElement('div');
        this.element.classList.add('click-particle');
        document.body.appendChild(this.element);

        // Random size
        const size = Math.random() * 5 + 2;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;

        // Random Color (Cycles neon palette)
        const colors = ['#00f3ff', '#bd00ff', '#39ff14', '#ffffff'];
        this.element.style.background = colors[Math.floor(Math.random() * colors.length)];
        this.element.style.boxShadow = `0 0 10px ${this.element.style.background}`;

        this.life = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity (optional)
        this.life -= 0.02;

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        if (this.life <= 0) {
            this.element.remove();
            return false;
        }
        return true;
    }
}

let particles = [];

document.addEventListener('click', (e) => {
    // Spawn particles
    const count = 12;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(e.clientX, e.clientY));
    }
});

function animateParticles() {
    particles = particles.filter(p => p.update());
    requestAnimationFrame(animateParticles);
}
animateParticles();

// --- Sidebar Interaction ---
const sidebarAccordion = document.querySelector('.sidebar-accordion');
const accordionHeader = document.querySelector('.sidebar-accordion-header');

accordionHeader.addEventListener('click', () => {
    sidebarAccordion.classList.toggle('active');
});



// Sidebar Links Logic
const sidebarLinks = document.querySelectorAll('.sidebar-link:not(.group-toggle)');
const contentPanels = document.querySelectorAll('.content-panel');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // e.preventDefault(); // Allow default hash update or handle manually
        const targetId = link.getAttribute('data-target');
        if (targetId) {
            e.preventDefault();
            navigateToSection(targetId);
        }
    });
});

// --- Scroll Reveal & Cursor ---
const cursorGlow = document.querySelector('.cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
        }
    });
}, { threshold: 0.1 });

function observeItems() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        revealObserver.observe(item);
    });
}

// --- Dynamic Content ---
function createPokemonCard(pk, extraClass = '') {
    const item = document.createElement('div');
    item.className = 'gallery-item pkball-card ' + extraClass;

    // Check if multiple images exist
    const hasMultiple = pk.images && pk.images.length > 1;
    const mainImage = pk.images ? pk.images[0] : pk.src; // Fallback for old data format if any

    // Store images in dataset for carousel
    if (hasMultiple) {
        item.dataset.images = JSON.stringify(pk.images);
        item.dataset.index = 0;
    }

    // Lazy Loading Logic (Blur Up)
    const imgElement = document.createElement('img');
    imgElement.src = mainImage;
    imgElement.alt = pk.name;
    imgElement.loading = "lazy";
    imgElement.onload = () => {
        imgElement.classList.add('loaded');
    };

    let html = '';
    // Append the image element directly later or wrap it
    // To match previous grid structure:
    // item.innerHTML = html; -> We need to manually append the img

    // Construct HTML structure
    item.appendChild(imgElement);

    if (hasMultiple) {
        const controls = document.createElement('div');
        controls.className = 'carousel-controls';
        controls.innerHTML = `
            <div class="carousel-btn prev" onclick="rotateImage(this, -1)">&#8249;</div>
            <div class="carousel-btn next" onclick="rotateImage(this, 1)">&#8250;</div>
        `;
        item.appendChild(controls);
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    // Name Formatting with Gender Symbols
    let displayName = pk.name.toUpperCase();

    // Pikachu Female / Nidoran F -> Pink Female Symbol
    if (displayName.endsWith(' FEMALE') || displayName.endsWith(' F')) {
        displayName = displayName.replace(/ (FEMALE|F)$/, '') + ' <span style="color: #ffb7c5; font-size: 1.2em;">♀</span>';
    }
    // Nidoran M -> Blue Male Symbol
    else if (displayName.endsWith(' M')) {
        displayName = displayName.replace(/ M$/, '') + ' <span style="color: #87CEEB; font-size: 1.2em;">♂</span>';
    }

    let dexNumHtml = '';
    // Only display pokedex number if it's NOT a Maple3D/Looney card (which have 'looney-card' extraClass)
    if (pk.id && !extraClass.includes('looney-card')) {
        dexNumHtml = `#${pk.id} `;
    }

    let typeHtml = '';
    if (pk.types && pk.types.length > 0) {
        let pills = pk.types.map(t => {
            const className = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return `<span class="type-pill type-${className}" data-i18n="type_${className}">${t}</span>`;
        }).join('');
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'type-badge-container';
        badgeContainer.innerHTML = pills;
        item.appendChild(badgeContainer);
    }

    overlay.innerHTML = `<h3>${dexNumHtml}${displayName}</h3>`;
    item.appendChild(overlay);

    return item;
}

// Global function for carousel rotation
window.rotateImage = function (btn, direction) {
    // Prevent bubbling up to any links
    event.stopPropagation();
    event.preventDefault();

    const card = btn.closest('.gallery-item');
    const imgElement = card.querySelector('img');
    const images = JSON.parse(card.dataset.images);
    let currentIndex = parseInt(card.dataset.index);

    // Update index
    currentIndex += direction;
    if (currentIndex >= images.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = images.length - 1;

    // Update state
    card.dataset.index = currentIndex;
    imgElement.src = images[currentIndex];
};

// --- 3D TILT EFFECT & LIGHTBOX LOGIC ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');

// Navigation State
let currentLightboxList = [];
let currentLightboxIndex = -1;

function openLightbox(src, caption, isVideo = false, reelUrl = null, list = [], index = -1) {
    if (!lightbox) return;

    const lightboxInsta = document.getElementById('lightbox-insta');

    lightbox.classList.add('active');

    // Update State
    currentLightboxList = list;
    currentLightboxIndex = index;

    // Reset all
    lightboxImg.style.display = 'none';
    lightboxVideo.style.display = 'none';
    lightboxVideo.pause();

    if (lightboxInsta) {
        lightboxInsta.style.display = 'none';
        lightboxInsta.href = '#';
    }

    if (isVideo) {
        lightboxVideo.src = src;
        lightboxVideo.style.display = 'block';
        lightboxVideo.muted = true; // Force mute
        lightboxVideo.loop = true;  // Force loop
        lightboxVideo.playsInline = true;
        lightboxVideo.play();
    } else {
        lightboxImg.src = src;
        lightboxImg.style.display = 'block';
    }

    // Handle Insta Button
    if (reelUrl && reelUrl !== '#' && lightboxInsta) {
        lightboxInsta.href = reelUrl;
        lightboxInsta.style.display = 'flex';
    }

    lightboxCaption.textContent = caption;
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Navigation Function
window.navigateLightbox = function (direction) {
    if (!currentLightboxList || currentLightboxList.length === 0) return;

    currentLightboxIndex += direction;

    // Loop logic
    if (currentLightboxIndex >= currentLightboxList.length) currentLightboxIndex = 0;
    if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxList.length - 1;

    const nextItem = currentLightboxList[currentLightboxIndex];

    // Determine type based on item data (simulated check as we passed raw data or DOM elements?)
    // Better to pass the raw data object to openLightbox if possible.
    // Refactoring renderGrid to pass the 'data' array to allow navigation.

    // Fallback: If we only have the simple list of objects with {src, name, reel, type}
    const isVideo = nextItem.video || false;
    // Note: Our current data structure varies (N3D vs Looney). 
    // N3D: {id, name, folder, images} -> Main image is images[0]
    // Looney: {src, name, reel}

    let src = "";
    let caption = nextItem.name;
    let reel = nextItem.reel || null;

    if (nextItem.images && nextItem.images.length > 0) {
        src = nextItem.images[0];
    } else if (nextItem.src) {
        src = nextItem.src;
    }

    openLightbox(src, caption, isVideo, reel, currentLightboxList, currentLightboxIndex);
};

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');

    // Stop video
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0;
    }

    document.body.style.overflow = 'auto'; // Restore scrolling
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") window.navigateLightbox(-1);
    if (e.key === "ArrowRight") window.navigateLightbox(1);
});

// Reuseable function to add effects to a card
function addCardInteractions(card, pkName, reelUrl = null, list = [], index = -1) {
    const img = card.querySelector('img');
    const video = card.querySelector('video');

    // Inject Glare Element
    const glare = document.createElement('div');
    glare.className = 'glare';
    card.appendChild(glare);

    // Lightbox trigger (Image)
    if (img) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(img.src, pkName, false, reelUrl, list, index);
        });
    }

    // Lightbox trigger (Video) - For Star Wars
    if (video) {
        const overlay = card.querySelector('.overlay'); // Click on overlay/card to open
        if (overlay) {
            overlay.style.cursor = 'pointer';
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Video';
                openLightbox(video.src, title, true, null, list, index);
            });
        }
        // Also allow clicking the video itself if controls aren't blocking
        video.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault(); // Prevent default play/pause
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Video';
            openLightbox(video.src, title, true, null, list, index);
        });
    }

    // 3D Tilt Effect + Glare
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentages
        const xPct = x / rect.width;
        const yPct = y / rect.height;

        // Calculate rotation (max 15 degrees)
        const xRot = (0.5 - yPct) * 15;
        const yRot = (xPct - 0.5) * 15;

        card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none'; // Instant follow

        // Glare Position Logic (Moving Gradient)
        const glareX = (xPct * 100);
        const glareY = (yPct * 100);
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)`;
        glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease'; // Smooth return

        glare.style.opacity = '0';
    });
}

// --- Modified Grid Rendering ---
function renderGrid(containerId, data, extraClass = '') {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    // Clear current content
    grid.innerHTML = '';

    // Search Feedback: No Results
    if (data.length === 0) {
        const msg = document.createElement('div');
        msg.className = 'no-results-message';
        // Select random funny message or standard one
        const messages = typeof noResultsMessages !== 'undefined' && typeof currentLang !== 'undefined' && noResultsMessages[currentLang]
            ? noResultsMessages[currentLang]
            : [
                "No se ha encontrado ningún Pokémon.",
                "¡Ese Pokémon se ha escapado!",
                "¿Seguro que se escribe así?",
                "La Pokédex no reconoce esa consulta."
            ];
        msg.textContent = messages[Math.floor(Math.random() * messages.length)];
        grid.appendChild(msg);
        return;
    }

    data.forEach((pk, index) => {
        const item = createPokemonCard(pk, extraClass);
        // Add interactions to the new card, PASSING THE FULL LIST AND INDEX
        // Pass reel URL if available (used by Looney/Maple sections)
        const reelUrl = pk.reel || null;
        addCardInteractions(item, pk.name, reelUrl, data, index);

        grid.appendChild(item);
        revealObserver.observe(item);
    });

    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

function applyFilters(dataset, query, genStr, typeStr) {
    return dataset.filter(pk => {
        if (query && !pk.name.toLowerCase().includes(query)) return false;
        if (genStr !== 'all') {
            const desiredGen = parseInt(genStr, 10);
            if (pk.generation !== desiredGen) return false;
        }
        if (typeStr !== 'all') {
            if (!pk.types || !pk.types.includes(typeStr)) return false;
        }
        return true;
    });
}

function initDataAndSearch() {
    // Initial Render
    if (typeof n3dData !== 'undefined') renderGrid('n3d-grid', n3dData);
    if (typeof cplData !== 'undefined') renderGrid('cpl-grid', cplData);

    // Filter Handlers for N3D
    const n3dSearch = document.getElementById('n3d-search-input');
    const n3dGen = document.getElementById('n3d-gen-filter');
    const n3dType = document.getElementById('n3d-type-filter');
    
    function updateN3D() {
        if (typeof n3dData === 'undefined') return;
        const q = n3dSearch ? n3dSearch.value.toLowerCase() : '';
        const g = n3dGen ? n3dGen.value : 'all';
        const t = n3dType ? n3dType.value : 'all';
        const filtered = applyFilters(n3dData, q, g, t);
        renderGrid('n3d-grid', filtered);
    }
    
    if (n3dSearch) n3dSearch.addEventListener('input', updateN3D);
    if (n3dGen) n3dGen.addEventListener('change', updateN3D);
    if (n3dType) n3dType.addEventListener('change', updateN3D);

    // Filter Handlers for CPL
    const cplSearch = document.getElementById('cpl-search-input');
    const cplGen = document.getElementById('cpl-gen-filter');
    const cplType = document.getElementById('cpl-type-filter');
    
    function updateCPL() {
        if (typeof cplData === 'undefined') return;
        const q = cplSearch ? cplSearch.value.toLowerCase() : '';
        const g = cplGen ? cplGen.value : 'all';
        const t = cplType ? cplType.value : 'all';
        const filtered = applyFilters(cplData, q, g, t);
        renderGrid('cpl-grid', filtered);
    }
    
    if (cplSearch) cplSearch.addEventListener('input', updateCPL);
    if (cplGen) cplGen.addEventListener('change', updateCPL);
    if (cplType) cplType.addEventListener('change', updateCPL);

    // Maple3D Grid (Standard Pokemon Card style but with looney-card visual fit)
    const mapleGrid = document.getElementById('maple-grid');
    if (mapleGrid && typeof mapleData !== 'undefined') {
        renderGrid('maple-grid', mapleData, 'looney-card');
    }

    // Looney Grid (Legacy Static)
    const looneyGrid = document.getElementById('looney-grid');
    if (looneyGrid && typeof looneyData !== 'undefined') {
        looneyGrid.innerHTML = ''; // Prevent duplication on language change
        looneyData.forEach((lt, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item looney-card';

            // Lazy Load Logic for Looney
            const img = document.createElement('img');
            img.src = lt.src;
            img.alt = lt.name;
            img.loading = "lazy";
            img.onload = () => img.classList.add('loaded');

            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.innerHTML = `<h3>${lt.name.toUpperCase()}</h3><p>Rockstar Edition</p>`;

            item.appendChild(img);
            item.appendChild(overlay);

            // Add interactions (Tilt/Lightbox) - Pass Reel URL and List/Index
            addCardInteractions(item, lt.name, lt.reel, looneyData, index);

            looneyGrid.appendChild(item);
            revealObserver.observe(item);
        });
    }

    // Urban Vibes Grid
    const urbanGrid = document.getElementById('urban-grid');
    if (urbanGrid && typeof urbanVibesData !== 'undefined') {
        renderGrid('urban-grid', urbanVibesData, 'looney-card');
    }

    // Amigurumi Grids
    if (document.getElementById('amigurumi-harry-potter-grid') && typeof amigurumiHarryPotterData !== 'undefined') {
        renderGrid('amigurumi-harry-potter-grid', amigurumiHarryPotterData, 'looney-card');
    }
    if (document.getElementById('amigurumi-dragon-ball-grid') && typeof amigurumiDragonBallData !== 'undefined') {
        renderGrid('amigurumi-dragon-ball-grid', amigurumiDragonBallData, 'looney-card');
    }
    if (document.getElementById('amigurumi-pokemon-grid') && typeof amigurumiPokemonData !== 'undefined') {
        renderGrid('amigurumi-pokemon-grid', amigurumiPokemonData, 'looney-card');
    }
    if (document.getElementById('amigurumi-mario-world-grid') && typeof amigurumiMarioWorldData !== 'undefined') {
        renderGrid('amigurumi-mario-world-grid', amigurumiMarioWorldData, 'looney-card');
    }
    if (document.getElementById('amigurumi-one-piece-grid') && typeof amigurumiOnePieceData !== 'undefined') {
        renderGrid('amigurumi-one-piece-grid', amigurumiOnePieceData, 'looney-card');
    }
    if (document.getElementById('amigurumi-naruto-grid') && typeof amigurumiNarutoData !== 'undefined') {
        renderGrid('amigurumi-naruto-grid', amigurumiNarutoData, 'looney-card');
    }
    if (document.getElementById('amigurumi-kimetsu-no-yaiba-grid') && typeof amigurumiKimetsuNoYaibaData !== 'undefined') {
        renderGrid('amigurumi-kimetsu-no-yaiba-grid', amigurumiKimetsuNoYaibaData, 'looney-card');
    }
    if (document.getElementById('amigurumi-shingeki-no-kyojin-grid') && typeof amigurumiShingekinoKyojinData !== 'undefined') {
        renderGrid('amigurumi-shingeki-no-kyojin-grid', amigurumiShingekinoKyojinData, 'looney-card');
    }
    if (document.getElementById('amigurumi-jujutsu-kaisen-grid') && typeof amigurumiJujutsuKaisenData !== 'undefined') {
        renderGrid('amigurumi-jujutsu-kaisen-grid', amigurumiJujutsuKaisenData, 'looney-card');
    }
    if (document.getElementById('amigurumi-huntr-x-grid') && typeof amigurumiHuntrxData !== 'undefined') {
        renderGrid('amigurumi-huntr-x-grid', amigurumiHuntrxData, 'looney-card');
    }
    if (document.getElementById('amigurumi-marvel-dc-grid') && typeof amigurumiMarvelDCData !== 'undefined') {
        renderGrid('amigurumi-marvel-dc-grid', amigurumiMarvelDCData, 'looney-card');
    }
}

initDataAndSearch();

// --- Video Control & Interactions ---
function setupVideoControls() {
    const videos = [];
    document.querySelectorAll('#starwars .gallery-item').forEach(card => {
        const vid = card.querySelector('video');
        if (vid) {
            // Mock data object for star wars video list navigation
            videos.push({
                src: vid.src,
                name: card.querySelector('h3') ? card.querySelector('h3').textContent : 'Star Wars Video',
                video: true,
                reel: card.dataset.reel || null
            });
        }
    });

    document.querySelectorAll('#starwars .gallery-item').forEach((card, index) => {
        const vid = card.querySelector('video');
        if (vid) {
            // Mouseover Preview
            vid.pause();
            card.addEventListener('mouseenter', () => {
                vid.play().catch(e => console.log("Video play error:", e));
            });
            card.addEventListener('mouseleave', () => {
                vid.pause();
                vid.currentTime = 0; // Reset preview
            });

            // Attach Lightbox & Tilt (using the shared function)
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Video';
            addCardInteractions(card, title, card.dataset.reel || null, videos, index);
        }
    });
}

setupVideoControls();
// Only auto-open the accordion on PC. On mobile, keep it closed to save space.
if (window.innerWidth >= 992) {
    sidebarAccordion.classList.add('active');
}
setTimeout(observeItems, 500);

// --- SMOOTH TRANSITION LOGIC ---
document.querySelectorAll('.sidebar-link, .sidebar-link-main').forEach(link => {
    link.addEventListener('click', (e) => {
        // Add Fade Class to Main Content
        const main = document.querySelector('.main-content');
        if (main) {
            main.classList.add('fade-transition');
            setTimeout(() => {
                main.classList.remove('fade-transition');
            }, 500);
        }
    });
});
// --- Programmatic Navigation ---
window.navigateToSection = function (targetId) {
    const contentPanels = document.querySelectorAll('.content-panel');
    const sidebarLinks = document.querySelectorAll('.sidebar-link:not(.group-toggle)');

    // Update UI Classes
    sidebarLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-target') === targetId) {
            l.classList.add('active');
            // If it's inside an accordion, ensure accordion is open
            const accordion = l.closest('.sidebar-accordion');
            if (accordion) accordion.classList.add('active');
        }
    });

    contentPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetId) {
            panel.classList.add('active');
            // Trigger reveals for lazy loaded items in this panel
            setTimeout(observeItems, 100);
        }
    });

    // Update URL Hash
    if (window.location.hash !== '#' + targetId) {
        history.pushState(null, null, '#' + targetId);
    }

    // Scroll handling
    if (window.innerWidth < 992) {
        const main = document.querySelector('.main-content');
        if (main) main.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// --- Initialization & Hash Handling ---
function handleInitialNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetPanel = document.getElementById(hash);
        if (targetPanel && targetPanel.classList.contains('content-panel')) {
            window.navigateToSection(hash);
            return;
        }
    }
}

// Window popstate to handle browser back/forward
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash) window.navigateToSection(hash);
});

// Initialize after data is loaded and DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    handleInitialNavigation();
});

// For immediate execution if DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    handleInitialNavigation();
}

// --- SECURITY: PREVENT IMAGE THEFT ---
// Block right-click context menu
document.addEventListener('contextmenu', (e) => {
    // Prevent right click on images and videos, or the whole document
    // We block it globally to make the site feel like an app and protect assets
    e.preventDefault();
});

// Block dragging of images and videos
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
    }
});

// Disable keyboard shortcuts for opening DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
       (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
       (e.ctrlKey && e.key === 'u') ||
       (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'u'))) {
        e.preventDefault();
    }
});

// --- AJAX Form Submission ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const btn = contactForm.querySelector('button[type="submit"]');
        const formMsg = document.getElementById('form-message');
        
        // Save original button text and show loading
        const originalText = btn.innerHTML;
        btn.innerHTML = 'ENVIANDO...';
        btn.disabled = true;
        
        const formData = new FormData(contactForm);

        fetch(contactForm.action, {
            method: contactForm.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Success
                contactForm.reset();
                formMsg.textContent = '¡Correo enviado correctamente!';
                formMsg.style.color = '#39ff14'; // Neon Green
                formMsg.style.display = 'block';
                
                // Hide after 3 seconds
                setTimeout(() => {
                    formMsg.style.display = 'none';
                }, 3000);
            } else {
                // Error
                formMsg.textContent = 'Hubo un error al enviar. Inténtalo de nuevo.';
                formMsg.style.color = '#ff003c'; // Neon Red
                formMsg.style.display = 'block';
            }
        })
        .catch(error => {
            formMsg.textContent = 'Hubo un problema de red. Inténtalo más tarde.';
            formMsg.style.color = '#ff003c';
            formMsg.style.display = 'block';
        })
        .finally(() => {
            // Restore button state
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    });
}
