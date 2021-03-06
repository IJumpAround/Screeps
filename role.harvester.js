var roleHarvester =
    {

        /** @param {Creep} creep **/
        run: function(creep) {
            //Run my harvest function
            if (creep.store.energy < creep.store.getCapacity(RESOURCE_ENERGY) * 0.89) {
                this.harvest(creep);
            }

            //Creep is full and is returning its load
            else {
                this.returnLoad(creep);
            }
        },


//*****************************************************************************
//*****************************************************************************
    /** @param {Creep} creep
     Choses a destination to return carried energy to
     **/
    returnLoad: function(creep) {
        //Prioritize the container placed next to the harvester
        let container = creep.pos.findInRange(FIND_STRUCTURES, 2, { filter: { structureType: STRUCTURE_CONTAINER } });
        //console.log(creep.name + ' ' +container);
        if (container.length === 0) {
            creep.drop(RESOURCE_ENERGY);
        } else {
            let result = creep.transfer(container[0], RESOURCE_ENERGY);
            //console.log(result);
            if (result === ERR_FULL) {
                creep.drop(RESOURCE_ENERGY);
            } else {/*
                console.log("ERROR");
                console.log(creep.name);
                console.log(container);
                console.log(result);*/
            }
        }


    },


//*****************************************************************************


    /** @param {Creep} creep
     Harvests energy from the closest source
     if the source is too far the creep pathfinds there
     -Selects a destination once
     -Pathfinds every tick
     Modifies two creep memory values:
     target: which contains the id of the target source
     harvesting: true when the creep is harvesting false when it is returning
     **/
    harvest: function(creep) {
        let homeSource;
        //TODO uncomment this when implementing new spawn
        let sourcePos = getSourcePos(creep.memory.homeSource);
        try {
            homeSource = sourcePos.lookFor(LOOK_SOURCES)[0];
        } catch (err) {
            console.log(err);
            console.log(err.stack);
            creep.moveTo(sourcePos);
            return;
        }
        //Harvest from source

        //console.log(result);
        if (!creep.pos.isNearTo(homeSource)) {
            creep.say("Moving to source");
            // creep.moveTo(homeSource.pos, { visualizePathStyle: { stroke: '#ffaa00' } });
            creep.move_next_to_destination(homeSource.pos, homeSource.id);
        } else {
            let result = creep.harvest(homeSource);
        }

    }
};

module.exports = roleHarvester;
