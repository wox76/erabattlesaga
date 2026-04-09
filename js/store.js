// ============================================================
//  TOTAL BATTLE WAR  —  Store View
// ============================================================

'use strict';

const StoreView = {
    activeTab: 'goods',
    activeCategory: null,

    init() {
        // nothing async needed
    },

    render() {
        const container = document.getElementById('store-content');
        if (!container) return;

        const gemBalance = Game.state.gems || 0;
        const silverBalance = Game.state.resources.silver || 0;

        const tabs = `
      <div class="store-currency-bar">
        <div class="curr-chip curr-silver">💰 ${Game.formatNumber(silverBalance)}</div>
        <div class="curr-chip curr-gems">💎 ${gemBalance}</div>
      </div>
      <div class="tab-bar store-tab-bar">
        <button class="tab-btn ${this.activeTab === 'goods' ? 'active' : ''}" onclick="StoreView.setTab('goods')">🎁 Merce</button>
        <button class="tab-btn ${this.activeTab === 'army' ? 'active' : ''}" onclick="StoreView.setTab('army')">⚔️ Esercito</button>
        <button class="tab-btn ${this.activeTab === 'generals' ? 'active' : ''}" onclick="StoreView.setTab('generals')">👑 Generali</button>
        <button class="tab-btn ${this.activeTab === 'equipment' ? 'active' : ''}" onclick="StoreView.setTab('equipment')">🛡️ Oggetti Generali</button>
        <button class="tab-btn ${this.activeTab === 'monsters' ? 'active' : ''}" onclick="StoreView.setTab('monsters')">🐉 Mostri</button>
      </div>`;

        let content = '';
        if (this.activeTab === 'goods') content = this.renderGoods();
        else if (this.activeTab === 'army') content = this.renderArmy();
        else if (this.activeTab === 'generals') content = this.renderGenerals();
        else if (this.activeTab === 'equipment') content = this.renderEquipment();
        else if (this.activeTab === 'monsters') content = this.renderMonsters();

        container.innerHTML = tabs + content;
    },

    setTab(tab, category = null) {
        this.activeTab = tab;
        this.activeCategory = category;
        this.render();
    },

    // ---- GOODS --------------------------------------------------
    renderGoods() {
        const categories = [...new Set(STORE_GOODS.map(g => g.category))];
        const active = this.activeCategory || categories[0];

        const catBar = `<div class="store-cat-bar">
      ${categories.map(c => `<button class="cat-btn ${c === active ? 'active' : ''}" onclick="StoreView.setCategory('${c}')">${c}</button>`).join('')}
    </div>`;

        const items = STORE_GOODS.filter(g => g.category === active).map(g => this.renderGoodCard(g)).join('');
        return catBar + `<div class="store-grid">${items}</div>`;
    },

    renderGoodCard(item) {
        const costHtml = this.renderCost(item.cost, item.gems);
        const canAfford = this.canAffordItem(item);
        const badgeHtml = item.badge ? `<div class="store-badge badge-${this.badgeClass(item.badge)}">${item.badge}</div>` : '';

        let givesHtml = '';
        if (item.gives?.resources) {
            givesHtml = Object.entries(item.gives.resources)
                .map(([r, v]) => `${this.resIcon(r)} ${Game.formatNumber(v)}`).join(' · ');
        } else if (item.gives?.speedUp) {
            givesHtml = `⚡ -${Game.formatTime(item.gives.speedUp)}`;
        } else if (item.gives?.gems) {
            givesHtml = `💎 +${item.gives.gems}`;
        } else if (item.gives?.boost) {
            givesHtml = `🚀 ${item.gives.boost.type}`;
        }

        return `
      <div class="store-card ${canAfford ? '' : 'store-card-locked'}">
        ${badgeHtml}
        <div class="sc-icon">${item.icon}</div>
        <div class="sc-name">${item.name}</div>
        <div class="sc-gives">${givesHtml}</div>
        <div class="sc-desc">${item.description}</div>
        <div class="sc-cost">${costHtml}</div>
        <button class="btn sc-buy-btn ${canAfford ? 'btn-buy' : 'btn-disabled'}"
          onclick="StoreView.buyItem('${item.id}')">
          ${canAfford ? 'Acquista' : '❌'}
        </button>
      </div>`;
    },

    // ---- ARMY packs --------------------------------------------
    renderArmy() {
        const categories = [...new Set(STORE_ARMY.map(g => g.category))];
        const active = this.activeCategory || categories[0];

        const catBar = `<div class="store-cat-bar">
      ${categories.map(c => `<button class="cat-btn ${c === active ? 'active' : ''}" onclick="StoreView.setCategory('${c}')">${c}</button>`).join('')}
    </div>`;

        const items = STORE_ARMY.filter(g => g.category === active).map(item => {
            const costHtml = this.renderCost(item.cost, item.gems);
            const canAfford = this.canAffordItem(item);
            const badgeHtml = item.badge ? `<div class="store-badge badge-${this.badgeClass(item.badge)}">${item.badge}</div>` : '';

            const troopsHtml = Object.entries(item.gives.troops)
                .map(([id, n]) => {
                    const t = TROOPS[id];
                    return `<span class="troop-give-chip">${t ? t.icon : '⚔️'} ${n}</span>`;
                }).join('');

            return `
        <div class="store-card army-card ${canAfford ? '' : 'store-card-locked'}">
          ${badgeHtml}
          <div class="sc-icon">${item.icon}</div>
          <div class="sc-name">${item.name}</div>
          <div class="sc-troops">${troopsHtml}</div>
          <div class="sc-desc">${item.description}</div>
          <div class="sc-cost">${costHtml}</div>
          <button class="btn sc-buy-btn ${canAfford ? 'btn-buy' : 'btn-disabled'}"
            onclick="StoreView.buyItem('${item.id}')">
            ${canAfford ? 'Ottieni' : '❌'}
          </button>
        </div>`;
        }).join('');

        return catBar + `<div class="store-grid">${items}</div>`;
    },

    // ---- GENERALS ----------------------------------------------
    renderGenerals() {
        const rarityOrder = { 'comune': 0, 'raro': 1, 'epico': 2, 'leggendario': 3 };
        const sorted = [...STORE_GENERALS].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        const owned = Game.state.generals || [];

        const cards = sorted.map(gen => {
            const isOwned = owned.includes(gen.id);
            const canAfford = !isOwned && this.canAffordItem(gen);
            const costHtml = this.renderCost(gen.cost, gen.gems);
            const badgeHtml = gen.badge ? `<div class="store-badge badge-${this.badgeClass(gen.badge)}">${gen.badge}</div>` : '';

            const statBar = (label, val) => {
                const w = Math.min(100, val);
                return `<div class="gen-stat-row"><span>${label}</span><div class="gen-stat-bar"><div style="width:${w}%"></div></div><span>${val}</span></div>`;
            };

            const skillsHtml = gen.skills.map(s =>
                `<li class="gen-skill-item">⚡ ${s}</li>`
            ).join('');

            return `
        <div class="store-card gen-card rarity-${gen.rarity} ${isOwned ? 'gen-owned' : ''}">
          ${badgeHtml}
          ${isOwned ? '<div class="gen-owned-badge">✅ Posseduto</div>' : ''}
          <div class="gen-portrait">${gen.icon}</div>
          <div class="gen-name">${gen.name}</div>
          <div class="gen-role-chip rarity-chip-${gen.rarity}">${gen.rarity.toUpperCase()} · ${gen.role}</div>
          <div class="gen-desc">${gen.description}</div>
          <div class="gen-passive">🔆 ${gen.passive}</div>
          <ul class="gen-skills">${skillsHtml}</ul>
          <div class="gen-stats">
            ${statBar('LDR', gen.stats.leadership)}
            ${statBar('ATK', gen.stats.attack)}
            ${statBar('DEF', gen.stats.defense)}
            ${statBar('VEL', gen.stats.speed)}
          </div>
          <div class="sc-cost">${costHtml}</div>
          <button class="btn sc-buy-btn ${isOwned ? 'btn-disabled' : canAfford ? 'btn-buy' : 'btn-disabled'}"
            onclick="StoreView.buyItem('${gen.id}')">
            ${isOwned ? '✅ Già tuo' : canAfford ? '🎖️ Recluta' : '❌ Risorse'}
          </button>
        </div>`;
        }).join('');

        return `<div class="store-grid gen-grid">${cards}</div>`;
    },

    renderEquipment() {
        const categories = [...new Set(STORE_EQUIPMENT.map(g => g.category))];
        const active = this.activeCategory || categories[0];

        const catBar = `<div class="store-cat-bar">
          ${categories.map(c => `<button class="cat-btn ${c === active ? 'active' : ''}" onclick="StoreView.setCategory('${c}')">${c}</button>`).join('')}
        </div>`;

        const items = STORE_EQUIPMENT.filter(g => g.category === active).map(item => {
            const costHtml = this.renderCost(item.cost, item.gems);
            const isEquipped = Object.values(Game.state.hero.equipment).includes(item.id);
            const canAfford = !isEquipped && this.canAffordItem(item);
            const badgeHtml = item.badge ? `<div class="store-badge badge-${this.badgeClass(item.badge)}">${item.badge}</div>` : '';

            const statsHtml = Object.entries(item.stats || {}).map(([s, v]) => `<span class="stat-ico">${s.toUpperCase()}: +${v}</span>`).join(' ');

            return `
              <div class="store-card gear-card ${isEquipped ? 'gen-owned' : ''}">
                ${badgeHtml}
                <div class="sc-icon">${item.icon}</div>
                <div class="sc-name">${item.name}</div>
                <div class="sc-gives" style="font-size:9px;">${statsHtml}</div>
                <div class="sc-desc">${item.description}</div>
                <div class="sc-cost">${costHtml}</div>
                <button class="btn sc-buy-btn ${isEquipped ? 'btn-disabled' : canAfford ? 'btn-buy' : 'btn-disabled'}"
                  onclick="StoreView.buyItem('${item.id}')">
                  ${isEquipped ? '👕 In uso' : canAfford ? '🔧 Compra' : '❌ Risorse'}
                </button>
              </div>`;
        }).join('');

        return catBar + `<div class="store-grid">${items}</div>`;
    },

    // ---- MONSTERS ----------------------------------------------
    renderMonsters() {
        const typeColors = { 'Difesa': 'mon-def', 'Attacco': 'mon-atk', 'Trappola': 'mon-trap', 'Supporto': 'mon-sup' };
        const rarityOrder = { 'comune': 0, 'raro': 1, 'epico': 2, 'leggendario': 3 };
        const sorted = [...STORE_MONSTERS].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

        const cards = sorted.map(mon => {
            const canAfford = this.canAffordItem(mon);
            const costHtml = this.renderCost(mon.cost, mon.gems);
            const badgeHtml = mon.badge ? `<div class="store-badge badge-${this.badgeClass(mon.badge)}">${mon.badge}</div>` : '';
            const typeClass = typeColors[mon.type] || '';

            return `
        <div class="store-card mon-card rarity-${mon.rarity}">
          ${badgeHtml}
          <div class="mon-portrait">${mon.icon}</div>
          <div class="mon-name">${mon.name}</div>
          <div class="mon-type-chip ${typeClass}">${mon.type}</div>
          <div class="gen-role-chip rarity-chip-${mon.rarity}">${mon.rarity.toUpperCase()}</div>
          <div class="sc-desc">${mon.description}</div>
          <div class="mon-effect">✨ ${mon.effect}</div>
          <div class="mon-duration">⏱ Durata: ${mon.duration}</div>
          <div class="mon-stats">
            ⚔️ ${mon.stats.attack} &nbsp;
            🛡️ ${mon.stats.defense} &nbsp;
            ❤️ ${Game.formatNumber(mon.stats.hp)} &nbsp;
            ${mon.stats.count > 1 ? '×' + mon.stats.count : ''}
          </div>
          <div class="sc-cost">${costHtml}</div>
          <button class="btn sc-buy-btn ${canAfford ? 'btn-monster' : 'btn-disabled'}"
            onclick="StoreView.buyItem('${mon.id}')">
            ${canAfford ? '🔮 Evoca' : '❌ Risorse'}
          </button>
        </div>`;
        }).join('');

        return `<div class="store-grid mon-grid">${cards}</div>`;
    },

    setCategory(cat) {
        this.activeCategory = cat;
        this.render();
    },

    // ---- Purchase logic ----------------------------------------
    canAffordItem(item) {
        const gems = Game.state.gems || 0;
        if (item.gems > 0 && gems < item.gems) return false;
        if (item.cost?.silver > 0 && (Game.state.resources.silver || 0) < item.cost.silver) return false;
        return true;
    },

    buyItem(id) {
        // Search across all catalogs
        const item =
            STORE_GOODS.find(x => x.id === id) ||
            STORE_ARMY.find(x => x.id === id) ||
            STORE_GENERALS.find(x => x.id === id) ||
            STORE_EQUIPMENT.find(x => x.id === id) ||
            STORE_MONSTERS.find(x => x.id === id);

        if (!item) return;
        if (!this.canAffordItem(item)) {
            CityView.showToast('Risorse o Gemme insufficienti!', 'error');
            return;
        }

        // Deduct cost
        if (item.gems > 0) {
            Game.state.gems = Math.max(0, (Game.state.gems || 0) - item.gems);
        }
        if (item.cost?.silver > 0) {
            Game.state.resources.silver = Math.max(0, (Game.state.resources.silver || 0) - item.cost.silver);
        }

        // Apply reward
        const gives = item.gives;
        let msg = '';

        if (gives?.resources) {
            const storage = Game.getStorage();
            for (const [res, amt] of Object.entries(gives.resources)) {
                Game.state.resources[res] = Math.min(
                    (Game.state.resources[res] || 0) + amt,
                    storage[res] || Infinity
                );
            }
            msg = `${item.icon} ${item.name} aggiunto alle risorse!`;
        }

        if (gives?.speedUp) {
            // Apply to active build queue first, then research
            const q = Game.state.buildQueue[0] || Game.state.researchQueue[0];
            if (q) {
                q.finishAt = Math.max(Date.now(), q.finishAt - gives.speedUp * 1000);
                msg = `⚡ ${Game.formatTime(gives.speedUp)} sottratti alla coda!`;
            } else {
                msg = '⚡ Nessuna coda attiva — acceleratore salvato!';
                Game.state.pendingSpeedUp = (Game.state.pendingSpeedUp || 0) + gives.speedUp;
            }
        }

        if (gives?.gems) {
            Game.state.gems = (Game.state.gems || 0) + gives.gems;
            msg = `💎 +${gives.gems} Gemme aggiunte!`;
        }

        if (gives?.boost) {
            if (!Game.state.boosts) Game.state.boosts = [];
            Game.state.boosts.push({ ...gives.boost, startedAt: Date.now() });
            msg = `🚀 Boost attivato per ${Game.formatTime(gives.boost.durationSec)}!`;
        }

        if (gives?.troops) {
            for (const [troopId, count] of Object.entries(gives.troops)) {
                Game.state.troops[troopId] = (Game.state.troops[troopId] || 0) + count;
            }
            const summary = Object.entries(gives.troops)
                .map(([id, n]) => `${TROOPS[id]?.icon || '⚔️'} ${n}`)
                .join(' ');
            msg = `${item.icon} ${summary} aggiunti al tuo esercito!`;
        }

        // Equipment logic
        if (item.tab === 'equipment') {
            const slotMap = { 'Armi': 'weapon', 'Armature': 'armor', 'Elmi': 'helmet', 'Scudi': 'shield', 'Gioielli': 'jewelry' };
            const slot = slotMap[item.category];
            if (slot) {
                if (!Game.state.hero.inventory) Game.state.hero.inventory = [];
                Game.state.hero.inventory.push(item.id);
                msg = `🎒 ${item.name} aggiunto all'inventario!`;

                // Auto-equip if slot is empty
                if (!Game.state.hero.equipment[slot]) {
                    Game.state.hero.equipment[slot] = item.id;
                    msg = `👕 ${item.name} equipaggiato!`;
                }
            }
        }

        // General
        if (item.role && item.passive) {
            if (!Game.state.generals) Game.state.generals = [];
            if (!Game.state.generals.includes(item.id)) {
                Game.state.generals.push(item.id);
                msg = `👑 ${item.name} si unisce al tuo esercito!`;

                // Apply general passive effects immediately
                this._applyGeneralPassive(item);
            }
        }

        // Monster
        if (item.type && item.duration) {
            if (!Game.state.activeMonsters) Game.state.activeMonsters = [];
            Game.state.activeMonsters.push({
                id: item.id, name: item.name, icon: item.icon,
                effect: item.effect, duration: item.duration,
                activatedAt: Date.now()
            });
            msg = `🔮 ${item.icon} ${item.name} evocato! Effetto: ${item.effect}`;
        }

        Game.addNotification(msg || `Acquistato: ${item.name}`, 'info');
        CityView.showToast(msg || `✅ ${item.name} acquistato!`, 'success');
        Game.save();
        this.render();

        // Refresh army if open
        if (document.getElementById('army-content')) ArmyView.render();
    },

    _applyGeneralPassive(gen) {
        // Passive effects are applied dynamically via game.js references to Game.state.generals
        // This is just a hook for future data-driven passive system
        console.log('[Store] General passive activated:', gen.id, gen.passive);
    },

    // ---- Helpers -----------------------------------------------
    renderCost(cost, gems) {
        const parts = [];
        if (cost?.silver > 0) {
            const ok = (Game.state.resources.silver || 0) >= cost.silver;
            parts.push(`<span class="cost-item ${ok ? '' : 'cost-missing'}">💰 ${Game.formatNumber(cost.silver)}</span>`);
        }
        if (gems > 0) {
            const ok = (Game.state.gems || 0) >= gems;
            parts.push(`<span class="cost-item ${ok ? '' : 'cost-missing'}">💎 ${gems}</span>`);
        }
        if (!parts.length) parts.push(`<span class="cost-item" style="color:var(--green)">🆓 Gratis</span>`);
        return parts.join('');
    },

    resIcon(res) {
        return { lumber: '🪵', iron: '⚙️', stone: '🪨', food: '🌾', silver: '💰' }[res] || '📦';
    },

    badgeClass(badge) {
        const m = {
            'Popolare': 'popular', 'Valore': 'value', 'Best': 'best',
            'Raro': 'rare', 'Leggendario': 'legendary', 'Epico': 'epic',
            'Consigliato': 'recommended'
        };
        return m[badge] || 'default';
    }
};
