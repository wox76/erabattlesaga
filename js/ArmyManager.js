import { UNIT_TYPES } from './data.js';

export class ArmyManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.gridSize = 5;
        // 5x5 grid, null = empty, object = unit
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.armyValue = 0;
    }

    // --- Grid Management ---

    getEmptySlot() {
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c] === null) {
                    return { r, c };
                }
            }
        }
        return null;
    }

    addUnit(unitId) {
        const slot = this.getEmptySlot();
        if (!slot) return false;

        const def = UNIT_TYPES[unitId];
        if (!def) return false;

        const unit = {
            id: Date.now() + Math.random(),
            type: unitId,
            level: 1, // Merge level
            stats: { ...def.stats },
            ...slot
        };

        this.grid[slot.r][slot.c] = unit;
        this.calculateArmyValue();
        this.gameManager.notify(); // Update UI
        return unit;
    }

    buyUnit(unitId) {
        const def = UNIT_TYPES[unitId];
        if (!def) return false;

        if (this.gameManager.resources.solidi >= def.cost) {
            if (this.addUnit(unitId)) {
                this.gameManager.resources.solidi -= def.cost;
                this.gameManager.notify();
                return true;
            } else {
                console.log("Army Grid Full!");
                return false;
            }
        } else {
            console.log("Not enough solidi!");
            return false;
        }
    }

    moveUnit(fromR, fromC, toR, toC) {
        const unit = this.grid[fromR][fromC];
        if (!unit) return false;

        const target = this.grid[toR][toC];

        if (target === null) {
            // Move to empty
            this.grid[toR][toC] = unit;
            this.grid[fromR][fromC] = null;
            unit.r = toR;
            unit.c = toC;
        } else {
            // Swap or Merge? 
            if (target.type === unit.type && target.level === unit.level) {
                // Merge!
                this.mergeUnits(target, unit, toR, toC);
                this.grid[fromR][fromC] = null;
            } else {
                // Swap
                this.grid[toR][toC] = unit;
                this.grid[fromR][fromC] = target;
                unit.r = toR;
                unit.c = toC;
                target.r = fromR;
                target.c = fromC;
            }
        }
        this.gameManager.notify();
        return true;
    }

    mergeUnits(targetUnit, sourceUnit, r, c) {
        // Upgrade targetUnit
        targetUnit.level++;
        // Stat boost (e.g. +50% per level)
        targetUnit.stats.attack = Math.floor(targetUnit.stats.attack * 1.5);
        targetUnit.stats.health = Math.floor(targetUnit.stats.health * 1.5);

        console.log(`Merged! Unit Level ${targetUnit.level}`);
        this.calculateArmyValue();
    }

    removeUnit(r, c) {
        this.grid[r][c] = null;
        this.calculateArmyValue();
        this.gameManager.notify();
    }

    calculateArmyValue() {
        let val = 0;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const u = this.grid[r][c];
                if (u) {
                    // Simple value calculation
                    val += (u.stats.attack + u.stats.health) * u.level;
                }
            }
        }
        this.armyValue = val;
    }

    // --- Combat Logic Helpers ---

    getAllUnits() {
        const units = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c]) units.push(this.grid[r][c]);
            }
        }
        return units;
    }
    // --- Persistence ---

    exportState() {
        // Return grid configuration
        // We only need to save units, not empty slots
        const units = [];
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.grid[r][c]) {
                    units.push(this.grid[r][c]);
                }
            }
        }
        return {
            armyValue: this.armyValue,
            units: units
        };
    }

    importState(data) {
        // Clear grid
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.armyValue = 0;

        if (!data || !data.units) return;

        data.units.forEach(u => {
            if (u.r < this.gridSize && u.c < this.gridSize) {
                this.grid[u.r][u.c] = u;
            }
        });

        this.calculateArmyValue();
        this.gameManager.notify();
    }
}
