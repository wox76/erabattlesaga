import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BUILDINGS } from './data.js';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 50, 60); // Adjusted view

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        // OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 300;
        this.controls.target.set(0, 0, 0);

        // Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.buildingMeshes = []; // Keep track of meshes for interaction

        // Interaction Callback
        this.onBuildingClick = null;

        this.setupLights();
        this.createGround(); // Large ground
        this.createGrid();   // City Grid

        window.addEventListener('resize', () => this.onWindowResize(), false);
        this.canvas.addEventListener('click', (e) => this.onMouseClick(e), false);

        this.animate();

        // Constants for Grid
        this.cellSize = 10;
        this.gridSize = 5; // 5x5 cells
        this.gridOffset = (this.gridSize * this.cellSize) / 2;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
    }

    createGround() {
        // Infinite-looking ground
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const material = new THREE.MeshStandardMaterial({ color: 0x3a9d23 });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.position.y = -0.1; // Slightly below grid
        this.scene.add(ground);
    }

    createGrid() {
        // Visual Grid Helper
        const size = 50; // 5 cells * 10 units
        const divisions = 5;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x000000, 0x000000);
        gridHelper.position.y = 0.1; // Slightly above ground
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Mark the city area
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.1 });
        const cityArea = new THREE.Mesh(geometry, material);
        cityArea.rotation.x = -Math.PI / 2;
        this.scene.add(cityArea);
    }

    // Helper to create material based on status and level
    getBuildingMaterial(colorHex, status, level = 1) {
        if (status === 'constructing') {
            return new THREE.MeshStandardMaterial({
                color: 0xFFA500, // Orange
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
        }

        const color = new THREE.Color(colorHex);

        // Adjust saturation/lightness based on level
        if (level > 1) {
            const hsl = {};
            color.getHSL(hsl);
            // Increase saturation by 20% per level (capped at 1)
            hsl.s = Math.min(1.0, hsl.s + (level - 1) * 0.2);
            // Slightly darken to make color deeper/richer? Or keep lightness same?
            // Let's just boost saturation for now as requested.
            color.setHSL(hsl.h, hsl.s, hsl.l);
        }

        return new THREE.MeshStandardMaterial({ color: color });
    }

    addBuilding(buildingData) {
        const def = BUILDINGS[buildingData.type];
        if (!def) return;

        const w = buildingData.width || 1;
        const d = buildingData.depth || 1;

        // Box geometry based on size
        const geometry = new THREE.BoxGeometry(w * 10 - 2, 10, d * 10 - 2); // -2 provides a small gap

        const material = this.getBuildingMaterial(def.color, buildingData.status, buildingData.level);
        const mesh = new THREE.Mesh(geometry, material);

        // User Data for identification
        mesh.userData = { id: buildingData.id, type: buildingData.type };

        // Position
        const startX = -(this.gridSize * this.cellSize) / 2;
        const startZ = -(this.gridSize * this.cellSize) / 2;

        const centerX = startX + (buildingData.gridX * this.cellSize) + (w * this.cellSize) / 2;
        const centerZ = startZ + (buildingData.gridZ * this.cellSize) + (d * this.cellSize) / 2;

        mesh.position.set(centerX, 5, centerZ); // y=5 (height/2)
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.buildingMeshes.push(mesh);
    }

    // Update visual if status changes (called by GameManager/Main)
    updateBuildingStatus(building) {
        const mesh = this.buildingMeshes.find(m => m.userData.id === building.id);
        if (mesh) {
            const def = BUILDINGS[mesh.userData.type];
            // Pass level to get material with correct saturation
            mesh.material = this.getBuildingMaterial(def.color, building.status, building.level);
        }
    }

    onMouseClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.buildingMeshes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            console.log("Clicked object:", object.userData);
            if (this.onBuildingClick) {
                this.onBuildingClick(object.userData.id);
            }
        } else {
            console.log("Clicked nothing");
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update(); // Required for damping
        this.renderer.render(this.scene, this.camera);
    }
}
