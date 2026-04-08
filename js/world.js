// ============================================================
//  TOTAL BATTLE WAR  —  World Map
// ============================================================

'use strict';

const WorldView = {
    MAP_SIZE: 20,
    tiles: [],
    marchTimers: [],
    viewX: 0,
    viewY: 0,

    init() {
        this.generateMap();
        Game.on('tick', () => this.refreshMarches());
        Game.on('marchesChanged', () => this.render());
    },

    generateMap() {
        this.tiles = [];
        const rng = (seed, n) => {
            let x = Math.sin(seed) * 10000;
            return Math.floor((x - Math.floor(x)) * n);
        };

        for (let y = 0; y < this.MAP_SIZE; y++) {
            for (let x = 0; x < this.MAP_SIZE; x++) {
                const seed = x * 31 + y * 97 + 1337;
                const roll = rng(seed, 100);
                let type = 'plains';
                if (roll < 10) type = 'forest';
                else if (roll < 18) type = 'ironmine';
                else if (roll < 25) type = 'stonequarry';
                else if (roll < 30) type = 'wheat_field';
                else if (roll < 34) type = 'monster_goblin';
                else if (roll < 37) type = 'monster_orc';
                else if (roll < 38) type = 'monster_dragon';

                // Player castle at center
                if (x === 10 && y === 10) type = 'player_city';

                this.tiles.push({ x, y, type, id: `tile_${x}_${y}` });
            }
        }
    },

    render() {
        const container = document.getElementById('world-content');
        if (!container) return;

        const tileIcons = {
            plains: 'assets/map_forest.jpg', forest: '🌲', ironmine: '⛏️', stonequarry: '🪨',
            wheat_field: '🌾', monster_goblin: '👺', monster_orc: '👹',
            monster_dragon: '🐉', player_city: '🏰'
        };

        const tileLabels = {
            plains: '', forest: 'Foresta', ironmine: 'Miniera', stonequarry: 'Cava',
            wheat_field: 'Grano', monster_goblin: 'Goblin', monster_orc: 'Orco',
            monster_dragon: 'Drago', player_city: 'La Tua Città'
        };

        // Render ALL tiles for the drag-to-scroll map
        const tileW = 44;
        const rowH = 39; // 52px height * 0.75 for interlock
        let gridHtml = '';
        
        for (let y = 0; y < this.MAP_SIZE; y++) {
            const isOddRow = y % 2 !== 0; 
            const rowTop = y * rowH;
            
            for (let x = 0; x < this.MAP_SIZE; x++) {
                const tile = this.tiles.find(t => t.x === x && t.y === y);
                if (!tile) continue;
                
                const isPlayer = tile.type === 'player_city';
                const icon = tileIcons[tile.type];
                const tileLeft = x * tileW + (isOddRow ? (tileW / 2) : 0);
                
                let contentHtml = '';
                if (tile.type !== 'plains') {
                    const iconDisplay = icon.includes('/') 
                        ? `<img src="${icon}" class="tile-img" alt="">`
                        : `<span class="tile-emoji">${icon}</span>`;
                    contentHtml = `<div class="tile-content">${iconDisplay}</div>`;
                }

                gridHtml += `
          <div class="world-tile ${tile.type} ${isPlayer ? 'player-tile' : ''}"
               onclick="WorldView.clickTile(${x},${y})"
               title="${tileLabels[tile.type] || tile.type}"
               style="left: ${tileLeft}px; top: ${rowTop}px;">
            <div class="tile-inner">${contentHtml}</div>
          </div>`;
            }
        }

        // Marches
        let marchesHtml = '<p class="muted center">Nessuna marcia attiva.</p>';
        if (Game.state.marches && Game.state.marches.length > 0) {
            marchesHtml = Game.state.marches.map(m => {
                const target = WORLD_ENTITIES[m.targetId];
                const targetName = target ? target.name : 'Sconosciuto';
                const isReturning = m.state === 'marching_in';
                return `
                    <div class="queue-item" style="border-left: 3px solid ${isReturning ? 'var(--blue)' : 'var(--ember)'}">
                        <div class="qi-info">
                            <strong>${isReturning ? 'Ritorno da' : 'Attacco a'} ${targetName}</strong>
                            <div class="qi-timer" id="timer_${m.id}">...</div>
                        </div>
                    </div>`;
            }).join('');
        }

        container.innerHTML = `
      <div class="world-header" style="justify-content: flex-end; display: flex; padding: 10px;">
        <button class="btn btn-sm" onclick="WorldView.centerOnCity()">🏰 Centra Città</button>
      </div>
      <div class="world-grid-container" id="world-drag-container">
        <div class="world-grid">${gridHtml}</div>
      </div>
      <div style="margin-top: 10px;">
          <div class="world-legend">
            ${Object.entries(tileIcons).filter(([k]) => k !== 'plains').map(([k, ico]) =>
                `<span>${ico} ${tileLabels[k]}</span>`
            ).join('')}
          </div>
          <div id="world-marches">${marchesHtml}</div>
      </div>
    `;

        this.initDrag();
    },

    initDrag() {
        const slider = document.getElementById('world-drag-container');
        if (!slider) return;
        
        let isDown = false;
        let startX;
        let startY;
        let scrollLeft;
        let scrollTop;
        let hasDragged = false;

        const startDrag = (e) => {
            isDown = true;
            hasDragged = false;
            slider.style.cursor = 'grabbing';
            const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
            const pageY = e.type.includes('touch') ? e.touches[0].pageY : e.pageY;
            startX = pageX - slider.offsetLeft;
            startY = pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollTop = slider.scrollTop;
        };

        const stopDrag = (e) => {
            isDown = false;
            slider.style.cursor = 'grab';
            
            // Restore pointer events so clicks work again
            const grid = slider.querySelector('.world-grid');
            if (grid) grid.style.pointerEvents = 'auto';

            if (hasDragged) {
                setTimeout(() => { hasDragged = false; }, 0); 
            }
        };

        const moveDrag = (e) => {
            if (!isDown) return;
            e.preventDefault(); // Prevent default mobile scrolling
            const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
            const pageY = e.type.includes('touch') ? e.touches[0].pageY : e.pageY;
            const x = pageX - slider.offsetLeft;
            const y = pageY - slider.offsetTop;
            const walkX = (x - startX) * 1.5; 
            const walkY = (y - startY) * 1.5; 
            
            if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
                hasDragged = true;
                const grid = slider.querySelector('.world-grid');
                if (grid) grid.style.pointerEvents = 'none';
            }

            slider.scrollLeft = scrollLeft - walkX;
            slider.scrollTop = scrollTop - walkY;
        };

        slider.addEventListener('mousedown', startDrag);
        slider.addEventListener('mouseleave', stopDrag);
        slider.addEventListener('mouseup', stopDrag);
        slider.addEventListener('mousemove', moveDrag);
        
        slider.addEventListener('touchstart', startDrag, {passive: false});
        slider.addEventListener('touchend', stopDrag);
        slider.addEventListener('touchcancel', stopDrag);
        slider.addEventListener('touchmove', moveDrag, {passive: false});

        // Center on first render
        if (!this.hasCentered) {
            setTimeout(() => {
                this.centerOnCity();
                this.hasCentered = true;
            }, 100);
        }
    },

    centerOnCity() {
        const slider = document.getElementById('world-drag-container');
        if (slider && slider.clientWidth > 0) {
            const tileW = 44;
            const rowH = 39; 
            
            const centerX = (10 * tileW) + (tileW / 2) - (slider.clientWidth / 2);
            const centerY = (10 * rowH) + (52 / 2) - (slider.clientHeight / 2);
            
            slider.scrollLeft = centerX;
            slider.scrollTop = centerY;
        } else if (slider) {
            setTimeout(() => this.centerOnCity(), 50);
        }
    },

    clickTile(x, y) {
        const tile = this.tiles.find(t => t.x === x && t.y === y);
        if (!tile) return;

        if (tile.type === 'player_city') {
            CityView.showToast('Questa è la tua città!', 'info');
            return;
        }
        if (tile.type === 'plains') return;

        const entity = WORLD_ENTITIES[tile.type];
        if (!entity) return;

        const isMonster = tile.type.startsWith('monster_');
        const isResource = !isMonster;

        const html = isResource
            ? `
            <div style="font-size:13px;">
              <p>Puoi raccogliere questo nodo per ottenere risorse preziose.</p>
              <div style="margin:10px 0; padding:8px; background:rgba(255,255,255,0.05); border-radius:8px;">
                ${Object.entries(entity.yields).map(([r, v]) => `<div>${r}: <b>${v}</b></div>`).join('')}
              </div>
              <p>⏱ Tempo: <b>${Game.formatTime(entity.gatherTime)}</b></p>
              <hr style="border:0; border-top:1px solid var(--border); margin:10px 0;">
              <div style="display:flex; gap:10px;">
                <button class="btn btn-upgrade" style="flex:1" onclick="WorldView.openMarchModal(${x}, ${y}, '${tile.type}')">Raccogli</button>
                <button class="btn btn-disabled" style="flex:1" onclick="Modal.close()">Chiudi</button>
              </div>
            </div>`
            : `
            <div style="font-size:13px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>❤️ HP: <b>${entity.hp}</b></span>
                <span>⚔️ ATK: <b>${entity.stats.attack}</b></span>
                <span>🛡️ DEF: <b>${entity.stats.defense}</b></span>
              </div>
              <p>Debolezza: <b style="color:var(--blue)">${entity.weakness.toUpperCase()}</b></p>
              <p>Possibile Bottino:</p>
              <div style="margin:10px 0; padding:8px; background:rgba(255,255,255,0.05); border-radius:8px;">
                ${Object.entries(entity.loot).map(([r, v]) => `<div>${r}: <b>${v}</b></div>`).join('')}
              </div>
              <hr style="border:0; border-top:1px solid var(--border); margin:10px 0;">
              <div style="display:flex; gap:10px;">
                <button class="btn btn-train" style="flex:1" onclick="WorldView.openMarchModal(${x}, ${y}, '${tile.type}')">Attacca</button>
                <button class="btn btn-disabled" style="flex:1" onclick="Modal.close()">Chiudi</button>
              </div>
            </div>`;

        Modal.show(`${entity.icon} ${entity.name}`, html);
    },

    refreshMarches() {
        if (!Game.state.marches) return;
        const now = Date.now();
        Game.state.marches.forEach(m => {
            const el = document.getElementById(`timer_${m.id}`);
            if (!el) return;
            const remSec = Math.max(0, (m.state === 'marching_in' ? m.returnAt : m.arriveAt) - now) / 1000;
            el.textContent = Game.formatTime(remSec);
        });
    },

    openMarchModal(x, y, targetId) {
        Modal.close();
        const s = Game.state;
        const target = WORLD_ENTITIES[targetId];
        
        let html = `<div style="font-size:13px; max-height:400px; overflow-y:auto; padding:5px;">`;
        html += `<p class="muted center" style="margin-bottom:10px;">Seleziona le truppe per la marcia verso ${target ? target.name : targetId}.</p>`;
        
        let hasTroops = false;
        for (const [tId, count] of Object.entries(s.troops)) {
            if (count > 0) {
                hasTroops = true;
                const tDef = TROOPS[tId];
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; margin-bottom:8px;">
                        <div>
                            <span>${tDef.icon} <b>${tDef.name}</b></span>
                            <div style="font-size:11px; color:var(--text-muted)">Disp: ${Game.formatNumber(count)} | Vel: ${tDef.stats.speed}</div>
                        </div>
                        <input type="number" id="march_troop_${tId}" value="0" min="0" max="${count}" style="width:60px; padding:4px; text-align:center; background:var(--bg-deep); border:1px solid var(--border); color:white; border-radius:4px;" onchange="WorldView.recalcMarchTime(${x}, ${y})" oninput="WorldView.recalcMarchTime(${x}, ${y})">
                    </div>`;
            }
        }

        if (!hasTroops) {
            html += `<p class="center" style="color:var(--ember); font-weight:bold;">Non hai truppe disponibili!</p>`;
        } else {
            html += `
                <div style="margin:15px 0; text-align:center; padding:10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card2);">
                    <div style="font-size:12px; color:var(--text-muted)">Tempo Stimato di Marcia (Sola Andata)</div>
                    <div id="march_time_preview" style="font-size:16px; font-weight:bold; color:var(--gold); margin-top:5px;">--:--</div>
                </div>
                <button class="btn btn-train" style="width:100%" onclick="WorldView.sendMarch(${x}, ${y}, '${targetId}')">Invia Truppe</button>
            `;
        }
        
        html += `</div>`;
        Modal.show('Prepara Marcia', html);
        
        // Initial calc
        setTimeout(() => this.recalcMarchTime(x, y), 50);
    },

    recalcMarchTime(x, y) {
        const s = Game.state;
        let minSpeed = 999;
        let selectedAny = false;
        
        for (const tId in s.troops) {
            if (s.troops[tId] > 0) {
                const el = document.getElementById(`march_troop_${tId}`);
                if (el && parseInt(el.value) > 0) {
                    selectedAny = true;
                    if (TROOPS[tId].stats.speed < minSpeed) {
                        minSpeed = TROOPS[tId].stats.speed;
                    }
                }
            }
        }
        
        const previewEl = document.getElementById('march_time_preview');
        if (!previewEl) return;
        
        if (!selectedAny) {
            previewEl.textContent = '--:--';
        } else {
            const timeSec = Game.calculateMarchTime(x, y, minSpeed);
            const testMult = Game.state.testingMode ? 10 : 1;
            const timeAdjusted = Math.max(1, timeSec / testMult);
            previewEl.textContent = Game.formatTime(timeAdjusted);
        }
    },

    sendMarch(x, y, targetId) {
        const payload = {};
        const s = Game.state;
        for (const tId in s.troops) {
            if (s.troops[tId] > 0) {
                const el = document.getElementById(`march_troop_${tId}`);
                if (el) {
                    const val = parseInt(el.value);
                    if (val > 0) payload[tId] = val;
                }
            }
        }
        
        const res = Game.sendMarch(x, y, targetId, payload);
        if (res.ok) {
            CityView.showToast(res.msg, 'success');
            Modal.close();
            this.render(); // update map
        } else {
            CityView.showToast(res.msg, 'error');
        }
    }
};

// Init world view centered on player city
WorldView.viewX = 10;
WorldView.viewY = 10;
