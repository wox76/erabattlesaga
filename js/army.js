// ============================================================
//  TOTAL BATTLE WAR  —  Army Panel
// ============================================================

'use strict';

const ArmyView = {
  activeTab: 'overview',

  init() {
    Game.on('trainQueueChanged', () => this.refresh());
    Game.on('trainComplete', () => this.refresh());
    Game.on('tick', () => this.refreshTimer());
  },

  render() {
    const container = document.getElementById('army-content');
    if (!container) return;

    const tabs = `
      <div class="tab-bar">
        <button class="tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" onclick="ArmyView.setTab('overview')">Esercito</button>
        <button class="tab-btn ${this.activeTab === 'train' ? 'active' : ''}" onclick="ArmyView.setTab('train')">Addestra</button>
        <button class="tab-btn ${this.activeTab === 'queue' ? 'active' : ''}" onclick="ArmyView.setTab('queue')">Coda</button>
      </div>
      <div id="army-quick-bar" class="army-quick-bar">
        <span>Arruolamento Rapido:</span>
        <button class="btn btn-buy-small" onclick="ArmyView.buyRecruits(10)">+10 Reclute (👨‍🌾)</button>
      </div>
    `;

    let content = '';
    if (this.activeTab === 'overview') content = this.renderOverview();
    else if (this.activeTab === 'train') content = this.renderTrain();
    else if (this.activeTab === 'queue') content = this.renderQueue();

    container.innerHTML = tabs + content;
  },

  refresh() { if (document.getElementById('army-content')) this.render(); },

  refreshTimer() {
    const el = document.getElementById('army-queue-timer');
    if (!el) return;
    const q = Game.state.trainQueue[0];
    if (q) {
      const rem = Math.max(0, q.finishAt - Date.now()) / 1000;
      el.textContent = Game.formatTime(rem);
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  renderOverview() {
    const troops = Game.state.troops;
    const hasTroops = Object.values(troops).some(v => v > 0);

    // Total power
    let totalPower = 0;
    let totalUpkeep = 0;
    const training = Game.state.trainQueue;
    let rows = Object.entries(TROOPS).map(([id, tDef]) => {
      const count = troops[id] || 0;
      const inTraining = training.filter(q => q.troopId === id).reduce((acc, q) => acc + q.count, 0);
      const upkeep = (tDef.upkeep.food || 0) * count;
      totalUpkeep += upkeep;
      if (count > 0) {
        totalPower += (tDef.stats.attack + tDef.stats.defense) * count;
      }
      const isRecruit = id === 'recruit';
      return `
        <tr class="${(count > 0 || inTraining > 0) ? 'has-troops' : 'no-troops'}">
          <td><span class="troop-icon">${tDef.icon}</span> ${tDef.name}</td>
          <td>
            ${count > 0 ? Game.formatNumber(count) : (inTraining > 0 ? '0' : '—')}
            ${inTraining > 0 ? `<div class="incoming-badge" title="In addestramento">+${Game.formatNumber(inTraining)} 🏗️</div>` : ''}
          </td>
          <td>${count > 0 ? `🌾 ${upkeep.toFixed(1)}/h` : '—'}</td>
          <td class="tier-badge tier-${tDef.tier}">T${tDef.tier}</td>
          <td>
            ${isRecruit && count >= 10 ? `<button class="btn-action" onclick="ArmyView.openPromoteModal()">🎖️ Addestra</button>` : '—'}
          </td>
        </tr>`;
    }).join('');

    return `
      <div class="army-stats">
        <div class="army-stat-card"><span>💪 Potere</span><strong>${Game.formatNumber(totalPower)}</strong></div>
        <div class="army-stat-card"><span>🌾 Mantenimento</span><strong>${Game.formatNumber(totalUpkeep)}/h</strong></div>
      </div>
      <div class="section-title">Forze in campo</div>
      ${hasTroops ? `
        <div class="table-wrap">
          <table class="troops-table">
            <thead><tr><th>Truppa</th><th>Numero</th><th>Upkeep</th><th>Tier</th><th>Azione</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>` : `<p class="muted center">Nessuna truppa. Usa l'arruolamento rapido o la tab Addestra.</p>`}
    `;
  },

  renderTrain() {
    const barracks = Game.getBuilding('barracks');
    const stable = Game.getBuilding('stable');
    const hasT2 = Game.getResearchBonuses().unlockTier2;

    let sections = '';

    if (!barracks && !stable) {
      return `<p class="muted center">Costruisci una Caserma o una Stalla per addestrare truppe.</p>`;
    }

    const renderTroopCard = (tDef) => {
      const inQueue = Game.state.trainQueue.some(q => q.troopId === tDef.id);
      const isT2 = tDef.tier === 2;
      let blocked = '';
      if (tDef.trainedIn === 'barracks' && (!barracks || barracks.level < (tDef.requiredBarracksLevel || 1))) {
        blocked = `Richiede Caserma Lv ${tDef.requiredBarracksLevel || 1}`;
      } else if (tDef.trainedIn === 'stable' && (!stable || stable.level < (tDef.requiredStableLevel || 1))) {
        blocked = `Richiede Stalla Lv ${tDef.requiredStableLevel || 1}`;
      } else if (isT2 && !hasT2) {
        blocked = 'Sblocca "Truppe d\'Élite" in Accademia';
      }

      return `
        <div class="troop-train-card ${blocked ? 'blocked' : ''}">
          <div class="ttc-header">
            <span class="ttc-icon">${tDef.icon}</span>
            <div class="ttc-info">
              <strong>${tDef.name}</strong>
              <span class="tier-badge tier-${tDef.tier}">Tier ${tDef.tier}</span>
            </div>
          </div>
          <div class="ttc-stats">
            ⚔️ ${tDef.stats.attack} &nbsp;🛡️ ${tDef.stats.defense} &nbsp;❤️ ${tDef.stats.hp} &nbsp;💨 ${tDef.stats.speed}
          </div>
          <div class="ttc-cost">${this.renderCostSmall(tDef.cost)}</div>
          <div class="ttc-time">⏱ ${Game.formatTime(tDef.trainTime)} / unità</div>
          ${blocked
          ? `<div class="ttc-blocked">🔒 ${blocked}</div>`
          : `<div class="ttc-train-row">
                <input type="number" id="qty_${tDef.id}" class="qty-input" value="10" min="1" max="9999">
                <button class="btn btn-train" onclick="ArmyView.train('${tDef.id}')">Addestra</button>
              </div>`}
        </div>`;
    };

    if (barracks) {
      sections += `<div class="section-title">⚔️ Fanteria</div>
        <div class="troop-grid">
          ${Object.values(TROOPS).filter(t => t.trainedIn === 'barracks').map(renderTroopCard).join('')}
        </div>`;
    }
    if (stable) {
      sections += `<div class="section-title">🐴 Cavalleria</div>
        <div class="troop-grid">
          ${Object.values(TROOPS).filter(t => t.trainedIn === 'stable').map(renderTroopCard).join('')}
        </div>`;
    }
    return sections;
  },

  renderQueue() {
    const q = Game.state.trainQueue;
    if (!q.length) {
      return `<p class="muted center">Nessun addestramento in corso.</p>`;
    }
    const items = q.map((item, i) => {
      const tDef = TROOPS[item.troopId];
      const rem = Math.max(0, item.finishAt - Date.now()) / 1000;
      const isFirst = i === 0;
      return `
        <div class="queue-item">
          <span class="qi-icon">${tDef ? tDef.icon : '⚔️'}</span>
          <div class="qi-info">
            <strong>${tDef ? tDef.name : item.troopId}</strong> ×${item.count}
            ${isFirst ? `<div class="qi-timer" id="army-queue-timer">${Game.formatTime(rem)}</div>` : '<div class="qi-pending">In attesa</div>'}
          </div>
        </div>`;
    }).join('');
    return `<div class="queue-list">${items}</div>`;
  },

  train(troopId) {
    const input = document.getElementById(`qty_${troopId}`);
    const count = parseInt(input?.value || '10');
    const result = Game.startTraining(troopId, count);
    if (!result.ok) {
      CityView.showToast(result.msg, 'error');
    } else {
      CityView.showToast(`Addestramento avviato!`, 'success');
      this.render();
    }
  },

  buyRecruits(count) {
    const res = Game.buyRecruits(count);
    if (res.ok) {
      CityView.showToast(res.msg, 'success');
      this.render();
    } else {
      CityView.showToast(res.msg, 'error');
    }
  },

  openPromoteModal() {
    const recruits = Game.state.troops.recruit || 0;
    if (recruits < 10) return;

    const targets = Object.values(TROOPS).filter(t => t.tier === 1);

    let html = `
      <div class="promote-modal">
        <p class="center muted">Hai <strong>${recruits}</strong> Reclute pronte per l'addestramento formale.</p>
        <p class="center" style="font-size:12px; margin-bottom:15px;">L'addestramento consuma reclute e metà delle risorse normali, ma è più veloce del 30%!</p>
        <div class="promote-grid">
          ${targets.map(t => {
      const costHalf = {};
      for (const [r, v] of Object.entries(t.cost)) costHalf[r] = Math.round(v * 0.5 * 10);
      return `
              <div class="promote-card" onclick="ArmyView.confirmPromote('${t.id}', 10)">
                <div class="pc-icon">${t.icon}</div>
                <div class="pc-name">${t.name}</div>
                <div class="pc-cost">Cost: ${this.renderCostSmall(costHalf)}</div>
                <button class="btn btn-upgrade" style="font-size:10px; margin-top:5px; height:auto; padding:6px 0;">Addestra 10</button>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
    Modal.show('Scegli Specializzazione', html);
  },

  confirmPromote(targetId, count) {
    const res = Game.promoteRecruits(targetId, count);
    if (res.ok) {
      Modal.close();
      CityView.showToast(res.msg, 'success');
      this.render();
    } else {
      CityView.showToast(res.msg, 'error');
    }
  },

  renderCostSmall(cost) {
    const icons = { lumber: '🪵', iron: '⚙️', stone: '🪨', food: '🌾', silver: '💰' };
    return Object.entries(cost)
      .filter(([, v]) => v > 0)
      .map(([res, amt]) => {
        const have = Game.state.resources[res] || 0;
        const ok = have >= amt;
        return `<span class="cost-item ${ok ? '' : 'cost-missing'}">${icons[res]}${amt}</span>`;
      }).join(' ');
  }
};
