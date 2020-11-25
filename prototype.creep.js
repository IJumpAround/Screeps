let utilities = require('./utilities')
/**
    target structure in memory
    creep.memory.target = {ID: idString, pos: {x, y, roomName}}

    example
    mover1234.memory.target = {'58dbc5448283ff5308a402f5', {13, 8, E84N97}}

    with this structure you can attempt to use Game.getObjectByID before searching
    the roomPosition
**/

/**
*Adds the passed target into the creeps memory.
*@param {object} target - must be an object with a RoomPosition
**/
Creep.prototype.setTarget =
 function(target) {
    //target is an object with a room position
    if(target.pos){
        this.memory.target = {id: target.id, pos: target.pos};
    }
    //target is not valid
    else{
        this.memory.target = null;
        console.log("SetTarget Error: '" + target + "' does not have a room position");
    }
};


/**
*Returns the object of the target stored in the creeps memory.
@returns {object|boolean}
**/
Creep.prototype.getTarget =
    function() {
        if(this.memory.target)
            return Game.getObjectById(this.memory.target.id);
        else {
            console.log(`${this.name} INVALID TARGET IN MEMORY`);
            return false;
        }
};




/**
 *
 * @param {RoomPosition} target_pos
 */
Creep.prototype.move_next_to_destination = function(target_pos) {
    target_pos.findClosestByRange();
    let src = this.pos

    let adjacent_path = memory_interface.get_adjacent_path(this)
    if (!adjacent_path) {
        let adjacent_tiles = utilities.get_adjacent_empty_tiles(target_pos);
        let path;
        if (adjacent_tiles.length > 0) {
            path = src.findPathTo(adjacent_tiles[0]);
        } else {
            path = src.findPathTo(target_pos, { ignoreCreeps: true });
        }
        memory_interface.store_adjacent_path(this, path)
    }
    this.room.visual.poly(adjacent_path)
    return this.moveByPath(adjacent_path)
    // return path;

}

Creep.prototype.isValidTarget =
/**
*Convert the creeps memory.target to a RoomPosition object then pass it
*to this function along with the action the creep is performing to determine
*if the target needs to be re-chosen
*@param {string} action - action being performed
*@returns {boolean}
**/
    function(action){
        let target = this.getTarget();

        if(target){
            //Check if creep is dropping off resources or retrieving
            if(action === MY_ACTION_DROPOFF || action === MY_ACTION_RETRIEVE) {
                //check if retrieving a resource
                if(action === MY_ACTION_RETRIEVE && target instanceof Resource)
                    return true;
                //check if object is container or storage
                else if(target.structureType === STRUCTURE_CONTAINER || target.structureType === STRUCTURE_STORAGE){
                    if(target.store[RESOURCE_ENERGY] < target.store.getCapacity()){
                        return true;
                    }
                }
                //check if object is extension or spawn
                else if(target.structureType === STRUCTURE_EXTENSION || target.structureType === STRUCTURE_SPAWN){
                    if(target.store.energy < target.store.getCapacity()){
                        return true;
                    }
                }
                //Target is not a valid dropoff point
                else
                    return false;
            }
            //check if creep is building
            else if(action === MY_ACTION_BUILD) {
                //only valid if target is a construction site
                return (target instanceof ConstructionSite);
            }
            //check if creep is repairing a structure
            else if(action === MY_ACTION_REPAIR) {
                if(target.structureType){
                    return (target.hits < target.hitsMax);
                }
                else
                    return false;
            }
            else if(action === MY_ACTION_HARVEST)
                return (target instanceof Source);
        }
        else
            return false;
    };
