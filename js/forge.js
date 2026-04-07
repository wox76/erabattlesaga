// ============================================================
//  TOTAL BATTLE WAR  —  Forge View
// ============================================================

'use strict';

const ForgeView = {
    init() {
        Game.on('stateChanged', () => this.refresh());
    },

    render() {
        const container = document.getElementById('forge-content');
        if (!container) return;

        // Check if forge is researched
        const forgeResearched = (Game.state.research['research_forge'] || 0) >= 1;
        if (!forgeResearched) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="es-icon">⚒️</div>
                    <h3>Fucina Bloccata</h3>
                    <p>Ricerca "Forgiatura" nell'Accademia per sbloccare la produzione di equipaggiamenti.</p>
                    <button class="btn btn-upgrade" onclick="App.switchView('research'); ResearchView.setBranch('milestone')">Vai alla Ricerca</button>
                </div>
            `;
            return;
        }

        let html = '';
        FORGE_ITEMS.forEach(section => {
            html += `<div class="forge-section-header">${section.section}</div>`;
            section.items.forEach(item => {
                html += this.renderForgeRow(item);
            });
        });

        container.innerHTML = `<div class="forge-list">${html}</div>`;
    },

    refresh() {
        if (document.getElementById('forge-content')) this.render();
    },

    renderForgeRow(item) {
        const owned = (Game.state.forgeItems || {})[item.id] || false;

        return `
            <div class="forge-row ${owned ? 'owned' : ''}" onclick="ForgeView.showInfo('${item.id}')">
                <div class="f-img-box">
                    <span class="f-icon-large">${item.icon}</span>
                </div>
                <div class="f-info">
                    <div class="f-name">${item.name}</div>
                    <div class="f-desc">${item.description}</div>
                </div>
                <div class="f-action">
                    ${owned ? '<span class="f-owned-badge">✅ Attivo</span>' : '<span class="f-arrow">🛡️</span>'}
                </div>
            </div>
        `;
    },

    showInfo(itemId) {
        // Find item in FORGE_ITEMS
        let item = null;
        FORGE_ITEMS.forEach(s => {
            const found = s.items.find(i => i.id === itemId);
            if (found) item = found;
        });
        if (!item) return;

        const owned = (Game.state.forgeItems || {})[itemId] || false;
        const costHtml = ResearchView.renderCost(item.cost);
        const canAfford = Game.canAfford(item.cost);

        const statsHtml = Object.entries(item.stats).map(([k, v]) => {
            return `<div class="stat-line"><span>${k}:</span> <strong>+${v}%</strong></div>`;
        }).join('');

        const html = `
            <div class="forge-modal">
                <p class="center muted" style="margin-bottom:15px;">${item.description}</p>
                <div class="section-title">Bonus Forgiatura</div>
                <div class="forge-stats-box">${statsHtml}</div>
                
                ${!owned ? `
                    <div class="section-title">Costo Creazione</div>
                    <div class="res-cost-box">${costHtml}</div>
                    <button class="btn ${canAfford ? 'btn-upgrade' : 'btn-disabled'}" 
                            onclick="ForgeView.craft('${item.id}'); Modal.close();">
                        ${canAfford ? 'Forgia Equipaggiamento' : 'Risorse Insufficienti'}
                    </button>
                ` : `
                    <div class="owned-msg">✅ Questo equipaggiamento è già stato forgiato e i suoi bonus sono attivi.</div>
                `}
            </div>
        `;
        Modal.show(item.name, html);
    },

    craft(itemId) {
        // Find item
        let item = null;
        FORGE_ITEMS.forEach(s => {
            const found = s.items.find(i => i.id === itemId);
            if (found) item = found;
        });
        if (!item) return;

        if (!Game.canAfford(item.cost)) {
            CityView.showToast('Risorse insufficienti!', 'error');
            return;
        }

        Game.deductCost(item.cost);
        if (!Game.state.forgeItems) Game.state.forgeItems = {};
        Game.state.forgeItems[itemId] = true;

        Game.save();
        Game.emit('stateChanged');
        CityView.showToast(`${item.name} forgiato!`, 'success');
        this.render();
    }
};
