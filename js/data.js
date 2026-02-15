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
        color: 0xff6961, // Pastel Red
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
        color: 0x77dd77, // Pastel Green
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
        color: 0xC2B280, // Sand/Wood (Pastel Brown)
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
        color: 0xcfcfc4, // Pastel Gray
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
        color: 0x708090, // SlateGray (Kept generic, but lighter)
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
        color: 0xfdfd96, // Pastel Yellow
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
        color: 0xffb347, // Pastel Orange
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
        color: 0xaec6cf, // Pastel Blue
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
        color: 0xffffff, // White
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
        color: 0xdda0dd, // Plum (Pastel Purple)
        width: 3,
        depth: 3,
        buildTime: 30000
    }
};

export const REQUEST_TEMPLATES = [
    // --- BASIC NEEDS (Houses & Farms) ---
    { title: "Population Boom", description: "Citizens are arriving daily. Build a House.", type: "build", target: "house", reward: { solidi: 100 } },
    { title: "New Families", description: "Young couples need homes. Build a House.", type: "build", target: "house", reward: { solidi: 110 } },
    { title: "Refugees", description: "Refugees seek shelter. Build a House.", type: "build", target: "house", reward: { solidi: 120 } },
    { title: "Expansion Plans", description: "The city must grow. Build a House.", type: "build", target: "house", reward: { solidi: 100 } },
    { title: "Housing Shortage", description: "Streets are crowded. Build a House.", type: "build", target: "house", reward: { solidi: 130 } },
    { title: "Winter Shelter", description: "Winter is coming. Build a House.", type: "build", target: "house", reward: { solidi: 140 } },
    { title: "Merchant Quarter", description: "Merchants need residences. Build a House.", type: "build", target: "house", reward: { solidi: 150 } },
    { title: "Craftsmen Homes", description: "Attract skilled labor. Build a House.", type: "build", target: "house", reward: { solidi: 110 } },

    { title: "Famine Warning", description: "Stores are running low. Build a Farm.", type: "build", target: "farm", reward: { solidi: 150 } },
    { title: "Grain Supply", description: "We need more grain. Build a Farm.", type: "build", target: "farm", reward: { solidi: 160 } },
    { title: "Feeding the Army", description: "Troops march on empty stomachs. Build a Farm.", type: "build", target: "farm", reward: { solidi: 170 } },
    { title: "Agricultural Boom", description: "Good weather for crops. Build a Farm.", type: "build", target: "farm", reward: { solidi: 150 } },
    { title: "Apple Orchards", description: "People demand fruit. Build a Farm.", type: "build", target: "farm", reward: { solidi: 160 } },
    { title: "Cattle Ranching", description: "Meat is a luxury. Build a Farm.", type: "build", target: "farm", reward: { solidi: 180 } },
    { title: "Golden Fields", description: "Expand our agriculture. Build a Farm.", type: "build", target: "farm", reward: { solidi: 155 } },

    // --- INDUSTRY (Wood, Stone, Iron) ---
    { title: "Lumber Needs", description: "Construction has stalled. Build a Woodcutter.", type: "build", target: "woodcutter", reward: { solidi: 200 } },
    { title: "Shipbuilding Timber", description: "The navy needs wood. Build a Woodcutter.", type: "build", target: "woodcutter", reward: { solidi: 220 } },
    { title: "Fuel for Fires", description: "Winter demands firewood. Build a Woodcutter.", type: "build", target: "woodcutter", reward: { solidi: 210 } },
    { title: "Clear the Forest", description: "Expand the frontier. Build a Woodcutter.", type: "build", target: "woodcutter", reward: { solidi: 200 } },
    { title: "Carpenter's Request", description: "Carpenters need supply. Build a Woodcutter.", type: "build", target: "woodcutter", reward: { solidi: 230 } },

    { title: "Wall Fortifications", description: "We need stone for walls. Build a Quarry.", type: "build", target: "quarry", reward: { solidi: 250 } },
    { title: "Paving Roads", description: "Roads are muddy. Build a Quarry.", type: "build", target: "quarry", reward: { solidi: 260 } },
    { title: "Monument Material", description: "Sculptors need marble. Build a Quarry.", type: "build", target: "quarry", reward: { solidi: 280 } },
    { title: "Foundation Work", description: "New buildings need foundations. Build a Quarry.", type: "build", target: "quarry", reward: { solidi: 250 } },
    { title: "Rock Supply", description: "Stockpile stone. Build a Quarry.", type: "build", target: "quarry", reward: { solidi: 270 } },

    { title: "Weaponsmithing", description: "Smiths are idle. Build a Iron Mine.", type: "build", target: "mine", reward: { solidi: 300 } },
    { title: "Armor Production", description: "The legion needs armor. Build a Iron Mine.", type: "build", target: "mine", reward: { solidi: 320 } },
    { title: "Tool Shortage", description: "Farmers need plows. Build a Iron Mine.", type: "build", target: "mine", reward: { solidi: 310 } },
    { title: "Deep Earth", description: "Riches lie beneath. Build a Iron Mine.", type: "build", target: "mine", reward: { solidi: 350 } },
    { title: "Iron Age", description: "Iron is power. Build a Iron Mine.", type: "build", target: "mine", reward: { solidi: 330 } },

    // --- ECONOMY (Market) ---
    { title: "Trade Routes", description: "Merchants want a hub. Build a Market.", type: "build", target: "market", reward: { solidi: 350 } },
    { title: "Local Commerce", description: "Farmers depend on trade. Build a Market.", type: "build", target: "market", reward: { solidi: 360 } },
    { title: "Tax Revenue", description: "Increase tax efficiency. Build a Market.", type: "build", target: "market", reward: { solidi: 400 } },
    { title: "Foreign Goods", description: "Import luxury items. Build a Market.", type: "build", target: "market", reward: { solidi: 380 } },
    { title: "Bazaar Opening", description: "The people love shopping. Build a Market.", type: "build", target: "market", reward: { solidi: 370 } },
    { title: "Coin Flow", description: "Keep the gold moving. Build a Market.", type: "build", target: "market", reward: { solidi: 390 } },

    // --- MILITARY (Barracks) ---
    { title: "Militia Parsing", description: "Train the peasants. Build a Barracks.", type: "build", target: "barracks", reward: { solidi: 300 } },
    { title: "Border Patrol", description: "Secure the borders. Build a Barracks.", type: "build", target: "barracks", reward: { solidi: 320 } },
    { title: "Elite Guards", description: "The General needs guards. Build a Barracks.", type: "build", target: "barracks", reward: { solidi: 350 } },
    { title: "Conscription", description: "Draft more soldiers. Build a Barracks.", type: "build", target: "barracks", reward: { solidi: 310 } },
    { title: "War Preparations", description: "Enemy scouts spotted. Build a Barracks.", type: "build", target: "barracks", reward: { solidi: 340 } },
    { title: "Training Grounds", description: "Keep troops sharp. Build a Barracks.", type: "build", target: "barracks", reward: { solidi: 330 } },

    // --- FAITH & LUXURY (Temple & Colosseum) ---
    { title: "Divine Favor", description: "The Gods are angry. Build a Temple.", type: "build", target: "temple", reward: { solidi: 400 } },
    { title: "Religious Festival", description: "Host a festival. Build a Temple.", type: "build", target: "temple", reward: { solidi: 450 } },
    { title: "Holy Site", description: "Pilgrims are coming. Build a Temple.", type: "build", target: "temple", reward: { solidi: 420 } },
    { title: "Spiritual Guidance", description: "People seek answers. Build a Temple.", type: "build", target: "temple", reward: { solidi: 410 } },

    { title: "Grand Games", description: "Host the grand games! Build a Colosseum.", type: "build", target: "colosseum", reward: { solidi: 1000 } },
    { title: "Gladiator Combat", description: "The people want blood. Build a Colosseum.", type: "build", target: "colosseum", reward: { solidi: 1200 } },
    { title: "Public Display", description: "Show your power. Build a Colosseum.", type: "build", target: "colosseum", reward: { solidi: 1100 } },
    { title: "Entertainment Hub", description: "Distract the masses. Build a Colosseum.", type: "build", target: "colosseum", reward: { solidi: 1050 } },
    { title: "Victory Celebration", description: "Celebrate our conquests. Build a Colosseum.", type: "build", target: "colosseum", reward: { solidi: 1150 } }
];

export const EXPLORATION_TYPES = {
    wood: {
        id: 'wood',
        name: 'Search for Wood',
        icon: '🌲',
        cost: 50,
        time: 5000, // 5 seconds
        risk: 0.1, // 10% fail
        min: 50,
        max: 150
    },
    stone: {
        id: 'stone',
        name: 'Search for Stone',
        icon: '🪨',
        cost: 80,
        time: 8000,
        risk: 0.2,
        min: 30,
        max: 100
    },
    iron: {
        id: 'iron',
        name: 'Search for Iron',
        icon: '⛏️',
        cost: 120,
        time: 12000,
        risk: 0.3,
        min: 10,
        max: 50
    }
};
