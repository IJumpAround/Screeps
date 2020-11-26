require("prototype.creep");
require("constants");
let spawnRoom = require("./spawnRoom");
let memorySetup = require("memory_setup");


//global functions
global.getPos = require("helperFunctions").getRoomPosition;
global.getRoom = require("helperFunctions").getRoomObject;
global.getSourcePos = require("helperFunctions").getSourcePosition;
global.memory_interface = require("memory_interface");

memorySetup.init_memory();

if (Memory.spawnRooms) {
    global.MY_SAFEROOMS = Object.keys(Memory.spawnRooms);
}

let terrainUtils = require("terrainUtils");
memorySetup.load_owned_rooms();
let planner = require("planner");


//Initializations
//roomInit.init();

//*************************************************************************************
//BEGIN MAIN LOOP HERE
module.exports.loop = function() {
    let tick = Game.time;


    //delete memory of dead creeps
    for (let i in Memory.creeps) {
        if (Memory.creeps.hasOwnProperty(i) && !Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    //require('targeting').balanceTargets(MY_ROLE_BUILDER,['596b09cd35e5cd0a8e9fa3eb','test']);

    // Iterate over rooms and run logic for each room
    let rooms = Object.keys(Memory.spawnRooms);
    // console.log(`MAIN LOOP ${rooms.length}`);

    for (let i = 0; i < rooms.length; i++) {
        let roomname = rooms[i];
        let room = Game.rooms[roomname];
        spawnRoom.run(roomname, tick);


        planner.test_draw_lines(Game.rooms[roomname]);
        // Create road plans
        if (tick % 100 === 0) {

            planner.source_roads(roomname);

            if (room.controller.owner.username === "Nickka")
                terrainUtils._load_harvester_spots(Game.rooms[roomname]);
        }

    }
};
