require('prototype.creep');
require('constants');
let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleMover = require('role.mover');
let roleClaimer = require('role.claimer');
let roleDefender = require('role.defender');
let roleHealer = require('role.healer');
let roomUI = require('roomUI');
//let roomInit = require('roomInit');
//let spawning = require('spawning');
let towerActions = require('towerActions');
let defense = require('defense');
let spawnRoom = require('spawnRoom');

let spawning = require('updatedSpawning');
let helper_functions = require('helperFunctions');
let utilities = require('utilities');
let memorySetup = require('memory_setup')


memorySetup.init_memory()
//var temp = require('Temp');

//var targeting = require('targeting');

//memory
//Memory.reservedControllers = {id: {x,y,roomname}}
if (Memory.spawnRooms) {
    global.MY_SAFEROOMS = Object.keys(Memory.spawnRooms);
}

global._ = require('lodash')
memorySetup.load_owned_rooms()
let planner = require('planner')


//Initializations
//roomInit.init();

//*************************************************************************************
//BEGIN MAIN LOOP HERE
module.exports.loop = function ()
{
    let tick = Game.time

    //global functions
    global.getPos = require('helperFunctions').getRoomPosition;
    global.getRoom = require('helperFunctions').getRoomObject;
    global.getSourcePos = require('helperFunctions').getSourcePosition;
    global.memory_interface = require('memory_interface')
    //roleBuilder.findRepairTargets();
    //VARIABLES

    //delete memory of dead creeps
    for(let i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    //require('targeting').balanceTargets(MY_ROLE_BUILDER,['596b09cd35e5cd0a8e9fa3eb','test']);

    // Iterate over rooms and run logic for each room
    let rooms = Object.keys(Memory.spawnRooms);
    console.log(`looping over rooms ${rooms}`)
    for(let i = 0; i < rooms.length; i++){
        let room = rooms[i];
        spawnRoom.run(room);

        // Create road plans
        if (tick % 100 === 0) {
            planner.source_roads(room)
        }
        // spawnRoom.run(MY_SPAWN_ROOMS[room]);
        // }
        // catch(err)
        // {
        //     console.log(err + ' in room ' + room);
        //     console.log(err.stack)
        // }

    }
};
