// ============================================================
//  TOTAL BATTLE WAR  —  Research View
// ============================================================

'use strict';

const ResearchView = {
    activeBranch: 'economy',

    init() {
        Game.on('researchQueueChanged', () => this.refresh());
        Game.on('researchComplete', () => this.refresh());
        Game.on('tick', () => this.refreshTimer());
    },

    render() {
        const container = document.getElementById('research-content');
        if (!container) return;

        const q = Game.state.researchQueue[0];
        const queueHtml = q ? (() => {
            const node = RESEARCH[q.nodeId];
            const rem = Math.max(0, q.finishAt - Date.now()) / 1000;
            return `<div class="research-queue-bar">
        <span>${node ? node.icon : '📚'} ${node ? node.name : q.nodeId} → Lv ${q.toLevel}</span>
        <span id="res-queue-timer">${Game.formatTime(rem)}</span>
      </div>`;
        })() : '';

        const tabs = `
      <div class="tab-bar">
        <button class="tab-btn ${this.activeBranch === 'economy' ? 'active' : ''}" onclick="ResearchView.setBranch('economy')">🌾 Economia</button>
        <button class="tab-btn ${this.activeBranch === 'military' ? 'active' : ''}" onclick="ResearchView.setBranch('military')">⚔️ Militare</button>
        <button class="tab-btn ${this.activeBranch === 'monster' ? 'active' : ''}" onclick="ResearchView.setBranch('monster')">🐉 Mostri</button>
        <button class="tab-btn ${this.activeBranch === 'milestone' ? 'active' : ''}" onclick="ResearchView.setBranch('milestone')">📜 Sblocca</button>
      </div>`;

        let content = '';
        if (this.activeBranch === 'monster') {
            content = this.renderMonsterTree();
        } else if (this.activeBranch === 'milestone') {
            content = this.renderMilestoneList();
        } else {
            const nodes = Object.values(RESEARCH).filter(n => n.branch === this.activeBranch);
            const nodesHtml = nodes.map(node => this.renderNode(node)).join('');
            content = `<div class="research-grid">${nodesHtml}</div>`;
        }

        container.innerHTML = tabs + queueHtml + content;
    },

    renderMonsterTree() {
        const activeRes = Game.state.researchQueue[0];
        const isMonsterResValue = activeRes && RESEARCH[activeRes.nodeId]?.branch === 'monster';

        let footer = '';
        if (isMonsterResValue) {
            const node = RESEARCH[activeRes.nodeId];
            const rem = Math.max(0, activeRes.finishAt - Date.now()) / 1000;
            footer = `
                <div class="mon-active-footer">
                    <div class="maf-icon">${node.icon}</div>
                    <div class="maf-info">
                        <div class="maf-title">${node.name}</div>
                        <div class="maf-timer" id="maf-timer-val">${Game.formatTime(rem)}</div>
                    </div>
                    <button class="maf-speed-btn" onclick="ResearchView.speedUp()">Velocizza</button>
                </div>
            `;
        }

        return `
            <div class="monster-tree">
                <div class="mt-row">
                    ${this.renderMonsterCard('mon_beast_atk')}
                </div>
                <div class="mt-connectors">
                    <div class="mt-connector-v"></div>
                    <div class="mt-connector-h"></div>
                </div>
                <div class="mt-row">
                    ${this.renderMonsterCard('mon_dragon_atk')}
                    ${this.renderMonsterCard('mon_elem_atk')}
                    ${this.renderMonsterCard('mon_giant_atk')}
                </div>
                <div class="mt-connectors">
                    <div class="mt-connector-v"></div>
                </div>
                <div class="mt-row">
                    ${this.renderMonsterCard('mon_beast_hp')}
                </div>
                ${footer}
            </div>
        `;
    },

    renderMonsterCard(nodeId) {
        const node = RESEARCH[nodeId];
        if (!node) return '';
        const level = Game.state.research[nodeId] || 0;
        const maxLevel = node.maxLevel;
        const active = Game.state.researchQueue.some(q => q.nodeId === nodeId);

        // Requirements
        const reqsMet = Object.entries(node.requires || {}).every(([reqId, reqLvl]) =>
            (Game.state.research[reqId] || 0) >= reqLvl
        );

        return `
            <div class="monster-card ${active ? 'active' : ''} ${!reqsMet ? 'locked' : ''}" 
                 onclick="ResearchView.showNodeInfo('${nodeId}')">
                <div class="mc-frame"></div>
                <div class="mc-icon-bg">${node.icon}</div>
                <div class="mc-name">${node.name}</div>
                <div class="mc-progress-bar">${level}/${maxLevel}</div>
            </div>
        `;
    },

    showNodeInfo(nodeId) {
        const node = RESEARCH[nodeId];
        const curLvl = Game.state.research[nodeId] || 0;
        if (curLvl >= node.maxLevel) {
            Modal.show(node.name, `<p class="center">Ricerca completata al livello massimo!</p>`);
            return;
        }

        const nextLvl = curLvl + 1;
        const lvlData = node.levelData[nextLvl - 1];
        const costHtml = this.renderCost(lvlData.cost);
        const timeStr = Game.formatTime(lvlData.researchTime);

        let reqHtml = '';
        Object.entries(node.requires || {}).forEach(([reqId, reqLvl]) => {
            const rNode = RESEARCH[reqId] || BUILDINGS[reqId];
            if (!rNode) return; // Skip unknown requirements

            let met = false;
            if (RESEARCH[reqId]) {
                met = (Game.state.research[reqId] || 0) >= reqLvl;
            } else if (BUILDINGS[reqId]) {
                met = Game.getBuildingLevel(reqId) >= reqLvl;
            }

            reqHtml += `<div style="color: ${met ? '#4ade80' : '#ef4444'}; font-size:12px;">
                ${met ? '✅' : '❌'} Richiede ${rNode.name} Lv ${reqLvl}
            </div>`;
        });

        const html = `
            <div style="padding: 10px; color: #cbd5e1;">
                <p style="margin-bottom:15px; font-size:14px;">${node.description}</p>
                <div class="section-title">Requisiti</div>
                <div style="margin-bottom:15px;">${reqHtml || 'Nessuno'}</div>
                <div class="section-title">Costo Livello ${nextLvl}</div>
                <div style="background: rgba(0,0,0,0.2); padding:10px; border-radius:8px; margin-bottom:15px;">
                    <div style="margin-bottom:8px;">${costHtml}</div>
                    <div style="font-size:12px; color: #94a3b8;">Tempo: ${timeStr}</div>
                </div>
                <button class="btn btn-upgrade" onclick="ResearchView.startResearch('${nodeId}'); Modal.close();">
                    Avvia Ricerca
                </button>
            </div>
        `;
        Modal.show(node.name, html);
    },

    speedUp() {
        const res = Game.speedUpResearch(0); // Assuming first in queue
        if (res.ok) {
            CityView.showToast(res.msg, 'success');
            this.render();
        } else {
            CityView.showToast(res.msg, 'error');
        }
    },

    refresh() { if (document.getElementById('research-content')) this.render(); },

    refreshTimer() {
        const el = document.getElementById('res-queue-timer');
        if (!el) return;
        const q = Game.state.researchQueue[0];
        if (q) el.textContent = Game.formatTime(Math.max(0, q.finishAt - Date.now()) / 1000);
    },

    setBranch(branch) {
        this.activeBranch = branch;
        this.render();
    },

    renderNode(node) {
        const currentLevel = Game.state.research[node.id] || 0;
        const maxLevel = node.maxLevel;
        const inQueue = Game.state.researchQueue.some(q => q.nodeId === node.id);
        const globalQueue = Game.state.researchQueue.length > 0;

        // Check requirements
        const reqsMet = Object.entries(node.requires || {}).every(([reqId, reqLvl]) =>
            (Game.state.research[reqId] || 0) >= reqLvl
        );

        let actionBtn = '';
        if (currentLevel >= maxLevel) {
            actionBtn = `<div class="res-maxed">✅ Completata</div>`;
        } else if (inQueue) {
            const q = Game.state.researchQueue.find(q => q.nodeId === node.id);
            const rem = q ? Math.max(0, q.finishAt - Date.now()) / 1000 : 0;
            actionBtn = `<button class="btn btn-disabled">In corso… ${Game.formatTime(rem)}</button>`;
        } else if (!reqsMet) {
            const req = Object.entries(node.requires || {}).find(([reqId, reqLvl]) =>
                (Game.state.research[reqId] || 0) < reqLvl
            );
            const reqNode = req ? RESEARCH[req[0]] : null;
            actionBtn = `<div class="res-locked">🔒 Richiede ${reqNode ? reqNode.name + ' Lv' + req[1] : ''}</div>`;
        } else if (!Game.hasBuilding('academy')) {
            actionBtn = `<div class="res-locked">🔒 Costruisci Accademia</div>`;
        } else {
            const nextLevel = currentLevel + 1;
            const lvlData = node.levelData[nextLevel - 1];
            const canAfford = Game.canAfford(lvlData.cost);
            const timeStr = Game.formatTime(lvlData.researchTime);
            const costHtml = this.renderCost(lvlData.cost);
            actionBtn = `
        <div class="res-cost">${costHtml}</div>
        <div class="res-time">⏱ ${timeStr}</div>
        <button class="btn ${canAfford && !globalQueue ? 'btn-research' : 'btn-disabled'}"
          onclick="ResearchView.startResearch('${node.id}')">
          ${!canAfford ? '❌ Risorse' : globalQueue ? '⏳ In coda' : '🔬 Ricerca Lv ' + nextLevel}
        </button>`;
        }

        // Progress dots
        const dots = Array.from({ length: maxLevel }, (_, i) => {
            const filled = i < currentLevel;
            return `<span class="res-dot ${filled ? 'filled' : ''}"></span>`;
        }).join('');

        return `
      <div class="research-card ${currentLevel >= maxLevel ? 'completed' : ''} ${!reqsMet ? 'locked' : ''}">
        <div class="res-header">
          <span class="res-icon">${node.icon}</span>
          <div class="res-info">
            <strong>${node.name}</strong>
            <span class="res-branch">${node.branch === 'economy' ? '🌾 Economia' : '⚔️ Militare'}</span>
          </div>
          <div class="res-level">${currentLevel}/${maxLevel}</div>
        </div>
        <p class="res-desc">${node.description}</p>
        <div class="res-dots">${dots}</div>
        ${actionBtn}
      </div>`;
    },

    renderMilestoneList() {
        const nodes = Object.values(RESEARCH).filter(n => n.branch === 'milestone');
        const rows = nodes.map(node => this.renderMilestoneRow(node)).join('');
        return `
            <div class="unlock-list">
                <div class="unlock-header">SBLOCCA</div>
                ${rows}
            </div>
        `;
    },

    renderMilestoneRow(node) {
        const currentLevel = Game.state.research[node.id] || 0;
        const isMax = currentLevel >= node.maxLevel;
        const activeNode = Game.state.researchQueue[0];
        const isResearchingThis = activeNode && activeNode.nodeId === node.id;

        return `
            <div class="unlock-row ${isMax ? 'completed' : ''} ${isResearchingThis ? 'active' : ''}" 
                 onclick="ResearchView.showNodeInfo('${node.id}')">
                <div class="ur-img-box">
                    <span class="ur-icon-large">${node.icon}</span>
                </div>
                <div class="ur-info">
                    <div class="ur-title">${node.name}</div>
                    <div class="ur-desc">${node.description}</div>
                </div>
                <div class="ur-status">
                    ${isMax ? '<span class="ur-check">✅</span>' : isResearchingThis ? '<span class="ur-working">⚙️</span>' : '<span class="ur-shield">🛡️</span>'}
                </div>
            </div>
        `;
    },

    startResearch(nodeId) {
        const result = Game.startResearch(nodeId);
        if (!result.ok) {
            CityView.showToast(result.msg, 'error');
        } else {
            CityView.showToast('Ricerca avviata!', 'success');
            this.render();
        }
    },

    renderCost(cost) {
        const icons = { lumber: '🪵', iron: '⚙️', stone: '🪨', food: '🌾', silver: '💰' };
        return Object.entries(cost)
            .filter(([, v]) => v > 0)
            .map(([res, amt]) => {
                const have = Game.state.resources[res] || 0;
                const ok = have >= amt;
                return `<span class="cost-item ${ok ? '' : 'cost-missing'}">${icons[res]} ${Game.formatNumber(amt)}</span>`;
            }).join('');
    }
};
