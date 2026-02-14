export const GENERALS = [
    {
        id: 'astralo',
        name: 'Astralo',
        image: 'assets/personaggi/astralo.png',
        bonus: {
            materials: 1.2, // +20% Materials production (applies to all: wood, stone, iron)
            morale: 0.9     // -10% Morale (future)
        },
        description: 'Master of Logistics. +20% Materials, -10% Morale.'
    },
    {
        id: 'crom',
        name: 'Crom',
        image: 'assets/personaggi/crom.png',
        bonus: {
            attack: 1.2,    // +20% Attack
            materials: 0.9  // -10% Materials production
        },
        description: 'Warmonger. +20% Attack, -10% Materials.'
    },
    {
        id: 'gerelt',
        name: 'Gerelt',
        image: 'assets/personaggi/gerelt.png',
        bonus: {
            speed: 1.2,     // +20% Movement Speed
            income: 0.9     // -10% Income (Solidi)
        },
        description: 'Swift Strategist. +20% Speed, -10% Income.'
    },
    {
        id: 'helena',
        name: 'Helena',
        image: 'assets/personaggi/helena.png',
        bonus: {
            income: 1.2,    // +20% Income
            attack: 0.9     // -10% Attack
        },
        description: 'Economic Genius. +20% Income, -10% Attack.'
    },
    {
        id: 'ofle',
        name: 'Ofle',
        image: 'assets/personaggi/ofle.png',
        bonus: {
            materials: 1.1,      // +10% Materials
            constructionTime: 0.8 // -20% Construction Time (multiplier)
        },
        description: 'Master Builder. +10% Materials, -20% Build Time.'
    },
    {
        id: 'sonya',
        name: 'Sonya',
        image: 'assets/personaggi/sonya.png',
        bonus: {
            defense: 1.2,          // +20% Defense
            constructionSpeed: 1.1 // +10% Construction Speed
        },
        description: 'Defender. +20% Defense, +10% Build Speed.'
    },
    {
        id: 'talkenbar',
        name: 'Talkenbar',
        image: 'assets/personaggi/talkenbar.png',
        bonus: {
            income: 1.15,   // +15% Income
            armySize: 0.9   // -10% Max Army Size
        },
        description: 'Merchant Lord. +15% Income, -10% Army Size.'
    }
];

export const RESOURCES = {
    solidi: 'Solidi',
    wood: 'Wood',
    stone: 'Stone',
    iron: 'Iron',
    food: 'Food'
};

export const BUILDINGS = {
    palace: {
        id: 'palace',
        name: 'Palace',
        description: 'The seat of power. Generates base resources.',
        cost: { solidi: 0, wood: 0, stone: 0, iron: 0 },
        production: { solidi: 2, wood: 1, stone: 1, iron: 1, food: 2 },
        color: 0xff0000,
        width: 2,
        depth: 2,
        buildTime: 0 // Instant
    },
    house: {
        id: 'house',
        name: 'House',
        description: 'Increases population cap and tax revenue.',
        cost: { solidi: 50, wood: 50, stone: 0, iron: 0 },
        production: { solidi: 1, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0x00ff00,
        width: 1,
        depth: 1,
        buildTime: 5000
    },
    woodcutter: {
        id: 'woodcutter',
        name: 'Woodcutter',
        description: 'Produces Wood.',
        cost: { solidi: 100, wood: 20, stone: 0, iron: 0 },
        production: { solidi: 0, wood: 5, stone: 0, iron: 0, food: 0 },
        color: 0x8B4513, // SaddleBrown
        width: 1,
        depth: 1,
        buildTime: 5000
    },
    quarry: {
        id: 'quarry',
        name: 'Quarry',
        description: 'Produces Stone.',
        cost: { solidi: 100, wood: 100, stone: 0, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 3, iron: 0, food: 0 },
        color: 0x808080,
        width: 1,
        depth: 1,
        buildTime: 8000
    },
    mine: {
        id: 'mine',
        name: 'Iron Mine',
        description: 'Extracts Iron.',
        cost: { solidi: 150, wood: 150, stone: 100, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 2, food: 0 },
        color: 0x708090, // SlateGray
        width: 1,
        depth: 1,
        buildTime: 10000
    },
    farm: {
        id: 'farm',
        name: 'Farm',
        description: 'Produces Food.',
        cost: { solidi: 80, wood: 50, stone: 20, iron: 0 },
        production: { solidi: 0, wood: 0, stone: 0, iron: 0, food: 5 },
        color: 0xFFD700, // Gold (Wheat)
        width: 1,
        depth: 1,
        buildTime: 5000
    },
    market: {
        id: 'market',
        name: 'Market',
        description: 'Increases Solidi production.',
        cost: { solidi: 200, wood: 100, stone: 50, iron: 0 },
        production: { solidi: 10, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xffff00,
        width: 1,
        depth: 1,
        buildTime: 8000
    },
    barracks: {
        id: 'barracks',
        name: 'Barracks',
        description: 'Trains soldiers.',
        cost: { solidi: 300, wood: 200, stone: 200, iron: 50 },
        production: { solidi: -5, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0x0000ff,
        width: 2,
        depth: 1,
        buildTime: 15000
    },
    temple: {
        id: 'temple',
        name: 'Temple',
        description: 'A place for worship. Citizens request this.',
        cost: { solidi: 500, wood: 300, stone: 500, iron: 50 },
        production: { solidi: -2, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xFFFFFF, // White
        width: 2,
        depth: 2,
        buildTime: 20000
    },
    colosseum: {
        id: 'colosseum',
        name: 'Colosseum',
        description: 'Entertainment for the masses.',
        cost: { solidi: 1000, wood: 500, stone: 1000, iron: 200 },
        production: { solidi: -10, wood: 0, stone: 0, iron: 0, food: 0 },
        color: 0xA52A2A, // Brown
        width: 3,
        depth: 3,
        buildTime: 30000
    }
};

export const REQUEST_TEMPLATES = [
    {
        title: "We need faith!",
        description: "The people demand a place to pray. Build a Temple.",
        type: "build",
        target: "temple",
        reward: { solidi: 400 }
    },
    {
        title: "Entertainment!",
        description: "The populace is bored. Build a Colosseum.",
        type: "build",
        target: "colosseum",
        reward: { solidi: 1000 }
    },
    {
        title: "More Homes",
        description: "We are overcrowding. Build a House.",
        type: "build",
        target: "house",
        reward: { solidi: 100 }
    },
    {
        title: "Defenses",
        description: "We feel unsafe. Build a Barracks.",
        type: "build",
        target: "barracks",
        reward: { solidi: 300 }
    },
    {
        title: "Hunger",
        description: "We are hungry! Build a Farm.",
        type: "build",
        target: "farm",
        reward: { solidi: 150 }
    }
];

export const EXPLORATION_TYPES = {
    wood: {
        id: 'wood',
        name: 'Search for Wood',
        cost: 50,
        time: 5000, // 5 seconds
        risk: 0.1, // 10% fail
        min: 50,
        max: 150
    },
    stone: {
        id: 'stone',
        name: 'Search for Stone',
        cost: 80,
        time: 8000,
        risk: 0.2,
        min: 30,
        max: 100
    },
    iron: {
        id: 'iron',
        name: 'Search for Iron',
        cost: 120,
        time: 12000,
        risk: 0.3,
        min: 10,
        max: 50
    }
};
