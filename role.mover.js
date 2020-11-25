let roleMover = {

    run : function(creep){
        let retrieving = creep.memory.retrieving;
        if(creep.memory.retrieving && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
            creep.memory.retrieving = false;
            creep.say('hauling');
            creep.memory.target = null;
        }
        else if(!creep.memory.retrieving && creep.store[RESOURCE_ENERGY] === 0){
            creep.memory.retrieving = true;
            creep.say('retrieving');
            creep.memory.target = null;
        }
        if(!creep.memory.retrieving){
            this.dropOff(creep);
        }
        else{
            this.retrieve(creep);
        }


    },

    /**
        Get a list of locations based on the homeSource object type passed
        @returns {(StructureContainer[]|StructureStorage[]|Resource[]|boolean)} returns array of containers,storages,dropped resource, or false if none are found
        @param {Creep} creep -
    **/
    retrieveLocations : function(creep){
        let home; //creeps home, either a source or a room
        let droppedRange = 6;
        let containerRange = 3;
        let pickups = [];
        let containers = [];

        home = getSourcePos(creep.memory.homeSource);

        //creeps home location is a source
        if(home){
            //set home to the source object
            try{
            home = home.lookFor(LOOK_SOURCES)[0];
            }
            catch(err){
                console.log(`ERRORRORORO ${err}`);
                console.log(err.stack);
                creep.moveTo(home, {reusePath: 0, visualizePathStyle: {stroke: '#7c0000'}});
                return;
            }
            pickups = home.pos.findInRange(FIND_DROPPED_RESOURCES,droppedRange);
            if(pickups.length === 0)
                containers = home.pos.findInRange(FIND_STRUCTURES, containerRange,{filter: {structureType: STRUCTURE_CONTAINER}});
        }
        //creeps home location is a room
        //get dropped resources or the storage structure
        else{
            home = getRoom(creep.memory.homeRoom);
            pickups = home.find(FIND_DROPPED_RESOURCES);
            if(pickups.length === 0)
                containers = home.find(FIND_STRUCTURES,{filter: {structureType: STRUCTURE_STORAGE}});
        }

        if(pickups.length > 0)
            return pickups;
        else if(containers.length > 0)
            return containers;
        else
            return false;



    },


    //Will attempt to take resource from harvesters first
    //then any resources on the ground
    /** @param {Creep} creep
    **/
    retrieve : function(creep){
        let locations;
        let target; //creep.pos.findClosestByRange(locations);
        let result; //err code returned by withdraw or pickup
        //Find a target
        if(!creep.isValidTarget(MY_ACTION_RETRIEVE)) {
            creep.say('invalid target')
            //Get list of locations then the closest one
            locations = this.retrieveLocations(creep);
            target = creep.pos.findClosestByRange(locations);
            if(target)
                creep.setTarget(target);
            else if(locations)
                target = locations[0]; //creep.pos.findClosestByRange(locations);
         //   else
                //console.log(creep.name + ' nothing to pickup')
        }
        //Creep has a target already
        else{
            target = creep.getTarget();
            console.log(`target ${target}`);
        }

        // console.log(`${creep.name} target: ${JSON.stringify(target)}`);

        //Is a dropped resource
        if(target && target.amount){
            if(!creep.pos.isNearTo(target)) {
                let move_res = creep.moveTo(target, {reusePath: 2,
                    visualizePathStyle: { stroke: '#ff558b', opacity: .6 }
                });
            } else {
                result = creep.pickup(target);
            }
        }
        //Only take from target that has stored energy above a threshold
        else if(target && target.store[RESOURCE_ENERGY] > target.store.getCapacity()*MY_MIN_STORAGE_RATIO){
            if(!creep.pos.isNearTo(target)) {
                creep.moveTo(target, { reusePath: 2, visualizePathStyle: { stroke: '#55ffff' } });
            }
            else {
                result = creep.withdraw(target, RESOURCE_ENERGY);
            }
        }
        else{
            creep.say("waiting...");
            let pos = getSourcePos(creep.memory.homeSource);
            if(!creep.pos.isNearTo(pos))
                creep.moveTo(pos, {reusePath: 2, visualizePathStyle: {stroke: '#5fffff'}});
        }
        //console.log (result);

    },


//*****************************************************************************
    /**@param {Creep} creep
     destination
    Pathfinds the creep to the drop off point where it unloads.
    upon completion the creep will have nothing carried
    **/
    dropOff : function(creep){
        //console.log('test123');
        let destination;
        let homeRoom = getRoom(creep.memory.spawnerRoom);
        let destinations = [];
        if(!creep.isValidTarget(MY_ACTION_DROPOFF))
        {
            //Find potential destinations
            //Prioritize spawn
                destinations = homeRoom.find(FIND_MY_STRUCTURES,{
                filter : function(object)
                {
                    console.log(`${creep.name} Potential dropoff point ${JSON.stringify(object)}`);
                    return (object.structureType === STRUCTURE_SPAWN &&
                            object.store.energy !== object.store.getCapacity(RESOURCE_ENERGY));
                }

            });
            //Extensions next
            if (destinations.length === 0){
                destinations = homeRoom.find(FIND_MY_STRUCTURES,{
                    filter : function(object){
                        return ((object.structureType === STRUCTURE_EXTENSION &&
                                object.store.energy !== object.store.getCapacity(RESOURCE_ENERGY)) || (object.structureType === STRUCTURE_TOWER &&
                                    object.store.energy < object.store.getCapacity(RESOURCE_ENERGY) *0.6));
                    }
                });

                //Finally containers
                //
                //check to make sure the creep is not infinitly taking from and filling the storage
                //in the event it is a room filler

//TODO uncomment this
                let regularMover =  getSourcePos(creep.memory.homeSource);
                if (regularMover && destinations.length === 0){
                    destinations = homeRoom.find(FIND_STRUCTURES,{
                        filter : function(object){
                            return (( object.structureType === STRUCTURE_STORAGE)  && (object.store[RESOURCE_ENERGY]  < object.store.getCapacity()));
                        }
                    });
                    //console.log("test:" + destination);
                }
            }
        }
        else{
            destination = creep.getTarget();
        }

        //Check if a destination was found
        if(destinations.length > 0){
            destination = creep.pos.findClosestByRange(destinations);
            if(destination == null){
                creep.moveTo(destinations[0], {reusePath:0, visualizePathStyle: {stroke: '#ffff00'}});
                return;
            }
            else
                creep.setTarget(destination);
        }

        //Destination is now considered valid
        //Attempt to transfer energy
        if (creep.pos.isNearTo(destination)) {
            let result = creep.transfer(destination,RESOURCE_ENERGY)
        } else {
            creep.moveTo(destination, { reusePath: 0, visualizePathStyle: { stroke: '#ffff00' } });
        }


    //console.log(destination);
    },


    /**
     *
     * @param {Creep} creep
     * @param {RoomPosition} target_pos
     */
    path_to_dropped_resource(creep, target_pos) {
        target_pos.lookFor()

    }

};

module.exports = roleMover;
