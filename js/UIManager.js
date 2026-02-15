import { GENERALS, BUILDINGS, EXPLORATION_TYPES, RESOURCES } from './data.js';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.container = document.getElementById('ui-layer');
        this.currentScreen = null;

        // Subscribe to game updates
        this.gameManager.subscribe(() => this.update());

        this.init();
    }

    init() {
        this.showTitleScreen();
    }

    clear() {
        this.container.innerHTML = '';
    }

    showTitleScreen() {
        this.clear();
        this.currentScreen = 'title';
        this.container.style.pointerEvents = 'auto';

        const screen = document.createElement('div');
        screen.className = 'title-screen';

        const logo = document.createElement('img');
        logo.src = 'assets/logo.png';
        logo.className = 'game-logo';
        logo.alt = 'Era Total War Saga';

        const startBtn = document.createElement('button');
        startBtn.className = 'start-game-btn';
        startBtn.textContent = 'START';
        startBtn.onclick = () => {
            // Try to go full screen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(e => {
                    console.log("Fullscreen denied", e);
                });
            }
            this.showSelectionScreen();
        };

        screen.appendChild(logo);
        screen.appendChild(startBtn);
        this.container.appendChild(screen);
    }

    showSelectionScreen() {
        this.clear();
        this.currentScreen = 'selection';
        this.container.style.pointerEvents = 'auto';

        if (this.currentGeneralIndex === undefined) {
            this.currentGeneralIndex = 0;
        }

        const screen = document.createElement('div');
        screen.className = 'selection-screen slider-mode';

        // === Carousel Viewport ===
        const viewport = document.createElement('div');
        viewport.className = 'carousel-viewport';

        // === Carousel Track ===
        const track = document.createElement('div');
        track.className = 'carousel-track';

        // Render Cards
        this.cardElements = [];
        GENERALS.forEach((general, index) => {
            const card = document.createElement('div');
            card.className = 'carousel-card';
            // Store index for easy access
            card.dataset.index = index;

            const img = document.createElement('img');
            img.src = general.image;
            img.className = 'slider-image';
            img.draggable = false; // Prevent browser drag

            const info = document.createElement('div');
            info.className = 'slider-info';

            const name = document.createElement('h1');
            name.textContent = general.name;

            const desc = document.createElement('p');
            desc.className = 'slider-desc';
            desc.textContent = general.description;

            const bonus = document.createElement('div');
            bonus.className = 'slider-bonus';
            const bonusText = Object.entries(general.bonus)
                .map(([key, val]) => `${key.toUpperCase()}: ${val > 1 ? '+' + Math.round((val - 1) * 100) + '%' : Math.round((val - 1) * 100) + '%'}`)
                .join(' | ');
            bonus.textContent = bonusText;

            info.appendChild(name);
            info.appendChild(desc);
            info.appendChild(bonus);

            card.appendChild(img);
            card.appendChild(info);
            track.appendChild(card);
            this.cardElements.push(card);
        });

        viewport.appendChild(track);
        screen.appendChild(viewport);

        // === Select Button ===
        const selectBtn = document.createElement('button');
        selectBtn.className = 'select-btn';
        selectBtn.textContent = 'START REIGN';
        selectBtn.style.marginTop = '20px';
        selectBtn.onclick = () => {
            const general = GENERALS[this.currentGeneralIndex];
            this.gameManager.selectGeneral(general.id);
            this.showGameUI();
        };
        screen.appendChild(selectBtn);

        this.container.appendChild(screen);

        // === Initialize Carousel Logic ===
        this.initCarousel(viewport, track);
    }

    initCarousel(viewport, track) {
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;
        let currentIndex = this.currentGeneralIndex || 0;

        // Configuration
        const cardWidth = 320; // 280px width + 40px gap
        // We center the first item using padding-left: 50%.
        // So index 0 is at translate 0 (relative to that padding).
        // Index 1 is at -cardWidth, etc.
        // We need to offset by half the card width to center it perfectly?
        // Let's refine:
        // viewport center is at 50%.
        // track padding-left is 50%.
        // So the left edge of the first card is at the center of the viewport.
        // We want the CENTER of the first card to be at the center of the viewport.
        // Card width is 280px. So we need to shift left by 140px.
        // So initial offset for index 0 is -140px.
        const centerOffset = -140;

        const setSliderPosition = () => {
            track.style.transform = `translateX(${currentTranslate}px)`;
        };

        const updateActiveCard = () => {
            // Find which index is closest to center
            // Position relative to 0 (which is index 0)
            // effectivePos = currentTranslate - centerOffset
            // index = -effectivePos / cardWidth
            const effectivePos = currentTranslate - centerOffset;
            const rawIndex = -effectivePos / cardWidth;
            let index = Math.round(rawIndex);

            // Clamp
            if (index < 0) index = 0;
            if (index > GENERALS.length - 1) index = GENERALS.length - 1;

            this.currentGeneralIndex = index;

            this.cardElements.forEach((card, i) => {
                if (i === index) card.classList.add('active');
                else card.classList.remove('active');
            });
        };

        // Initialize position
        // Target for index i: centerOffset + i * -cardWidth
        const getPositionForIndex = (index) => {
            return centerOffset + (index * -cardWidth);
        };

        // Set initial state
        prevTranslate = getPositionForIndex(currentIndex);
        currentTranslate = prevTranslate;
        setSliderPosition();
        updateActiveCard();

        // Drag Events
        const touchStart = (index) => {
            return (event) => {
                isDragging = true;
                startPos = getPositionX(event);
                animationID = requestAnimationFrame(animation);
                viewport.classList.add('grabbing');
                track.style.transition = 'none'; // Disable transition during drag
            }
        }

        const touchEnd = () => {
            isDragging = false;
            cancelAnimationFrame(animationID);
            viewport.classList.remove('grabbing');
            track.style.transition = 'transform 0.3s ease-out'; // Re-enable for snap

            // Snap logic
            const movedBy = currentTranslate - prevTranslate;

            // Simple snap to nearest
            const effectivePos = currentTranslate - centerOffset;
            const rawIndex = -effectivePos / cardWidth;
            let index = Math.round(rawIndex);

            // Clamp
            if (index < 0) index = 0;
            if (index > GENERALS.length - 1) index = GENERALS.length - 1;

            currentIndex = index;
            currentTranslate = getPositionForIndex(currentIndex);
            prevTranslate = currentTranslate;

            setSliderPosition();
            updateActiveCard();
        }

        const touchMove = (event) => {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                const diff = currentPosition - startPos;
                currentTranslate = prevTranslate + diff;
            }
        }

        const getPositionX = (event) => {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        const animation = () => {
            setSliderPosition();
            if (isDragging) requestAnimationFrame(animation);
        }

        // Listeners
        viewport.addEventListener('touchstart', touchStart(currentIndex));
        viewport.addEventListener('touchend', touchEnd);
        viewport.addEventListener('touchmove', touchMove);

        viewport.addEventListener('mousedown', touchStart(currentIndex));
        viewport.addEventListener('mouseup', touchEnd);
        viewport.addEventListener('mouseleave', () => { if (isDragging) touchEnd() });
        viewport.addEventListener('mousemove', touchMove);

        // Context menu disable
        window.oncontextmenu = function (event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    showGameUI() {
        this.clear();
        this.currentScreen = 'game';
        this.container.style.pointerEvents = 'none'; // Allow clicks to pass through to canvas
        this.container.style.pointerEvents = 'none'; // Passthrough for 3D controls

        // === HUD Top Left: General Info ===
        const generalPanel = document.createElement('div');
        generalPanel.className = 'general-panel ui-element';
        generalPanel.style.cursor = 'pointer'; // Make it look clickable

        // Add click handler to open profile
        generalPanel.onclick = () => {
            this.showGeneralProfile();
        };

        const genImg = document.createElement('img');
        genImg.src = this.gameManager.selectedGeneral.image;
        genImg.className = 'general-portrait';

        const genName = document.createElement('div');
        genName.className = 'general-name-hud';
        genName.textContent = this.gameManager.selectedGeneral.name;

        generalPanel.appendChild(genImg);
        generalPanel.appendChild(genName);
        this.container.appendChild(generalPanel);

        // === Requests Panel - Top Right ===
        const requestsPanel = document.createElement('div');
        requestsPanel.className = 'requests-panel ui-element';
        requestsPanel.id = 'requests-panel';
        this.container.appendChild(requestsPanel);

        // === Exploration Panel - Left (Below General) ===
        const explorationPanel = document.createElement('div');
        explorationPanel.className = 'exploration-panel ui-element';
        explorationPanel.innerHTML = '<h3 style="font-size: 0.8em; line-height: 1.2;">SCOUTS<br>search for:</h3>';

        Object.values(EXPLORATION_TYPES).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'explore-btn';
            btn.id = `explore-${type.id}`;
            btn.innerHTML = `
                <div class="explore-icon">${type.icon}</div>
                <div class="explore-cost">${type.cost}</div>
            `;
            btn.onclick = () => this.gameManager.sendExplorer(type.id);
            explorationPanel.appendChild(btn);
        });

        this.container.appendChild(explorationPanel);

        // === Bottom Area Container ===
        const bottomContainer = document.createElement('div');
        bottomContainer.className = 'bottom-container';

        // === Resources Bar (Bottom) ===
        const resourcesBar = document.createElement('div');
        resourcesBar.className = 'resources-bar ui-element';
        resourcesBar.id = 'resource-display';
        bottomContainer.appendChild(resourcesBar);

        // === Building Menu (Bottom) ===
        const buildMenu = document.createElement('div');
        buildMenu.className = 'building-menu ui-element';

        Object.values(BUILDINGS).forEach(b => {
            const btn = document.createElement('div');
            btn.className = 'building-btn';
            btn.id = `btn-${b.id}`;
            btn.onclick = () => {
                this.gameManager.constructBuilding(b.id);
            };

            let costStr = '';
            if (b.cost.solidi) costStr += `<div class="cost-item">💰 ${b.cost.solidi}</div>`;
            if (b.cost.wood) costStr += `<div class="cost-item">🌲 ${b.cost.wood}</div>`;
            if (b.cost.stone) costStr += `<div class="cost-item">🪨 ${b.cost.stone}</div>`;
            if (b.cost.iron) costStr += `<div class="cost-item">⛏️ ${b.cost.iron}</div>`;

            btn.innerHTML = `
                <div>${b.name}</div>
                <div class="building-cost">
                    ${costStr}
                </div>
             `;

            buildMenu.appendChild(btn);
        });

        bottomContainer.appendChild(buildMenu);
        this.container.appendChild(bottomContainer);

        this.update(); // Initial update
    }

    showGeneralProfile() {
        // Don't close the game UI, just overlay on top
        // But we need to pause interaction with the game itself if possible?
        // For now just an overlay div

        const overlay = document.createElement('div');
        overlay.className = 'general-profile-screen';

        const stats = this.gameManager.generalStats;
        const general = this.gameManager.selectedGeneral;

        if (!stats || !general) {
            console.error("General stats or selected general missing");
            return;
        }

        overlay.innerHTML = `
            <div class="profile-container">
                <button class="profile-close-btn">&times;</button>
                <div class="profile-header">
                    <h1 class="profile-name">${general.name}</h1>
                    <div class="profile-level">Level <span id="profile-level-val">${stats.level}</span></div>
                    
                    <div class="xp-container">
                        <div class="xp-fill" id="profile-xp-fill" style="width: ${(stats.xp / stats.nextLevelXp) * 100}%"></div>
                        <div class="xp-text"><span id="profile-xp-val">${stats.xp}</span> / <span id="profile-next-xp-val">${stats.nextLevelXp}</span> XP</div>
                    </div>
                </div>
                
                <div class="profile-content">
                    <div class="gear-column left">
                        <div class="gear-slot" data-label="Weapon">⚔️</div>
                        <div class="gear-slot" data-label="Shield">🛡️</div>
                        <div class="gear-slot" data-label="Helmet">🪖</div>
                    </div>
                    
                    <div class="profile-main-image">
                        <img src="${general.image}" alt="${general.name}">
                    </div>
                    
                    <div class="gear-column right">
                        <div class="gear-slot" data-label="Accessory">💍</div>
                        <div class="gear-slot" data-label="Mount">🐎</div>
                        <div class="gear-slot" data-label="Armor">🥋</div>
                    </div>
                </div>
                
                <div class="profile-footer">
                    <div class="commanders-area">
                        Commanders coming soon...
                    </div>
                </div>
            </div>
        `;

        // Close logic
        overlay.querySelector('.profile-close-btn').addEventListener('click', () => {
            overlay.remove();
        });

        // Close on click outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        this.container.appendChild(overlay);
        this.currentProfileOverlay = overlay;
    }

    update() {
        if (this.currentScreen !== 'game') return;

        // Update generic game stuff
        this.updateGameHUD();

        // Update Profile if open
        if (this.currentProfileOverlay) {
            const stats = this.gameManager.generalStats;
            if (stats) {
                const xpFill = this.currentProfileOverlay.querySelector('#profile-xp-fill');
                const xpVal = this.currentProfileOverlay.querySelector('#profile-xp-val');
                const nextXpVal = this.currentProfileOverlay.querySelector('#profile-next-xp-val');
                const levelVal = this.currentProfileOverlay.querySelector('#profile-level-val');

                if (xpFill && xpVal && nextXpVal && levelVal) {
                    xpFill.style.width = `${(stats.xp / stats.nextLevelXp) * 100}%`;
                    xpVal.textContent = Math.floor(stats.xp);
                    nextXpVal.textContent = stats.nextLevelXp;
                    levelVal.textContent = stats.level;
                }
            }
        }
    }

    updateGameHUD() {
        // Resources
        const resDisplay = document.getElementById('resource-display');
        if (resDisplay) {
            const r = this.gameManager.resources;
            // Define icons/labels
            const resData = [
                { id: 'solidi', label: 'Solidi', icon: '💰', val: Math.floor(r.solidi) },
                { id: 'wood', label: 'Wood', icon: '🌲', val: Math.floor(r.wood) },
                { id: 'stone', label: 'Stone', icon: '🪨', val: Math.floor(r.stone) },
                { id: 'iron', label: 'Iron', icon: '⛏️', val: Math.floor(r.iron) },
                { id: 'food', label: 'Food', icon: '🍞', val: Math.floor(r.food) }
            ];

            // Use simple ID checks to avoid full re-render flickering if possible, 
            // but map + innerHTML is fine for now as it's efficient enough.
            resDisplay.innerHTML = resData.map(res => `
                <div class="resource-box">
                    <div class="res-icon">${res.icon}</div>
                    <div class="res-val">${res.val}</div>
                    <div class="res-label">${res.label}</div>
                </div>
            `).join('');
        }

        // Requests
        const reqPanel = document.getElementById('requests-panel');
        if (reqPanel) {
            reqPanel.innerHTML = '<h3>Requests</h3>';
            this.gameManager.activeRequests.forEach(req => {
                const item = document.createElement('div');
                item.className = 'request-item';
                item.innerHTML = `
                     <div class="req-title">${req.title}</div>
                     <div class="req-desc">${req.description}</div>
                     <div class="req-reward">Reward: ${req.reward.solidi} Solidi</div>
                 `;

                if (req.status === 'completed') {
                    item.classList.add('completed');
                    item.innerHTML += '<div class="req-status">COMPLETED</div>';
                } else if (req.status === 'constructing') {
                    item.innerHTML += '<button class="make-btn" disabled>Constructing...</button>';
                } else if (req.type === 'build' && req.status === 'active') {
                    if (this.gameManager.canAfford(req.target)) {
                        const makeBtn = document.createElement('button');
                        makeBtn.className = 'make-btn';
                        makeBtn.textContent = 'Make';
                        makeBtn.onclick = () => {
                            this.gameManager.constructBuilding(req.target);
                        };
                        item.appendChild(makeBtn);
                    }
                }

                reqPanel.appendChild(item);
            });
            if (this.gameManager.activeRequests.length === 0) {
                reqPanel.innerHTML += '<div class="no-req">The people are content... for now.</div>';
            }
        }

        // Exploration Buttons
        Object.values(EXPLORATION_TYPES).forEach(type => {
            const btn = document.getElementById(`explore-${type.id}`);
            if (btn) {
                const explorer = this.gameManager.explorers[type.id];
                if (explorer) {
                    const remaining = Math.ceil((explorer.endTime - Date.now()) / 1000);
                    btn.innerHTML = `
                        <div style="font-size:0.7em">Back:</div>
                        <div class="explore-icon">${type.icon}</div>
                        <div class="explore-cost">${remaining}s</div>
                    `;
                    btn.disabled = true;
                } else {
                    btn.innerHTML = `
                        <div class="explore-icon">${type.icon}</div>
                        <div class="explore-cost">${type.cost}</div>
                    `;
                    btn.disabled = this.gameManager.resources.solidi < type.cost;
                }
            }
        });

        // Building Buttons
        Object.values(BUILDINGS).forEach(b => {
            const btn = document.getElementById(`btn-${b.id}`);
            if (btn) {
                const canAfford = this.gameManager.canAfford(b.id);
                if (canAfford) {
                    btn.removeAttribute('disabled');
                    btn.classList.remove('disabled');
                } else {
                    btn.setAttribute('disabled', 'true');
                    btn.classList.add('disabled');
                }
            }
        });
    }

    showBuildingUpgradeModal(buildingId) {
        const building = this.gameManager.buildings.find(b => b.id === buildingId);
        if (!building) return;

        const def = BUILDINGS[building.type];
        const currentLevel = building.level || 1;
        const nextLevel = currentLevel + 1;

        // Calculate Costs for Next Level
        const levelMultiplier = Math.pow(1.5, currentLevel);
        const cost = {
            solidi: Math.floor(def.cost.solidi * levelMultiplier),
            wood: Math.floor(def.cost.wood * levelMultiplier),
            stone: Math.floor(def.cost.stone * levelMultiplier),
            iron: Math.floor(def.cost.iron * levelMultiplier)
        };

        // Create Modal Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Modal Content
        overlay.innerHTML = `
            <div class="modal-content" style="width: 400px; text-align: center;">
                <h2>${def.name} (Level ${currentLevel})</h2>
                <p>${def.description}</p>
                <div style="margin: 20px 0; text-align: left;">
                    <h3>Upgrade to Level ${nextLevel}</h3>
                    <p><strong>Production:</strong> +50%</p>
                    <p><strong>XP Reward:</strong> 10 XP</p>
                    <div class="cost-list">
                        ${cost.solidi > 0 ? `<div>💰 ${cost.solidi} Solidi</div>` : ''}
                        ${cost.wood > 0 ? `<div>🌲 ${cost.wood} Wood</div>` : ''}
                        ${cost.stone > 0 ? `<div>🪨 ${cost.stone} Stone</div>` : ''}
                        ${cost.iron > 0 ? `<div>⛏️ ${cost.iron} Iron</div>` : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="confirm-upgrade" class="btn primary-btn">Upgrade</button>
                    <button id="cancel-upgrade" class="btn close-btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event Listeners
        const confirmBtn = overlay.querySelector('#confirm-upgrade');
        confirmBtn.onclick = () => {
            const success = this.gameManager.upgradeBuilding(buildingId);
            if (success) {
                document.body.removeChild(overlay);
            } else {
                alert("Not enough resources!");
            }
        };

        const cancelBtn = overlay.querySelector('#cancel-upgrade');
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
        };
    }
}
