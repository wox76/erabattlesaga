import { QUEST_DATA } from './data/quest_data.js';

export class QuestManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeQuestIndex = 0;
        this.activeQuest = null;
        this.completedSubQuests = new Set();

        // Load from save or start fresh
        this.loadState();
    }

    loadState() {
        // Mock save/load - in real implementation, get from localStorage
        // For now, simple start
        this.activateQuest(this.activeQuestIndex);

        // Subscribe to game updates
        this.gameManager.subscribe(this.update.bind(this));
    }

    update() {
        if (this.activeQuest) {
            let changed = false;

            this.activeQuest.subQuests.forEach(sq => {
                // Determine if this subquest is currently meetable
                const isMet = !this.isSubQuestCompleted(sq.id) && this.checkCondition(sq);

                // Check if this state is different from the last known state
                // We store the state on the subquest object itself (it's a copy)
                if (sq._lastMetState !== isMet) {
                    sq._lastMetState = isMet;
                    changed = true;
                    // If it became met and it's a CHECK type, we could validly alert or highlight it.
                }
            });

            // Only update UI if the "completable" status of any quest actually changed
            if (changed && this.gameManager.uiManager) {
                this.gameManager.uiManager.updateQuestUI();
            }
        }
    }

    activateQuest(index) {
        if (index >= QUEST_DATA.length) {
            console.log("All quests completed!");
            this.activeQuest = null;
            return;
        }
        this.activeQuestIndex = index;
        this.activeQuest = JSON.parse(JSON.stringify(QUEST_DATA[index])); // Deep copy
        this.completedSubQuests.clear();
        console.log(`Quest Started: ${this.activeQuest.title}`);

        // Trigger UI update
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateQuestUI();
        }
    }

    isSubQuestCompleted(subQuestId) {
        return this.completedSubQuests.has(subQuestId);
    }

    checkCondition(subQuest) {
        if (subQuest.type === 'RESOURCE') {
            const res = subQuest.target.resource;
            const amt = subQuest.target.amount;
            return this.gameManager.resources[res] >= amt;
        }
        if (subQuest.type === 'CHECK') {
            if (subQuest.target.type === 'unit') {
                const units = this.gameManager.armyManager.getAllUnits();
                const count = units.filter(u => u.type === subQuest.target.id).length;
                return count >= subQuest.target.count;
            }
            if (subQuest.target.type === 'building') {
                // Count active buildings of this type
                const count = this.gameManager.buildings.filter(b => b.type === subQuest.target.id && b.status === 'active').length;
                return count >= subQuest.target.count;
            }
            if (subQuest.target.type === 'army_power') {
                const power = this.gameManager.armyManager.getTotalArmyPower();
                return power >= subQuest.target.amount;
            }
        }
        return false; // BATTLE and MONSTER must be triggered manually
    }

    completeSubQuest(subQuestId) {
        if (this.isSubQuestCompleted(subQuestId)) return;

        const subQuest = this.activeQuest.subQuests.find(sq => sq.id === subQuestId);
        if (!subQuest) return;

        // Validation & Consumption
        if (subQuest.type === 'RESOURCE') {
            const res = subQuest.target.resource;
            const amt = subQuest.target.amount;
            if (this.gameManager.resources[res] >= amt) {
                this.gameManager.updateResource(res, -amt);
            } else {
                console.warn(`Not enough resources for quest ${subQuestId}`);
                return false; // Not enough resources
            }
        } else if (subQuest.type === 'CHECK') {
            // Verify condition is actually met before completing!
            if (!this.checkCondition(subQuest)) {
                console.warn(`Conditions not met for quest ${subQuestId}`);
                return false;
            }
        } else if (subQuest.type === 'BATTLE' || subQuest.type === 'MONSTER') {
            // Battle logic handled externally, or we trigger it here
            // If called here, we assume player won
        }

        // Mark complete
        this.completedSubQuests.add(subQuestId);

        // Give Reward
        console.log(`Completing subquest ${subQuestId}, giving rewards:`, subQuest.reward);
        this.giveRewards(subQuest.reward);

        // Check Main Quest Completion
        if (this.completedSubQuests.size === this.activeQuest.subQuests.length) {
            this.completeMainQuest();
        } else {
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateQuestUI();
            }
        }

        return true;
    }

    giveRewards(rewards) {
        if (!rewards) return;

        if (rewards.solidi) this.gameManager.updateResource('solidi', rewards.solidi);
        if (rewards.wood) this.gameManager.updateResource('wood', rewards.wood);
        if (rewards.stone) this.gameManager.updateResource('stone', rewards.stone);
        if (rewards.food) this.gameManager.updateResource('food', rewards.food);
        if (rewards.iron) this.gameManager.updateResource('iron', rewards.iron);
        if (rewards.exp) {
            // Assuming General/Player XP system
            // this.gameManager.addExp(rewards.exp);
            console.log(`Gained ${rewards.exp} XP`);
        }
        if (rewards.item) {
            console.log(`Gained Item: ${rewards.item}`);
        }
    }

    completeMainQuest() {
        console.log(`Quest Completed: ${this.activeQuest.title}`);
        this.giveRewards(this.activeQuest.rewards);
        this.activeQuestIndex++;
        this.activateQuest(this.activeQuestIndex);
    }

    // Call this if battle is won and it matches a quest objective
    startBattleForQuest(subQuestId) {
        const subQuest = this.activeQuest.subQuests.find(sq => sq.id === subQuestId);
        if (!subQuest) return;

        // Open battle UI with specific params
        // We might need to pass a callback or set a state that we are in a quest battle
        this.gameManager.battleManager.startQuestBattle(subQuest, () => {
            this.completeSubQuest(subQuestId);
        });
    }
}
