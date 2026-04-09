// ============================================================
//  TOTAL BATTLE WAR  —  City View
// ============================================================

'use strict';

const CityView = {
    activePanel: null,
    selectedSlot: null,

    init() {
        this.render();
        Game.on('tick', () => this.onTick());
        Game.on('buildQueueChanged', () => this.refreshQueueBar());
        Game.on('buildComplete', () => { this.render(); this.refreshQueueBar(); });
    },

    render() {
        const container = document.getElementById('city-buildings');
        if (!container) return;
        container.innerHTML = '';

        const castleContainer = document.createElement('div');
        castleContainer.className = 'castle-container';
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'buildings-grid';

        CITY_SLOTS.forEach(slot => {
            const bData = Game.state.buildings[slot.id];
            const inQueue = Game.state.buildQueue.find(q => q.slotId === slot.id);

            const el = document.createElement('div');
            el.className = 'building-slot' + (bData ? ' built' : ' empty') + (inQueue ? ' in-progress' : '');
            el.id = slot.id;

            if (bData) {
                const bDef = BUILDINGS[bData.buildingId];
                const maxLevel = Game.getBuildingMaxLevel(bData.buildingId);
                const iconHtml = bDef.icon.includes('/') 
                ? `<img src="${bDef.icon}" class="building-img" alt="${bDef.name}">`
                : bDef.icon;

              el.innerHTML = `
          <div class="building-icon">${iconHtml}</div>
          <div class="building-label">${bDef.name}</div>
          <div class="building-level ${bData.level >= maxLevel ? 'max' : ''}">Lv ${bData.level}</div>
          ${inQueue ? '<div class="building-constructing">🔨</div>' : ''}
        `;
            } else {
                el.innerHTML = `<div class="building-icon empty-icon">➕</div><div class="building-label">Costruisci</div>`;
            }

            el.addEventListener('click', () => this.openPanel(slot));
            
            if (slot.id === 'slot_castle') {
                castleContainer.appendChild(el);
            } else {
                gridContainer.appendChild(el);
            }
        });

        container.appendChild(castleContainer);
        container.appendChild(gridContainer);
        
        this.refreshQueueBar();
    },

    onTick() {
        this.refreshQueueBar();
        // Update progress on constructing slots
        Game.state.buildQueue.forEach(q => {
            const el = document.getElementById(q.slotId);
            if (el) {
                const remaining = Math.max(0, q.finishAt - Date.now()) / 1000;
                const cd = el.querySelector('.building-constructing');
                if (cd) cd.title = Game.formatTime(remaining);
            }
        });
    },

    refreshQueueBar() {
        const bar = document.getElementById('build-queue-bar');
        if (!bar) return;
        const q = Game.state.buildQueue[0];
        if (!q) {
            bar.classList.add('hidden');
            return;
        }
        bar.classList.remove('hidden');
        const bDef = BUILDINGS[q.buildingId];
        const remaining = Math.max(0, q.finishAt - Date.now()) / 1000;
        const total = (q.finishAt - (q.finishAt - Game.state.stats.totalBuildTime * 1000)) || 1;
      const iconHtml = bDef && bDef.icon.includes('/')
        ? `<img src="${bDef.icon}" class="queue-img" alt="${bDef.name}">`
        : (bDef ? bDef.icon : '🔨');

        bar.innerHTML = `
      <div class="queue-info">
        <span class="queue-icon">${iconHtml}</span>
        <span class="queue-text">${bDef ? bDef.name : ''} → Lv ${q.toLevel}</span>
        <span class="queue-time" id="queue-countdown">${Game.formatTime(remaining)}</span>
        <button class="queue-instant-btn" onclick="CityView.instantComplete('${q.slotId}')">⚡</button>
      </div>
      <div class="queue-progress-bar"><div class="queue-progress-fill" id="queue-fill"></div></div>
    `;
    },

    instantComplete(slotId) {
        const q = Game.state.buildQueue.find(qi => qi.slotId === slotId);
        if (!q) return;
        const remSec = Math.max(0, q.finishAt - Date.now()) / 1000;
        let gems = Math.max(1, Math.ceil(remSec / 60));
        let btnText = `⚡ Completa per ${gems} Gemme`;

        if (Game.state.testingMode) {
            gems = 0;
            btnText = `⚡ Completa GRATIS (Testing Mode)`;
        }

        Modal.show('Completamento Istantaneo', `
            <div class="center">
                <p style="margin-bottom:20px; color:var(--text-muted)">Vuoi completare la costruzione istantaneamente e sbloccare subito i bonus dell'edificio?</p>
                <button class="btn btn-upgrade" onclick="CityView.confirmInstant('${slotId}')">
                    ${btnText}
                </button>
            </div>
        `);
    },

    confirmInstant(slotId) {
        const res = Game.instantComplete(slotId);
        if (res.ok) {
            Modal.close();
            this.render();
            // Force refresh city view elements if needed
            const slotEl = document.getElementById(slotId);
            if (slotEl) slotEl.classList.remove('building');
        } else {
            this.showToast(res.msg, 'error');
        }
    },

    // ---- Panels ------------------------------------------------
    openPanel(slot) {
        this.selectedSlot = slot;
        const bData = Game.state.buildings[slot.id];

        if (bData) {
            this.showBuildingPanel(slot, bData);
        } else {
            this.showBuildSelectPanel(slot);
        }
    },

    showBuildingPanel(slot, bData) {
        const bDef = BUILDINGS[bData.buildingId];
        const currentLevel = bData.level;
        const maxLevel = Game.getBuildingMaxLevel(bData.buildingId);
        const nextLevel = currentLevel + 1;
        const inQueue = Game.state.buildQueue.find(q => q.slotId === slot.id);

        let upgradeSection = '';
        if (currentLevel < maxLevel) {
            const nextLvlData = bDef.levelData[nextLevel - 1];
            const canAfford = Game.canAfford(nextLvlData.cost);
            const costHtml = this.renderCost(nextLvlData.cost);
            const timeStr = Game.formatTime(nextLvlData.buildTime);

            upgradeSection = `
        <div class="panel-section">
          <h3>Potenzia a Lv ${nextLevel}</h3>
          <div class="cost-row">${costHtml}</div>
          <div class="build-time">⏱ ${timeStr}</div>
          ${inQueue
                    ? `<button class="btn btn-disabled">In costruzione… (${Game.formatTime(Math.max(0, inQueue.finishAt - Date.now()) / 1000)})</button>`
                    : `<button class="btn btn-upgrade ${canAfford ? '' : 'btn-no-res'}" onclick="CityView.doUpgrade('${slot.id}', '${bData.buildingId}')">
                ${canAfford ? '🔨 Potenzia' : '❌ Risorse Insufficienti'}
               </button>`
                }
        </div>`;
        } else {
            upgradeSection = `<div class="panel-section max-level-label">Livello Massimo Raggiunto ✅</div>`;
        }

        let effectHtml = this.renderEffect(bDef, currentLevel);

        const iconHtml = bDef.icon.includes('/')
            ? `<img src="${bDef.icon}" class="panel-img" alt="${bDef.name}">`
            : bDef.icon;

        this.showPanel(`
      <div class="panel-header">
        <span class="panel-icon">${iconHtml}</span>
        <div>
          <h2>${bDef.name}</h2>
          <p class="panel-desc">${bDef.description}</p>
        </div>
      </div>
      <div class="panel-level-badge">Livello ${currentLevel} / ${maxLevel}</div>
      <div class="panel-section">
        <h3>Effetti Attuali</h3>
        ${effectHtml}
      </div>
      ${upgradeSection}
      ${this.renderManageButton(bData.buildingId)}
      ${bData.buildingId !== 'castle' 
        ? `<div class="panel-section" style="border-top:1px solid rgba(224, 74, 47, 0.2); margin-top:20px;">
             <button class="btn btn-upgrade" style="background:var(--ember); border-color:var(--ember-dark);" 
               onclick="CityView.doDemolish('${slot.id}')">
               🗑️ Distruggi Edificio
             </button>
           </div>` 
        : ''}
    `);
    },

    renderManageButton(id) {
        const mapping = {
            'barracks': { name: 'Esercito', view: 'army' },
            'stable': { name: 'Cavalleria', view: 'army' },
            'academy': { name: 'Ricerca', view: 'research' },
            'market': { name: 'Negozio', view: 'store' },
            'treasury': { name: 'Risorse', view: 'store' },
            'forge': { name: 'Fucina', view: 'forge' }
        };

        const target = mapping[id];
        if (!target) return '';

        return `
        <div class="panel-section">
          <button class="btn btn-upgrade" style="background:var(--blue); border-color:var(--blue-light);" 
            onclick="App.switchView('${target.view}'); CityView.closePanel();">
            🛡️ Gestisci ${target.name}
          </button>
        </div>`;
    },

    showBuildSelectPanel(slot) {
        // Find buildings that can be placed in any slot (non-unique ones already placed elsewhere, or unique ones not placed)
        const placed = Object.values(Game.state.buildings).map(b => b.buildingId);
        const available = Object.values(BUILDINGS).filter(bDef => {
            if (bDef.id === 'castle') return false; // castle can't be rebuilt
            if (bDef.unique && placed.includes(bDef.id)) return false;
            return true;
        });

        const castleLevel = Game.getCastleLevel();
        const itemsHtml = available.map(bDef => {
            const firstCost = bDef.levelData[0].cost;
            const canAfford = Game.canAfford(firstCost);
            const costHtml = this.renderCost(firstCost);
            const iconHtml = bDef.icon.includes('/')
                ? `<img src="${bDef.icon}" class="bo-img" alt="${bDef.name}">`
                : bDef.icon;

            return `
        <div class="build-option ${canAfford ? 'can-afford' : 'cant-afford'}" onclick="CityView.doBuild('${slot.id}', '${bDef.id}')">
          <span class="bo-icon">${iconHtml}</span>
          <div class="bo-info">
            <span class="bo-name">${bDef.name}</span>
            <span class="bo-desc">${bDef.description}</span>
            <div class="bo-cost">${costHtml}</div>
          </div>
          <span class="bo-arrow">${canAfford ? '▶' : '🔒'}</span>
        </div>`;
        }).join('');

        this.showPanel(`
      <div class="panel-header">
        <span class="panel-icon">🏗️</span>
        <div><h2>Costruisci Edificio</h2><p class="panel-desc">Scegli cosa costruire in questo slot</p></div>
      </div>
      <div class="build-options-list">${itemsHtml}</div>
    `);
    },

    doBuild(slotId, buildingId) {
        const result = Game.startBuild(slotId, buildingId);
        if (!result.ok) {
            this.showToast(result.msg, 'error');
        } else {
            this.closePanel();
            this.render();
        }
    },

    doUpgrade(slotId, buildingId) {
        const result = Game.startBuild(slotId, buildingId);
        if (!result.ok) {
            this.showToast(result.msg, 'error');
        } else {
            this.closePanel();
            this.render();
        }
    },

    doDemolish(slotId) {
        if (confirm('Sei sicuro di voler distruggere questo edificio? Tutti i progressi e i livelli andranno perduti.')) {
            const res = Game.demolishBuilding(slotId);
            if (res.ok) {
                this.closePanel();
                this.render();
                this.showToast('Edificio distrutto.', 'info');
            } else {
                this.showToast(res.msg, 'error');
            }
        }
    },

    showPanel(html) {
        let panel = document.getElementById('city-panel');
        if (!panel) return;
        panel.innerHTML = `
      <div class="panel-close-row"><button class="panel-close-btn" onclick="CityView.closePanel()">✕</button></div>
      ${html}
    `;
        panel.classList.add('open');
        document.getElementById('panel-overlay').classList.add('active');
    },

    closePanel() {
        const panel = document.getElementById('city-panel');
        if (panel) panel.classList.remove('open');
        const overlay = document.getElementById('panel-overlay');
        if (overlay) overlay.classList.remove('active');
        this.selectedSlot = null;
    },

    // ---- Helpers -----------------------------------------------
    renderCost(cost) {
        const icons = { lumber: '🪵', iron: '⚙️', stone: '🪨', food: '🌾', silver: '💰' };
        return Object.entries(cost)
            .filter(([, v]) => v > 0)
            .map(([res, amt]) => {
                const have = Game.state.resources[res] || 0;
                const ok = Game.state.testingMode || (have >= amt);
                return `<span class="cost-item ${ok ? '' : 'cost-missing'}">${icons[res]} ${Game.formatNumber(amt)}</span>`;
            }).join('');
    },

    renderEffect(bDef, level) {
        const lvlData = bDef.levelData[level - 1];
        if (!lvlData) return '';
        const e = lvlData.effect;
        const lines = [];
        if (e.lumberPerHour) lines.push(`🪵 Legname: +${Game.formatNumber(e.lumberPerHour)}/h`);
        if (e.ironPerHour) lines.push(`⚙️ Ferro: +${Game.formatNumber(e.ironPerHour)}/h`);
        if (e.stonePerHour) lines.push(`🪨 Pietra: +${Game.formatNumber(e.stonePerHour)}/h`);
        if (e.foodPerHour) lines.push(`🌾 Cibo: +${Game.formatNumber(e.foodPerHour)}/h`);
        if (e.silverPerHour) lines.push(`💰 Argento: +${Game.formatNumber(e.silverPerHour)}/h`);
        if (e.storageMultiplier) lines.push(`📦 Capienza: ${(e.storageMultiplier * 100).toFixed(0)}%`);
        if (e.defenseBonus) lines.push(`🛡️ Difesa: +${e.defenseBonus}%`);
        if (e.healCapacity) lines.push(`⚕️ Letti: ${Game.formatNumber(e.healCapacity)}`);
        if (e.trainingSpeedBonus) lines.push(`⏩ Addestramento: +${e.trainingSpeedBonus}%`);
        if (e.researchSpeedBonus) lines.push(`📖 Ricerca: +${e.researchSpeedBonus}%`);
        if (e.constructionSpeedBonus) lines.push(`🔨 Costruzione: +${e.constructionSpeedBonus}%`);
        if (e.powerBonus) lines.push(`💪 Potere: +${e.powerBonus}`);
        if (e.tradeSlots) lines.push(`🔄 Slot Commercio: ${e.tradeSlots}`);
        if (!lines.length) return '<p class="muted">Nessun effetto speciale.</p>';
        return lines.map(l => `<div class="effect-line">${l}</div>`).join('');
    },

    showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
    }
};
