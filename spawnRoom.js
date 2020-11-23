let roomUI = require('roomUI');
let spawning = require('updatedSpawning');
let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleMover = require('role.mover');
let roleClaimer = require('role.claimer');
let roleDefender = require('role.defender');
let roleHealer = require('role.healer');
let defense = require('defense');

let spawnRoom = {
    numCreeps : {
        'harvester': 0,
        'mover': 0,
        'upgrader': 0,
        'builder': 0,
        'claimer' : 0,
        'defender' : 0,
        'healer' : 0
    },
    creepsSpawnedHere: [],
    loaded_sources: {},
    room: {},

    /**
    *@param {string} roomName - roomname
    **/
    run : function(roomName, tick){

        let hostiles = defense.run(roomName);
        let towerActions = require('towerActions');
        //roleBuilder.findRepairTargets();


        //Get list of all creeps spawned by the spawner in this room and count them
        this.room = Game.rooms[roomName];
        if(this.creepsSpawnedHere.length === 0 || tick % 10 === 0) {
            this.creepsSpawnedHere = _.filter(Game.creeps, (i) => i.memory.spawnerRoom === roomName);
            this.numCreeps.harvester = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_HARVESTER);
            this.numCreeps.mover = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_MOVER);
            this.numCreeps.upgrader = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_UPGRADER);
            this.numCreeps.builder = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_BUILDER);
            this.numCreeps.claimer = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_CLAIMER);
            this.numCreeps.defender = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_DEFENDER);
            this.numCreeps.healer = _.sum(this.creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_HEALER);
        }

        //Get spawner and tower in this room
        let spawner = this.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}});
        let tower = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        spawner = spawner[0];

        let hostilesInRoom = _.filter(this.room.find(FIND_HOSTILE_CREEPS));

        //Defense code
        if (hostilesInRoom.length > 0)
        {
            if(!Memory.warTime){
                console.log("Hostile creep detected");
                Memory.warTime = true;
            }

            if(tower)
                towerActions.fire(tower,hostiles);

        }
        else{
            if(Memory.warTime){
                Memory.warTime = false;
                console.log('area secure');
            }
            else if(tower)
                towerActions.repair(tower);
        }

        //EXECUTE CREEP ROLES
        for(let name in this.creepsSpawnedHere){
        	let creep = this.creepsSpawnedHere[name];
            let spawnTime = require('utilities').calculateTimeCost(creep.body);
            switch (creep.memory.role){

        	    case MY_ROLE_HARVESTER:{
                    if(creep.ticksToLive < spawnTime){
                        this.numCreeps[MY_ROLE_HARVESTER]--;
                     }

        			roleHarvester.run(creep);
                    break;
                    //test.run(creep);
        		}
        		case MY_ROLE_UPGRADER:{
        			//numCreeps[MY_ROLE_UPGRADER]--;
        			roleUpgrader.run(creep);
                    break;
        		}
        		case MY_ROLE_BUILDER:{
        			//numCreeps[MY_ROLE_BUILDER]--;
        			roleBuilder.run(creep);
                    break;
        		}
                case MY_ROLE_MOVER:{
                    if(creep.ticksToLive < spawnTime){
                        this.numCreeps[MY_ROLE_MOVER]--;
                    }
                    //roleMover.run(creep);
                    try{
                        roleMover.run(creep);
                    }
                    catch(err) {
                        console.log(err + ' in room: ' + roomName + ' while executing mover role on creep: ' + creep.name);
                        console.log(err.stack)
                    }
                    break;
                }

                case MY_ROLE_CLAIMER:{
                    if(creep.ticksToLive < spawnTime){
                        this.numCreeps[MY_ROLE_CLAIMER]--;
                    }
                    roleClaimer.run(creep);
                    break;
                }
                case MY_ROLE_DEFENDER:{
                    //numCreeps[MY_ROLE_DEFENDER]--;
                    try{
                        roleDefender.run(creep,hostiles);
                    }
                    catch(err){
                        console.log(err);
                    }
                    break;
                }
                case MY_ROLE_HEALER:{
                    //numCreeps[MY_ROLE_HEALER]--;
                    try{
                        roleHealer.run(creep);
                    }
                    catch(err){
                        console.log(err);
                    }
                    break;
                }
            }

        }

        //towerActions.repair(tower);
        roomUI.drawHud(this.numCreeps,roomName);

        spawning.run(this.creepsSpawnedHere, this.numCreeps, spawner);
    }

};

module.exports = spawnRoom;
