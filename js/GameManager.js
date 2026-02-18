import { GENERALS, BUILDINGS, RESOURCES, EXPLORATION_TYPES, REQUEST_TEMPLATES, UNIT_TYPES, ABILITIES, STORE_PACKS } from './data.js';
import { ArmyManager } from './ArmyManager.js';
import { QuestManager } from './QuestManager.js';
import { BattleManager } from './BattleManager.js';
import { SceneManager } from './SceneManager.js';

export class GameManager {
    constructor() {
        this.listeners = []; // Initialize listeners first!

        this.armyManager = new ArmyManager(this);
        this.questManager = new QuestManager(this);
        this.battleManager = new BattleManager(this);
        // SceneManager will be assigned by Main

        this.resources = {
            gems: 0,
            diamonds: 0,
            solidi: 500,
            wood: 200,
            stone: 100,
            iron: 50,
            weapons: 0,
            armor: 0,
            food: 100,
            population: 2 // Starting population
        };
        this.buildings = [];
        this.selectedGeneral = null;

        // General Stats (RPG Progression)
        this.generalStats = {
            level: 1,
            xp: 0,
            nextLevelXp: 1000
        };

        this.productionRates = {
            solidi: 0,
            wood: 0,
            stone: 0,
            iron: 0,
            food: 0
        };

        // Grid System
        this.gridSize = 50; // 50x50
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));

        this.activeRequests = [];
        this.explorers = {}; // Map of resourceType -> endTime

        // Request generation
        this.lastRequestTime = Date.now();
        this.requestInterval = 15000;

        // Speed Up Cost Factor
        this.speedUpBaseCost = 50;

        // Store / Progression
        this.unlockedAbilities = ['fireball']; // Default unlocked
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }

    selectGeneral(generalId) {
        this.selectedGeneral = GENERALS.find(g => g.id === generalId);
        this.startGame();
    }

    startGame() {
        // Center the palace on the 50x50 grid (25, 25)
        const centerX = Math.floor(this.gridSize / 2) - 1;
        const centerZ = Math.floor(this.gridSize / 2) - 1;
        this.constructBuildingAt('palace', centerX, centerZ, true);

        this.startLoop();
        this.startPassiveXpLoop();

        // Auto-Save Interval (30s)
        setInterval(() => {
            if (this.hasSaveGame() || this.resources.solidi > 0) { // Don't save empty states unnecessarily
                this.saveGame();
            }
        }, 30000);
    }

    startLoop() {
        setInterval(() => {
            this.updateResources();
            this.checkRequests();
            this.checkExplorers();
            this.checkConstruction();
        }, 1000);
    }

    startPassiveXpLoop() {
        // Passive XP gain: amount depends on city size (buildings)
        setInterval(() => {
            // Base XP (1) + 1 XP per 2 active buildings
            const activeBuildings = this.buildings.filter(b => b.status === 'active').length;
            const xpAmount = 1 + Math.floor(activeBuildings / 2);
            this.addXp(xpAmount);
        }, 5000);
    }

    addXp(amount) {
        this.generalStats.xp += amount;

        // Check for level up
        if (this.generalStats.xp >= this.generalStats.nextLevelXp) {
            this.generalStats.xp -= this.generalStats.nextLevelXp;
            this.generalStats.level++;
            // Increase requirement for next level (simple curve)
            this.generalStats.nextLevelXp = Math.floor(this.generalStats.nextLevelXp * 1.5);
            console.log(`Leveled Up! New Level: ${this.generalStats.level}`);

            // TODO: Notification or visual effect
        }
        this.notify();
    }

    updateResources() {
        if (!this.selectedGeneral) return;

        let prod = { solidi: 0, wood: 0, stone: 0, iron: 0, food: 0 };
        let maxPop = 0;

        this.buildings.forEach(b => {
            if (b.status !== 'active') return; // Only active buildings produce

            const def = BUILDINGS[b.type];
            if (def) {
                // ... production logic existing ...
                const lvlMult = Math.pow(1.5, (b.level || 1) - 1);

                // Population Cap from Houses
                if (def.populationCap) {
                    maxPop += Math.floor(def.populationCap * lvlMult);
                }

                prod.solidi += def.production.solidi * lvlMult;
                prod.wood += def.production.wood * lvlMult;
                prod.stone += def.production.stone * lvlMult;
                prod.iron += def.production.iron * lvlMult;
                prod.food += def.production.food * lvlMult;

                // Worker Production
                if (b.workers > 0 && def.workerProduction) {
                    if (def.workerProduction.food) prod.food += b.workers * def.workerProduction.food;
                    if (def.workerProduction.solidi) prod.solidi += b.workers * def.workerProduction.solidi;
                    if (def.workerProduction.wood) prod.wood += b.workers * def.workerProduction.wood;
                    if (def.workerProduction.stone) prod.stone += b.workers * def.workerProduction.stone;
                    if (def.workerProduction.iron) prod.iron += b.workers * def.workerProduction.iron;
                }
            }
        });

        // MILL EFFFECT (Global Food Bonus)
        const mill = this.buildings.find(b => b.type === 'mill' && b.status === 'active');
        if (mill) {
            prod.food *= 1.2; // 20% Bonus
        }

        // POPULATION LOGIC
        // 1. Growth
        // If enough food (>= 1) and space (pop < maxPop), populate increases
        // Growth rate: 1 per tick (simple for now)
        if (this.resources.food >= 1 && this.resources.population < maxPop) {
            this.resources.population++;
        }

        // 2. Consumption
        // Each person consumes 0.2 Food
        // If food runs out, population dies? For now just stops growing/producing tax?
        // Let's keep it simple: consume food.
        const consumption = Math.floor(this.resources.population * 0.2);
        this.resources.food -= consumption;
        if (this.resources.food < 0) this.resources.food = 0; // No negative food

        // 3. Tax Revenue
        // Count Idle Population
        let totalAssigned = 0;
        this.buildings.forEach(b => {
            if (b.workers) totalAssigned += b.workers;
        });

        const idlePop = Math.max(0, this.resources.population - totalAssigned);

        // Each IDLE person generates 0.2 Solidi
        const tax = Math.floor(idlePop * 0.2);
        prod.solidi += tax;

        // Apply General Bonuses
        if (this.selectedGeneral.bonus.income) prod.solidi *= this.selectedGeneral.bonus.income;
        // Apply materials bonus to all materials
        if (this.selectedGeneral.bonus.materials) {
            prod.wood *= this.selectedGeneral.bonus.materials;
            prod.stone *= this.selectedGeneral.bonus.materials;
            prod.iron *= this.selectedGeneral.bonus.materials;
        }

        this.resources.solidi += prod.solidi;
        this.resources.wood += prod.wood;
        this.resources.stone += prod.stone;
        this.resources.iron += prod.iron;
        this.resources.food += prod.food;

        this.productionRates = prod;
        this.notify();
    }

    updateResource(type, amount) {
        console.log(`Updating resource: ${type} by ${amount}`);
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;
            this.notify();
        }
    }

    convertDiamond() {
        if (this.resources.diamonds >= 1) {
            this.resources.diamonds -= 1;
            this.resources.solidi += 1000;
            this.notify();
            return true;
        }
        return false;
    }

    craftItem(type) {
        let cost = {};
        if (type === 'weapons') {
            cost = { iron: 10 };
        } else if (type === 'armor') {
            cost = { iron: 20 };
        } else {
            return false;
        }

        if (this.resources.iron >= cost.iron) {
            this.resources.iron -= cost.iron;
            this.resources[type] = (this.resources[type] || 0) + 1;
            this.notify();
            return true;
        }
        return false;
    }

    checkConstruction() {
        const now = Date.now();
        let changed = false;

        this.buildings.forEach(b => {
            if (b.status === 'constructing') {
                if (now >= b.endTime) {
                    b.status = 'active';
                    changed = true;

                    if (b.isUpgrading) {
                        b.level = (b.level || 1) + 1;
                        delete b.isUpgrading;
                        this.addXp(10); // 10 XP for upgrade
                        console.log(`Building upgraded to Level ${b.level}`);
                    }

                    // Check for requests waiting for this building
                    const req = this.activeRequests.find(r => r.target === b.type && r.status === 'constructing');
                    if (req) {
                        this.completeRequest(req);
                    }
                    this.saveGame();
                }
            }
        });

        if (changed) this.notify();
    }

    completeRequest(req) {
        req.status = 'completed';
        if (req.reward.solidi) this.resources.solidi += req.reward.solidi;
        this.saveGame();
        this.notify();

        setTimeout(() => {
            this.activeRequests = this.activeRequests.filter(r => r.id !== req.id);
            this.notify();
        }, 3000);
    }

    checkRequests() {
        if (this.activeRequests.length < 3 && Date.now() - this.lastRequestTime > this.requestInterval) {
            this.generateRequest();
            this.lastRequestTime = Date.now();
        }
    }

    generateRequest() {
        const template = REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
        if (this.activeRequests.find(r => r.target === template.target)) return;

        const request = {
            id: Date.now(),
            ...template,
            status: 'active'
        };
        this.activeRequests.push(request);
        this.notify();
    }

    checkRequestCompletion(buildingType) {
        const reqIndex = this.activeRequests.findIndex(r => r.target === buildingType && r.status === 'active');
        if (reqIndex !== -1) {
            const req = this.activeRequests[reqIndex];
            req.status = 'completed';

            if (req.reward.solidi) this.resources.solidi += req.reward.solidi;

            this.notify();

            setTimeout(() => {
                this.activeRequests = this.activeRequests.filter(r => r.id !== req.id);
                this.notify();
            }, 3000);
        }
    }

    canAfford(buildingId) {
        const b = BUILDINGS[buildingId];
        if (!b) return false;

        return this.resources.solidi >= b.cost.solidi &&
            this.resources.wood >= b.cost.wood &&
            this.resources.stone >= b.cost.stone &&
            this.resources.iron >= b.cost.iron;
    }

    getFreeSpot(width, depth) {
        // Optimization: Scan from center outwards
        const cx = Math.floor(this.gridSize / 2);
        const cz = Math.floor(this.gridSize / 2);

        // Generate all possible top-left positions
        const possibleSpots = [];
        for (let z = 0; z <= this.gridSize - depth; z++) {
            for (let x = 0; x <= this.gridSize - width; x++) {
                // Calc distance from center of this spot to map center
                // Center of the building spot:
                const bx = x + width / 2;
                const bz = z + depth / 2;
                const dist = (bx - cx) ** 2 + (bz - cz) ** 2;
                possibleSpots.push({ x, z, dist });
            }
        }

        // Sort by distance (closest to center first)
        possibleSpots.sort((a, b) => a.dist - b.dist);

        // Check each spot
        for (const spot of possibleSpots) {
            let isFree = true;
            for (let dz = 0; dz < depth; dz++) {
                for (let dx = 0; dx < width; dx++) {
                    if (this.grid[spot.z + dz][spot.x + dx] !== null) {
                        isFree = false;
                        break;
                    }
                }
                if (!isFree) break;
            }

            if (isFree) return { x: spot.x, z: spot.z };
        }

        return null; // No spot found
    }

    constructBuilding(buildingId, isFree = false) {
        const b = BUILDINGS[buildingId];
        if (!b) return;

        // Check resources (if not free)
        if (!isFree && !this.canAfford(buildingId)) return false;

        // Check Grid Space
        const spot = this.getFreeSpot(b.width, b.depth);
        if (!spot) {
            console.log("Not enough space in the city!");
            return false;
        }

        return this.placeBuilding(buildingId, spot.x, spot.z, isFree);
    }

    constructBuildingAt(buildingId, x, z, isFree = false) {
        // Force placement at specific spot (for initialization)
        const b = BUILDINGS[buildingId];
        if (!b) return;
        return this.placeBuilding(buildingId, x, z, isFree);
    }

    placeBuilding(buildingId, x, z, isFree) {
        const b = BUILDINGS[buildingId];

        // Deduct Resources
        if (!isFree) {
            this.resources.solidi -= b.cost.solidi;
            this.resources.wood -= b.cost.wood;
            this.resources.stone -= b.cost.stone;
            this.resources.iron -= b.cost.iron;
        }

        // Determine Construction Time
        let time = b.buildTime || 0;
        if (this.selectedGeneral) {
            if (this.selectedGeneral.bonus.constructionTime) time *= this.selectedGeneral.bonus.constructionTime;
            if (this.selectedGeneral.bonus.constructionSpeed) time /= this.selectedGeneral.bonus.constructionSpeed;
        }
        if (isFree) time = 0;

        // Place on Grid
        const newBuilding = {
            id: Date.now() + Math.random(),
            type: buildingId,
            gridX: x,
            gridZ: z,
            width: b.width,
            depth: b.depth,
            status: time > 0 ? 'constructing' : 'active',
            level: 1,
            workers: 0,
            startTime: Date.now(),
            endTime: Date.now() + time,
            totalTime: time
        };

        // Mark grid cells
        for (let dz = 0; dz < b.depth; dz++) {
            for (let dx = 0; dx < b.width; dx++) {
                if (z + dz < this.gridSize && x + dx < this.gridSize) {
                    this.grid[z + dz][x + dx] = newBuilding.id;
                }
            }
        }

        this.buildings.push(newBuilding);
        this.addXp(50);

        // Handle Request Status
        const req = this.activeRequests.find(r => r.target === buildingId && r.status === 'active');
        if (req) {
            if (newBuilding.status === 'active') {
                this.completeRequest(req);
            } else {
                req.status = 'constructing';
                this.notify();
            }
        }

        this.notify();
        this.saveGame();
        return newBuilding;
    }

    upgradeBuilding(buildingId) {
        const b = this.buildings.find(b => b.id === buildingId);
        if (!b || b.status !== 'active') return;

        const def = BUILDINGS[b.type];
        // Cost: 1.5x base cost * current level
        const levelMultiplier = Math.pow(1.5, b.level || 1);
        const cost = {
            solidi: Math.floor(def.cost.solidi * levelMultiplier),
            wood: Math.floor(def.cost.wood * levelMultiplier),
            stone: Math.floor(def.cost.stone * levelMultiplier),
            iron: Math.floor(def.cost.iron * levelMultiplier)
        };

        // Check affordability
        if (this.resources.solidi < cost.solidi ||
            this.resources.wood < cost.wood ||
            this.resources.stone < cost.stone ||
            this.resources.iron < cost.iron) {
            console.log("Not enough resources to upgrade");
            return false;
        }

        // Deduct resources
        this.resources.solidi -= cost.solidi;
        this.resources.wood -= cost.wood;
        this.resources.stone -= cost.stone;
        this.resources.iron -= cost.iron;

        // Start Upgrade
        // Time: 50% of base time * level (maybe? or just fixed 50%)
        // Let's go with 50% of base time
        const upgradeTime = (def.buildTime || 5000) * 0.5;

        b.status = 'constructing';
        b.startTime = Date.now();
        b.endTime = Date.now() + upgradeTime;
        b.totalTime = upgradeTime;

        // After upgrade completes (in checkConstruction), level will be incremented there?
        // Actually checkConstruction handles 'constructing' -> 'active'.
        // We should add a flag or just assume construction on existing building means upgrade?
        // Let's simply handle the level increment NOW or in checkConstruction?
        // If we do it now, it might be weird if we cancel. 
        // Let's store 'isUpgrading' flag.
        b.isUpgrading = true;

        this.notify();
        this.saveGame();
        return true;
    }

    sendExplorer(type) {
        const def = EXPLORATION_TYPES[type];
        if (!def) return;

        if (this.resources.solidi < def.cost) return;
        if (this.explorers[type]) return;

        this.resources.solidi -= def.cost;
        this.explorers[type] = {
            endTime: Date.now() + def.time,
            def: def
        };
        this.saveGame();
        this.notify();
    }

    checkExplorers() {
        const now = Date.now();
        for (const [type, data] of Object.entries(this.explorers)) {
            if (now >= data.endTime) {
                delete this.explorers[type];

                if (Math.random() > data.def.risk) {
                    const amount = Math.floor(Math.random() * (data.def.max - data.def.min + 1)) + data.def.min;
                    this.resources[type] += amount;
                    console.log(`Explorer returned with ${amount} ${type}`);
                } else {
                    console.log(`Explorer failed to find ${type}`);
                }
                this.saveGame();
                this.notify();
            }
        }
    }
    assignWorker(buildingId) {
        const b = this.buildings.find(b => b.id === buildingId);
        if (!b) return;

        const def = BUILDINGS[b.type];
        if (!def.workerSlots) return;

        // Check slots
        if ((b.workers || 0) >= def.workerSlots) return;

        // Check available population
        let totalAssigned = 0;
        this.buildings.forEach(build => {
            if (build.workers) totalAssigned += build.workers;
        });

        if (this.resources.population > totalAssigned) {
            b.workers = (b.workers || 0) + 1;
            this.notify();
        }
    }

    removeWorker(buildingId) {
        const b = this.buildings.find(b => b.id === buildingId);
        if (!b) return;

        if ((b.workers || 0) > 0) {
            b.workers--;
            this.notify();
        }
    }

    // --- STORE & SPELLS ---

    unlockAbility(abilityId) {
        if (this.unlockedAbilities.includes(abilityId)) return true; // Already unlocked

        const ability = ABILITIES[abilityId];
        if (!ability) return false;

        const cost = ability.unlockCost;
        if (!cost) return true; // Free?

        // Check costs
        for (const [res, amount] of Object.entries(cost)) {
            if ((this.resources[res] || 0) < amount) return false;
        }

        // Deduct
        for (const [res, amount] of Object.entries(cost)) {
            this.resources[res] -= amount;
        }

        this.unlockedAbilities.push(abilityId);
        this.saveGame();
        this.notify();
        return true;
    }

    buyStoreItem(packId, category) {
        // Find pack
        const pack = STORE_PACKS[category].find(p => p.id === packId);
        if (!pack) return false;

        // Check Cost
        if (typeof pack.cost === 'object') {
            for (const [res, amount] of Object.entries(pack.cost)) {
                if ((this.resources[res] || 0) < amount) return false;
            }
            // Deduct
            for (const [res, amount] of Object.entries(pack.cost)) {
                this.resources[res] -= amount;
            }
        }
        // If cost is "Free" or string, ignore deduction

        // Grant Reward
        for (const [res, amount] of Object.entries(pack.reward)) {
            this.resources[res] = (this.resources[res] || 0) + amount;
        }

        this.saveGame();
        this.notify();
        return true;
    }

    // --- Persistence ---

    hasSaveGame() {
        return !!localStorage.getItem('etws_save_data');
    }

    saveGame() {
        const data = {
            resources: this.resources,
            buildings: this.buildings,
            selectedGeneral: this.selectedGeneral ? this.selectedGeneral.id : null,
            generalStats: this.generalStats,
            activeRequests: this.activeRequests,
            explorers: this.explorers,
            lastRequestTime: this.lastRequestTime,
            army: this.armyManager.exportState(),
            quests: this.questManager.exportState(),
            unlockedAbilities: this.unlockedAbilities,
            timestamp: Date.now()
        };
        localStorage.setItem('etws_save_data', JSON.stringify(data));
        console.log("Game Saved");
        return true;
    }

    loadGame() {
        const json = localStorage.getItem('etws_save_data');
        if (!json) return false;

        try {
            const data = JSON.parse(json);

            this.resources = data.resources;
            this.buildings = data.buildings;

            if (data.selectedGeneral) {
                this.selectedGeneral = GENERALS.find(g => g.id === data.selectedGeneral);
            }

            this.generalStats = data.generalStats || { level: 1, xp: 0, nextLevelXp: 1000 };
            this.activeRequests = data.activeRequests || [];
            this.explorers = data.explorers || {};
            this.lastRequestTime = data.lastRequestTime || Date.now();
            this.unlockedAbilities = Array.isArray(data.unlockedAbilities) ? data.unlockedAbilities : ['fireball'];

            // Managers
            if (data.army) this.armyManager.importState(data.army);
            if (data.quests) this.questManager.importState(data.quests); // This triggers UI update for quests

            // Rebuild Grid
            this.rebuildGrid();

            // Start Loops
            this.startLoop();
            this.startPassiveXpLoop();

            this.notify();
            return true;
        } catch (e) {
            console.error("Failed to load save:", e);
            return false;
        }
    }

    resetGame() {
        localStorage.removeItem('etws_save_data');
        location.reload();
    }

    rebuildGrid() {
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.buildings.forEach(b => {
            // Handle potential missing data if save is old (though this is new feature)
            const width = b.width || 1;
            const depth = b.depth || 1;

            for (let dz = 0; dz < depth; dz++) {
                for (let dx = 0; dx < width; dx++) {
                    const z = b.gridZ + dz;
                    const x = b.gridX + dx;
                    if (z < this.gridSize && x < this.gridSize) {
                        this.grid[z][x] = b.id;
                    }
                }
            }
        });
    }
}
