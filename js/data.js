export const GENERALS = [
    {
        id: 'astralo',
        name: 'general.astralo.name',
        image: 'assets/personaggi/astralo.png',
        bonus: {
            materials: 1.2, // +20% Materials production (applies to all: wood, stone, iron)
            morale: 0.9     // -10% Morale (future)
        },
        description: 'general.astralo.desc'
    },
    {
        id: 'crom',
        name: 'general.crom.name',
        image: 'assets/personaggi/crom.png',
        bonus: {
            attack: 1.2,    // +20% Attack
            materials: 0.9  // -10% Materials production
        },
        description: 'general.crom.desc'
    },
    {
        id: 'gerelt',
        name: 'general.gerelt.name',
        image: 'assets/personaggi/gerelt.png',
        bonus: {
            speed: 1.2,     // +20% Movement Speed
            income: 0.9     // -10% Income (Solidi)
        },
        description: 'general.gerelt.desc'
    },
    {
        id: 'helena',
        name: 'general.helena.name',
        image: 'assets/personaggi/helena.png',
        bonus: {
            income: 1.2,    // +20% Income
            attack: 0.9     // -10% Attack
        },
        description: 'general.helena.desc'
    },
    {
        id: 'ofle',
        name: 'general.ofle.name',
        image: 'assets/personaggi/ofle.png',
        bonus: {
            materials: 1.1,      // +10% Materials
            constructionTime: 0.8 // -20% Construction Time (multiplier)
        },
        description: 'general.ofle.desc'
    },
    {
        id: 'sonya',
        name: 'general.sonya.name',
        image: 'assets/personaggi/sonya.png',
        bonus: {
            defense: 1.2,          // +20% Defense
            constructionSpeed: 1.1 // +10% Construction Speed
        },
        description: 'general.sonya.desc'
    },
    {
        id: 'talkenbar',
        name: 'general.talkenbar.name',
        image: 'assets/personaggi/talkenbar.png',
        bonus: {
            income: 1.15,   // +15% Income
            armySize: 0.9   // -10% Max Army Size
        },
        description: 'general.talkenbar.desc'
    }
];

export const RESOURCES = {
    solidi: 'res.solidi',
    wood: 'res.wood',
    stone: 'res.stone',
    iron: 'res.iron',
    food: 'res.food',
    weapons: 'res.weapons',
    armor: 'res.armor',
    population: 'res.population'
};

export const BUILDINGS = {
    palace: {
        id: 'palace',
        name: 'building.palace.name',
        description: 'building.palace.desc',
        cost: { solidi: 0, wood: 0, stone: 0, iron: 0 },
        production: { solidi: 2, wood: 1, stone: 1, iron: 1, food: 2 },
        color: 0xff6961, // Pastel Red
        width: 2,
        depth: 2,
        buildTime: 0, // Instant
        icon: 'ra ra-tower'
    },
    house: {
        id: 'house',
        name: 'building.house.name',
        description: 'building.house.desc',
        cost: { solidi: 50, wood: 50, stone: 0, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 0, food: 0 },
        populationCap: 5,
        color: 0x77dd77, // Pastel Green
        width: 1,
        depth: 1,
        buildTime: 5000,
        icon: 'ra ra-health'
    },
    woodcutter: {
        id: 'woodcutter',
        name: 'building.woodcutter.name',
        description: 'building.woodcutter.desc',
        cost: { solidi: 100, wood: 20, stone: 0, iron: 0 },
        production: { solidi: 0, wood: 5, stone: 0, iron: 0, food: 0 },
        color: 0xC2B280, // Sand/Wood (Pastel Brown)
        width: 1,
        depth: 1,
        buildTime: 5000,
        icon: 'ra ra-axe'
    },
    quarry: {
        id: 'quarry',
        name: 'building.quarry.name',
        description: 'building.quarry.desc',
        cost: { solidi: 100, wood: 100, stone: 0, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 3, iron: 0, food: 0 },
        color: 0xcfcfc4, // Pastel Gray
        width: 1,
        depth: 1,
        buildTime: 8000,
        icon: 'ra ra-hammer'
    },
    mine: {
        id: 'mine',
        name: 'building.mine.name',
        description: 'building.mine.desc',
        cost: { solidi: 150, wood: 150, stone: 100, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 2, food: 0 },
        color: 0x708090, // SlateGray (Kept generic, but lighter)
        width: 1,
        depth: 1,
        buildTime: 10000,
        icon: 'ra ra-mine-wagon'
    },
    smithy: {
        id: 'smithy',
        name: 'building.smithy.name',
        description: 'building.smithy.desc',
        cost: { solidi: 200, wood: 100, stone: 100, iron: 50 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0x808080, // Grey
        width: 1,
        depth: 1,
        buildTime: 12000,
        icon: 'ra ra-anvil'
    },
    farm: {
        id: 'farm',
        name: 'building.farm.name',
        description: 'building.farm.desc',
        cost: { solidi: 80, wood: 50, stone: 20, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 0, food: 5 },
        workerSlots: 3,
        workerProduction: { food: 5 },
        color: 0xfdfd96, // Pastel Yellow
        width: 1,
        depth: 1,
        buildTime: 5000,
        icon: 'ra ra-scythe'
    },
    mill: {
        id: 'mill',
        name: 'building.mill.name',
        description: 'building.mill.desc',
        cost: { solidi: 200, wood: 150, stone: 50, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 0, food: 0 },
        bonus: { foodMultiplier: 1.2 },
        color: 0xffebcd, // BlanchedAlmond
        width: 1,
        depth: 1,
        buildTime: 8000,
        icon: 'ra ra-windmill'
    },
    market: {
        id: 'market',
        name: 'building.market.name',
        description: 'building.market.desc',
        cost: { solidi: 200, wood: 100, stone: 50, iron: 0 },
        production: { solidi: 10, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xffb347, // Pastel Orange
        width: 1,
        depth: 1,
        buildTime: 8000,
        icon: 'ra ra-wooden-sign'
    },
    barracks: {
        id: 'barracks',
        name: 'building.barracks.name',
        description: 'building.barracks.desc',
        cost: { solidi: 300, wood: 200, stone: 200, iron: 50 },
        production: { solidi: -5, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xaec6cf, // Pastel Blue
        width: 2,
        depth: 1,
        buildTime: 15000,
        icon: 'ra ra-crossed-swords'
    },
    temple: {
        id: 'temple',
        name: 'building.temple.name',
        description: 'building.temple.desc',
        cost: { solidi: 500, wood: 300, stone: 500, iron: 50 },
        production: { solidi: -2, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xffffff, // White
        width: 2,
        depth: 2,
        buildTime: 20000,
        icon: 'ra ra-sun-symbol'
    },
    colosseum: {
        id: 'colosseum',
        name: 'building.colosseum.name',
        description: 'building.colosseum.desc',
        cost: { solidi: 1000, wood: 500, stone: 1000, iron: 200 },
        production: { solidi: -10, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xdda0dd, // Plum (Pastel Purple)
        width: 3,
        depth: 3,
        buildTime: 30000,
        icon: 'ra ra-round-shield'
    }
};

export const REQUEST_TEMPLATES = [
    // --- BASIC NEEDS (Houses & Farms) ---
    { title: "req.pop_boom.title", description: "req.pop_boom.desc", type: "build", target: "house", reward: { solidi: 100 } },
    { title: "req.new_families.title", description: "req.new_families.desc", type: "build", target: "house", reward: { solidi: 110 } },
    { title: "req.refugees.title", description: "req.refugees.desc", type: "build", target: "house", reward: { solidi: 120 } },
    { title: "req.expansion.title", description: "req.expansion.desc", type: "build", target: "house", reward: { solidi: 100 } },
    { title: "req.housing.title", description: "req.housing.desc", type: "build", target: "house", reward: { solidi: 130 } },
    { title: "req.winter.title", description: "req.winter.desc", type: "build", target: "house", reward: { solidi: 140 } },
    { title: "req.merchant_homes.title", description: "req.merchant_homes.desc", type: "build", target: "house", reward: { solidi: 150 } },
    { title: "req.craftsmen.title", description: "req.craftsmen.desc", type: "build", target: "house", reward: { solidi: 110 } },

    { title: "req.famine.title", description: "req.famine.desc", type: "build", target: "farm", reward: { solidi: 150 } },
    { title: "req.grain.title", description: "req.grain.desc", type: "build", target: "farm", reward: { solidi: 160 } },
    { title: "req.army_feed.title", description: "req.army_feed.desc", type: "build", target: "farm", reward: { solidi: 170 } },
    { title: "req.agri_boom.title", description: "req.agri_boom.desc", type: "build", target: "farm", reward: { solidi: 150 } },
    { title: "req.orchards.title", description: "req.orchards.desc", type: "build", target: "farm", reward: { solidi: 160 } },
    { title: "req.cattle.title", description: "req.cattle.desc", type: "build", target: "farm", reward: { solidi: 180 } },
    { title: "req.golden_fields.title", description: "req.golden_fields.desc", type: "build", target: "farm", reward: { solidi: 155 } },

    // --- INDUSTRY (Wood, Stone, Iron) ---
    { title: "req.lumber.title", description: "req.lumber.desc", type: "build", target: "woodcutter", reward: { solidi: 200 } },
    { title: "req.ship_timber.title", description: "req.ship_timber.desc", type: "build", target: "woodcutter", reward: { solidi: 220 } },
    { title: "req.firewood.title", description: "req.firewood.desc", type: "build", target: "woodcutter", reward: { solidi: 210 } },
    { title: "req.forest.title", description: "req.forest.desc", type: "build", target: "woodcutter", reward: { solidi: 200 } },
    { title: "req.carpenter.title", description: "req.carpenter.desc", type: "build", target: "woodcutter", reward: { solidi: 230 } },

    { title: "req.walls.title", description: "req.walls.desc", type: "build", target: "quarry", reward: { solidi: 250 } },
    { title: "req.paving.title", description: "req.paving.desc", type: "build", target: "quarry", reward: { solidi: 260 } },
    { title: "req.monument.title", description: "req.monument.desc", type: "build", target: "quarry", reward: { solidi: 280 } },
    { title: "req.foundation.title", description: "req.foundation.desc", type: "build", target: "quarry", reward: { solidi: 250 } },
    { title: "req.rock.title", description: "req.rock.desc", type: "build", target: "quarry", reward: { solidi: 270 } },

    { title: "req.weapons.title", description: "req.weapons.desc", type: "build", target: "mine", reward: { solidi: 300 } },
    { title: "req.armor.title", description: "req.armor.desc", type: "build", target: "mine", reward: { solidi: 320 } },
    { title: "req.tools.title", description: "req.tools.desc", type: "build", target: "mine", reward: { solidi: 310 } },
    { title: "req.deep_earth.title", description: "req.deep_earth.desc", type: "build", target: "mine", reward: { solidi: 350 } },
    { title: "req.iron_age.title", description: "req.iron_age.desc", type: "build", target: "mine", reward: { solidi: 330 } },

    // --- ECONOMY (Market) ---
    { title: "req.trade.title", description: "req.trade.desc", type: "build", target: "market", reward: { solidi: 350 } },
    { title: "req.commerce.title", description: "req.commerce.desc", type: "build", target: "market", reward: { solidi: 360 } },
    { title: "req.tax.title", description: "req.tax.desc", type: "build", target: "market", reward: { solidi: 400 } },
    { title: "req.foreign.title", description: "req.foreign.desc", type: "build", target: "market", reward: { solidi: 380 } },
    { title: "req.bazaar.title", description: "req.bazaar.desc", type: "build", target: "market", reward: { solidi: 370 } },
    { title: "req.coin.title", description: "req.coin.desc", type: "build", target: "market", reward: { solidi: 390 } },

    // --- MILITARY (Barracks) ---
    { title: "req.militia.title", description: "req.militia.desc", type: "build", target: "barracks", reward: { solidi: 300 } },
    { title: "req.patrol.title", description: "req.patrol.desc", type: "build", target: "barracks", reward: { solidi: 320 } },
    { title: "req.guards.title", description: "req.guards.desc", type: "build", target: "barracks", reward: { solidi: 350 } },
    { title: "req.draft.title", description: "req.draft.desc", type: "build", target: "barracks", reward: { solidi: 310 } },
    { title: "req.war_prep.title", description: "req.war_prep.desc", type: "build", target: "barracks", reward: { solidi: 340 } },
    { title: "req.training.title", description: "req.training.desc", type: "build", target: "barracks", reward: { solidi: 330 } },

    // --- FAITH & LUXURY (Temple & Colosseum) ---
    { title: "req.divine.title", description: "req.divine.desc", type: "build", target: "temple", reward: { solidi: 400 } },
    { title: "req.festival.title", description: "req.festival.desc", type: "build", target: "temple", reward: { solidi: 450 } },
    { title: "req.holy.title", description: "req.holy.desc", type: "build", target: "temple", reward: { solidi: 420 } },
    { title: "req.spiritual.title", description: "req.spiritual.desc", type: "build", target: "temple", reward: { solidi: 410 } },

    { title: "req.games.title", description: "req.games.desc", type: "build", target: "colosseum", reward: { solidi: 1000 } },
    { title: "req.gladiator.title", description: "req.gladiator.desc", type: "build", target: "colosseum", reward: { solidi: 1200 } },
    { title: "req.display.title", description: "req.display.desc", type: "build", target: "colosseum", reward: { solidi: 1100 } },
    { title: "req.entertainment.title", description: "req.entertainment.desc", type: "build", target: "colosseum", reward: { solidi: 1050 } },
    { title: "req.victory.title", description: "req.victory.desc", type: "build", target: "colosseum", reward: { solidi: 1150 } }
];

export const EXPLORATION_TYPES = {
    wood: {
        id: 'wood',
        name: 'explore.wood.name',
        icon: 'ra ra-pine-tree',
        cost: 50,
        time: 5000, // 5 seconds
        risk: 0.1, // 10% fail
        min: 50,
        max: 150
    },
    stone: {
        id: 'stone',
        name: 'explore.stone.name',
        icon: 'ra ra-cubes',
        cost: 80,
        time: 8000,
        risk: 0.2,
        min: 30,
        max: 100
    },
    iron: {
        id: 'iron',
        name: 'explore.iron.name',
        icon: 'ra ra-mining-diamonds',
        cost: 120,
        time: 12000,
        risk: 0.3,
        min: 10,
        max: 50
    }
};

export const UNIT_TYPES = {
    soldier: {
        id: 'soldier',
        name: 'unit.soldier.name',
        description: 'unit.soldier.desc',
        cost: { solidi: 100 }, // No weapons needed
        stats: { attack: 10, health: 50, speed: 1 },
        icon: 'ra ra-sword',
        tier: 1,
        mergeObj: 'soldier'
    },
    archer: {
        id: 'archer',
        name: 'unit.archer.name',
        description: 'unit.archer.desc',
        cost: { solidi: 150 }, // No weapons needed
        stats: { attack: 15, health: 30, speed: 1.2 },
        icon: 'ra ra-archer',
        tier: 1,
        mergeObj: 'archer'
    },
    knight: {
        id: 'knight',
        name: 'unit.knight.name',
        description: 'unit.knight.desc',
        cost: { solidi: 300, weapons: 1, armor: 1 },
        stats: { attack: 25, health: 80, speed: 2 },
        icon: 'ra ra-knight-helmet',
        tier: 2,
        mergeObj: 'knight'
    },
    hero: {
        id: 'hero',
        name: 'unit.hero.name',
        description: 'unit.hero.desc',
        cost: { solidi: 1000, weapons: 2, armor: 2 },
        stats: { attack: 100, health: 500, speed: 1.5 },
        icon: 'ra ra-broken-skull',
        tier: 3,
        mergeObj: 'hero'
    }
};

export const ABILITIES = {
    // --- MAGIC (SPELLS) ---
    fireball: {
        id: 'fireball',
        type: 'spell',
        name: 'ability.fireball.name',
        desc: 'ability.fireball.desc',
        icon: 'ra ra-burning-meteor',
        cooldown: 10000,
        color: 0xff4400,
        damage: 50,
        radius: 15,
        unlockCost: { solidi: 0 },
        unlocked: true // Starter
    },
    ice_nova: {
        id: 'ice_nova',
        type: 'spell',
        name: 'ability.ice_nova.name',
        desc: 'ability.ice_nova.desc',
        icon: 'ra ra-ice-cube',
        cooldown: 15000,
        duration: 5000,
        color: 0x00aaff,
        unlockCost: { diamonds: 100 },
        unlocked: false
    },
    thunderbolt: {
        id: 'thunderbolt',
        type: 'spell',
        name: 'ability.thunderbolt.name',
        desc: 'ability.thunderbolt.desc',
        icon: 'ra ra-lightning-trio',
        cooldown: 5000,
        color: 0xffff00,
        damage: 150, // High single target
        unlockCost: { diamonds: 200 },
        unlocked: false
    },
    heal: {
        id: 'heal',
        type: 'spell',
        name: 'ability.heal.name',
        desc: 'ability.heal.desc',
        icon: 'ra ra-health',
        cooldown: 20000,
        color: 0x00ff00,
        healAmount: 50,
        unlockCost: { diamonds: 300 },
        unlocked: false
    },
    meteor: {
        id: 'meteor',
        type: 'spell',
        name: 'ability.meteor.name',
        desc: 'ability.meteor.desc',
        icon: 'ra ra-cracked-alien-skull', // Placeholder
        cooldown: 60000,
        color: 0xff0000,
        damage: 500, // Ultimate
        radius: 30, // Large Area
        unlockCost: { diamonds: 1000 },
        unlocked: false
    },

    // --- SKILLS (SPECIAL ATTACKS) ---
    fury: {
        id: 'fury',
        type: 'skill',
        name: 'ability.fury.name',
        desc: 'ability.fury.desc',
        icon: 'ra ra-muscle-up',
        cooldown: 20000,
        duration: 10000,
        color: 0xff0000,
        multiplier: 2.0,
        unlockCost: { diamonds: 100 },
        unlocked: false
    },
    shield_wall: {
        id: 'shield_wall',
        type: 'skill',
        name: 'ability.shield_wall.name',
        desc: 'ability.shield_wall.desc',
        icon: 'ra ra-shield',
        cooldown: 30000,
        duration: 10000,
        color: 0x0000ff,
        defenseBuff: true, // Implementation detail
        unlockCost: { diamonds: 250 },
        unlocked: false
    },
    haste: {
        id: 'haste',
        type: 'skill',
        name: 'ability.haste.name',
        desc: 'ability.haste.desc',
        icon: 'ra ra-rabbit',
        cooldown: 20000,
        duration: 15000,
        color: 0x00ff88,
        speedBuff: true,
        unlockCost: { diamonds: 150 },
        unlocked: false
    },
    war_cry: {
        id: 'war_cry',
        type: 'skill',
        name: 'ability.war_cry.name',
        desc: 'ability.war_cry.desc',
        icon: 'ra ra-megaphone', // Placeholder
        cooldown: 25000,
        duration: 10000,
        color: 0xffaa00,
        debuff: 'weaken',
        unlockCost: { diamonds: 200 },
        unlocked: false
    },
    whirlwind: {
        id: 'whirlwind',
        type: 'skill',
        name: 'ability.whirlwind.name',
        desc: 'ability.whirlwind.desc',
        icon: 'ra ra-tornado',
        cooldown: 15000,
        color: 0xcccccc,
        damage: 30, // AoE around unit
        radius: 5,
        unlockCost: { diamonds: 350 },
        unlocked: false
    }
};

export const STORE_PACKS = {
    diamonds: [
        { id: 'd_small', name: 'store.d_small', cost: 'Free', reward: { diamonds: 100 }, icon: 'ra ra-diamond' },
        { id: 'd_medium', name: 'store.d_medium', cost: 'Free', reward: { diamonds: 500 }, icon: 'ra ra-diamond' },
        { id: 'd_large', name: 'store.d_large', cost: 'Free', reward: { diamonds: 1000 }, icon: 'ra ra-diamond' }
    ],
    resources: [
        { id: 'r_weapons', name: 'store.r_weapons', cost: { diamonds: 50 }, reward: { weapons: 10 }, icon: 'ra ra-sword' },
        { id: 'r_armor', name: 'store.r_armor', cost: { diamonds: 50 }, reward: { armor: 10 }, icon: 'ra ra-vest' },
        { id: 'r_solidi', name: 'store.r_solidi', cost: { diamonds: 10 }, reward: { solidi: 1000 }, icon: 'ra ra-gold-bar' }
    ]
};
