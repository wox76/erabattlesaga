// ============================================================
//  TOTAL BATTLE WAR  —  Core Game Engine
// ============================================================

'use strict';

const SAVE_KEY = 'tbw_save_v1';
const TICK_MS = 1000;          // 1 second per tick
const MAX_OFFLINE_HOURS = 8;    // max offline resource accumulation

// ---------------------------------------------------------------
//  DEFAULT STATE
// ---------------------------------------------------------------
function createDefaultState() {
    return {
        version: 1,
        cityName: 'Fortezza',
        lastSave: Date.now(),

        resources: {
            lumber: 5000,
            iron: 4000,
            stone: 4500,
            food: 8000,
            silver: 1000
        },
        gems: 200,

        // Hero/General: chosen at start
        hero: {
            selectedId: null,
            equipment: { weapon: null, armor: null, helmet: null, shield: null, jewelry: null },
            inventory: []
        },
        testingMode: false,
        stats: {
            totalPlayTime: 0,
            totalBuildTime: 0,
            totalTrainTime: 0
        },

        // Installed buildings: slotId → { buildingId, level }
        buildings: {
            slot_castle: { buildingId: 'castle', level: 1 }
        },

        // Active build queue: [{ slotId, buildingId, fromLevel, toLevel, finishAt }]
        buildQueue: [],

        // Troops owned
        troops: {
            recruit: 0,
            archer: 0,
            spearman: 0,
            rider: 0,
            elite_archer: 0,
            heavy_infantry: 0,
            knight: 0
        },

        // Active training queue: [{ troopId, count, perUnitMs, finishAt }]
        trainQueue: [],

        // Research levels: { nodeId: level }
        research: {},

        // Active research queue: [{ nodeId, finishAt }]
        researchQueue: [],

        // Marches on the map
        marches: [],

        // Statistics
        stats: {
            totalBuildTime: 0,
            totalResourcesGathered: 0,
            battlesWon: 0,
            battlesLost: 0
        }
    };
}

// ---------------------------------------------------------------
//  GAME STATE (singleton)
// ---------------------------------------------------------------
const Game = {
    state: null,
    tickInterval: null,
    listeners: {},    // event → [callbacks]

    // ---- Initialization ----------------------------------------
    init() {
        const loaded = this.load();
        const def = createDefaultState();

        if (loaded) {
            // Migration: Ensure new properties exist
            if (!loaded.hero) loaded.hero = def.hero;
            if (!loaded.hero.equipment) loaded.hero.equipment = def.hero.equipment;
            if (loaded.hero.equipment && !loaded.hero.equipment.hasOwnProperty('jewelry')) {
                loaded.hero.equipment.jewelry = null;
            }
            if (loaded.gems === undefined) loaded.gems = def.gems;
            if (!loaded.hero.inventory) loaded.hero.inventory = def.hero.inventory || [];
            if (!loaded.generals) loaded.generals = [];
            if (!loaded.boosts) loaded.boosts = [];
            if (!loaded.activeMonsters) loaded.activeMonsters = [];
            if (!loaded.research) loaded.research = {};
            if (!loaded.troops) loaded.troops = {};
            if (loaded.troops.recruit === undefined) loaded.troops.recruit = 0;
            if (loaded.testingMode === undefined) loaded.testingMode = false;
            if (loaded.testingBoostApplied === undefined) loaded.testingBoostApplied = false;
            if (loaded.forgeItems === undefined) loaded.forgeItems = {};
            if (!loaded.buildings) loaded.buildings = {};
            if (!loaded.marches) loaded.marches = [];

            this.state = loaded;
        } else {
            this.state = def;
        }

        this.applyOfflineProgress();
        this.startTick();
        console.log('[Game] Initialized. City:', this.state.cityName);
    },

    // ---- Event system ------------------------------------------
    on(event, cb) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(cb);
    },
    emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    },

    // ---- Tick --------------------------------------------------
    startTick() {
        this.tickInterval = setInterval(() => this.tick(), TICK_MS);
    },

    tick() {
        const s = this.state;
        const now = Date.now();
        const prod = this.getProduction();

        // Increment resources (per second)
        const elapsed = (now - s.lastSave) / 1000;
        if (elapsed > 0) {
            const storage = this.getStorage();
            for (const res in prod) {
                const amount = (prod[res] / 3600) * elapsed;
                s.resources[res] = Math.min(storage[res], (s.resources[res] || 0) + amount);
            }
            s.lastSave = now;
            s.stats.totalPlayTime += elapsed;
        }

        // Check build queue
        const completedBuilds = [];
        s.buildQueue = s.buildQueue.filter(item => {
            if (now >= item.finishAt) {
                completedBuilds.push(item);
                return false;
            }
            return true;
        });
        completedBuilds.forEach(item => this._completeBuild(item));
        if (completedBuilds.length > 0) this.emit('buildQueueChanged');

        // Check training queue
        const completedTrains = [];
        s.trainQueue = s.trainQueue.filter(item => {
            if (now >= item.finishAt) {
                completedTrains.push(item);
                return false;
            }
            return true;
        });
        completedTrains.forEach(item => this._completeTrain(item));
        if (completedTrains.length > 0) this.emit('trainQueueChanged');

        // Check research queue
        const completedResearch = [];
        s.researchQueue = s.researchQueue.filter(item => {
            if (now >= item.finishAt) {
                completedResearch.push(item);
                return false;
            }
            return true;
        });
        completedResearch.forEach(item => this._completeResearch(item));
        if (completedResearch.length > 0) this.emit('researchQueueChanged');

        // Update marches
        this._tickMarches(now);

        this.emit('tick', { resources: s.resources, prod });
    },

    // ---- Production calculation --------------------------------
    getProduction() {
        const s = this.state;
        const prod = { lumber: 0, iron: 0, stone: 0, food: 0, silver: 0 };
        const testMult = s.testingMode ? 10 : 1;

        // Base production from buildings
        for (const [slotId, bData] of Object.entries(s.buildings)) {
            const bDef = BUILDINGS[bData.buildingId];
            if (!bDef) continue;
            const lvlData = bDef.levelData[bData.level - 1];
            if (!lvlData) continue;
            const e = lvlData.effect;
            if (e.lumberPerHour) prod.lumber += e.lumberPerHour;
            if (e.ironPerHour) prod.iron += e.ironPerHour;
            if (e.stonePerHour) prod.stone += e.stonePerHour;
            if (e.foodPerHour) prod.food += e.foodPerHour;
            if (e.silverPerHour) prod.silver += e.silverPerHour;
        }

        // Research, Hero & Forge bonuses
        const rBonus = this.getResearchBonuses();
        const hBonus = this.getHeroBonuses();
        const fBonus = this.getForgeBonuses ? this.getForgeBonuses() : {};

        prod.lumber *= (1 + ((rBonus.lumberProductionBonus || 0) + (hBonus.lumberProductionBonus || 0) + (fBonus.prodBonus || 0)) / 100);
        prod.iron *= (1 + ((rBonus.ironProductionBonus || 0) + (hBonus.ironProductionBonus || 0) + (fBonus.prodBonus || 0)) / 100);
        prod.stone *= (1 + ((rBonus.stoneProductionBonus || 0) + (hBonus.stoneProductionBonus || 0) + (fBonus.prodBonus || 0)) / 100);
        prod.food *= (1 + ((rBonus.foodProductionBonus || 0) + (hBonus.foodProductionBonus || 0) + (fBonus.prodBonus || 0)) / 100);
        prod.silver *= (1 + ((fBonus.prodBonus || 0)) / 100);

        // Apply Testing Mode Multiplier
        for (const res in prod) {
            prod[res] *= testMult;
        }

        // Troop food upkeep (not affected by testing mode benefit)
        let upkeep = 0;
        for (const [troopId, count] of Object.entries(s.troops)) {
            const tDef = TROOPS[troopId];
            if (tDef && count > 0) upkeep += (tDef.upkeep.food || 0) * count;
        }
        prod.food -= upkeep;

        return prod;
    },

    getStorage() {
        const s = this.state;
        const storage = { ...BASE_STORAGE };
        const rBonus = this.getResearchBonuses();
        const storageBonus = 1 + (rBonus.storageBonus || 0) / 100;

        // Warehouse level bonus
        const wh = this.getBuilding('warehouse');
        let whMult = 1;
        if (wh) {
            const lvlData = BUILDINGS.warehouse.levelData[wh.level - 1];
            if (lvlData) whMult = lvlData.effect.storageMultiplier;
        }

        for (const res in storage) {
            storage[res] = Math.round(storage[res] * storageBonus * whMult);
        }
        return storage;
    },

    getResearchBonuses() {
        const bonuses = {};
        for (const [nodeId, level] of Object.entries(this.state.research)) {
            const node = RESEARCH[nodeId];
            if (!node || level < 1) continue;
            const lvlData = node.levelData[level - 1];
            if (!lvlData) continue;
            for (const [key, val] of Object.entries(lvlData.effect)) {
                bonuses[key] = (bonuses[key] || 0) + val;
            }
        }
        return bonuses;
    },

    getHeroBonuses() {
        const s = this.state;
        const bonuses = { attack: 0, defense: 0, speed: 0, leadership: 0, constructionSpeedBonus: 0, researchSpeedBonus: 0, trainingSpeedBonus: 0, lumberProductionBonus: 0, ironProductionBonus: 0, stoneProductionBonus: 0, foodProductionBonus: 0 };

        if (!s.hero.selectedId) return bonuses;

        const gen = STARTING_GENERALS.find(g => g.id === s.hero.selectedId) || STORE_GENERALS.find(g => g.id === s.hero.selectedId);
        if (gen) {
            bonuses.attack += gen.stats.attack;
            bonuses.defense += gen.stats.defense;
            bonuses.speed += gen.stats.speed;
            bonuses.leadership += gen.stats.leadership;

            if (gen.passive.includes('Attacco')) bonuses.attackBonus = 15;
            if (gen.passive.includes('Costruzione')) bonuses.constructionSpeedBonus = 20;
            if (gen.passive.includes('Ricerca')) bonuses.researchSpeedBonus = 25;
        }

        for (const slot in s.hero.equipment) {
            const itemId = s.hero.equipment[slot];
            if (!itemId) continue;
            const item = STORE_EQUIPMENT.find(e => e.id === itemId);
            if (item && item.stats) {
                for (const stat in item.stats) {
                    bonuses[stat] = (bonuses[stat] || 0) + item.stats[stat];
                }
            }
        }
        return bonuses;
    },

    getForgeBonuses() {
        const bonuses = { prodBonus: 0, guardAtk: 0, guardDef: 0, specAtk: 0, specDef: 0, siegeAtk: 0, marchSpeed: 0, cryptLoot: 0, meleeDef: 0, flyingAtk: 0, horseAtk: 0, horseSpeed: 0 };
        const owned = this.state.forgeItems || {};

        FORGE_ITEMS.forEach(section => {
            section.items.forEach(item => {
                if (owned[item.id]) {
                    for (const [stat, val] of Object.entries(item.stats)) {
                        bonuses[stat] = (bonuses[stat] || 0) + val;
                    }
                }
            });
        });
        return bonuses;
    },

    toggleTestingMode() {
        const s = this.state;
        s.testingMode = !s.testingMode;

        if (s.testingMode && !s.testingBoostApplied) {
            s.resources.silver += 1000000;
            s.gems += 10000;
            s.testingBoostApplied = true;
            this.addNotification("Testing Mode Attivato! Bonus iniziali accreditati.", "success");
        }

        this.save();
        this.emit('stateChanged');
        return s.testingMode;
    },

    // ---- Castle level gating -----------------------------------
    getCastleLevel() {
        const castle = this.getBuilding('castle');
        return castle ? castle.level : 1;
    },

    getBuildingMaxLevel(buildingId) {
        const castleLevel = this.getCastleLevel();
        const bDef = BUILDINGS[buildingId];
        if (!bDef) return 0;
        // Other buildings capped at castle level
        if (buildingId === 'castle') return bDef.levelData.length;
        return Math.min(castleLevel, bDef.levelData.length);
    },

    // ---- Build system ------------------------------------------
    canAfford(cost) {
        const r = this.state.resources;
        return Object.entries(cost).every(([res, amt]) => (r[res] || 0) >= amt);
    },

    deductCost(cost) {
        const r = this.state.resources;
        for (const [res, amt] of Object.entries(cost)) {
            r[res] = Math.max(0, (r[res] || 0) - amt);
        }
    },

    startBuild(slotId, buildingId) {
        const s = this.state;
        // Validate slot
        const slotDef = CITY_SLOTS.find(sl => sl.id === slotId);
        if (!slotDef) return { ok: false, msg: 'Slot non trovato.' };

        // Check build queue not full (max 1 for now, 2 with castle research)
        if (s.buildQueue.length >= 1 && this.getCastleLevel() < 5) {
            return { ok: false, msg: 'Coda costruzioni piena. Potenzia il Castello per aggiungere più slot.' };
        }

        const currentBuilding = s.buildings[slotId];
        const fromLevel = currentBuilding ? currentBuilding.level : 0;
        const bDef = BUILDINGS[buildingId];
        if (!bDef) return { ok: false, msg: 'Edificio non trovato.' };

        const maxLevel = this.getBuildingMaxLevel(buildingId);
        if (fromLevel >= maxLevel) {
            return { ok: false, msg: `Livello massimo raggiunto (${maxLevel}). Potenzia il Castello.` };
        }

        const toLevel = fromLevel + 1;
        const lvlData = bDef.levelData[toLevel - 1];
        if (!lvlData) return { ok: false, msg: 'Dati livello non trovati.' };

        // Check if already in queue
        if (s.buildQueue.some(q => q.slotId === slotId)) {
            return { ok: false, msg: 'Questo edificio è già in costruzione.' };
        }

        // Check cost
        if (!this.canAfford(lvlData.cost)) {
            return { ok: false, msg: 'Risorse insufficienti.' };
        }

        this.deductCost(lvlData.cost);

        // Apply construction speed bonus
        const rBonus = this.getResearchBonuses();
        const hBonus = this.getHeroBonuses();
        const testMult = s.testingMode ? 10 : 1;
        const speedBonus = 1 - ((rBonus.constructionSpeedBonus || 0) + (hBonus.constructionSpeedBonus || 0)) / 100;
        const buildTimeSec = Math.round((lvlData.buildTime / testMult) * Math.max(0.1, speedBonus));
        const finishAt = Date.now() + buildTimeSec * 1000;

        const startAt = Date.now();
        s.buildQueue.push({ slotId, buildingId, fromLevel, toLevel, startAt, finishAt });
        s.stats.totalBuildTime += buildTimeSec;

        this.emit('buildQueueChanged');
        this.save();
        return { ok: true, finishAt };
    },

    _completeBuild(item) {
        const s = this.state;
        s.buildings[item.slotId] = { buildingId: item.buildingId, level: item.toLevel };
        this.emit('buildComplete', item);
        this.addNotification(`${BUILDINGS[item.buildingId].name} potenziato al Lv.${item.toLevel}!`, 'build');
        this.save();
    },

    instantComplete(slotId) {
        const s = this.state;
        const idx = s.buildQueue.findIndex(q => q.slotId === slotId);
        if (idx === -1) return { ok: false, msg: 'Costruzione non trovata.' };

        const q = s.buildQueue[idx];
        const remSec = (q.finishAt - Date.now()) / 1000;
        const gems = Math.max(1, Math.ceil(remSec / 60));

        if (s.gems < gems) return { ok: false, msg: 'Gemme insufficienti!' };

        s.gems -= gems;
        const item = s.buildQueue.splice(idx, 1)[0];
        this._completeBuild(item);
        this.emit('buildQueueChanged');
        this.save();
        return { ok: true };
    },

    // ---- Training system ---------------------------------------
    startTraining(troopId, count) {
        const s = this.state;
        if (count <= 0) return { ok: false, msg: 'Quantità non valida.' };

        const tDef = TROOPS[troopId];
        if (!tDef) return { ok: false, msg: 'Truppa non trovata.' };

        // Check required building level
        if (tDef.trainedIn === 'barracks') {
            const barracks = this.getBuilding('barracks');
            if (!barracks || barracks.level < (tDef.requiredBarracksLevel || 1)) {
                return { ok: false, msg: `Richiede Caserma al livello ${tDef.requiredBarracksLevel || 1}.` };
            }
        } else if (tDef.trainedIn === 'stable') {
            const stable = this.getBuilding('stable');
            if (!stable || stable.level < (tDef.requiredStableLevel || 1)) {
                return { ok: false, msg: `Richiede Stalla al livello ${tDef.requiredStableLevel || 1}.` };
            }
        }

        // Check tier 2 unlock
        if (tDef.tier === 2 && !this.getResearchBonuses().unlockTier2) {
            return { ok: false, msg: 'Sblocca Truppe d\'Élite nell\'Accademia.' };
        }

        // Cost per unit × count
        const totalCost = {};
        for (const [res, amt] of Object.entries(tDef.cost)) {
            totalCost[res] = amt * count;
        }

        if (!this.canAfford(totalCost)) return { ok: false, msg: 'Risorse insufficienti.' };
        this.deductCost(totalCost);

        // Training time with bonus
        const rBonus = this.getResearchBonuses();
        const hBonus = this.getHeroBonuses();
        const bBonus = this._getBuildingTrainingBonus(tDef.trainedIn);
        const speedReduction = ((rBonus.trainingSpeedBonus || 0) + (hBonus.trainingSpeedBonus || 0) + bBonus) / 100;
        const testMult = s.testingMode ? 10 : 1;
        const perUnitMs = Math.round((tDef.trainTime * 1000 / testMult) * Math.max(0.1, 1 - speedReduction));
        const finishAt = Date.now() + perUnitMs * count;

        const startAt = Date.now();
        s.trainQueue.push({ troopId, count, perUnitMs, startAt, finishAt });
        this.emit('trainQueueChanged');
        this.save();
        return { ok: true, finishAt };
    },

    _getBuildingTrainingBonus(trainedIn) {
        const b = this.getBuilding(trainedIn);
        if (b) {
            const bDef = BUILDINGS[trainedIn];
            const lvlData = bDef.levelData[b.level - 1];
            if (lvlData) {
                if (trainedIn === 'barracks') return lvlData.effect.trainingSpeedBonus || 0;
                if (trainedIn === 'stable') return lvlData.effect.cavalrySpeedBonus || 0;
            }
        }
        return 0;
    },

    _completeTrain(item) {
        this.state.troops[item.troopId] = (this.state.troops[item.troopId] || 0) + item.count;
        const tDef = TROOPS[item.troopId];
        this.emit('trainComplete', item);
        this.addNotification(`${item.count} ${tDef ? tDef.name : item.troopId} pronti!`, 'train');
        this.save();
    },

    speedUpTrain(idx) {
        const s = this.state;
        const q = s.trainQueue[idx];
        if (!q) return { ok: false, msg: 'Addestramento non trovato.' };

        const remSec = (q.finishAt - Date.now()) / 1000;
        const gems = Math.max(1, Math.ceil(remSec / 60));

        if (s.gems < gems) return { ok: false, msg: 'Gemme insufficienti!' };

        s.gems -= gems;
        s.trainQueue.splice(idx, 1);
        this._completeTrain(q);
        this.emit('trainQueueChanged');
        this.save();
        return { ok: true };
    },

    // ---- Research system ---------------------------------------
    startResearch(nodeId) {
        const s = this.state;
        const node = RESEARCH[nodeId];
        if (!node) return { ok: false, msg: 'Ricerca non trovata.' };

        if (s.researchQueue.length >= 1) {
            return { ok: false, msg: 'Stai già ricercando qualcosa.' };
        }

        const currentLevel = s.research[nodeId] || 0;
        if (currentLevel >= node.maxLevel) {
            return { ok: false, msg: 'Ricerca già al massimo livello.' };
        }

        // Requirements check
        for (const [reqId, reqLevel] of Object.entries(node.requires || {})) {
            if ((s.research[reqId] || 0) < reqLevel) {
                const reqNode = RESEARCH[reqId];
                return { ok: false, msg: `Richiede ${reqNode ? reqNode.name : reqId} Lv.${reqLevel}.` };
            }
        }

        // Academy required
        const academy = this.getBuilding('academy');
        if (!academy) return { ok: false, msg: 'Costruisci prima un\'Accademia.' };

        const toLevel = currentLevel + 1;
        const lvlData = node.levelData[toLevel - 1];
        if (!lvlData) return { ok: false, msg: 'Dati ricerca non trovati.' };

        if (!this.canAfford(lvlData.cost)) return { ok: false, msg: 'Risorse insufficienti.' };
        this.deductCost(lvlData.cost);

        // Speed bonus from academy level
        const rBonus = this.getResearchBonuses();
        const academyBonus = BUILDINGS.academy.levelData[academy.level - 1]?.effect?.researchSpeedBonus || 0;
        const testMult = s.testingMode ? 10 : 1;
        const speedReduction = ((rBonus.constructionSpeedBonus || 0) + academyBonus) / 100;
        const timeSec = Math.round((lvlData.researchTime / testMult) * Math.max(0.1, 1 - speedReduction));
        const finishAt = Date.now() + timeSec * 1000;

        const startAt = Date.now();
        s.researchQueue.push({ nodeId, toLevel, startAt, finishAt });
        this.emit('researchQueueChanged');
        this.save();
        return { ok: true, finishAt };
    },

    _completeResearch(item) {
        this.state.research[item.nodeId] = item.toLevel;
        const node = RESEARCH[item.nodeId];
        this.emit('researchComplete', item);
        this.addNotification(`${node ? node.name : item.nodeId} Lv.${item.toLevel} completata!`, 'research');
        this.save();
    },

    speedUpResearch(idx) {
        const s = this.state;
        const q = s.researchQueue[idx];
        if (!q) return { ok: false, msg: 'Ricerca non trovata.' };

        const remSec = (q.finishAt - Date.now()) / 1000;
        const gems = Math.max(1, Math.ceil(remSec / 60));

        if (s.gems < gems) return { ok: false, msg: 'Gemme insufficienti!' };

        s.gems -= gems;
        s.researchQueue.splice(idx, 1);
        this._completeResearch(q);
        this.emit('researchQueueChanged');
        this.save();
        return { ok: true };
    },

    // ---- Notifications -----------------------------------------
    notifications: [],
    addNotification(msg, type = 'info') {
        const n = { id: Date.now(), msg, type, time: Date.now() };
        this.notifications.unshift(n);
        if (this.notifications.length > 20) this.notifications.pop();
        this.emit('notification', n);
    },

    // ---- Offline progress ---------------------------------------
    applyOfflineProgress() {
        const s = this.state;
        const now = Date.now();
        const elapsedSec = Math.min((now - s.lastSave) / 1000, MAX_OFFLINE_HOURS * 3600);

        if (elapsedSec < 5) return;

        const prod = this.getProduction();
        const storage = this.getStorage();

        for (const res in prod) {
            s.resources[res] = Math.min(
                (s.resources[res] || 0) + prod[res] / 3600 * elapsedSec,
                storage[res]
            );
        }

        // Complete any finished queue items
        const now2 = Date.now();
        s.buildQueue = s.buildQueue.filter(item => {
            if (now2 >= item.finishAt) { this._completeBuild(item); return false; }
            return true;
        });
        s.trainQueue = s.trainQueue.filter(item => {
            if (now2 >= item.finishAt) { this._completeTrain(item); return false; }
            return true;
        });
        s.researchQueue = s.researchQueue.filter(item => {
            if (now2 >= item.finishAt) { this._completeResearch(item); return false; }
            return true;
        });

        const mins = Math.round(elapsedSec / 60);
        if (mins > 0) this.addNotification(`Benvenuto! Prodotto offline per ${mins} minuti.`, 'offline');
        s.lastSave = now;
    },

    // ---- Save / Load -------------------------------------------
    buyRecruits(count) {
        const cost = {
            lumber: TROOPS.recruit.cost.lumber * count,
            iron: TROOPS.recruit.cost.iron * count,
            food: TROOPS.recruit.cost.food * count
        };
        if (!this.canAfford(cost)) return { ok: false, msg: 'Risorse insufficienti per arruolare reclute.' };

        this.deductCost(cost);
        this.state.troops.recruit = (this.state.troops.recruit || 0) + count;
        this.save();
        this.emit('troopsChanged');
        this.emit('trainComplete'); // Refresh views
        return { ok: true, msg: `${count} Reclute arruolate!` };
    },

    promoteRecruits(targetTroopId, count) {
        const s = this.state;
        if ((s.troops.recruit || 0) < count) return { ok: false, msg: 'Non hai abbastanza reclute.' };

        const tDef = TROOPS[targetTroopId];
        if (!tDef) return { ok: false, msg: 'Truppa non valida.' };

        // Promotion cost (50% of normal resources, but uses recruits)
        const promoCost = {};
        for (const [res, amt] of Object.entries(tDef.cost)) {
            promoCost[res] = Math.round(amt * 0.5 * count);
        }

        if (!this.canAfford(promoCost)) return { ok: false, msg: 'Risorse insufficienti per l\'addestramento.' };

        this.deductCost(promoCost);
        s.troops.recruit -= count;

        // Start training (faster than normal training: -30% time)
        const baseMs = (tDef.trainTime * 0.7) * 1000;
        const now = Date.now();
        let finishAt = now + (baseMs * count);

        // If something is already in queue, add to its finishAt
        if (s.trainQueue.length > 0) {
            finishAt = s.trainQueue[s.trainQueue.length - 1].finishAt + (baseMs * count);
        }

        s.trainQueue.push({
            troopId: targetTroopId,
            count: count,
            perUnitMs: baseMs,
            finishAt: finishAt,
            startAt: now
        });

        this.save();
        this.emit('trainQueueChanged');
        return { ok: true, msg: `Addestramento avviato per ${count} ${tDef.name}!` };
    },

    // ---- Marches & Combat --------------------------------------
    _tickMarches(now) {
        const s = this.state;
        if (!s.marches) return;
        
        let changed = false;
        
        s.marches = s.marches.filter(m => {
            if (m.state === 'marching_out' && now >= m.arriveAt) {
                this._resolveMarch(m);
                changed = true;
            }
            if (m.state === 'marching_in' && now >= m.returnAt) {
                // Return troops
                for (const t in m.payload) {
                    s.troops[t] = (s.troops[t] || 0) + m.payload[t];
                }
                if (m.loot) {
                    for (const r in m.loot) {
                        s.resources[r] = Math.min((s.resources[r] || 0) + m.loot[r], this.getStorage()[r] || 999999);
                    }
                    if (Object.keys(m.loot).length > 0) {
                        this.addNotification('Marcia ritornata con bottino!', 'info');
                    } else {
                        this.addNotification('Marcia ritornata alla città.', 'info');
                    }
                } else {
                    this.addNotification('Marcia ritornata alla città.', 'info');
                }
                changed = true;
                return false; // Remove march from list
            }
            return true;
        });
        
        if (changed) {
            this.emit('marchesChanged');
        }
    },

    _resolveMarch(m) {
        // Find target
        const entity = WORLD_ENTITIES[m.targetId];
        if (!entity || !m.targetId.startsWith('monster_')) {
            // Simplified gathering fallback 
            m.state = 'marching_in';
            const marchTime = m.arriveAt - m.startAt;
            m.returnAt = Date.now() + marchTime;
            m.startAt = Date.now();
            return;
        }

        let playerAtk = 0;
        let totalTroops = 0;
        for (const t in m.payload) {
            const count = m.payload[t];
            totalTroops += count;
            const tDef = TROOPS[t];
            if (tDef && count > 0) {
                let pAtk = tDef.stats.attack * count;
                if (entity.weakness === t) {
                    pAtk *= 1.5; // 50% damage bonus against weakness
                }
                playerAtk += pAtk;
            }
        }
        
        // Simple combat check
        const monsterAtk = entity.stats.attack * entity.level * 20; 
        const monsterHp = entity.hp;

        // Ratio of player output to monster survival 
        const killRatio = playerAtk / Math.max(1, monsterHp);
        
        if (killRatio >= 0.8) { // Requires 80% of HP output to win for now
            this.addNotification(`Vittoria contro ${entity.name}!`, 'train');
            m.loot = entity.loot;
            
            // Losses calculation
            let lossRatio = Math.min(0.5, 1 / Math.max(1, killRatio * 2)); 
            if (killRatio > 5) lossRatio = 0; // Overkill = no losses
            
            for (const t in m.payload) {
                m.payload[t] -= Math.floor(m.payload[t] * lossRatio);
            }
        } else {
            this.addNotification(`Disastrosa Sconfitta contro ${entity.name}...`, 'error');
            m.loot = {}; 
            // All troops lost
            for (const t in m.payload) {
                m.payload[t] = 0; 
            }
        }

        m.state = 'marching_in';
        const marchTime = m.arriveAt - m.startAt;
        const now = Date.now();
        m.returnAt = now + marchTime;
        m.startAt = now;
    },

    calculateMarchTime(x, y, minTroopSpeed) {
        if (minTroopSpeed <= 0) minTroopSpeed = 10;
        const baseSpeed = 60; // Base 60s per tile
        const dX = x - 10;
        const dY = y - 10;
        const dist = Math.sqrt(dX * dX + dY * dY);
        return Math.floor((dist * baseSpeed) / Math.max(1, minTroopSpeed));
    },

    sendMarch(x, y, targetId, troopsPayload) {
        const s = this.state;
        let totalTroops = 0;
        let minSpeed = 999;
        
        for (const t in troopsPayload) {
            const num = parseInt(troopsPayload[t]);
            if (isNaN(num) || num <= 0) {
                delete troopsPayload[t];
                continue;
            }
            if ((s.troops[t] || 0) < num) {
                return { ok: false, msg: `Non hai abbastanza ${TROOPS[t].name}.` };
            }
            troopsPayload[t] = num;
            totalTroops += num;
            
            if (TROOPS[t].stats.speed < minSpeed) {
                minSpeed = TROOPS[t].stats.speed;
            }
        }

        if (totalTroops === 0) return { ok: false, msg: "Nessuna truppa selezionata per l'attacco." };

        // Deduct troops immediately
        for (const t in troopsPayload) {
            s.troops[t] -= troopsPayload[t];
        }

        const timeSec = this.calculateMarchTime(x, y, minSpeed);
        const testMult = s.testingMode ? 10 : 1;
        const timeSecAdjusted = Math.max(1, timeSec / testMult); // Faster in testing mode

        const now = Date.now();
        if (!s.marches) s.marches = [];
        s.marches.push({
            id: 'march_' + now,
            x, y,
            targetId,
            state: 'marching_out',
            payload: troopsPayload,
            startAt: now,
            arriveAt: now + (timeSecAdjusted * 1000),
            returnAt: 0,
            loot: {}
        });

        this.save();
        this.emit('marchesChanged');
        return { ok: true, msg: 'Le tue truppe sono in marcia!' };
    },

    save() {
        this.state.lastSave = Date.now();
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.warn('[Game] Save failed:', e);
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[Game] Load failed:', e);
            return null;
        }
    },

    deleteSave() {
        localStorage.removeItem(SAVE_KEY);
        this.state = createDefaultState();
        this.emit('stateReset');
    },

    // ---- Helpers -----------------------------------------------
    formatTime(seconds) {
        if (seconds <= 0) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    },

    formatNumber(n) {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return Math.floor(n).toString();
    },

    getTotalPower() {
        // Simple power formula
        let power = 0;
        const s = this.state;
        for (const [slotId, bData] of Object.entries(s.buildings)) {
            power += bData.level * 200;
        }
        for (const [troopId, count] of Object.entries(s.troops)) {
            const t = TROOPS[troopId];
            if (t) power += count * (t.stats.attack + t.stats.defense);
        }
        for (const [nodeId, level] of Object.entries(s.research)) {
            power += level * 150;
        }
        return power;
    },

    getBuilding(buildingId) {
        for (const slotId in this.state.buildings) {
            const b = this.state.buildings[slotId];
            if (b.buildingId === buildingId) return b;
        }
        return null;
    },

    hasBuilding(buildingId, minLevel = 1) {
        const b = this.getBuilding(buildingId);
        return b && b.level >= minLevel;
    },

    getBuildingLevel(buildingId) {
        const b = this.getBuilding(buildingId);
        return b ? b.level : 0;
    }
};

// ---------------------------------------------------------------
//  MODAL UTILITY (Graphical Popups)
// ---------------------------------------------------------------
const Modal = {
    show(title, html) {
        const modal = document.getElementById('modal-overlay');
        const mTitle = document.getElementById('modal-title');
        const mBody = document.getElementById('modal-body');
        if (!modal || !mTitle || !mBody) return;

        mTitle.innerText = title;
        mBody.innerHTML = html;
        modal.classList.add('active');
    },
    close() {
        const modal = document.getElementById('modal-overlay');
        if (modal) modal.classList.remove('active');
    }
};
