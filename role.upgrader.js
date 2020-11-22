var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //Return to harvesting
        if(creep.memory.upgrading && creep.store.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
        //Return to upgrading
	    if(!creep.memory.upgrading && creep.store.energy === creep.store.getCapacity()) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

        //Start upgrading controller
	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        //pick up resources
        else {
            var containers = creep.room.find(FIND_STRUCTURES,{
                filter : (i) => i.structureType == STRUCTURE_STORAGE &&
                                i.store[RESOURCE_ENERGY] > i.storeCapacity * 0.02
                });
            //Withdraw from containers first
            if(containers.length > 0){
                closest = creep.pos.findClosestByPath(containers);
                if(creep.withdraw(closest,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    creep.moveTo(closest,{visualizePathStyle: {stroke: '#ffaa00'}});

            }
           
            else{
                var droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};

module.exports = roleUpgrader;
