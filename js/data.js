// ============================================================
//  TOTAL BATTLE WAR  —  Static Data Definitions
// ============================================================

'use strict';

// ---------------------------------------------------------------
// BUILDINGS
// Each building has:
//   id, name, icon, description, category
//   maxLevel (gated by castle), slots (which city slot can hold it)
//   levelData[level] = { cost:{lumber,iron,stone,food,silver}, buildTime(s), effect }
// ---------------------------------------------------------------
const BUILDINGS = {

  castle: {
    id: 'castle', name: 'Castello', icon: 'assets/castello.jpg',
    description: 'Il cuore della tua città. Il suo livello determina il limite per tutti gli altri edifici.',
    category: 'core', unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(300 * Math.pow(1.8, i)),
        iron: Math.round(200 * Math.pow(1.8, i)),
        stone: Math.round(250 * Math.pow(1.8, i)),
        food: Math.round(100 * Math.pow(1.6, i)),
        silver: Math.round(150 * Math.pow(1.9, i))
      },
      buildTime: Math.round(60 * Math.pow(1.9, i)),  // seconds
      effect: { powerBonus: (i + 1) * 200 }
    }))
  },

  lumbermill: {
    id: 'lumbermill', name: 'Segheria', icon: 'assets/segheria.jpg',
    description: 'Produce legname nel tempo.',
    category: 'economy',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(100 * Math.pow(1.5, i)),
        iron: Math.round(50 * Math.pow(1.5, i)),
        stone: Math.round(80 * Math.pow(1.5, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(30 * Math.pow(1.7, i)),
      effect: { lumberPerHour: Math.round(2500 * (i + 1) * 1.5) }
    }))
  },

  foundry: {
    id: 'foundry', name: 'Fonderia', icon: 'assets/fonderia.jpg',
    description: 'Produce ferro nel tempo.',
    category: 'economy',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(80 * Math.pow(1.5, i)),
        iron: Math.round(120 * Math.pow(1.5, i)),
        stone: Math.round(60 * Math.pow(1.5, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(30 * Math.pow(1.7, i)),
      effect: { ironPerHour: Math.round(2000 * (i + 1) * 1.5) }
    }))
  },

  quarry: {
    id: 'quarry', name: 'Cava', icon: 'assets/cava.jpg',
    description: 'Estrae pietra grezza.',
    category: 'economy',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(90 * Math.pow(1.5, i)),
        iron: Math.round(60 * Math.pow(1.5, i)),
        stone: Math.round(100 * Math.pow(1.5, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(30 * Math.pow(1.7, i)),
      effect: { stonePerHour: Math.round(2200 * (i + 1) * 1.5) }
    }))
  },

  farm: {
    id: 'farm', name: 'Fattoria', icon: 'assets/fattoria.jpg',
    description: 'Produce cibo per nutrire le truppe.',
    category: 'economy',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(110 * Math.pow(1.5, i)),
        iron: Math.round(40 * Math.pow(1.5, i)),
        stone: Math.round(70 * Math.pow(1.5, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(25 * Math.pow(1.7, i)),
      effect: { foodPerHour: Math.round(3000 * (i + 1) * 1.5) }
    }))
  },

  treasury: {
    id: 'treasury', name: 'Erario', icon: 'assets/erario.jpg',
    description: 'Accumula argento col tempo.',
    category: 'economy',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(100 * Math.pow(1.6, i)),
        iron: Math.round(100 * Math.pow(1.6, i)),
        stone: Math.round(100 * Math.pow(1.6, i)),
        food: 0, silver: Math.round(200 * Math.pow(1.7, i))
      },
      buildTime: Math.round(40 * Math.pow(1.7, i)),
      effect: { silverPerHour: Math.round(300 * (i + 1) * 1.15) }
    }))
  },

  house: {
    id: 'house', name: 'Casa', icon: 'assets/casa.jpg',
    description: 'Fornisce alloggio ai cittadini e genera una rendita in argento.',
    category: 'economy',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(60 * Math.pow(1.4, i)),
        iron: Math.round(30 * Math.pow(1.4, i)),
        stone: Math.round(50 * Math.pow(1.4, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(15 * Math.pow(1.6, i)),
      effect: { silverPerHour: Math.round(150 * (i + 1) * 1.1), population: (i + 1) * 100 }
    }))
  },

  barracks: {
    id: 'barracks', name: 'Caserma', icon: 'assets/caserma.jpg',
    description: 'Addestra fanti, arcieri e lancieri.',
    category: 'military',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(150 * Math.pow(1.6, i)),
        iron: Math.round(200 * Math.pow(1.6, i)),
        stone: Math.round(100 * Math.pow(1.6, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(45 * Math.pow(1.75, i)),
      effect: { trainingSpeedBonus: (i + 1) * 5, unlockedTiers: Math.min(Math.ceil((i + 1) / 5), 3) }
    }))
  },

  stable: {
    id: 'stable', name: 'Stalla', icon: 'assets/stalla.jpg',
    description: 'Addestra la cavalleria.',
    category: 'military',
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(120 * Math.pow(1.6, i)),
        iron: Math.round(180 * Math.pow(1.6, i)),
        stone: Math.round(80 * Math.pow(1.6, i)),
        food: Math.round(50 * Math.pow(1.5, i)), silver: 0
      },
      buildTime: Math.round(50 * Math.pow(1.75, i)),
      effect: { cavalrySpeedBonus: (i + 1) * 3 }
    }))
  },

  academy: {
    id: 'academy', name: 'Accademia', icon: 'assets/accademia.jpg',
    description: 'Centro di ricerca. Sblocca nuove tecnologie.',
    category: 'research',
    unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(200 * Math.pow(1.65, i)),
        iron: Math.round(150 * Math.pow(1.65, i)),
        stone: Math.round(180 * Math.pow(1.65, i)),
        food: 0, silver: Math.round(100 * Math.pow(1.6, i))
      },
      buildTime: Math.round(60 * Math.pow(1.8, i)),
      effect: { researchSpeedBonus: (i + 1) * 4 }
    }))
  },

  wall: {
    id: 'wall', name: 'Mura', icon: 'assets/mura.jpg',
    description: 'Protegge la città dagli attacchi nemici.',
    category: 'defense',
    unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(100 * Math.pow(1.55, i)),
        iron: Math.round(150 * Math.pow(1.55, i)),
        stone: Math.round(300 * Math.pow(1.55, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(50 * Math.pow(1.7, i)),
      effect: { defenseBonus: (i + 1) * 8 }
    }))
  },

  hospital: {
    id: 'hospital', name: 'Ospedale', icon: 'assets/ospedale.jpg',
    description: 'Recupera i soldati feriti in battaglia.',
    category: 'military',
    unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(100 * Math.pow(1.55, i)),
        iron: Math.round(80 * Math.pow(1.55, i)),
        stone: Math.round(60 * Math.pow(1.55, i)),
        food: Math.round(50 * Math.pow(1.5, i)), silver: 0
      },
      buildTime: Math.round(35 * Math.pow(1.7, i)),
      effect: { healCapacity: (i + 1) * 500 }
    }))
  },

  warehouse: {
    id: 'warehouse', name: 'Magazzino', icon: 'assets/magazzino.jpg',
    description: 'Aumenta la capienza delle risorse.',
    category: 'economy',
    unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(150 * Math.pow(1.5, i)),
        iron: Math.round(100 * Math.pow(1.5, i)),
        stone: Math.round(200 * Math.pow(1.5, i)),
        food: 0, silver: 0
      },
      buildTime: Math.round(40 * Math.pow(1.7, i)),
      effect: {
        storageMultiplier: 1 + (i + 1) * 0.15,
        protectedAmount: Math.round(2000 * (i + 1))
      }
    }))
  },

  market: {
    id: 'market', name: 'Mercato', icon: 'assets/mercato.jpg',
    description: 'Scambia risorse con altri governanti e negozio.',
    category: 'economy',
    unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(200 * Math.pow(1.6, i)),
        iron: Math.round(150 * Math.pow(1.6, i)),
        stone: Math.round(150 * Math.pow(1.6, i)),
        food: 0, silver: Math.round(300 * Math.pow(1.7, i))
      },
      buildTime: Math.round(55 * Math.pow(1.75, i)),
      effect: { tradeSlots: i + 1 }
    }))
  },

  forge: {
    id: 'forge', name: 'Fucina', icon: 'assets/fucina.jpg',
    description: 'Permette di forgiare potenti equipaggiamenti per l\'esercito.',
    category: 'military',
    unique: true,
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: {
        lumber: Math.round(180 * Math.pow(1.6, i)),
        iron: Math.round(300 * Math.pow(1.6, i)),
        stone: Math.round(150 * Math.pow(1.6, i)),
        silver: 0
      },
      buildTime: Math.round(60 * Math.pow(1.8, i)),
      effect: { forgeBonus: (i + 1) * 5 }
    }))
  }
};

// ---------------------------------------------------------------
// TROOPS
// ---------------------------------------------------------------
const TROOPS = {
  recruit: {
    id: 'recruit', name: 'Recluta', icon: '👨‍🌾',
    category: 'peasants', tier: 0,
    trainedIn: 'barracks', requiredBarracksLevel: 1,
    trainTime: 5,
    cost: { lumber: 20, iron: 20, food: 20, stone: 0, silver: 0 },
    upkeep: { food: 0.5 },
    stats: { attack: 4, defense: 4, hp: 20, speed: 8 },
    description: 'Un cittadino armato alla meglio. Può essere addestrato per diventare un vero soldato.'
  },
  archer: {
    id: 'archer', name: 'Arciere', icon: '🏹',
    category: 'guardsmen', tier: 1,
    trainedIn: 'barracks', requiredBarracksLevel: 1,
    trainTime: 30,   // seconds per unit
    cost: { lumber: 10, iron: 15, food: 5, stone: 0, silver: 0 },
    upkeep: { food: 1 },  // per hour per unit
    stats: { attack: 12, defense: 8, hp: 40, speed: 10 },
    strongAgainst: ['rider'], weakAgainst: ['spearman']
  },
  spearman: {
    id: 'spearman', name: 'Lanciere', icon: '🗡️',
    category: 'guardsmen', tier: 1,
    trainedIn: 'barracks', requiredBarracksLevel: 1,
    trainTime: 25,
    cost: { lumber: 5, iron: 20, food: 5, stone: 0, silver: 0 },
    upkeep: { food: 1 },
    stats: { attack: 10, defense: 15, hp: 60, speed: 8 },
    strongAgainst: ['archer'], weakAgainst: ['rider']
  },
  rider: {
    id: 'rider', name: 'Cavaliere', icon: '🐎',
    category: 'guardsmen', tier: 1,
    trainedIn: 'stable', requiredStableLevel: 1,
    trainTime: 60,
    cost: { lumber: 20, iron: 30, food: 20, stone: 0, silver: 10 },
    upkeep: { food: 2 },
    stats: { attack: 18, defense: 10, hp: 80, speed: 18 },
    strongAgainst: ['spearman'], weakAgainst: ['archer']
  },
  elite_archer: {
    id: 'elite_archer', name: 'Arciere d\'Élite', icon: '🎯',
    category: 'specialists', tier: 2,
    trainedIn: 'barracks', requiredBarracksLevel: 5,
    trainTime: 90,
    cost: { lumber: 30, iron: 50, food: 15, stone: 10, silver: 20 },
    upkeep: { food: 2 },
    stats: { attack: 30, defense: 18, hp: 80, speed: 12 },
    strongAgainst: ['rider'], weakAgainst: ['spearman']
  },
  heavy_infantry: {
    id: 'heavy_infantry', name: 'Fanteria Pesante', icon: '🪖',
    category: 'specialists', tier: 2,
    trainedIn: 'barracks', requiredBarracksLevel: 5,
    trainTime: 80,
    cost: { lumber: 20, iron: 60, food: 10, stone: 20, silver: 15 },
    upkeep: { food: 2 },
    stats: { attack: 20, defense: 40, hp: 150, speed: 6 },
    strongAgainst: ['archer'], weakAgainst: ['rider']
  },
  knight: {
    id: 'knight', name: 'Cavaliere Nero', icon: '⚔️',
    category: 'specialists', tier: 2,
    trainedIn: 'stable', requiredStableLevel: 5,
    trainTime: 120,
    cost: { lumber: 40, iron: 80, food: 40, stone: 10, silver: 50 },
    upkeep: { food: 3 },
    stats: { attack: 50, defense: 30, hp: 200, speed: 20 },
    strongAgainst: ['spearman'], weakAgainst: ['archer']
  }
};

// ---------------------------------------------------------------
// RESEARCH TREE
// ---------------------------------------------------------------
const RESEARCH = {
  // ECONOMY BRANCH
  lumber_production: {
    id: 'lumber_production', name: 'Taglio Efficiente', icon: '🪵',
    branch: 'economy', maxLevel: 5,
    description: 'Aumenta la produzione di legname del 10% per livello.',
    requires: {},
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: Math.round(500 * Math.pow(2, i)), iron: Math.round(200 * Math.pow(2, i)), stone: 0, food: 0, silver: 0 },
      researchTime: Math.round(120 * Math.pow(2, i)),
      effect: { lumberProductionBonus: (i + 1) * 10 }
    }))
  },
  iron_production: {
    id: 'iron_production', name: 'Smelting Avanzato', icon: '⚙️',
    branch: 'economy', maxLevel: 5,
    description: 'Aumenta la produzione di ferro del 10% per livello.',
    requires: {},
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: 0, iron: Math.round(500 * Math.pow(2, i)), stone: Math.round(200 * Math.pow(2, i)), food: 0, silver: 0 },
      researchTime: Math.round(120 * Math.pow(2, i)),
      effect: { ironProductionBonus: (i + 1) * 10 }
    }))
  },
  stone_production: {
    id: 'stone_production', name: 'Tecnica di Estrazione', icon: '🪨',
    branch: 'economy', maxLevel: 5,
    description: 'Aumenta la produzione di pietra del 10% per livello.',
    requires: {},
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: Math.round(200 * Math.pow(2, i)), iron: 0, stone: Math.round(400 * Math.pow(2, i)), food: 0, silver: 0 },
      researchTime: Math.round(120 * Math.pow(2, i)),
      effect: { stoneProductionBonus: (i + 1) * 10 }
    }))
  },
  food_production: {
    id: 'food_production', name: 'Agricoltura Avanzata', icon: '🌾',
    branch: 'economy', maxLevel: 5,
    description: 'Aumenta la produzione di cibo del 10% per livello.',
    requires: {},
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: Math.round(200 * Math.pow(2, i)), iron: 0, stone: 0, food: Math.round(300 * Math.pow(2, i)), silver: 0 },
      researchTime: Math.round(90 * Math.pow(2, i)),
      effect: { foodProductionBonus: (i + 1) * 10 }
    }))
  },
  storage_mastery: {
    id: 'storage_mastery', name: 'Logistica', icon: '📦',
    branch: 'economy', maxLevel: 5,
    description: 'Aumenta la capacità di stoccaggio del 20% per livello.',
    requires: { lumber_production: 1 },
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: Math.round(800 * Math.pow(2, i)), iron: Math.round(600 * Math.pow(2, i)), stone: Math.round(600 * Math.pow(2, i)), food: 0, silver: 0 },
      researchTime: Math.round(200 * Math.pow(2, i)),
      effect: { storageBonus: (i + 1) * 20 }
    }))
  },
  construction_speed: {
    id: 'construction_speed', name: 'Ingegneria', icon: '🔨',
    branch: 'economy', maxLevel: 5,
    description: 'Riduce i tempi di costruzione del 5% per livello.',
    requires: { stone_production: 1 },
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: Math.round(600 * Math.pow(2, i)), iron: Math.round(500 * Math.pow(2, i)), stone: Math.round(800 * Math.pow(2, i)), food: 0, silver: 0 },
      researchTime: Math.round(180 * Math.pow(2, i)),
      effect: { constructionSpeedBonus: (i + 1) * 5 }
    }))
  },

  // MILITARY BRANCH
  attack_tactics: {
    id: 'attack_tactics', name: 'Tattiche d\'Attacco', icon: '⚔️',
    branch: 'military', maxLevel: 5,
    description: 'Aumenta l\'attacco di tutte le truppe del 5% per livello.',
    requires: {},
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: 0, iron: Math.round(600 * Math.pow(2, i)), stone: 0, food: Math.round(400 * Math.pow(2, i)), silver: Math.round(200 * Math.pow(2, i)) },
      researchTime: Math.round(150 * Math.pow(2, i)),
      effect: { attackBonus: (i + 1) * 5 }
    }))
  },
  defense_tactics: {
    id: 'defense_tactics', name: 'Tattiche Difensive', icon: '🛡️',
    branch: 'military', maxLevel: 5,
    description: 'Aumenta la difesa di tutte le truppe del 5% per livello.',
    requires: {},
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: Math.round(200 * Math.pow(2, i)), iron: Math.round(500 * Math.pow(2, i)), stone: Math.round(400 * Math.pow(2, i)), food: 0, silver: 0 },
      researchTime: Math.round(150 * Math.pow(2, i)),
      effect: { defenseBonus: (i + 1) * 5 }
    }))
  },
  march_size: {
    id: 'march_size', name: 'Organizzazione', icon: '🪖',
    branch: 'military', maxLevel: 5,
    description: 'Aumenta la dimensione massima delle marce del 10% per livello.',
    requires: { attack_tactics: 1 },
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: 0, iron: Math.round(800 * Math.pow(2, i)), stone: 0, food: Math.round(600 * Math.pow(2, i)), silver: Math.round(400 * Math.pow(2, i)) },
      researchTime: Math.round(200 * Math.pow(2, i)),
      effect: { marchSizeBonus: (i + 1) * 10 }
    }))
  },
  training_speed: {
    id: 'training_speed', name: 'Disciplina Militare', icon: '🎖️',
    branch: 'military', maxLevel: 5,
    description: 'Riduce i tempi di addestramento del 5% per livello.',
    requires: { defense_tactics: 1 },
    levelData: Array.from({ length: 5 }, (_, i) => ({
      level: i + 1,
      cost: { lumber: 0, iron: Math.round(700 * Math.pow(2, i)), stone: 0, food: Math.round(500 * Math.pow(2, i)), silver: Math.round(300 * Math.pow(2, i)) },
      researchTime: Math.round(180 * Math.pow(2, i)),
      effect: { trainingSpeedBonus: (i + 1) * 5 }
    }))
  },
  tier2_troops: {
    id: 'tier2_troops', name: 'Truppe d\'Élite', icon: '🌟',
    branch: 'military', maxLevel: 1,
    description: 'Sblocca le truppe di Tier 2 nelle caserme e nelle stalle.',
    requires: { attack_tactics: 3, defense_tactics: 3 },
    levelData: [{
      level: 1,
      cost: { lumber: 5000, iron: 8000, stone: 3000, food: 4000, silver: 2000 },
      researchTime: 3600,
      effect: { unlockTier2: true }
    }]
  },

  // MONSTER REINFORCEMENT BRANCH
  mon_beast_atk: {
    id: 'mon_beast_atk', name: 'Forza delle bestie I', icon: '🐻',
    branch: 'monster', maxLevel: 10,
    description: 'Aumenta l\'attacco delle bestie del 5% per livello.',
    requires: {},
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: { silver: Math.round(1500 * Math.pow(1.5, i)) },
      researchTime: Math.round(300 * Math.pow(1.6, i)),
      effect: { beastAttackBonus: (i + 1) * 5 }
    }))
  },
  mon_dragon_atk: {
    id: 'mon_dragon_atk', name: 'Forza dei draghi I', icon: '🐲',
    branch: 'monster', maxLevel: 10,
    description: 'Aumenta l\'attacco dei draghi del 5% per livello.',
    requires: { mon_beast_atk: 1 },
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: { silver: Math.round(2500 * Math.pow(1.5, i)) },
      researchTime: Math.round(600 * Math.pow(1.6, i)),
      effect: { dragonAttackBonus: (i + 1) * 5 }
    }))
  },
  mon_elem_atk: {
    id: 'mon_elem_atk', name: 'Forza degli elementali I', icon: '🔥',
    branch: 'monster', maxLevel: 10,
    description: 'Aumenta l\'attacco degli elementali del 5% per livello.',
    requires: { mon_beast_atk: 1 },
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: { silver: Math.round(2200 * Math.pow(1.5, i)) },
      researchTime: Math.round(500 * Math.pow(1.6, i)),
      effect: { elementalAttackBonus: (i + 1) * 5 }
    }))
  },
  mon_giant_atk: {
    id: 'mon_giant_atk', name: 'Forza dei giganti I', icon: '🗿',
    branch: 'monster', maxLevel: 10,
    description: 'Aumenta l\'attacco dei giganti del 5% per livello.',
    requires: { mon_beast_atk: 1 },
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: { silver: Math.round(2800 * Math.pow(1.5, i)) },
      researchTime: Math.round(700 * Math.pow(1.6, i)),
      effect: { giantAttackBonus: (i + 1) * 5 }
    }))
  },
  mon_beast_hp: {
    id: 'mon_beast_hp', name: 'Salute bestie I', icon: '❤️',
    branch: 'monster', maxLevel: 10,
    description: 'Aumenta la salute delle bestie del 10% per livello.',
    requires: { mon_elem_atk: 1 },
    levelData: Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      cost: { silver: Math.round(2000 * Math.pow(1.5, i)) },
      researchTime: Math.round(450 * Math.pow(1.6, i)),
      effect: { beastHpBonus: (i + 1) * 10 }
    }))
  },

  // MILESTONE UNLOCKS (Sblocca)
  unlock_guards_1: {
    id: 'unlock_guards_1', name: 'Guardie I', icon: '🛡️',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti consente di addestrare e migliorare le guardie. Le guardie funzionano bene contro i mostri.',
    requires: {},
    levelData: [{
      level: 1, cost: { silver: 500 }, researchTime: 60,
      effect: { unlockGuards1: true }
    }]
  },
  unlock_specs_1: {
    id: 'unlock_specs_1', name: 'Specialisti I', icon: '🎖️',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti consente di addestrare e migliorare gli specialisti. Gli specialisti sono efficaci contro gli altri giocatori.',
    requires: { unlock_guards_1: 1 },
    levelData: [{
      level: 1, cost: { silver: 1500 }, researchTime: 300,
      effect: { unlockSpecs1: true }
    }]
  },
  unlock_siege_1: {
    id: 'unlock_siege_1', name: 'Corpi del Genio I', icon: '🏗️',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti permette di costruire e migliorare i Corpi del Genio. Le macchine d\'assedio e le fortificazioni fanno parte di questa categoria.',
    requires: { unlock_guards_1: 1 },
    levelData: [{
      level: 1, cost: { silver: 2000 }, researchTime: 600,
      effect: { unlockSiege1: true }
    }]
  },
  unlock_monsters_1: {
    id: 'unlock_monsters_1', name: 'Mostri I', icon: '🐲',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti permette di addestrare e migliorare i mostri nelle caserme.',
    requires: { unlock_specs_1: 1 },
    levelData: [{
      level: 1, cost: { silver: 3000 }, researchTime: 900,
      effect: { unlockMonsters1: true }
    }]
  },
  research_archaeology: {
    id: 'research_archaeology', name: 'Archeologia', icon: '🏺',
    branch: 'milestone', maxLevel: 1,
    description: 'Apre nuove cripte ed aumenta l\'efficacia delle esplorazioni delle cripte.',
    requires: { unlock_guards_1: 1 },
    levelData: [{
      level: 1, cost: { silver: 1000 }, researchTime: 450,
      effect: { archaeologyUnlocked: true }
    }]
  },
  research_forge: {
    id: 'research_forge', name: 'Forgiatura', icon: '⚒️',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti permette di migliorare l\'equipaggiamento e rende più veloce ed economica la produzione.',
    requires: { unlock_guards_1: 1 },
    levelData: [{
      level: 1, cost: { silver: 1200 }, researchTime: 500,
      effect: { forgeUnlocked: true }
    }]
  },
  unlock_guards_2: {
    id: 'unlock_guards_2', name: 'Guardie II', icon: '🦅',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti consente di addestrare le guardie di Tier 2 e di migliorarle.',
    requires: { unlock_guards_1: 1, academy: 5 },
    levelData: [{
      level: 1, cost: { silver: 5000 }, researchTime: 1800,
      effect: { unlockGuards2: true }
    }]
  },
  unlock_specs_2: {
    id: 'unlock_specs_2', name: 'Specialisti II', icon: '⭐',
    branch: 'milestone', maxLevel: 1,
    description: 'Ti consente di addestrare e migliorare gli specialisti di Tier 2.',
    requires: { unlock_specs_1: 1, unlock_guards_2: 1 },
    levelData: [{
      level: 1, cost: { silver: 6000 }, researchTime: 2400,
      effect: { unlockSpecs2: true }
    }]
  }
};

// ---------------------------------------------------------------
// CITY LAYOUT — fixed visual slot positions
// ---------------------------------------------------------------
const CITY_SLOTS = [
  { id: 'slot_castle', building: 'castle', locked: false },
  ...Array.from({ length: 41 }, (_, i) => ({
    id: `slot_${i + 1}`,
    building: null,
    locked: false
  }))
];

// ---------------------------------------------------------------
// BASE STORAGE (before bonuses)
// ---------------------------------------------------------------
const BASE_STORAGE = {
  lumber: 10000,
  iron: 8000,
  stone: 9000,
  food: 12000,
  silver: 5000
};

// ---------------------------------------------------------------
// ============================================================
//  STORE DATA
// ============================================================

// Currency used in the store: Silver (in-game) or Gems (premium).
// Gems start at 200, earned through events/achievements.

// ---- GOODS: resources, speed-ups, boosts --------------------
const STORE_GOODS = [
  // Resource bundles (cost Silver)
  {
    id: 'good_lumber_sm', tab: 'goods', category: 'Risorse',
    name: 'Fascio di Legno', icon: '🪵',
    description: 'Fornisce 5.000 di Legname istantaneamente.',
    cost: { silver: 500 }, gems: 0,
    gives: { resources: { lumber: 5000 } },
    badge: null
  },
  {
    id: 'good_lumber_lg', tab: 'goods', category: 'Risorse',
    name: 'Carro di Legno', icon: '🪵',
    description: 'Fornisce 25.000 di Legname.',
    cost: { silver: 2000 }, gems: 0,
    gives: { resources: { lumber: 25000 } },
    badge: 'Valore'
  },
  {
    id: 'good_iron_sm', tab: 'goods', category: 'Risorse',
    name: 'Lingotti di Ferro', icon: '⚙️',
    description: 'Fornisce 4.000 di Ferro.',
    cost: { silver: 500 }, gems: 0,
    gives: { resources: { iron: 4000 } }, badge: null
  },
  {
    id: 'good_iron_lg', tab: 'goods', category: 'Risorse',
    name: 'Forziere di Ferro', icon: '⚙️',
    description: 'Fornisce 20.000 di Ferro.',
    cost: { silver: 2000 }, gems: 0,
    gives: { resources: { iron: 20000 } }, badge: 'Valore'
  },
  {
    id: 'good_stone_sm', tab: 'goods', category: 'Risorse',
    name: 'Blocchi di Pietra', icon: '🪨',
    description: 'Fornisce 4.500 di Pietra.',
    cost: { silver: 500 }, gems: 0,
    gives: { resources: { stone: 4500 } }, badge: null
  },
  {
    id: 'good_food_sm', tab: 'goods', category: 'Risorse',
    name: 'Scorte Alimentari', icon: '🌾',
    description: 'Fornisce 6.000 di Cibo.',
    cost: { silver: 400 }, gems: 0,
    gives: { resources: { food: 6000 } }, badge: null
  },
  {
    id: 'good_food_lg', tab: 'goods', category: 'Risorse',
    name: 'Granai Reali', icon: '🌾',
    description: 'Fornisce 30.000 di Cibo.',
    cost: { silver: 1500 }, gems: 0,
    gives: { resources: { food: 30000 } }, badge: 'Valore'
  },
  {
    id: 'good_res_pack', tab: 'goods', category: 'Risorse',
    name: 'Pacco Risorse Mix', icon: '📦',
    description: '5.000 Legname + 4.000 Ferro + 4.500 Pietra + 5.000 Cibo.',
    cost: { silver: 1800 }, gems: 0,
    gives: { resources: { lumber: 5000, iron: 4000, stone: 4500, food: 5000 } },
    badge: 'Popolare'
  },
  // Speed-ups (cost Gems)
  {
    id: 'good_speed_5m', tab: 'goods', category: 'Acceleratori',
    name: 'Acceleratore 5 min', icon: '⚡',
    description: 'Riduce di 5 minuti qualsiasi costruzione o ricerca attiva.',
    cost: { silver: 0 }, gems: 10,
    gives: { speedUp: 300 }, badge: null
  },
  {
    id: 'good_speed_1h', tab: 'goods', category: 'Acceleratori',
    name: 'Acceleratore 1 ora', icon: '⚡',
    description: 'Riduce di 1 ora qualsiasi costruzione o ricerca attiva.',
    cost: { silver: 0 }, gems: 40,
    gives: { speedUp: 3600 }, badge: null
  },
  {
    id: 'good_speed_8h', tab: 'goods', category: 'Acceleratori',
    name: 'Acceleratore 8 ore', icon: '⚡',
    description: 'Riduce di 8 ore qualsiasi costruzione o ricerca attiva.',
    cost: { silver: 0 }, gems: 200,
    gives: { speedUp: 28800 }, badge: 'Best'
  },
  {
    id: 'good_speed_24h', tab: 'goods', category: 'Acceleratori',
    name: 'Acceleratore 24 ore', icon: '⚡',
    description: 'Riduce di 24 ore qualsiasi costruzione o ricerca attiva.',
    cost: { silver: 0 }, gems: 500,
    gives: { speedUp: 86400 }, badge: null
  },
  // Boosts
  {
    id: 'good_prod_boost', tab: 'goods', category: 'Potenziamenti',
    name: 'Boost Produzione ×2', icon: '🚀',
    description: 'Raddoppia la produzione di tutte le risorse per 4 ore.',
    cost: { silver: 0 }, gems: 80,
    gives: { boost: { type: 'production', multiplier: 2, durationSec: 14400 } },
    badge: null
  },
  {
    id: 'good_train_boost', tab: 'goods', category: 'Potenziamenti',
    name: 'Boost Addestramento ×2', icon: '🎖️',
    description: 'Dimezza i tempi di addestramento per 4 ore.',
    cost: { silver: 0 }, gems: 80,
    gives: { boost: { type: 'training', multiplier: 2, durationSec: 14400 } },
    badge: null
  },
  {
    id: 'good_shield_8h', tab: 'goods', category: 'Difesa',
    name: 'Scudo di Pace 8h', icon: '🔰',
    description: 'Rende la tua città inattaccabile per 8 ore.',
    cost: { silver: 0 }, gems: 60,
    gives: { boost: { type: 'shield', durationSec: 28800 } },
    badge: null
  },
  {
    id: 'good_shield_24h', tab: 'goods', category: 'Difesa',
    name: 'Scudo di Pace 24h', icon: '🔰',
    description: 'Rende la tua città inattaccabile per 24 ore.',
    cost: { silver: 0 }, gems: 120,
    gives: { boost: { type: 'shield', durationSec: 86400 } },
    badge: 'Consigliato'
  },
  {
    id: 'good_gem_pack_sm', tab: 'goods', category: 'Gemme',
    name: 'Sacchetto di Gemme', icon: '💎',
    description: '+100 Gemme al tuo saldo.',
    cost: { silver: 5000 }, gems: 0,
    gives: { gems: 100 }, badge: null
  },
  {
    id: 'good_gem_pack_lg', tab: 'goods', category: 'Gemme',
    name: 'Cassa di Gemme', icon: '💎',
    description: '+500 Gemme al tuo saldo.',
    cost: { silver: 20000 }, gems: 0,
    gives: { gems: 500 }, badge: 'Valore'
  }
];

// ---- ARMY PACKS: instant troop grants -----------------------
const STORE_ARMY = [
  {
    id: 'army_archers_100', tab: 'army', category: 'Guardie',
    name: 'Compagnia di Arcieri', icon: '🏹',
    description: '100 Arcieri pronti per la battaglia, senza tempi di addestramento.',
    cost: { silver: 1200 }, gems: 0,
    gives: { troops: { archer: 100 } }, badge: null
  },
  {
    id: 'army_archers_500', tab: 'army', category: 'Guardie',
    name: 'Legione di Arcieri', icon: '🏹',
    description: '500 Arcieri. La pioggia di frecce oscurerà il sole.',
    cost: { silver: 5000 }, gems: 0,
    gives: { troops: { archer: 500 } }, badge: 'Valore'
  },
  {
    id: 'army_spear_100', tab: 'army', category: 'Guardie',
    name: 'Compagnia di Lancieri', icon: '🗡️',
    description: '100 Lancieri. Irresistibili contro la cavalleria.',
    cost: { silver: 1000 }, gems: 0,
    gives: { troops: { spearman: 100 } }, badge: null
  },
  {
    id: 'army_spear_500', tab: 'army', category: 'Guardie',
    name: 'Falange di Lancieri', icon: '🗡️',
    description: '500 Lancieri pronti all\'attacco.',
    cost: { silver: 4200 }, gems: 0,
    gives: { troops: { spearman: 500 } }, badge: 'Valore'
  },
  {
    id: 'army_riders_50', tab: 'army', category: 'Guardie',
    name: 'Squadrone di Cavalieri', icon: '🐎',
    description: '50 Cavalieri. La velocità è la loro arma.',
    cost: { silver: 1500 }, gems: 0,
    gives: { troops: { rider: 50 } }, badge: null
  },
  {
    id: 'army_riders_200', tab: 'army', category: 'Guardie',
    name: 'Tagmata di Cavalieri', icon: '🐎',
    description: '200 Cavalieri. Una carica devastante.',
    cost: { silver: 5500 }, gems: 0,
    gives: { troops: { rider: 200 } }, badge: 'Valore'
  },
  {
    id: 'army_elite_arch_50', tab: 'army', category: 'Specialisti',
    name: 'Unità Arcieri Élite', icon: '🎯',
    description: '50 Arcieri d\'Élite Tier 2. Letali a lunga distanza.',
    cost: { silver: 0 }, gems: 150,
    gives: { troops: { elite_archer: 50 } }, badge: null
  },
  {
    id: 'army_heavy_50', tab: 'army', category: 'Specialisti',
    name: 'Plotone Fanteria Pesante', icon: '🪖',
    description: '50 Fanti Pesanti Tier 2. Muro inscalfibile.',
    cost: { silver: 0 }, gems: 150,
    gives: { troops: { heavy_infantry: 50 } }, badge: null
  },
  {
    id: 'army_knights_30', tab: 'army', category: 'Specialisti',
    name: 'Ordine dei Cavalieri Neri', icon: '⚔️',
    description: '30 Cavalieri Neri Tier 2. L\'élite della cavalleria.',
    cost: { silver: 0 }, gems: 200,
    gives: { troops: { knight: 30 } }, badge: 'Raro'
  },
  {
    id: 'army_starter_pack', tab: 'army', category: 'Pacchi',
    name: 'Pacco Starter', icon: '📦',
    description: '200 Arcieri + 200 Lancieri + 50 Cavalieri. Perfetto per iniziare.',
    cost: { silver: 6000 }, gems: 0,
    gives: { troops: { archer: 200, spearman: 200, rider: 50 } }, badge: 'Popolare'
  },
  {
    id: 'army_war_pack', tab: 'army', category: 'Pacchi',
    name: 'Pacco da Guerra', icon: '⚔️',
    description: '500 Arcieri + 500 Lancieri + 200 Cavalieri + 50 Élite + 30 Cavalieri Neri.',
    cost: { silver: 0 }, gems: 800,
    gives: { troops: { archer: 500, spearman: 500, rider: 200, elite_archer: 50, knight: 30 } },
    badge: 'Best'
  }
];

// ---- GENERALS (Captains / Heroes) ---------------------------
const STORE_GENERALS = [
  {
    id: 'gen_aurora',
    name: 'Aurora Luce dell\'Alba', icon: '👸',
    rarity: 'epico',
    role: 'Costruzione',
    description: 'Specialista in edilizia. La sua presenza velocizza ogni cantiere.',
    passive: 'Costruzione -20% tempo',
    skills: ['Sovrintendente: -10% costo costruzioni', 'Architetta: +2 slot coda', 'Progettista: sblocca potenziamento ×2'],
    stats: { leadership: 85, attack: 40, defense: 55, speed: 70 },
    cost: { silver: 0 }, gems: 600,
    owned: false, badge: 'Popolare'
  },
  {
    id: 'gen_ragnar',
    name: 'Ragnar il Berserker', icon: '🪓',
    rarity: 'leggendario',
    role: 'Attacco',
    description: 'Guerriero senza paura. Guida le truppe verso la vittoria.',
    passive: 'Attacco truppe +15%',
    skills: ['Furia Berserker: +25% ATK marcia', 'Grido di Guerra: demora nemici', 'Invincibile: sopravvive con 1 HP'],
    stats: { leadership: 95, attack: 90, defense: 50, speed: 80 },
    cost: { silver: 0 }, gems: 900,
    owned: false, badge: 'Raro'
  },
  {
    id: 'gen_farhad',
    name: 'Farhad il Saggio', icon: '🧙',
    rarity: 'epico',
    role: 'Ricerca',
    description: 'Mago e studioso. Le sue conoscenze accelerano l\'Accademia.',
    passive: 'Ricerca -25% tempo',
    skills: ['Mente Acuta: +15% effetto ricerca', 'Analista: rivela debolezze mostri', 'Grimorio: -10% costo ricerca'],
    stats: { leadership: 70, attack: 30, defense: 40, speed: 60 },
    cost: { silver: 0 }, gems: 500,
    owned: false, badge: null
  },
  {
    id: 'gen_straw',
    name: 'Straw la Raccoglitrice', icon: '🌿',
    rarity: 'raro',
    role: 'Raccolta',
    description: 'Maestra del saccheggio e della raccolta. Cargo massiccio.',
    passive: 'Capacità marcia raccolta +30%',
    skills: ['Nomade: +20% velocità marcia', 'Razziatore: +15% risorse da mostri', 'Forager: raccolta automatica'],
    stats: { leadership: 75, attack: 45, defense: 60, speed: 90 },
    cost: { silver: 8000 }, gems: 0,
    owned: false, badge: null
  },
  {
    id: 'gen_isolde',
    name: 'Isolde la Guaritrice', icon: '⚕️',
    rarity: 'raro',
    role: 'Difesa',
    description: 'Sacerdotessa guerriera. I feriti tornano in battaglia più forti.',
    passive: 'Recupero Ospedale +40%',
    skills: ['Miracolo: guarisce il 10% extra', 'Benedizione: +10% DEF tutte le truppe', 'Aura Sacra: nessuna perdita in difesa'],
    stats: { leadership: 80, attack: 35, defense: 85, speed: 55 },
    cost: { silver: 7000 }, gems: 0,
    owned: false, badge: null
  },
  {
    id: 'gen_khan',
    name: 'Khal Khan', icon: '🏇',
    rarity: 'leggendario',
    role: 'Cavalleria',
    description: 'Signore della steppa. La sua cavalleria è inarrestabile.',
    passive: 'Cavalleria ATK +20% / Velocità +25%',
    skills: ['Carica della Steppa: cavalieri ignoran DEF', 'Arciere a Cavallo: tiro in movimento', 'Ritirata Tattica: 0 perdite in fuga'],
    stats: { leadership: 90, attack: 80, defense: 55, speed: 100 },
    cost: { silver: 0 }, gems: 1000,
    owned: false, badge: 'Leggendario'
  },
  {
    id: 'gen_lyra',
    name: 'Lyra delle Ombre', icon: '🗡️',
    rarity: 'epico',
    role: 'Esploratore',
    description: 'Assassina e spia. Svela nemici nascosti e ruba informazioni.',
    passive: 'Mappa rivela nemici invisibili',
    skills: ['Infiltrazione: spia città nemiche', 'Veleno: -5% ATK nemico', 'Ombra: marcia non visibile'],
    stats: { leadership: 65, attack: 70, defense: 45, speed: 95 },
    cost: { silver: 0 }, gems: 700,
    owned: false, badge: null
  },
  {
    id: 'gen_iron_golem',
    name: 'Golem di Ferro', icon: '🤖',
    rarity: 'leggendario',
    role: 'Assedio',
    description: 'Costrutto meccanico. Abbatte le mura nemiche come fossero carta.',
    passive: 'Danno mura +50%',
    skills: ['Pugno d\'Acciaio: bonus assedio', 'Corazza Pesante: immune a frecce', 'Rinforzo: ripristina 20% HP'],
    stats: { leadership: 100, attack: 75, defense: 100, speed: 30 },
    cost: { silver: 0 }, gems: 1200,
    owned: false, badge: 'Epico'
  }
];

// ---- EQUIPMENT (Armor, Helmets, Weapons, Shields) -----------
const STORE_EQUIPMENT = [
  {
    id: 'eq_iron_sword', tab: 'equipment', category: 'Armi',
    name: 'Spada di Ferro', icon: '⚔️',
    description: 'Una spada bilanciata per i nuovi comandanti.',
    stats: { attack: 15, leadership: 5 },
    cost: { silver: 1500 }, gems: 0,
    badge: 'Base'
  },
  {
    id: 'eq_steel_blade', tab: 'equipment', category: 'Armi',
    name: 'Lama d\'Acciaio', icon: '🗡️',
    description: 'Affilata e letale. Aumenta significativamente l\'attacco.',
    stats: { attack: 40, leadership: 10 },
    cost: { silver: 0 }, gems: 150,
    badge: 'Raro'
  },
  {
    id: 'eq_excalibur', tab: 'equipment', category: 'Armi',
    name: 'Excalibur (Replica)', icon: '✨',
    description: 'Una spada leggendaria che ispira le truppe.',
    stats: { attack: 100, leadership: 50 },
    cost: { silver: 0 }, gems: 800,
    badge: 'Leggendario'
  },
  {
    id: 'eq_leather_armor', tab: 'equipment', category: 'Armature',
    name: 'Armatura di Cuoio', icon: '👕',
    description: 'Protezione leggera per il generale.',
    stats: { defense: 10, hp: 100 },
    cost: { silver: 1000 }, gems: 0,
    badge: 'Base'
  },
  {
    id: 'eq_plate_armor', tab: 'equipment', category: 'Armature',
    name: 'Armatura a Piastre', icon: '🛡️',
    description: 'Pesante armatura d\'acciaio per resistere ai colpi più duri.',
    stats: { defense: 50, hp: 500 },
    cost: { silver: 0 }, gems: 300,
    badge: 'Epico'
  },
  {
    id: 'eq_iron_helmet', tab: 'equipment', category: 'Elmi',
    name: 'Elmo di Ferro', icon: '🪖',
    description: 'Protegge la testa e aumenta l\'autorità.',
    stats: { defense: 8, leadership: 10 },
    cost: { silver: 800 }, gems: 0,
    badge: 'Base'
  },
  {
    id: 'eq_wooden_shield', tab: 'equipment', category: 'Scudi',
    name: 'Scudo di Legno', icon: '🪵',
    description: 'Semplice scudo per parare i colpi.',
    stats: { defense: 15 },
    cost: { silver: 500 }, gems: 0,
    badge: 'Base'
  },
  {
    id: 'eq_dragon_shield', tab: 'equipment', category: 'Scudi',
    name: 'Scudo del Drago', icon: '🐲',
    description: 'Forgiato nelle fiamme, offre una difesa impareggiabile.',
    stats: { defense: 80, hp: 200 },
    cost: { silver: 0 }, gems: 450,
    badge: 'Leggendario'
  },
  {
    id: 'eq_silver_ring', tab: 'equipment', category: 'Gioielli',
    name: 'Anello d\'Argento', icon: '💍',
    description: 'Un semplice anello che aumenta la concentrazione.',
    stats: { leadership: 20 },
    cost: { silver: 5000 }, gems: 0,
    badge: 'Base'
  },
  {
    id: 'eq_ruby_pendant', tab: 'equipment', category: 'Gioielli',
    name: 'Pendaglio di Rubino', icon: '📿',
    description: 'Il rubino brilla di una luce che infonde coraggio.',
    stats: { attack: 25, leadership: 15 },
    cost: { silver: 0 }, gems: 350,
    badge: 'Raro'
  },
  {
    id: 'eq_crown_kings', tab: 'equipment', category: 'Gioielli',
    name: 'Corona dei Re', icon: '👑',
    description: 'Simbolo di potere assoluto. Bonus massicci al comando.',
    stats: { leadership: 150, attack: 50, defense: 50 },
    cost: { silver: 0 }, gems: 1200,
    badge: 'Leggendario'
  }
];

// ---- STARTING GENERALS --------------------------------------
const STARTING_GENERALS = [
  {
    id: 'gen_astralo',
    name: 'Astralo', icon: 'assets/generale_astralo.jpg',
    description: 'Un saggio veterano le cui strategie riducono i tempi di ricerca.',
    passive: 'Velocità Ricerca +10%',
    stats: { leadership: 50, attack: 20, defense: 30, speed: 10 }
  },
  {
    id: 'gen_crom',
    name: 'Crom', icon: 'assets/generale_crom.jpg',
    description: 'Un guerriero brutale che ispira le truppe all\'attacco.',
    passive: 'Attacco Truppe +10%',
    stats: { leadership: 60, attack: 45, defense: 15, speed: 5 }
  },
  {
    id: 'gen_gerelt',
    name: 'Gerelt', icon: 'assets/generale_gerelt.jpg',
    description: 'Maestro esploratore, le sue marce sono le più rapide del regno.',
    passive: 'Velocità Marcia +15%',
    stats: { leadership: 40, attack: 25, defense: 20, speed: 45 }
  },
  {
    id: 'gen_helena',
    name: 'Helena', icon: 'assets/generale_helena.jpg',
    description: 'Comandante carismatica, attira più coloni nella tua città.',
    passive: 'Produzione Popolazione +10%',
    stats: { leadership: 80, attack: 15, defense: 25, speed: 10 }
  },
  {
    id: 'gen_ordal',
    name: 'Ordal', icon: 'assets/generale_ordal.jpg',
    description: 'Ingegnere architetto, ottimizza l\'uso delle risorse nelle costruzioni.',
    passive: 'Costo Costruzione -8%',
    stats: { leadership: 55, attack: 10, defense: 40, speed: 5 }
  },
  {
    id: 'gen_sonya',
    name: 'Sonya', icon: 'assets/generale_sonya.jpg',
    description: 'Esperta di logistica, i suoi mercanti caricano più merci.',
    passive: 'Capacità Stoccaggio +20%',
    stats: { leadership: 70, attack: 20, defense: 20, speed: 20 }
  },
  {
    id: 'gen_talkenbar',
    name: 'Talkenbar', icon: 'assets/generale_talkenbar.jpg',
    description: 'Un difensore stoico le cui mura sono impenetrabili.',
    passive: 'Difesa Mura +15%',
    stats: { leadership: 65, attack: 15, defense: 50, speed: 5 }
  }
];

// ---- MONSTERS (summonables to defend city or fight) ---------
const STORE_MONSTERS = [
  {
    id: 'mon_wolf_pack',
    name: 'Branco di Lupi', icon: '🐺',
    rarity: 'comune',
    type: 'Difesa',
    description: 'Un branco di lupi feroci protegge le tue mura per 12 ore.',
    stats: { attack: 45, defense: 30, hp: 800, count: 20 },
    duration: '12 ore',
    effect: 'Difesa città +15% per 12h',
    cost: { silver: 2000 }, gems: 0,
    badge: null
  },
  {
    id: 'mon_fire_golem',
    name: 'Golem di Fuoco', icon: '🔥',
    rarity: 'raro',
    type: 'Difesa',
    description: 'Un guardiano infuocato. Brucia chi si avvicina alle mura.',
    stats: { attack: 80, defense: 60, hp: 3000, count: 1 },
    duration: '24 ore',
    effect: 'Difesa città +30% per 24h',
    cost: { silver: 0 }, gems: 200,
    badge: 'Raro'
  },
  {
    id: 'mon_wyvern',
    name: 'Viverna da Battaglia', icon: '🦎',
    rarity: 'epico',
    type: 'Attacco',
    description: 'Monta questa bestia per ottenere un\'unità volante devastante in attacco.',
    stats: { attack: 120, defense: 70, hp: 5000, count: 1 },
    duration: '8 ore',
    effect: 'Aggiunge 1 Viverna alla prossima marcia di attacco',
    cost: { silver: 0 }, gems: 400,
    badge: 'Popolare'
  },
  {
    id: 'mon_shadow_spider',
    name: 'Ragno delle Ombre', icon: '🕷️',
    rarity: 'raro',
    type: 'Trappola',
    description: 'Tesse una ragnatela invisibile intorno alla città. Rallenta invasori.',
    stats: { attack: 20, defense: 90, hp: 1500, count: 5 },
    duration: '48 ore',
    effect: 'Invasori -40% velocità per 48h',
    cost: { silver: 3500 }, gems: 0,
    badge: null
  }
];

// ---- FORGE ITEMS (Fucina equipment sets) --------------------
const FORGE_ITEMS = [
  {
    section: 'EQUIPAGGIAMENTO STANDARD',
    items: [
      { id: 'f_guards_1', name: 'Coraggio delle guardie', icon: '🛡️', description: 'Rinforzo per i tuoi guardiani.', cost: { silver: 5000 }, stats: { guardAtk: 10, guardDef: 10 } },
      { id: 'f_specs_1', name: 'Autorità degli Specialisti', icon: '⚔️', description: 'Rinforzo per i tuoi specialisti.', cost: { silver: 8000 }, stats: { specAtk: 15, specDef: 5 } },
      { id: 'f_siege_1', name: 'Ingegnere pieno di risorse', icon: '🏗️', description: 'Corpi del genio potenziati.', cost: { silver: 10000 }, stats: { siegeAtk: 20 } },
      { id: 'f_eco_1', name: 'Governatore celebrato', icon: '🏛️', description: 'Rinforzo per la tua economia.', cost: { silver: 6000 }, stats: { prodBonus: 10 } },
      { id: 'f_march_1', name: 'Viandante rapido', icon: '👣', description: 'Raccolta di risorse sulla Mappa del mondo.', cost: { silver: 7000 }, stats: { marchSpeed: 15 } },
      { id: 'f_arch_1', name: 'Razziatore di tombe', icon: '⚰️', description: 'Esplorazione efficace di una cripta e produzione di pece.', cost: { silver: 9000 }, stats: { cryptLoot: 20 } }
    ]
  },
  {
    section: 'EQUIPAGGIAMENTO UNICO',
    items: [
      { id: 'f_emerald', name: 'Guardiano di smeraldo', icon: '💚', description: 'Rinforzo per le tue unità da mischia.', cost: { gems: 500 }, stats: { meleeDef: 25 } },
      { id: 'f_sky_1', name: 'Percorso del distruttore dei cieli', icon: '🦅', description: 'Rinforzo per le tue unità volanti.', cost: { gems: 800 }, stats: { flyingAtk: 30 } },
      { id: 'f_steppe_1', name: 'Conquistatore delle steppe', icon: '🐎', description: 'Rinforzo per le tue unità a cavallo.', cost: { gems: 600 }, stats: { horseAtk: 20, horseSpeed: 10 } }
    ]
  }
];

const STORE_MONSTERS_EXTENDED = [
  {
    id: 'mon_ice_titan',
    name: 'Titano di Ghiaccio', icon: '🧊',
    rarity: 'leggendario',
    type: 'Difesa',
    description: 'Un colosso immortale. Il suo solo sguardo congela i nemici.',
    stats: { attack: 150, defense: 200, hp: 20000, count: 1 },
    duration: '72 ore',
    effect: 'Difesa città +80% per 72h + congela 1 attacco nemico',
    cost: { silver: 0 }, gems: 1000,
    badge: 'Leggendario'
  },
  {
    id: 'mon_phoenix',
    name: 'Fenice Ardente', icon: '🦅',
    rarity: 'leggendario',
    type: 'Supporto',
    description: 'La Fenice brucia e rinasce. Guarisce le truppe e brucia i nemici.',
    stats: { attack: 100, defense: 80, hp: 8000, count: 1 },
    duration: '24 ore',
    effect: 'Recupera 20% truppe ferite + +25% ATK alla prossima battaglia',
    cost: { silver: 0 }, gems: 800,
    badge: 'Best'
  },
  {
    id: 'mon_sea_serpent',
    name: 'Serpente del Mare', icon: '🐍',
    rarity: 'epico',
    type: 'Attacco',
    description: 'Emerge dagli abissi per far paura ai nemici sulla mappa.',
    stats: { attack: 90, defense: 50, hp: 6000, count: 1 },
    duration: '12 ore',
    effect: 'Occupa un nodo risorsa sul mondo per 12h, raccogliendo automaticamente',
    cost: { silver: 0 }, gems: 350,
    badge: null
  },
  {
    id: 'mon_undead_horde',
    name: 'Orda degli Inferi', icon: '💀',
    rarity: 'raro',
    type: 'Attacco',
    description: 'Un\'ondata di non-morti. Infiniti, inarrestabili, spendibili.',
    stats: { attack: 30, defense: 10, hp: 200, count: 500 },
    duration: 'Una battaglia',
    effect: '+500 unità non-morte alla prossima marcia (usa e getta)',
    cost: { silver: 4000 }, gems: 0,
    badge: 'Valore'
  }
];

// ---------------------------------------------------------------
// WORLD MAP ENTITIES (for Phase 2)
// ---------------------------------------------------------------
const WORLD_ENTITIES = {
  forest: { id: 'forest', name: 'Foresta', icon: '🌲', yields: { lumber: 5000 }, gatherTime: 3600 },
  ironmine: { id: 'ironmine', name: 'Miniera di Ferro', icon: '⛏️', yields: { iron: 4000 }, gatherTime: 3600 },
  stonequarry: { id: 'stonequarry', name: 'Cava di Pietra', icon: '🪨', yields: { stone: 4500 }, gatherTime: 3600 },
  wheat_field: { id: 'wheat_field', name: 'Campo di Grano', icon: '🌿', yields: { food: 6000 }, gatherTime: 2400 },
  monster_goblin: {
    id: 'monster_goblin', name: 'Goblin Rinnegato', icon: '👺',
    level: 1, hp: 500,
    stats: { attack: 8, defense: 5 },
    loot: { lumber: 200, iron: 150, silver: 100 },
    weakness: 'spearman'
  },
  monster_orc: {
    id: 'monster_orc', name: 'Orco Berserker', icon: '👹',
    level: 3, hp: 2000,
    stats: { attack: 25, defense: 15 },
    loot: { lumber: 800, iron: 600, silver: 400 },
    weakness: 'archer'
  },
  monster_dragon: {
    id: 'monster_dragon', name: 'Drago Antico', icon: '🐉',
    level: 10, hp: 15000,
    stats: { attack: 120, defense: 80 },
    loot: { silver: 5000, iron: 3000, lumber: 2000 },
    weakness: 'knight'
  }
};
