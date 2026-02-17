import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BUILDINGS, UNIT_TYPES } from './data.js';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        // Mode: 'CITY' | 'ARMY' | 'BATTLE'
        this.mode = 'CITY';

        // Camera Setup (Perspective)
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 50, 60);

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

        // City Meshes
        this.buildingMeshes = [];
        this.cityGroup = new THREE.Group();
        this.scene.add(this.cityGroup);

        // Army Meshes
        this.armyGroup = new THREE.Group();
        this.armyGroup.visible = false; // Hidden by default
        this.scene.add(this.armyGroup);
        this.armySlotMeshes = [];
        this.armyUnitMeshes = [];

        // Interaction Callback
        this.onBuildingClick = null; // City callback
        this.onArmyDragDrop = null;  // Army callback (from, to)

        this.setupLights();
        this.createCityEnvironment(); // Ground + Grid in City Group

        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Mouse Events
        this.canvas.addEventListener('click', (e) => this.onMouseClick(e), false);
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e), false);

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

        // Drag State
        this.draggedUnit = null;
        this.isDragging = false;
        this.dragOffset = new THREE.Vector3();
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

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

    createCityEnvironment() {
        // Ground
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const material = new THREE.MeshStandardMaterial({ color: 0x3a9d23 });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.position.y = -0.1;
        this.cityGroup.add(ground);

        // Grid Helper
        const size = 50;
        const divisions = 5;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x000000, 0x000000);
        gridHelper.position.y = 0.1;
        gridHelper.material.opacity = 0.2;
        gridHelper.material.transparent = true;
        this.cityGroup.add(gridHelper);

        // City Area Indicator
        const areaGeo = new THREE.PlaneGeometry(size, size);
        const areaMat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.1 });
        const cityArea = new THREE.Mesh(areaGeo, areaMat);
        cityArea.rotation.x = -Math.PI / 2;
        this.cityGroup.add(cityArea);
    }

    // --- MODE SWITCHING ---
    switchToCity() {
        console.log("SceneManager: Switching to CITY");
        this.mode = 'CITY';
        this.cityGroup.visible = true;
        this.armyGroup.visible = false;
        console.log("cityGroup visible:", this.cityGroup.visible);
        console.log("armyGroup visible:", this.armyGroup.visible);

        // Ensure Battle Group is hidden and CLEARED
        if (this.battleGroup) {
            this.battleGroup.visible = false;
            while (this.battleGroup.children.length > 0) {
                this.battleGroup.remove(this.battleGroup.children[0]);
            }
            this.combatants = [];
            console.log("battleGroup cleared and hidden");
        }

        this.camera.position.set(0, 50, 60);
        this.controls.enableRotate = true;
        this.controls.target.set(0, 0, 0);
    }

    switchToArmy(armyGridData) {
        console.log("SceneManager: Switching to ARMY");
        this.mode = 'ARMY';
        this.cityGroup.visible = false;
        // ... (rest of function)

        // Ensure battle group is hidden and potentially cleared
        if (this.battleGroup) {
            this.battleGroup.visible = false;
            // Optional: clear it to save memory? 
            // For now, hiding is enough, BUT if units are "leaking", 
            // it might be because they were added to the wrong group?
            // Re-verified code: units use this.battleGroup.add().
            // So visibility should handle it. 
            // However, to be safe, let's clear the battle scene references.
            while (this.battleGroup.children.length > 0) {
                this.battleGroup.remove(this.battleGroup.children[0]);
            }
            this.combatants = [];
        }

        this.armyGroup.visible = true;

        // Camera for Army
        // User wants orbit mode, so we enable rotation
        this.camera.position.set(0, 60, 40);
        this.controls.target.set(0, 0, 0);
        this.controls.enableRotate = true; // Enabled!
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Keep standard constraints

        this.rebuildArmyScene(armyGridData);
    }

    // --- ARMY SCENE GENERATION ---
    rebuildArmyScene(armyGridData) {
        // Clear old
        while (this.armyGroup.children.length > 0) {
            this.armyGroup.remove(this.armyGroup.children[0]);
        }
        this.armySlotMeshes = [];
        this.armyUnitMeshes = [];

        // 1. Create Platform/Table
        const platformGeo = new THREE.BoxGeometry(60, 2, 60);
        const platformMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 }); // Wood
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.y = -1;
        platform.receiveShadow = true;
        this.armyGroup.add(platform);

        // 2. Create Slots (Checkers board style)
        const slotSize = 10;
        const offset = (5 * slotSize) / 2 - (slotSize / 2); // Center it

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const x = (c * slotSize) - offset;
                const z = (r * slotSize) - offset;

                // Visual Slot
                const slotGeo = new THREE.PlaneGeometry(slotSize - 0.5, slotSize - 0.5);
                const isEven = (r + c) % 2 === 0;
                const slotMat = new THREE.MeshStandardMaterial({
                    color: isEven ? 0x5d4037 : 0x795548,
                    side: THREE.DoubleSide
                });
                const slot = new THREE.Mesh(slotGeo, slotMat);
                slot.rotation.x = -Math.PI / 2;
                slot.position.set(x, 0.05, z);
                slot.userData = { isSlot: true, r: r, c: c }; // Identify slot
                this.armyGroup.add(slot);
                this.armySlotMeshes.push(slot);

                // Unit?
                const unit = armyGridData[r][c];
                if (unit) {
                    this.addUnitMesh(unit, x, z);
                }
            }
        }
    }

    addUnitMesh(unit, x, z) {
        const def = UNIT_TYPES[unit.type];
        // Unit representation: Cylinder or Box
        const geo = new THREE.CylinderGeometry(3, 3, 8, 16);

        // Color based on tier/level?
        const color = def.id === 'soldier' ? 0xcccccc :
            def.id === 'archer' ? 0x8fbc8f :
                def.id === 'knight' ? 0x4682b4 : 0xffd700; // Hero gold

        const mat = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(x, 4, z); // y=4 (height/2)
        mesh.userData = { isUnit: true, unitId: unit.id, r: unit.r, c: unit.c };
        mesh.castShadow = true;

        // Add Level Indicator (simple sphere on top)
        if (unit.level > 1) {
            const lvlGeo = new THREE.SphereGeometry(1.5);
            const lvlMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const lvlMesh = new THREE.Mesh(lvlGeo, lvlMat);
            lvlMesh.position.y = 5;
            mesh.add(lvlMesh);
        }

        this.armyGroup.add(mesh);
        this.armyUnitMeshes.push(mesh);
    }

    // --- CITY BUILDING HELPER ---
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

        // Darken based on level (15% darker per level after 1)
        if (level > 1) {
            const factor = Math.max(0.4, 1 - (level - 1) * 0.15); // Start at 100%, -15% per level, min 40%
            color.multiplyScalar(factor);
        }

        return new THREE.MeshStandardMaterial({ color: color });
    }

    addBuilding(buildingData) {
        const def = BUILDINGS[buildingData.type];
        if (!def) return;

        const w = buildingData.width || 1;
        const d = buildingData.depth || 1;
        const geometry = new THREE.BoxGeometry(w * 10 - 2, 10, d * 10 - 2);
        const material = this.getBuildingMaterial(def.color, buildingData.status, buildingData.level);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.userData = {
            id: buildingData.id,
            type: buildingData.type,
            status: buildingData.status,
            level: buildingData.level
        };
        const startX = -(this.gridSize * this.cellSize) / 2;
        const startZ = -(this.gridSize * this.cellSize) / 2;
        const centerX = startX + (buildingData.gridX * this.cellSize) + (w * this.cellSize) / 2;
        const centerZ = startZ + (buildingData.gridZ * this.cellSize) + (d * this.cellSize) / 2;

        mesh.position.set(centerX, 5, centerZ);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.cityGroup.add(mesh); // Add to city group specifically
        this.buildingMeshes.push(mesh);
    }

    updateBuildingStatus(building) {
        const mesh = this.buildingMeshes.find(m => m.userData.id === building.id);
        if (mesh) {
            // Optimization: Check if update is needed
            if (mesh.userData.status === building.status && mesh.userData.level === building.level) return;

            console.log(`Updating building ${building.type} (Level ${building.level}) visual`);

            mesh.userData.status = building.status;
            mesh.userData.level = building.level;

            const def = BUILDINGS[mesh.userData.type];
            mesh.material = this.getBuildingMaterial(def.color, building.status, building.level);
        }
    }

    // --- INTERACTION ---

    setMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onMouseClick(e) {
        if (this.isDragging) return; // Prevent click if we were dragging
        if (this.mode !== 'CITY') return; // Only click buildings in city mode

        this.setMousePosition(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.buildingMeshes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (this.onBuildingClick) {
                this.onBuildingClick(object.userData.id);
            }
        }
    }

    onMouseDown(e) {
        if (this.mode !== 'ARMY') return;
        this.setMousePosition(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for Units
        const intersects = this.raycaster.intersectObjects(this.armyUnitMeshes);
        if (intersects.length > 0) {
            this.isDragging = true;
            this.draggedUnit = intersects[0].object;
            this.controls.enabled = false; // Disable orbit

            // Calculate offset logic if needed, or just snap to mouse
            // Intersect with Drag Plane (y=4)
            this.dragPlane.constant = -4; // Plane at y=4

            // Logic to track start position
            this.dragStartPos = this.draggedUnit.position.clone();
        }
    }

    onMouseMove(e) {
        if (!this.isDragging || !this.draggedUnit) return;

        this.setMousePosition(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

        if (intersectPoint) {
            this.draggedUnit.position.copy(intersectPoint);
        }
    }

    onMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.controls.enabled = true;

        if (this.draggedUnit) {
            // Check drop target (Slots)
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.armySlotMeshes);

            if (intersects.length > 0) {
                const slot = intersects[0].object;
                const toR = slot.userData.r;
                const toC = slot.userData.c;
                const fromR = this.draggedUnit.userData.r;
                const fromC = this.draggedUnit.userData.c;

                console.log(`Dropped on ${toR},${toC}`);

                if (toR !== undefined && toC !== undefined) {
                    if (this.onArmyDragDrop) {
                        this.onArmyDragDrop(fromR, fromC, toR, toC);
                        // The loop update will handle re-positioning via rebuildArmyScene
                    }
                }
            } else {
                // Return to start
                this.draggedUnit.position.copy(this.dragStartPos);
            }

            this.draggedUnit = null;
        }
    }

    // --- TOUCH HANDLERS ---
    setTouchPosition(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        }
    }

    onTouchStart(e) {
        // e.preventDefault(); // Stop scrolling // Might interfere with orbit? 
        // Only prevent default if we hit a unit
        if (this.mode !== 'ARMY') return;

        this.setTouchPosition(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.armyUnitMeshes);

        if (intersects.length > 0) {
            e.preventDefault(); // Lock scroll only when dragging a unit
            this.isDragging = true;
            this.draggedUnit = intersects[0].object;
            this.controls.enabled = false;
            this.dragPlane.constant = -4;
            this.dragStartPos = this.draggedUnit.position.clone();
        }
    }

    onTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault(); // Stop scroll while dragging

        this.setTouchPosition(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint);

        if (intersectPoint) {
            this.draggedUnit.position.copy(intersectPoint);
        }
    }

    onTouchEnd(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        this.isDragging = false;
        this.controls.enabled = true;

        if (this.draggedUnit) {
            // Mouse is set from last move event, so it should be valid?
            // Actually touchend has no touches, so we rely on the last known pos
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.armySlotMeshes);

            if (intersects.length > 0) {
                const slot = intersects[0].object;
                const toR = slot.userData.r;
                const toC = slot.userData.c;
                const fromR = this.draggedUnit.userData.r;
                const fromC = this.draggedUnit.userData.c;

                if (toR !== undefined && toC !== undefined) {
                    if (this.onArmyDragDrop) {
                        this.onArmyDragDrop(fromR, fromC, toR, toC);
                    }
                }
            } else {
                this.draggedUnit.position.copy(this.dragStartPos);
            }
            this.draggedUnit = null;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // --- BATTLE MODE ---
    switchToBattle(playerArmy, enemyArmy, onBattleEnd) {
        this.mode = 'BATTLE';
        this.cityGroup.visible = false;
        this.armyGroup.visible = false;

        // Create Battle Group if not exists
        if (!this.battleGroup) {
            this.battleGroup = new THREE.Group();
            this.scene.add(this.battleGroup);
        }
        this.battleGroup.visible = true;
        this.onBattleEnd = onBattleEnd;

        // Camera Setup for Battle (Side view or Top-down?)
        this.camera.position.set(0, 80, 80);
        this.controls.target.set(0, 0, 0);
        this.controls.enableRotate = true;

        this.rebuildBattleScene(playerArmy, enemyArmy);
        this.battleOver = false;
    }

    rebuildBattleScene(playerArmy, enemyArmy) {
        // Clear old
        while (this.battleGroup.children.length > 0) {
            this.battleGroup.remove(this.battleGroup.children[0]);
        }
        this.combatants = [];

        // 1. Terrain (Grass)
        const groundGeo = new THREE.PlaneGeometry(200, 100);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.battleGroup.add(ground);

        // 2. Spawn Units
        // Player Units (Left side: x < 0)
        playerArmy.forEach((u, i) => {
            if (!u) return;
            const unit = this.createBattleUnitMesh(u, 'player');
            // Random scatter around x=-50
            unit.position.set(-50 + (Math.random() * 30 - 15), 0, (Math.random() * 80 - 40));
            this.battleGroup.add(unit);
            this.combatants.push({
                mesh: unit,
                data: u,
                side: 'player',
                hp: u.stats.health * u.level,
                maxHp: u.stats.health * u.level,
                atk: u.stats.attack * u.level,
                range: 15, // Melee range
                target: null,
                cooldown: 0
            });
        });

        // Enemy Units (Right side: x > 0)
        enemyArmy.forEach((u, i) => {
            if (!u) return;
            const unit = this.createBattleUnitMesh(u, 'enemy');
            // Random scatter around x=50
            unit.position.set(50 + (Math.random() * 30 - 15), 0, (Math.random() * 80 - 40));
            this.battleGroup.add(unit);
            this.combatants.push({
                mesh: unit,
                data: u,
                side: 'enemy',
                hp: u.stats.health * u.level, // Stats might need to be passed in differently if derived
                maxHp: u.stats.health * u.level,
                atk: u.stats.attack * u.level,
                range: 15,
                target: null,
                cooldown: 0
            });
        });
    }

    createBattleUnitMesh(unitData, side) {
        const def = UNIT_TYPES[unitData.id] || UNIT_TYPES['soldier']; // Fallback

        // Use consistent geometry with Army View
        const geo = new THREE.CylinderGeometry(3, 3, 8, 16);

        // Color logic from addUnitMesh
        let color = 0xcccccc;
        if (def.id === 'soldier') color = 0xcccccc;
        else if (def.id === 'archer') color = 0x8fbc8f;
        else if (def.id === 'knight') color = 0x4682b4;
        else if (def.id === 'hero') color = 0xffd700;

        // If it's an enemy, maybe tint it red or give it a red mark?
        // User asked for "same graphics", but we need to distinguish friends/foes.
        // Let's keep the base color but add a team indicator (e.g., base ring)
        const mat = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 4; // Same as army view
        mesh.castShadow = true;

        // Team Indicator (Ring at bottom)
        const ringGeo = new THREE.TorusGeometry(3.5, 0.5, 8, 16);
        const ringColor = side === 'player' ? 0x2196f3 : 0xf44336;
        const ringMat = new THREE.MeshBasicMaterial({ color: ringColor });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -3.5; // Near bottom of unit
        mesh.add(ring);

        // Level Indicator (Sphere on top) - Consistent with Army View
        if (unitData.level > 1) {
            const lvlGeo = new THREE.SphereGeometry(1.5);
            const lvlMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const lvlMesh = new THREE.Mesh(lvlGeo, lvlMat);
            lvlMesh.position.y = 5;
            mesh.add(lvlMesh);
        }

        // Health Bar (Simple plane above)
        const hpGeo = new THREE.PlaneGeometry(8, 1);
        const hpMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const hpMesh = new THREE.Mesh(hpGeo, hpMat);
        hpMesh.position.y = 8;
        mesh.add(hpMesh);

        return { mesh, hpBar: hpMesh, material: mat };
    }

    rebuildBattleScene(playerArmy, enemyArmy) {
        // Clear old
        while (this.battleGroup.children.length > 0) {
            this.battleGroup.remove(this.battleGroup.children[0]);
        }
        this.combatants = [];

        // 1. Terrain
        const groundGeo = new THREE.PlaneGeometry(200, 100);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.battleGroup.add(ground);

        // 2. Spawn Units
        const spawnUnit = (u, side, baseX) => {
            if (!u) return;
            const { mesh, hpBar, material } = this.createBattleUnitMesh(u, side);
            mesh.position.set(baseX + (Math.random() * 30 - 15), 0, (Math.random() * 80 - 40));
            this.battleGroup.add(mesh);

            this.combatants.push({
                mesh: mesh,
                hpBar: hpBar,
                material: material,
                data: u,
                side: side,
                hp: u.stats.health * u.level,
                maxHp: u.stats.health * u.level,
                atk: u.stats.attack * u.level,
                range: 15,
                target: null,
                cooldown: 0,
                flashTimer: 0 // For visual hit feedback
            });
        };

        playerArmy.forEach(u => spawnUnit(u, 'player', -50));
        enemyArmy.forEach(u => spawnUnit(u, 'enemy', 50));
    }

    updateBattle() {
        if (this.mode !== 'BATTLE' || this.battleOver) return;

        // Separate lists for targeting
        const players = [];
        const enemies = [];
        const allAlive = [];

        for (let i = 0; i < this.combatants.length; i++) {
            const c = this.combatants[i];
            if (c.hp > 0) {
                if (c.side === 'player') players.push(c);
                else enemies.push(c);
                allAlive.push(c);
            }
        }

        if (players.length === 0) {
            this.battleOver = true;
            // Collect dead player units
            const deadUnits = this.combatants
                .filter(c => c.side === 'player' && c.hp <= 0)
                .map(c => c.data);

            if (this.onBattleEnd) this.onBattleEnd(false, deadUnits);
            return;
        }
        if (enemies.length === 0) {
            this.battleOver = true;
            // Collect dead player units (even in victory, some might have died)
            const deadUnits = this.combatants
                .filter(c => c.side === 'player' && c.hp <= 0)
                .map(c => c.data);

            if (this.onBattleEnd) this.onBattleEnd(true, deadUnits);
            return;
        }

        // Logic Loop
        for (let i = 0; i < allAlive.length; i++) {
            const unit = allAlive[i];

            // Handle Flash Timer
            if (unit.flashTimer > 0) {
                unit.flashTimer--;
                if (unit.flashTimer <= 0) {
                    unit.material.emissive.setHex(0x000000);
                }
            }

            // Find Target
            const targets = unit.side === 'player' ? enemies : players;
            let nearest = null;
            let minDist = Infinity;

            for (let j = 0; j < targets.length; j++) {
                const t = targets[j];
                const dist = unit.mesh.position.distanceToSquared(t.mesh.position);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = t;
                }
            }

            if (nearest) {
                const realDist = Math.sqrt(minDist);
                if (realDist <= unit.range) {
                    // Attack
                    if (unit.cooldown <= 0) {
                        nearest.hp -= unit.atk;
                        unit.cooldown = 20;

                        nearest.material.emissive.setHex(0xffffff);
                        nearest.flashTimer = 5;

                        const hpPct = Math.max(0, nearest.hp / nearest.maxHp);
                        nearest.hpBar.scale.x = hpPct;
                        nearest.hpBar.material.color.setHex(hpPct > 0.5 ? 0x00ff00 : 0xff0000);

                        if (nearest.hp <= 0) {
                            nearest.mesh.visible = false;
                        }

                        const pushDir = unit.mesh.position.clone().sub(nearest.mesh.position).normalize().multiplyScalar(2);
                        unit.mesh.position.add(pushDir);
                    }
                    unit.cooldown--;
                } else {
                    // Move
                    const dir = nearest.mesh.position.clone().sub(unit.mesh.position).normalize();
                    unit.mesh.position.add(dir.multiplyScalar(0.2));
                    unit.mesh.lookAt(nearest.mesh.position);
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();

        if (this.mode === 'BATTLE') {
            this.updateBattle();
            // Hp bars face camera
            const camPos = this.camera.position;
            for (let i = 0; i < this.combatants.length; i++) {
                const c = this.combatants[i];
                if (c.hp > 0) c.hpBar.lookAt(camPos);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}
