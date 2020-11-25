//GLOBAL CONSTANTS

//Creep type count
global.MY_MAX_HARVESTERS = 4;
global.MY_MAX_UPGRADERS = 2;
global.MY_MAX_BUILDERS = 5;
global.MY_MAX_MOVERS = 2;
global.MY_MAX_CLAIMERS = 0;
global.MY_MAX_HEALERS = 2;
global.MY_MAX_DEFENDERS = 1;

//Amount of movers allowed per source
global.MY_MOVERS_PER_SOURCE = 1;

//roles
//ECONOMY
global.MY_ROLE_UPGRADER = 'upgrader';
global.MY_ROLE_HARVESTER = 'harvester';
global.MY_ROLE_BUILDER = 'builder';
global.MY_ROLE_DECONSTRUCTOR = 'deconstructor';
global.MY_ROLE_MOVER = 'mover';
global.MY_ROLE_CLAIMER = 'claimer';
//WARTIME
global.MY_ROLE_DEFENDER= 'defender';
global.MY_ROLE_HEALER = 'healer';

global.MY_ROLE_HARVESTER_STATIONARY = 'stationary;'
global.MY_ROLE_HARVESTER_MOBILE = 'mobile';

//ACTIONS
global.MY_ACTION_RETRIEVE = 'retrieve';
global.MY_ACTION_HARVEST = 'harvest';
global.MY_ACTION_DROPOFF = 'deposit';
global.MY_ACTION_BUILD = 'build';
global.MY_ACTION_REPAIR = 'repair';

global.MY_ROLE_BODY_PART_RATIOS = {
    [MY_ROLE_CLAIMER]: {
        [CLAIM]: 0.50,
        [MOVE]: 0.50,
    },

    [MY_ROLE_HARVESTER]: {
        [WORK]: 0.60,
        [CARRY]: 0.20,
        [MOVE]: 0.20
        // [MY_ROLE_HARVESTER_MOBILE]: {
        //     [WORK]: 0.40,
        //     [CARRY]: 0.30,
        //     [MOVE]: 0.30,
        // }
    },

    [MY_ROLE_BUILDER]: {
        [WORK]: 0.30,
        [CARRY]: 0.40,
        [MOVE]: 0.30,
    },

    [MY_ROLE_MOVER]: {
        [WORK]: 0.10,
        [CARRY]: 0.40,
        [MOVE]: 0.50,
    },

    [MY_ROLE_UPGRADER]: {
        [WORK]: 0.40,
        [CARRY]: 0.20,
        [MOVE]: 0.40,
    },

    [MY_ROLE_DEFENDER]: {
        [TOUGH]: 0.40,
        [MOVE]: 0.15,
        [ATTACK]: 0.25,
    },

    [MY_ROLE_HEALER]: {
        [TOUGH]: 0.33,
        [MOVE]: 0.33,
        [HEAL]: 0.33,
    },

    [MY_ROLE_CLAIMER]: {
        [CLAIM]: 0.60,
        [MOVE]: 0.40
    }
}

global.MY_UPGRADE_RANGE = 3
//minimum amount allowed in storage
global.MY_MIN_STORAGE_RATIO = 0.04;
//Repair percents
global.MY_MIN_REPAIR_PERCENT = {
    'road' : 0.5,
    'rampart' : 0.01,
    'constructedWall' : 0.0002,
    'container' : 0.7,
    'spawn' : 1,
    'extension' : 1,
    'tower' : 1
};
