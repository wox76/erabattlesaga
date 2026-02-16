import { GENERALS, BUILDINGS, RESOURCES, EXPLORATION_TYPES, REQUEST_TEMPLATES, UNIT_TYPES } from './data.js';
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
            solidi: 500,
            wood: 200,
            stone: 100,
            iron: 50,
            food: 100
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
        this.gridSize = 5; // 5x5
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));

        this.activeRequests = [];
        this.explorers = {}; // Map of resourceType -> endTime

        // Request generation
        this.lastRequestTime = Date.now();
        this.requestInterval = 15000;

        // Speed Up Cost Factor
        this.speedUpBaseCost = 50;
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
        this.constructBuilding('palace', true);
        this.startLoop();
        this.startPassiveXpLoop();
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

        this.buildings.forEach(b => {
            if (b.status !== 'active') return; // Only active buildings produce

            const def = BUILDINGS[b.type];
            if (def) {
                const lvlMult = Math.pow(1.5, (b.level || 1) - 1);
                prod.solidi += def.production.solidi * lvlMult;
                prod.wood += def.production.wood * lvlMult;
                prod.stone += def.production.stone * lvlMult;
                prod.iron += def.production.iron * lvlMult;
                prod.food += def.production.food * lvlMult;
            }
        });

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
                }
            }
        });

        if (changed) this.notify();
    }

    completeRequest(req) {
        req.status = 'completed';
        if (req.reward.solidi) this.resources.solidi += req.reward.solidi;
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
        for (let z = 0; z <= this.gridSize - depth; z++) {
            for (let x = 0; x <= this.gridSize - width; x++) {
                // Check if this area is free
                let isFree = true;
                for (let dz = 0; dz < depth; dz++) {
                    for (let dx = 0; dx < width; dx++) {
                        if (this.grid[z + dz][x + dx] !== null) {
                            isFree = false;
                            break;
                        }
                    }
                    if (!isFree) break;
                }

                if (isFree) return { x, z };
            }
        }
        return null; // No spot found
    }

    constructBuilding(buildingId, isFree = false) {
        const b = BUILDINGS[buildingId];
        if (!b) return;

        // Check resources (if not free)
        if (!isFree) {
            if (!this.canAfford(buildingId)) return false;
        }

        // Check Grid Space
        const spot = this.getFreeSpot(b.width, b.depth);
        if (!spot) {
            console.log("Not enough space in the city!");
            return false;
        }

        // Deduct Resources
        if (!isFree) {
            this.resources.solidi -= b.cost.solidi;
            this.resources.wood -= b.cost.wood;
            this.resources.stone -= b.cost.stone;
            this.resources.iron -= b.cost.iron;
        }

        // Determine Construction Time
        // Modifiers: General 'Ofle' or 'Sonya'
        let time = b.buildTime || 0;
        if (this.selectedGeneral) {
            if (this.selectedGeneral.bonus.constructionTime) {
                time *= this.selectedGeneral.bonus.constructionTime;
            }
            // Sonya has constructionSpeed +10%, so time = time / 1.1
            if (this.selectedGeneral.bonus.constructionSpeed) {
                time /= this.selectedGeneral.bonus.constructionSpeed;
            }
        }

        if (isFree) time = 0; // Instant if free (start game)

        // Place on Grid
        const newBuilding = {
            id: Date.now() + Math.random(),
            type: buildingId,
            gridX: spot.x,
            gridZ: spot.z,
            width: b.width,
            depth: b.depth,
            width: b.width,
            depth: b.depth,
            status: time > 0 ? 'constructing' : 'active',
            level: 1, // Start at Level 1
            startTime: Date.now(),
            endTime: Date.now() + time,
            totalTime: time
        };

        // Mark grid cells
        for (let dz = 0; dz < b.depth; dz++) {
            for (let dx = 0; dx < b.width; dx++) {
                this.grid[spot.z + dz][spot.x + dx] = newBuilding.id;
            }
        }

        this.buildings.push(newBuilding);

        // Grant Active XP for starting construction
        this.addXp(50);

        // Handle Request Status
        const req = this.activeRequests.find(r => r.target === buildingId && r.status === 'active');
        if (req) {
            if (newBuilding.status === 'active') {
                this.completeRequest(req);
            } else {
                req.status = 'constructing'; // Intermediate state
                this.notify();
            }
        }

        this.notify();
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
                this.notify();
            }
        }
    }
}
