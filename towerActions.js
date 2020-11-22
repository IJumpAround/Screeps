var towerActions = {

    /**
    *@param {StructureTower} thisTower -the tower taking actions
    *@param {Structure} [target] - the target to repair
    **/
    repair : function(thisTower, target = null){

        if(target == null)
        {
            if(thisTower.energy > thisTower.energyCapacity * 0.5){
                target = thisTower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter : (structure) => structure.hits < structure.hitsMax &&
                                            structure.structureType == STRUCTURE_ROAD ||
                                            (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100)
                });
                thisTower.repair(target);
            }

        }
        else
            thisTower.repair(target);

    },
    /**
    *@param {StructureTower} thisTower - The tower that will be firing
    *@param {Collection} baddies - list of enemies in the room
    **/
    fire : function(thisTower, baddies){
        var closest = thisTower.pos.findClosestByRange(baddies);
        thisTower.attack(closest);

    }

};

module.exports = towerActions;
