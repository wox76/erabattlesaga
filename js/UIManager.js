import { GENERALS, BUILDINGS, EXPLORATION_TYPES, RESOURCES, UNIT_TYPES, SPELLS } from './data.js';
import { t } from './i18n.js';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.gameManager.uiManager = this; // Attach UI Manager to Game Manager
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

        if (this.gameManager.hasSaveGame()) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'start-game-btn';
            continueBtn.style.marginBottom = '20px';
            continueBtn.textContent = t('ui.continue');
            continueBtn.onclick = () => {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(e => {
                        console.log("Fullscreen denied", e);
                    });
                }
                if (this.gameManager.loadGame()) {
                    this.showGameUI();
                } else {
                    alert('Failed to load save!');
                }
            };
            screen.appendChild(continueBtn);
        }

        const startBtn = document.createElement('button');
        startBtn.className = 'start-game-btn';
        startBtn.textContent = t('ui.start');
        startBtn.onclick = () => {
            // Try to go full screen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(e => {
                    console.log("Fullscreen denied", e);
                });
            }
            this.showSelectionScreen();
        };


        const resetBtn = document.createElement('button');
        resetBtn.className = 'start-game-btn'; // Re-use style or new 'reset-data-btn'
        resetBtn.style.marginTop = '10px';
        resetBtn.style.fontSize = '0.8em';
        resetBtn.style.background = '#333';
        resetBtn.style.border = '1px solid #666';
        resetBtn.innerHTML = `<i class="ra ra-skull"></i> ${t('ui.delete_save')}`;
        resetBtn.onclick = () => {
            if (confirm(t('ui.confirm') + ' ' + t('ui.delete_save') + '?')) {
                this.gameManager.resetGame();
            }
        };

        screen.appendChild(logo);
        screen.appendChild(startBtn);
        if (this.gameManager.hasSaveGame()) {
            screen.appendChild(resetBtn); // Only show if there is data to reset? Or always? User said "all'inizio".
        }

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
            name.textContent = t(general.name);

            const desc = document.createElement('p');
            desc.className = 'slider-desc';
            desc.textContent = t(general.description);

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
        selectBtn.textContent = t('ui.start_reign');
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
        genName.textContent = t(this.gameManager.selectedGeneral.name);

        generalPanel.appendChild(genImg);
        generalPanel.appendChild(genName);
        this.container.appendChild(generalPanel);

        // === HUD Top Right: Buttons Container ===
        const hudButtons = document.createElement('div');
        hudButtons.className = 'hud-buttons-container';
        this.container.appendChild(hudButtons);
        this.hudButtons = hudButtons;

        // Requests Button (R)
        const reqBtn = document.createElement('button');
        reqBtn.className = 'hud-btn';
        reqBtn.textContent = 'R';
        reqBtn.title = t('ui.requests');
        reqBtn.onclick = () => this.toggleRequests();
        hudButtons.appendChild(reqBtn);

        // Save/Reset Buttons REMOVED for Auto-Save


        // Quests Button (Scroll Icon)
        const questBtn = document.createElement('button');
        questBtn.className = 'hud-btn';
        questBtn.innerHTML = '<i class="ra ra-scroll-unfurled"></i>';
        questBtn.title = t('ui.quests');
        questBtn.onclick = () => this.toggleQuestLog();
        hudButtons.appendChild(questBtn);
        this.questBtn = questBtn; // Save ref for updates

        // === Requests Panel (Hidden by default) ===
        const requestsPanel = document.createElement('div');
        requestsPanel.className = 'requests-panel ui-element';
        requestsPanel.id = 'requests-panel';
        requestsPanel.style.display = 'none'; // Hidden initially
        this.container.appendChild(requestsPanel);
        this.requestsPanel = requestsPanel;

        // === Exploration Panel - Left (Below General) ===
        const explorePanel = document.createElement('div');
        explorePanel.className = 'exploration-panel ui-element';

        Object.values(EXPLORATION_TYPES).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'explore-btn';
            btn.id = `explore-${type.id}`;
            btn.onclick = () => {
                this.gameManager.sendExplorer(type.id);
            };
            explorePanel.appendChild(btn);
        });
        this.container.appendChild(explorePanel);

        // === Army Button - Right Side (Requests Panel) ===
        const armyBtn = document.createElement('button');
        armyBtn.className = 'army-btn ui-element'; // Define style later
        armyBtn.innerHTML = `<i class="ra ra-crossed-swords"></i> ${t('ui.army')}`;
        armyBtn.onclick = () => this.showArmyUI();
        this.container.appendChild(armyBtn);

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
            if (b.cost.solidi) costStr += `<div class="cost-item"><i class="ra ra-gold-bar icon-solidi"></i> ${b.cost.solidi}</div>`;
            if (b.cost.wood) costStr += `<div class="cost-item"><i class="ra ra-pine-tree icon-wood"></i> ${b.cost.wood}</div>`;
            if (b.cost.stone) costStr += `<div class="cost-item"><i class="ra ra-cubes icon-stone"></i> ${b.cost.stone}</div>`;
            if (b.cost.iron) costStr += `<div class="cost-item"><i class="ra ra-mining-diamonds icon-iron"></i> ${b.cost.iron}</div>`;

            btn.innerHTML = `
                <div class="building-icon"><i class="${b.icon}"></i></div>
                <div class="building-name">${t(b.name)}</div>
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
                        <div class="gear-slot" data-label="Weapon"><i class="ra ra-sword"></i></div>
                        <div class="gear-slot" data-label="Shield"><i class="ra ra-shield"></i></div>
                        <div class="gear-slot" data-label="Helmet"><i class="ra ra-helmet"></i></div>
                    </div>
                    
                    <div class="profile-main-image">
                        <img src="${general.image}" alt="${general.name}">
                    </div>
                    
                    <div class="gear-column right">
                        <div class="gear-slot" data-label="Accessory"><i class="ra ra-ring"></i></div>
                        <div class="gear-slot" data-label="Mount"><i class="ra ra-wolf-head"></i></div>
                        <div class="gear-slot" data-label="Armor"><i class="ra ra-vest"></i></div>
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
                { id: 'solidi', label: t('res.solidi'), icon: 'ra ra-gold-bar icon-solidi', val: Math.floor(r.solidi) },
                { id: 'wood', label: t('res.wood'), icon: 'ra ra-pine-tree icon-wood', val: Math.floor(r.wood) },
                { id: 'stone', label: t('res.stone'), icon: 'ra ra-cubes icon-stone', val: Math.floor(r.stone) },
                { id: 'iron', label: t('res.iron'), icon: 'ra ra-mining-diamonds icon-iron', val: Math.floor(r.iron) },
                { id: 'food', label: t('res.food'), icon: 'ra ra-meat icon-food', val: Math.floor(r.food) },
                { id: 'population', label: t('res.population'), icon: 'ra ra-player icon-population', val: Math.floor(r.population) }
            ];

            // Use simple ID checks to avoid full re-render flickering if possible, 
            // but map + innerHTML is fine for now as it's efficient enough.
            resDisplay.innerHTML = resData.map(res => `
                <div class="resource-box">
                    <div class="res-icon"><i class="${res.icon}"></i></div>
                    <div class="res-val">${res.val}</div>
                    <div class="res-label">${res.label}</div>
                </div>
            `).join('');
        }

        // Requests
        const reqPanel = document.getElementById('requests-panel');
        if (reqPanel) {
            reqPanel.innerHTML = `<h3>${t('ui.requests')}</h3>`;
            this.gameManager.activeRequests.forEach(req => {
                const item = document.createElement('div');
                item.className = 'request-item';
                item.innerHTML = `
                     <div class="req-title">${t(req.title)}</div>
                     <div class="req-desc">${t(req.description)}</div>
                     <div class="req-reward">${t('ui.reward')}: ${req.reward.solidi} ${t('res.solidi')}</div>
                 `;

                if (req.status === 'completed') {
                    item.classList.add('completed');
                    item.innerHTML += `<div class="req-status">${t('ui.completed')}</div>`;
                } else if (req.status === 'constructing') {
                    item.innerHTML += `<button class="make-btn" disabled>${t('ui.constructing')}</button>`;
                } else if (req.type === 'build' && req.status === 'active') {
                    if (this.gameManager.canAfford(req.target)) {
                        const makeBtn = document.createElement('button');
                        makeBtn.className = 'make-btn';
                        makeBtn.textContent = t('ui.make');
                        makeBtn.onclick = () => {
                            this.gameManager.constructBuilding(req.target);
                        };
                        item.appendChild(makeBtn);
                    }
                }

                reqPanel.appendChild(item);
            });
            if (this.gameManager.activeRequests.length === 0) {
                reqPanel.innerHTML += `<div class="no-req">${t('ui.no_requests')}</div>`;
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
                        <div style="font-size:0.7em">${t('ui.returning')}</div>
                        <div class="explore-icon"><i class="${type.icon} icon-${type.id}"></i></div>
                        <div class="explore-cost">${remaining}s</div>
                    `;
                    btn.disabled = true;
                } else {
                    btn.innerHTML = `
                        <div class="explore-icon"><i class="${type.icon} icon-${type.id}"></i></div>
                        <div class="explore-cost"><i class="ra ra-gold-bar icon-solidi"></i> ${type.cost}</div>
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
        overlay.id = 'building-modal'; // ID for easier updates

        const renderModalContent = () => {
            const b = this.gameManager.buildings.find(build => build.id === buildingId);
            if (!b) return; // Should not happen

            // Re-calculate visual data
            const currentWorkers = b.workers || 0;
            const maxWorkers = def.workerSlots || 0;

            let workerSection = '';
            if (maxWorkers > 0) {
                workerSection = `
                    <div style="margin: 20px 0; border-top: 1px solid #444; padding-top: 10px;">
                        <h3>${t('ui.workers')} (${currentWorkers}/${maxWorkers})</h3>
                        <p style="font-size: 0.9em; color: #aaa;">
                            ${t('ui.bonus_per_worker', { amount: def.workerProduction?.food || 0, res: t('res.food') })} 
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                            <button id="assign-worker" class="btn primary-btn" ${currentWorkers >= maxWorkers ? 'disabled' : ''}>
                                + ${t('ui.assign')}
                            </button>
                            <button id="remove-worker" class="btn close-btn" ${currentWorkers <= 0 ? 'disabled' : ''}>
                                - ${t('ui.unassign')}
                            </button>
                        </div>
                    </div>
                `;
            }

            overlay.innerHTML = `
            <div class="modal-content" style="width: 400px; text-align: center;">
                <h2>${t(def.name)} (${t('ui.level')} ${b.level || 1})</h2>
                <p>${t(def.description)}</p>
                
                ${workerSection}

                <div style="margin: 20px 0; text-align: left; border-top: 1px solid #444; padding-top: 10px;">
                    <h3>${t('ui.upgrade_to')} ${nextLevel}</h3>
                    <p><strong>${t('ui.production')}:</strong> +50%</p>
                    <p><strong>${t('ui.xp_reward')}:</strong> 10 XP</p>
                    <div class="cost-list">
                        ${cost.solidi > 0 ? `<div><i class="ra ra-gold-bar icon-solidi"></i> ${cost.solidi} ${t('res.solidi')}</div>` : ''}
                        ${cost.wood > 0 ? `<div><i class="ra ra-pine-tree icon-wood"></i> ${cost.wood} ${t('res.wood')}</div>` : ''}
                        ${cost.stone > 0 ? `<div><i class="ra ra-cubes icon-stone"></i> ${cost.stone} ${t('res.stone')}</div>` : ''}
                        ${cost.iron > 0 ? `<div><i class="ra ra-mining-diamonds icon-iron"></i> ${cost.iron} ${t('res.iron')}</div>` : ''}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="confirm-upgrade" class="btn primary-btn">${t('ui.upgrade')}</button>
                    <button id="cancel-upgrade" class="btn close-btn">${t('ui.cancel')}</button>
                </div>
            </div>
            `;

            // Re-attach listeners after innerHTML update
            overlay.querySelector('#confirm-upgrade').onclick = () => {
                const success = this.gameManager.upgradeBuilding(buildingId);
                if (success) {
                    document.body.removeChild(overlay);
                } else {
                    alert(t('ui.not_enough_resources'));
                }
            };
            overlay.querySelector('#cancel-upgrade').onclick = () => {
                if (document.body.contains(overlay)) document.body.removeChild(overlay);
            };

            if (maxWorkers > 0) {
                const assignBtn = overlay.querySelector('#assign-worker');
                if (assignBtn) {
                    assignBtn.onclick = () => {
                        this.gameManager.assignWorker(buildingId);
                        renderModalContent(); // Re-render to show new count
                    };
                }
                const removeBtn = overlay.querySelector('#remove-worker');
                if (removeBtn) {
                    removeBtn.onclick = () => {
                        this.gameManager.removeWorker(buildingId);
                        renderModalContent();
                    };
                }
            }
        };

        renderModalContent();

        document.body.appendChild(overlay);


    }

    showArmyUI() {
        // Switch to 3D Army View
        this.gameManager.sceneManager.switchToArmy(this.gameManager.armyManager.grid);

        // Hide City UI Elements
        const reqPanel = document.getElementById('requests-panel');
        if (reqPanel) reqPanel.style.display = 'none';

        // FORCE CLOSE QUEST LOG & REQUESTS PANEL
        this.closeQuestLog();

        if (this.requestsPanel) {
            this.requestsPanel.style.display = 'none';
        }

        const explorePanel = document.querySelector('.exploration-panel');
        if (explorePanel) explorePanel.style.display = 'none';

        const bottomContainer = document.querySelector('.bottom-container');
        if (bottomContainer) bottomContainer.style.display = 'none';

        const armyBtn = document.querySelector('.army-btn');
        if (armyBtn) armyBtn.style.display = 'none';

        // Hide HUD Buttons (Requests & Quests)
        if (this.hudButtons) this.hudButtons.style.display = 'none';


        // Setup DOM Overlay for Army HUD
        const overlay = document.createElement('div');
        overlay.className = 'army-hud';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none'; // Click through to 3D

        // --- Header Container (Center) ---
        const headerContainer = document.createElement('div');
        headerContainer.style.position = 'absolute';
        headerContainer.style.top = '20px';
        headerContainer.style.left = '50%';
        headerContainer.style.transform = 'translateX(-50%)';
        headerContainer.style.display = 'flex';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.gap = '20px';
        headerContainer.style.pointerEvents = 'auto';
        overlay.appendChild(headerContainer);

        // Army Value Display
        const valDisplay = document.createElement('h3');
        valDisplay.id = 'army-value-display';
        valDisplay.textContent = `${t('ui.army_power')}: ${this.gameManager.armyManager.armyValue}`;
        valDisplay.style.color = 'white';
        valDisplay.style.margin = '0';
        valDisplay.style.textShadow = '2px 2px 4px black';
        valDisplay.style.fontSize = '1.5em';
        headerContainer.appendChild(valDisplay);

        // Back Button (Return to City)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-army-btn';
        closeBtn.innerHTML = '<i class="ra ra-tower"></i>'; // Verified icon
        closeBtn.title = t('ui.back_city');
        closeBtn.style.padding = '10px';
        closeBtn.style.fontSize = '1.5em';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.background = 'rgba(0,0,0,0.6)';
        closeBtn.style.color = 'white';
        closeBtn.style.border = '2px solid #fff';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.width = '50px';
        closeBtn.style.height = '50px';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.onclick = () => {
            // Restore UI
            if (reqPanel) reqPanel.style.display = '';
            if (explorePanel) explorePanel.style.display = '';
            if (bottomContainer) bottomContainer.style.display = '';
            if (armyBtn) armyBtn.style.display = '';
            // Restore HUD Buttons
            if (this.hudButtons) this.hudButtons.style.display = '';

            document.body.removeChild(overlay);
            this.gameManager.sceneManager.switchToCity();
            this.armyOverlay = null;
        };
        headerContainer.appendChild(closeBtn);


        // --- Fight Button (Top Right) ---
        const fightBtn = document.createElement('button');
        fightBtn.className = 'fight-btn';
        fightBtn.innerHTML = `${t('ui.fight')} <i class="ra ra-crossed-swords"></i>`;
        fightBtn.style.position = 'absolute';
        fightBtn.style.top = '20px';
        fightBtn.style.right = '20px';
        fightBtn.style.pointerEvents = 'auto';
        fightBtn.style.padding = '12px 24px';
        fightBtn.style.fontSize = '1.2em';
        fightBtn.style.background = 'linear-gradient(45deg, #d32f2f, #b71c1c)';
        fightBtn.style.color = 'white';
        fightBtn.style.border = '2px solid #fff';
        fightBtn.style.borderRadius = '10px';
        fightBtn.style.cursor = 'pointer';
        fightBtn.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        fightBtn.onclick = () => {
            this.startBattle(); // Ensure this method exists!
        };
        overlay.appendChild(fightBtn);

        // Shop Container (Bottom - Fixed)
        const shopContainer = document.createElement('div');
        shopContainer.className = 'army-shop';
        shopContainer.style.pointerEvents = 'auto';
        shopContainer.style.position = 'absolute';
        shopContainer.style.bottom = '20px';
        shopContainer.style.left = '50%';
        shopContainer.style.transform = 'translateX(-50%)';
        shopContainer.style.display = 'flex';
        shopContainer.style.gap = '15px';
        shopContainer.style.background = 'rgba(0,0,0,0.6)';
        shopContainer.style.padding = '15px';
        shopContainer.style.borderRadius = '15px';
        overlay.appendChild(shopContainer);

        document.body.appendChild(overlay);
        this.armyOverlay = overlay;

        this.renderShop(shopContainer);

        // Hook up 3D Scene callbacks
        this.gameManager.sceneManager.onArmyDragDrop = (fromR, fromC, toR, toC) => {
            this.handleArmyDrag(fromR, fromC, toR, toC);
        };
    }

    // --- BATTLE UI ---

    showBattleUI() {
        this.clear();
        this.currentScreen = 'battle';
        this.container.style.pointerEvents = 'none'; // Click through to canvas

        // Battle UI Container (Left Side)
        const battlePanel = document.createElement('div');
        battlePanel.className = 'battle-panel';
        battlePanel.style.position = 'absolute';
        battlePanel.style.left = '20px';
        battlePanel.style.top = '50%';
        battlePanel.style.transform = 'translateY(-50%)';
        battlePanel.style.display = 'flex';
        battlePanel.style.flexDirection = 'column';
        battlePanel.style.gap = '15px';
        battlePanel.style.pointerEvents = 'auto'; // Enable clicks on buttons

        Object.values(SPELLS).forEach(spell => {
            const btnContainer = document.createElement('div');
            btnContainer.style.position = 'relative';
            btnContainer.style.width = '60px';
            btnContainer.style.height = '60px';

            const btn = document.createElement('button');
            btn.className = 'spell-btn'; // We'll add some CSS later or inline it
            btn.innerHTML = `<i class="${spell.icon}"></i>`;
            btn.title = `${t(spell.name)}: ${t(spell.desc)}`;
            btn.style.width = '100%';
            btn.style.height = '100%';
            btn.style.borderRadius = '50%';
            btn.style.border = `2px solid #${spell.color.toString(16)}`;
            btn.style.background = 'rgba(0,0,0,0.7)';
            btn.style.color = '#fff';
            btn.style.fontSize = '24px';
            btn.style.cursor = 'pointer';
            btn.style.overflow = 'hidden';
            btn.style.position = 'relative';

            // Cooldown Overlay
            const cdOverlay = document.createElement('div');
            cdOverlay.className = 'cd-overlay';
            cdOverlay.id = `cd-${spell.id}`;
            cdOverlay.style.position = 'absolute';
            cdOverlay.style.bottom = '0';
            cdOverlay.style.left = '0';
            cdOverlay.style.width = '100%';
            cdOverlay.style.height = '0%';
            cdOverlay.style.background = 'rgba(0,0,0,0.8)';
            cdOverlay.style.pointerEvents = 'none';
            cdOverlay.style.transition = 'height 0.1s linear';

            btn.appendChild(cdOverlay);

            btn.onclick = () => {
                const success = this.gameManager.sceneManager.activateSpell(spell.id);
                if (success) {
                    // Visual feedback (click)
                    btn.style.transform = 'scale(0.9)';
                    setTimeout(() => btn.style.transform = 'scale(1)', 100);
                }
            };

            btnContainer.appendChild(btn);
            battlePanel.appendChild(btnContainer);
        });

        this.container.appendChild(battlePanel);

        // Start UI Update Loop for Cooldowns
        if (this.battleInterval) clearInterval(this.battleInterval);
        this.battleInterval = setInterval(() => this.updateBattleUI(), 100);
    }

    hideBattleUI() {
        if (this.battleInterval) {
            clearInterval(this.battleInterval);
            this.battleInterval = null;
        }
        this.showGameUI(); // Return to Game UI
    }

    updateBattleUI() {
        const sm = this.gameManager.sceneManager;
        if (sm.mode !== 'BATTLE') return;

        const spellState = sm.spellState || {};
        const now = Date.now();

        Object.values(SPELLS).forEach(spell => {
            const overlay = document.getElementById(`cd-${spell.id}`);
            if (overlay) {
                const state = spellState[spell.id];
                if (state && state.readyTime > now) {
                    const remaining = state.readyTime - now;
                    const pct = (remaining / spell.cooldown) * 100;
                    overlay.style.height = `${pct}%`;
                } else {
                    overlay.style.height = '0%';
                }
            }
        });
    }

    renderShop(container) {
        Object.values(UNIT_TYPES).forEach(type => {
            const item = document.createElement('div');
            item.className = 'shop-item';

            // Icon Container
            const iconDiv = document.createElement('div');
            iconDiv.style.fontSize = '2em';

            const iconI = document.createElement('i');
            // Ensure we have a valid icon class, fallback to sword if missing (debug)
            iconI.className = type.icon || 'ra ra-sword';
            iconDiv.appendChild(iconI);

            // Name
            const nameDiv = document.createElement('div');
            nameDiv.style.fontWeight = 'bold';
            nameDiv.textContent = t(type.name);

            // Cost
            const costDiv = document.createElement('div');
            costDiv.style.color = 'gold';
            costDiv.innerHTML = `<i class="ra ra-gold-bar"></i> ${type.cost}`;

            // Stats
            const statsDiv = document.createElement('div');
            statsDiv.style.fontSize = '0.8em';
            statsDiv.style.color = '#aaa';
            statsDiv.textContent = `${t('ui.attack')}: ${type.stats.attack}`;

            item.appendChild(iconDiv);
            item.appendChild(nameDiv);
            item.appendChild(costDiv);
            item.appendChild(statsDiv);

            item.onclick = () => {
                const bought = this.gameManager.armyManager.buyUnit(type.id);
                if (bought) {
                    // Refresh 3D View
                    this.gameManager.sceneManager.rebuildArmyScene(this.gameManager.armyManager.grid);
                    this.updateArmyValue();
                } else {
                    item.style.backgroundColor = 'red';
                    setTimeout(() => item.style.backgroundColor = '', 200);
                }
            };
            container.appendChild(item);
        });
    }

    handleArmyDrag(fromR, fromC, toR, toC) {
        if (fromR === toR && fromC === toC) return;

        const success = this.gameManager.armyManager.moveUnit(fromR, fromC, toR, toC);
        if (success) {
            this.gameManager.sceneManager.rebuildArmyScene(this.gameManager.armyManager.grid);
            this.updateArmyValue();
        }
    }

    updateArmyValue() {
        if (this.armyOverlay) {
            const valDisplay = this.armyOverlay.querySelector('#army-value-display');
            if (valDisplay) valDisplay.textContent = `Army Power: ${this.gameManager.armyManager.armyValue}`;
        }
    }

    // --- Quest UI & Requests UI ---

    toggleRequests() {
        if (this.requestsPanel.style.display === 'none') {
            this.requestsPanel.style.display = 'block';
            // Close Quest Log if open
            if (this.questLogOverlay) {
                this.questLogOverlay.remove();
                this.questLogOverlay = null;
            }
        } else {
            this.requestsPanel.style.display = 'none';
        }
    }

    toggleQuestLog() {
        if (this.questLogOverlay) {
            this.closeQuestLog();
        } else {
            this.showQuestLog();
            // Close Requests Panel
            if (this.requestsPanel) {
                this.requestsPanel.style.display = 'none';
            }
        }
    }

    closeQuestLog() {
        if (this.questLogOverlay) {
            this.questLogOverlay.remove();
            this.questLogOverlay = null;
        }
        if (this.questUiInterval) {
            clearInterval(this.questUiInterval);
            this.questUiInterval = null;
        }
    }

    showQuestLog() {
        // Clear any existing
        this.closeQuestLog();

        const overlay = document.createElement('div');
        overlay.className = 'quest-log-overlay ui-element';

        // Initial render
        this.renderQuestContent(overlay);

        this.container.appendChild(overlay);
        this.questLogOverlay = overlay;

        // Auto-refresh every 2 seconds
        this.questUiInterval = setInterval(() => {
            if (this.questLogOverlay) {
                // Force check conditions
                this.gameManager.questManager.update();
                // Re-render
                this.renderQuestContent(this.questLogOverlay);
            } else {
                this.closeQuestLog();
            }
        }, 2000);
    }

    renderQuestContent(overlay) {
        if (!overlay) return;
        const qm = this.gameManager.questManager;
        const quest = qm.activeQuest;

        let content = '';
        if (!quest) {
            content = '<div class="quest-none">No active quests. You have conquered all challenges!</div>';
        } else {
            const subQuestsHtml = quest.subQuests.map(sq => {
                const isDone = qm.isSubQuestCompleted(sq.id);
                // Force re-check for UI state
                const canComplete = !isDone && qm.checkCondition(sq);

                let actionBtn = '';
                if (!isDone) {
                    if (sq.type === 'RESOURCE') {
                        actionBtn = `<button class="quest-action-btn" ${canComplete ? '' : 'disabled'} onclick="window.game.uiManager.handleQuestAction('${sq.id}')">Donate</button>`;
                    } else if (sq.type === 'BATTLE' || sq.type === 'MONSTER') {
                        actionBtn = `<button class="quest-action-btn battle" onclick="window.game.uiManager.handleQuestAction('${sq.id}')">Fight</button>`;
                    } else if (sq.type === 'CHECK') {
                        actionBtn = `<button class="quest-action-btn" ${canComplete ? '' : 'disabled'} onclick="window.game.uiManager.handleQuestAction('${sq.id}')">Check</button>`;
                    }
                }

                return `
                    <div class="sub-quest-item ${isDone ? 'completed' : ''}">
                        <div class="sq-text">
                            <i class="${isDone ? 'ra ra-checkbox-tree' : 'ra ra-checkbox-unchecked'}"></i>
                            ${t(sq.text, sq.textParams)}
                        </div>
                        <div class="sq-reward">${t('ui.reward')}: ${this.formatReward(sq.reward)}</div>
                        <div class="sq-action">
                            ${isDone ? '<span class="sq-done-text">' + t('ui.done') + '</span>' : actionBtn}
                        </div>
                    </div>
                `;
            }).join('');

            content = `
                <div class="quest-header">
                    <h2>${t('ui.quests')}</h2>
                </div>
                <div class="quest-rewards-main">
                    ${t('ui.completed')}: ${this.formatReward(quest.rewards)}
                </div>
                <div class="sub-quests-list">
                    ${subQuestsHtml}
                </div>
            `;
        }

        // We replace the inner content wrapper if it exists, or create full structure
        // But since we are likely updating, let's just wipe and set innerHTML of overlay
        overlay.innerHTML = `
            <div class="quest-log-paper">
                <div class="quest-content">
                    ${content}
                </div>
            </div>
        `;
    }

    formatReward(reward) {
        if (!reward) return '';
        let str = [];
        if (reward.solidi) str.push(`${reward.solidi} Solidi`);
        if (reward.exp) str.push(`${reward.exp} XP`);
        if (reward.item) str.push(`${reward.item}`);
        if (reward.wood) str.push(`${reward.wood} Wood`);
        if (reward.stone) str.push(`${reward.stone} Stone`);
        if (reward.iron) str.push(`${reward.iron} Iron`);
        if (reward.food) str.push(`${reward.food} Food`);
        return str.join(', ');
    }

    handleQuestAction(subQuestId) {
        const qm = this.gameManager.questManager;
        const sq = qm.activeQuest.subQuests.find(s => s.id === subQuestId);

        if (sq.type === 'BATTLE' || sq.type === 'MONSTER') {
            // Trigger Battle
            // Close Quest Log
            this.toggleQuestLog();
            qm.startBattleForQuest(subQuestId);
        } else {
            // Instant completion (Resource or Check)
            const success = qm.completeSubQuest(subQuestId);
            if (success) {
                // UI update automatically triggered via updateQuestUI -> but since we are inside the log, we might want to refresh it locally
                this.updateQuestUI();
            } else {
                // Show feedback?
                alert(t('ui.req_not_met'));
            }
        }
    }

    updateQuestUI() {
        // Redraw log if open
        if (this.questLogOverlay) {
            this.questLogOverlay.remove();
            this.questLogOverlay = null;
            this.showQuestLog();
        }
        this.updateQuestIcon();
    }

    updateQuestIcon() {
        if (this.questBtn) {
            const hasAvailable = this.gameManager.questManager.activeQuest?.subQuests.some(sq =>
                !this.gameManager.questManager.isSubQuestCompleted(sq.id) &&
                this.gameManager.questManager.checkCondition(sq)
            );

            if (hasAvailable) {
                this.questBtn.classList.add('has-update');
            } else {
                this.questBtn.classList.remove('has-update');
            }
        }
    }

    startBattle() {
        // 1. Prepare Data
        // Flatten army grid into list
        const armyList = this.gameManager.armyManager.getAllUnits();

        if (armyList.length === 0) {
            alert(t('ui.recruit_first'));
            return;
        }

        // Generate Enemy Army (Simpler version of previous logic)
        const totalPower = this.gameManager.armyManager.armyValue;
        const enemyList = [];
        let enemyPower = 0;

        // Ensure at least 1 enemy
        while (enemyPower < totalPower * 0.8 || enemyList.length < 1) {
            const types = Object.keys(UNIT_TYPES);
            const type = types[Math.floor(Math.random() * types.length)];
            const def = UNIT_TYPES[type];
            enemyList.push({
                ...def,
                level: 1, // Basic enemies for now
                stats: def.stats // Pass stats directly
            });
            enemyPower += def.stats.attack + def.stats.health;
            if (enemyPower > totalPower * 1.5) break;
        }

        // 2. Clear UI Overlay
        if (this.armyOverlay) {
            document.body.removeChild(this.armyOverlay);
            this.armyOverlay = null; // Clear ref
        }

        // 3. Switch Scene
        this.gameManager.sceneManager.switchToBattle(armyList, enemyList, (victory, deadUnits) => {
            this.endBattle(victory, deadUnits);
        });

        // 4. Show Battle HUD
        this.showBattleHUD();
    }

    showBattleHUD() {
        const overlay = document.createElement('div');
        overlay.className = 'battle-hud';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';

        const retreatBtn = document.createElement('button');
        retreatBtn.textContent = t('ui.retreat');
        retreatBtn.className = 'btn close-btn';
        retreatBtn.style.pointerEvents = 'auto';
        retreatBtn.style.position = 'absolute';
        retreatBtn.style.top = '20px';
        retreatBtn.style.right = '20px';
        retreatBtn.onclick = () => {
            this.gameManager.sceneManager.battleOver = true; // Force stop
            // Treat as defeat or just end? Let's say defeat for now if retreat
            // Also need to capture current state if possible, but simplest is 
            // just to accept current casualties.
            const deadUnits = this.gameManager.sceneManager.combatants
                .filter(c => c.side === 'player' && c.hp <= 0)
                .map(c => c.data);
            this.endBattle(false, deadUnits);
        };
        overlay.appendChild(retreatBtn);

        document.body.appendChild(overlay);
        this.battleOverlay = overlay;
    }

    endBattle(victory, deadUnits = []) {
        if (this.battleOverlay) {
            document.body.removeChild(this.battleOverlay);
            this.battleOverlay = null;
        }

        // Process Casualties
        if (deadUnits.length > 0) {
            console.log(`Lost ${deadUnits.length} units in battle.`);
            deadUnits.forEach(u => {
                // Remove from Army Grid
                // We need the original coordinates. 
                // The 'data' object passed back is the original unit object from ArmyManager
                this.gameManager.armyManager.removeUnit(u.r, u.c);
            });
        }

        if (victory) {
            // alert(`VICTORY! You earned 500 Solidi! \nLost Units: ${deadUnits.length}`);
            this.gameManager.resources.solidi += 500;
            this.gameManager.notify(); // Update resources
            this.showPopup(`<strong>${t('ui.victory')}</strong><br>${t('ui.victory_msg')}<br>${t('ui.lost_units')} ${deadUnits.length}`, () => {
                this.showArmyUI();
            });
        } else {
            // alert(`DEFEAT! Regroup and try again. \nLost Units: ${deadUnits.length}`);
            this.showPopup(`<strong>${t('ui.defeat')}</strong><br>${t('ui.defeat_msg')}<br>${t('ui.lost_units')} ${deadUnits.length}`, () => {
                this.showArmyUI();
            });
        }
    }

    // --- Custom Popup System ---
    showPopup(message, onConfirm = null) {
        console.log("UIManager: showPopup called with message:", message);

        // Remove existing if any
        if (this.currentPopup) {
            this.currentPopup.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay ui-element';
        // Inline styles to bypass potential CSS cache issues
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000'; // Very high z-index

        const box = document.createElement('div');
        box.className = 'popup-box';
        box.style.background = '#1a1a1a';
        box.style.border = '2px solid #ffd700';
        box.style.padding = '20px';
        box.style.borderRadius = '10px';
        box.style.textAlign = 'center';
        box.style.color = 'white';
        box.style.minWidth = '300px';

        const msg = document.createElement('div');
        msg.className = 'popup-message';
        msg.style.marginBottom = '20px';
        msg.style.fontSize = '1.2em';
        // Allow HTML for bolding keywords etc
        msg.innerHTML = message;

        const btn = document.createElement('button');
        btn.className = 'popup-btn';
        btn.textContent = 'OK';
        btn.style.padding = '10px 30px';
        btn.style.fontSize = '1.1em';
        btn.style.cursor = 'pointer';

        btn.onclick = () => {
            console.log("UIManager: Popup OK clicked");
            overlay.remove();
            this.currentPopup = null;
            if (onConfirm) onConfirm();
        };

        box.appendChild(msg);
        box.appendChild(btn);
        overlay.appendChild(box);
        this.container.appendChild(overlay);

        console.log("UIManager: Popup appended to container", this.container);
        this.currentPopup = overlay;
    }
}
