import { GameManager } from './GameManager.js';
import { SceneManager } from './SceneManager.js';
import { UIManager } from './UIManager.js';

window.addEventListener('DOMContentLoaded', () => {
    // Canvas
    const canvas = document.getElementById('game-canvas');

    // Core Systems
    const sceneManager = new SceneManager(canvas);
    const gameManager = new GameManager();

    // Link them
    gameManager.sceneManager = sceneManager;

    // Pass gameManager to UI (already correct)
    const uiManager = new UIManager(gameManager);

    // Expose for debug/UI interactions (Required for inline onclicks in UIManager)
    window.game = {
        gameManager,
        sceneManager,
        uiManager
    };

    // Hook up Interaction
    sceneManager.onBuildingClick = (buildingId) => {
        console.log("Main received click for building:", buildingId);
        // Check if building is constructing or active
        const b = gameManager.buildings.find(b => b.id === buildingId);
        if (b) {
            if (b.status === 'constructing') {
                gameManager.speedUpBuilding(buildingId);
            } else {
                uiManager.showBuildingUpgradeModal(buildingId);
            }
        }
    };

    // Hook up Game Events to Scene
    gameManager.subscribe(() => {
        const gameBuildings = gameManager.buildings;

        gameBuildings.forEach(b => {
            // Check if scene has this building
            let mesh = sceneManager.buildingMeshes.find(m => m.userData.id === b.id);

            if (!mesh) {
                // Add new building
                sceneManager.addBuilding(b);
            } else {
                // Update visual state (e.g. constructing -> active, or level change)
                sceneManager.updateBuildingStatus(b);
            }
        });
    });

    console.log("City Administration Game Initialized");
});
