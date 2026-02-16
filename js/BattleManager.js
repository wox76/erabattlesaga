import { UNIT_TYPES } from './data.js';

export class BattleManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    startQuestBattle(subQuest, onWinCallback) {
        // 1. Get Player Army
        const playerArmy = this.gameManager.armyManager.getAllUnits();
        if (playerArmy.length === 0) {
            alert("You need an army to fight!");
            return;
        }

        // 2. Generate Enemy Army based on subQuest
        const enemyPower = subQuest.target.power;
        const enemyName = subQuest.target.enemyName;
        const enemyArmy = this.generateEnemyArmy(enemyPower, enemyName);

        // 3. Switch Scene to Battle
        // We pass a callback that SceneManager calls when battle ends
        this.gameManager.sceneManager.switchToBattle(playerArmy, enemyArmy, (isVictory, deadUnits) => {
            this.handleBattleEnd(isVictory, deadUnits, onWinCallback);
        });
    }

    generateEnemyArmy(power, name) {
        const army = [];
        let currentPower = 0;

        // Simple generation: add units until power is met
        // Determine unit types based on name/theme if possible, otherwise random
        const types = Object.keys(UNIT_TYPES);

        while (currentPower < power) {
            // Pick random unit
            const typeId = types[Math.floor(Math.random() * types.length)];
            const def = UNIT_TYPES[typeId];

            // Create unit object (mocking ArmyManager structure)
            const unit = {
                id: Date.now() + Math.random(),
                type: typeId,
                level: 1, // varied levels?
                stats: { ...def.stats }
            };

            // Basic power calc
            const unitPower = (unit.stats.attack + unit.stats.health);

            if (currentPower + unitPower <= power * 1.2) { // Allow slight overflow
                army.push(unit);
                currentPower += unitPower;
            } else {
                // If we can't fit a big unit, maybe break or just add a weak soldier
                if (typeId !== 'soldier') {
                    // Try adding soldiers to fill gap
                    const soldierDef = UNIT_TYPES['soldier'];
                    const soldierPower = soldierDef.stats.attack + soldierDef.stats.health;
                    if (currentPower + soldierPower <= power * 1.2) {
                        army.push({
                            id: Date.now() + Math.random(),
                            type: 'soldier',
                            level: 1,
                            stats: { ...soldierDef.stats }
                        });
                        currentPower += soldierPower;
                    } else {
                        break; // Close enough
                    }
                } else {
                    break;
                }
            }
        }
        return army;
    }

    handleBattleEnd(isVictory, deadUnits, onWinCallback) {
        console.log(`Battle Ended. Victory: ${isVictory}`);

        try {
            // Remove dead units from player army
            // SceneManager returns list of dead unit DATA objects
            if (deadUnits && deadUnits.length > 0) {
                deadUnits.forEach(d => {
                    // Find in army manager grid and remove
                    // We need to match by ID
                    const grid = this.gameManager.armyManager.grid;
                    for (let r = 0; r < 5; r++) {
                        for (let c = 0; c < 5; c++) {
                            if (grid[r][c] && grid[r][c].id === d.id) {
                                this.gameManager.armyManager.removeUnit(r, c);
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Error processing battle results:", e);
        }

        // Show Result UI
        // Show Result UI
        if (isVictory) {
            // alert("Victory! You defeated the enemy."); // Replaced
            this.gameManager.uiManager.showPopup("<strong>Victory!</strong><br>You defeated the enemy.", () => {
                if (onWinCallback) {
                    try {
                        console.log("Executing Battle Win Callback...");
                        onWinCallback();
                        console.log("Battle Win Callback executed successfully.");
                    } catch (err) {
                        console.error("Error in Battle Win Callback:", err);
                    }
                }
                // Return to City AFTER dismissing popup
                if (this.gameManager.sceneManager) {
                    console.log("Calling SceneManager.switchToCity()...");
                    this.gameManager.sceneManager.switchToCity();
                }
            });
        } else {
            // alert("Defeat! Your army has been crushed."); // Replaced
            this.gameManager.uiManager.showPopup("<strong>Defeat!</strong><br>Your army has been crushed.", () => {
                // Return to City AFTER dismissing popup
                if (this.gameManager.sceneManager) {
                    console.log("Calling SceneManager.switchToCity()...");
                    this.gameManager.sceneManager.switchToCity();
                }
            });
        }
    }
}
