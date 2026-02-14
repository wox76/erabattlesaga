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
        this.showSelectionScreen();
    }

    clear() {
        this.container.innerHTML = '';
    }

    showSelectionScreen() {
        this.clear();
        this.currentScreen = 'selection';

        // Ensure pointer events are auto for interaction
        this.container.style.pointerEvents = 'auto';

        if (this.currentGeneralIndex === undefined) {
            this.currentGeneralIndex = 0;
        }

        const screen = document.createElement('div');
        screen.className = 'selection-screen slider-mode';

        // Slider Container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        // Navigation Buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-nav prev';
        prevBtn.innerHTML = '&#10094;'; // Left Arrow
        prevBtn.onclick = () => this.prevGeneral();

        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-nav next';
        nextBtn.innerHTML = '&#10095;'; // Right Arrow
        nextBtn.onclick = () => this.nextGeneral();

        // Current General Content
        const general = GENERALS[this.currentGeneralIndex];

        const content = document.createElement('div');
        content.className = 'slider-content';

        const img = document.createElement('img');
        img.src = general.image;
        img.className = 'slider-image';

        const info = document.createElement('div');
        info.className = 'slider-info';

        const name = document.createElement('h1');
        name.textContent = general.name;

        const desc = document.createElement('p');
        desc.className = 'slider-desc';
        desc.textContent = general.description;

        const bonus = document.createElement('div');
        bonus.className = 'slider-bonus';
        // Format bonus text nicely
        const bonusText = Object.entries(general.bonus)
            .map(([key, val]) => `${key.toUpperCase()}: ${val > 1 ? '+' + Math.round((val - 1) * 100) + '%' : Math.round((val - 1) * 100) + '%'}`)
            .join(' | ');
        bonus.textContent = bonusText;

        const selectBtn = document.createElement('button');
        selectBtn.className = 'select-btn';
        selectBtn.textContent = 'START REIGN';
        selectBtn.onclick = () => {
            this.gameManager.selectGeneral(general.id);
            this.showGameUI();
        };

        info.appendChild(name);
        info.appendChild(desc);
        info.appendChild(bonus);
        info.appendChild(selectBtn);

        content.appendChild(img);
        content.appendChild(info);

        sliderContainer.appendChild(prevBtn);
        sliderContainer.appendChild(content);
        sliderContainer.appendChild(nextBtn);

        screen.appendChild(sliderContainer);
        this.container.appendChild(screen);
    }

    prevGeneral() {
        this.currentGeneralIndex--;
        if (this.currentGeneralIndex < 0) this.currentGeneralIndex = GENERALS.length - 1;
        this.showSelectionScreen();
    }

    nextGeneral() {
        this.currentGeneralIndex++;
        if (this.currentGeneralIndex >= GENERALS.length) this.currentGeneralIndex = 0;
        this.showSelectionScreen();
    }

    showGameUI() {
        this.clear();
        this.currentScreen = 'game';
        this.container.style.pointerEvents = 'none'; // Passthrough for 3D controls

        // === HUD Top Left: General Info ===
        const generalPanel = document.createElement('div');
        generalPanel.className = 'general-panel ui-element';

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
        explorationPanel.innerHTML = '<h3>Scouts</h3>';

        Object.values(EXPLORATION_TYPES).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'explore-btn';
            btn.id = `explore-${type.id}`;
            btn.innerHTML = `${type.name} (Cost: ${type.cost} S)`;
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

    update() {
        if (this.currentScreen !== 'game') return;

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
                // ... same logic as before ...
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
                    btn.textContent = `Scout returning in ${remaining}s`;
                    btn.disabled = true;
                } else {
                    btn.innerHTML = `${type.name} <br> (Cost: ${type.cost} S)`;
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
}
