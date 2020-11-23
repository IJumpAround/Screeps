let roleBuilder =
{
    
    /** @param {Creep} creep **/
    run: function(creep)
    {

        //Creep needs to collect resources
	    if(creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
        {
            creep.memory.target = null;     //reset target
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }

        //creep has resources and can build or repair
	    if(!creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY))
        {
            creep.memory.target = null;     //reset target
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

        //Begin build logic
	    if(creep.memory.building){
            let sitesLeft = this.build(creep);
          console.log(`creep ${creep.name} sites left: ${sitesLeft}`);
            //There are no construction sites so start repairing
            if(!sitesLeft)
                this.repair(creep);
	    }
        //Retrieve some resources
        else{
            this.retrieve(creep);
        }

	},
/**
    Finds a construction site somewhere in our visible rooms and builds it
    @param {Creep} creep - the creep to perform the build action
    @returns {Boolean} - true if the creep is building false if there are no build sites found
**/
    build : function(creep){

        let targets = [];
        let closestTarget;
        let result;
        if(!creep.isValidTarget(MY_ACTION_BUILD)){

            //search for targets in any room listed in MY_SAFEROOMS

            for (let i in MY_SAFEROOMS){
                let room = MY_SAFEROOMS[i];

                if(Game.rooms[room]){
                    let temp =  Game.rooms[room].find(FIND_CONSTRUCTION_SITES);
                    if(temp.length > 0)
                        targets = targets.concat(temp);
                }
            }

            //attempt to find the closest target in the list
            if(targets.length > 0){
                closestTarget = creep.pos.findClosestByRange(targets);

                //Set the creeps memory target
                if(closestTarget == null){
                    creep.setTarget(targets[0]);
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                else
                    creep.setTarget(closestTarget);

                //Attempt to build or move to the target
                result = creep.build(closestTarget);
                if(result === ERR_NOT_IN_RANGE){
                    creep.moveTo(closestTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                }

                return true;

            }
            else
                return false;
        }
        //creep already has a target
        else{
            let target = creep.getTarget();
            result = creep.build(target);
            if(result === ERR_NOT_IN_RANGE){
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});

            }
            //so the creep doesnt get stuck walking between rooms
            else if(result === OK && creep.pos.x === 49){
                creep.move(LEFT);
            }
            else if(result === OK && creep.pos.y === 49){
                creep.move(TOP);
            }
            return true;
        }

    },

/**Filter passed into the find method to determine which structures are below
    their minimum health percent
    @returns {Boolean}
    @param {Boolean} useMinimum - false for any damaged building, true for
                                 buildings weaker than a constant threshold
**/
    repairFilter : function(useMinimum){
        /**@param {Structure} structure **/
        return function(structure){
            let type = structure.structureType;
            if(!useMinimum){
                return(structure.hits < structure.hitsMax);
            }
            else{

                let ratio = Math.round(structure.hits*1000)/Math.round(structure.hitsMax*1000);
                //console.log(JSON.stringify(structure) + ' ' + ratio);
                //console.log(type + ': ' + Math.round(ratio*100000) + ' ' + Math.round(MY_MIN_REPAIR_PERCENT[type]*100000));
                return(Math.round(ratio*100000) < Math.round(MY_MIN_REPAIR_PERCENT[type]*100000));
            }

        };
    },

    /** This function first searches for very damaged building based on the repair
        ratio constant. After all of those have been repaired all damaged structures
        are returned
        @param {Structure} [target=null] - the target to repair
        @returns {Array|Structure} - Array of damaged buildings or single building
        if the target was passed in
    **/
    findRepairTargets : function(target = null){
        let room;
        let temp;
        let targets = [];

        if(target != null){
            //supplied target
            return target;
        }
        else{
            //First look for very weak targets
            
            for (let i in MY_SAFEROOMS){
                room = Game.rooms[MY_SAFEROOMS[i]];
                if(room)
                    temp = room.find(FIND_STRUCTURES,{filter: this.repairFilter(true)});

                //append targets from each room to final list
                if(temp.length > 0)
                    targets = targets.concat(temp);
                }
            //Look for the remaining damaged targets
            if (targets.length === 0)
            {

                for (let i in MY_SAFEROOMS){
                    room = Game.rooms[MY_SAFEROOMS[i]];
                    //Find structures in this room with any damage
                    if(room)
                        temp = room.find(FIND_STRUCTURES,{filter: this.repairFilter(false)});

                    if(temp.length > 0)
                        targets = targets.concat(temp);
                    }
            }
            return targets;
        }
    },

/** calls the other functions to find targets and then performs repairs on them
    @param {Creep} creep - the creep object performing the repair
    @param {Structure} [target] -optional target structure to repair
**/
    repair : function(creep, target = null){
        let result;
        //check if we need to get a target
        if(!creep.isValidTarget(MY_ACTION_REPAIR)){
            //get all targets
            let targets = this.findRepairTargets();
            //console.log(targets);
            if(targets.length > 0){
                target = creep.pos.findClosestByRange(targets);
                if(!target)
                    target = targets[0];
                console.log(`targets ${targets}`)
                creep.setTarget(target);
                result = creep.repair(target);
                if(result === ERR_NOT_IN_RANGE)
                    creep.moveTo(target,{visualizePathStyle: {stroke: '#91ff00'}});
            }

        }
        //creep already has a target
        else{
            target = creep.getTarget();
            result = creep.repair(target);
            if(result === ERR_NOT_IN_RANGE)
                creep.moveTo(target,{visualizePathStyle: {stroke: '#91ff00'}});
        }
    },

/**
    @param {Creep} creep - creep performing the retrieving
    @param {Structure} [target=null] -optional target container or storage
**/
    retrieve : function(creep, target = null){
        let result;
        //Creep needs to choose a new target
        if(!creep.isValidTarget(MY_ACTION_RETRIEVE)){
            let dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES,40);
            dropped = dropped[0];
            if(dropped){
                creep.setTarget(dropped);
                result = creep.pickup(dropped);
                if(result === ERR_NOT_IN_RANGE)
                    creep.moveTo(dropped, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            //NOTE this stops after the first storage is found
            //Get the location of the storage structure
            else{
                let storage;
                for (let i in MY_SAFEROOMS){
                    let room = Game.rooms[MY_SAFEROOMS[i]];
                    storage = room.storage;
                    if(storage)
                        break;
                    }
                //console.log(creep.name + ' ' + storage);
                if(storage){
                    creep.setTarget(storage);
                    result = creep.withdraw(storage,RESOURCE_ENERGY);
                    if(result === ERR_NOT_IN_RANGE)
                        creep.moveTo(storage,{visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        //Creep already has a target
        else {
            target = creep.getTarget();
            if(target instanceof Resource) {
                result = creep.pickup(target);
                if(result === ERR_NOT_IN_RANGE)
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else{
                result = creep.withdraw(target,RESOURCE_ENERGY);
                if(result === ERR_NOT_IN_RANGE)
                    creep.moveTo(target,{visualizePathStyle: {stroke: '#ffaa00'}});
            }

        }
    }
};

module.exports = roleBuilder;
