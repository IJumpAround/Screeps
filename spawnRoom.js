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

    /**
    *@param {string} roomName - roomname
    **/
    run : function(roomName){

        let hostiles = defense.run(roomName);
        let towerActions = require('towerActions');
        //roleBuilder.findRepairTargets();


        //Get list of all creeps spawned by the spawner in this room and count them
        let thisRoom = Game.rooms[roomName];
        let creepsSpawnedHere = _.filter(Game.creeps, (i) => i.memory.spawnerRoom === roomName);
        this.numCreeps.harvester = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_HARVESTER);
        this.numCreeps.mover = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_MOVER);
        this.numCreeps.upgrader = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_UPGRADER);
        this.numCreeps.builder = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_BUILDER);
        this.numCreeps.claimer = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_CLAIMER);
        this.numCreeps.defender = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_DEFENDER);
        this.numCreeps.healer = _.sum(creepsSpawnedHere, (c) => c.memory.role === MY_ROLE_HEALER);

        //Get spawner and tower in this room
        let spawner = thisRoom.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_SPAWN}});
        spawner = spawner[0];
        let tower = thisRoom.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});

        let hostilesInRoom = _.filter(thisRoom.find(FIND_HOSTILE_CREEPS));

        //Defense code


        //console.log(hostiles);

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
        for(let name in creepsSpawnedHere){
        	let creep = creepsSpawnedHere[name];
            let spawnTime = require('utilities').calculateTimeCost(creep.body);
            // console.log(spawnTime + ' ' + creep.ticksToLive);
            switch (creep.memory.role){

        	    case MY_ROLE_HARVESTER:{
                    console.log(name + " " + creep.ticksToLive);
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

        spawning.run(creepsSpawnedHere, this.numCreeps, spawner);
    }

};

module.exports = spawnRoom;
