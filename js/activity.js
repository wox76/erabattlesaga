// ============================================================
//  TOTAL BATTLE WAR  —  Activities View
// ============================================================

'use strict';

const ActivityView = {
    init() {
        Game.on('tick', () => this.refreshTimers());
        Game.on('buildQueueChanged', () => this.refresh());
        Game.on('trainQueueChanged', () => this.refresh());
        Game.on('researchQueueChanged', () => this.refresh());
        Game.on('buildComplete', () => this.refresh());
        Game.on('trainComplete', () => this.refresh());
        Game.on('researchComplete', () => this.refresh());
    },

    render() {
        const container = document.getElementById('activities-content');
        if (!container) return;

        const s = Game.state;
        const hasActivity = s.buildQueue.length > 0 || s.researchQueue.length > 0 || s.trainQueue.length > 0;

        if (!hasActivity) {
            container.innerHTML = `
                <div class="activities-empty">
                    <div class="ae-icon">⏳</div>
                    <h3>Nessuna attività</h3>
                    <p>Tutti i tuoi lavoratori e cittadini sono a riposo. Inizia una costruzione o una ricerca!</p>
                </div>
            `;
            return;
        }

        let html = '<div class="section-title">Processi Attivi</div>';
        html += '<div class="activity-list">';

        // 1. Constructions
        s.buildQueue.forEach(q => {
            const bDef = BUILDINGS[q.buildingId];
            html += this.renderItem({
                id: q.slotId,
                type: 'build',
                name: (bDef ? bDef.name : q.buildingId) + ' → Lv ' + q.toLevel,
                icon: bDef ? bDef.icon : '🔨',
                startAt: q.startAt,
                finishAt: q.finishAt
            });
        });

        // 2. Research
        s.researchQueue.forEach((q, idx) => {
            const node = RESEARCH[q.nodeId];
            html += this.renderItem({
                id: idx,
                type: 'research',
                name: 'Ricerca: ' + (node ? node.name : q.nodeId) + ' → Lv ' + q.toLevel,
                icon: node ? node.icon : '📚',
                startAt: q.startAt,
                finishAt: q.finishAt
            });
        });

        // 3. Training
        s.trainQueue.forEach((q, idx) => {
            const tDef = TROOPS[q.troopId];
            html += this.renderItem({
                id: idx,
                type: 'train',
                name: 'Addestramento: ' + (tDef ? tDef.name : q.troopId) + ' ×' + q.count,
                icon: tDef ? tDef.icon : '⚔️',
                startAt: q.startAt,
                finishAt: q.finishAt
            });
        });

        html += '</div>';
        container.innerHTML = html;
    },

    renderItem(item) {
        const remSec = Math.max(0, item.finishAt - Date.now()) / 1000;
        const totalSec = (item.finishAt - item.startAt) / 1000 || 1;
        const progress = Math.min(100, Math.max(0, ((totalSec - remSec) / totalSec) * 100));
        const gems = Math.max(1, Math.ceil(remSec / 60));

        const iconHtml = (typeof item.icon === 'string' && item.icon.includes('/'))
            ? `<img src="${item.icon}" class="activity-img" alt="Icon">`
            : item.icon;

        return `
            <div class="activity-item" data-start="${item.startAt}" data-finish="${item.finishAt}" data-type="${item.type}" data-id="${item.id}">
                <div class="ai-icon-wrap ai-${item.type}">${iconHtml}</div>
                <div class="ai-info">
                    <div class="ai-name">${item.name}</div>
                    <div class="ai-timer">${Game.formatTime(remSec)}</div>
                    <div class="ai-progress-bg"><div class="ai-progress-fill" style="width:${progress}%"></div></div>
                </div>
                <button class="ai-speedup" onclick="ActivityView.speedUp('${item.type}', '${item.id}')">
                    ⚡ <span>${gems}</span>
                </button>
            </div>
        `;
    },

    refresh() {
        if (document.getElementById('activities-content')) this.render();
    },

    refreshTimers() {
        const items = document.querySelectorAll('.activity-item');
        items.forEach(el => {
            const start = parseInt(el.dataset.start);
            const finish = parseInt(el.dataset.finish);
            const remSec = Math.max(0, finish - Date.now()) / 1000;
            const totalSec = (finish - start) / 1000 || 1;
            const progress = Math.min(100, Math.max(0, ((totalSec - remSec) / totalSec) * 100));

            const timer = el.querySelector('.ai-timer');
            if (timer) timer.textContent = Game.formatTime(remSec);

            const fill = el.querySelector('.ai-progress-fill');
            if (fill) fill.style.width = progress + '%';

            // Update gems cost
            const gems = Math.max(1, Math.ceil(remSec / 60));
            const btnSpan = el.querySelector('.ai-speedup span');
            if (btnSpan) btnSpan.textContent = gems;
        });
    },

    speedUp(type, id) {
        let result;
        if (type === 'build') result = Game.instantComplete(id);
        else if (type === 'train') result = Game.speedUpTrain(parseInt(id));
        else if (type === 'research') result = Game.speedUpResearch(parseInt(id));

        if (result && result.ok) {
            CityView.showToast('Velocizzato con successo! ⚡', 'success');
            this.render();
        } else if (result) {
            CityView.showToast(result.msg, 'error');
        }
    }
};
