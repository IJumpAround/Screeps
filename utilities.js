var utilities = {

    /**
     *Takes an array of body parts and outputs the cost to spawn that body type
     *@param {array} body - array of body parts
     */
    printBodyCost: function(body) {
        let renewFloor = 600 / body.length;
        let renewCeil;
        let cost = 0;
        let count = [0, 0];
        let moveToPartRatio = 0;
        let timeCost = 0;
        for (var i = 0; i < body.length; i++) {
            timeCost += 3;
            if (body[i] === MOVE)
                count[1]++;
            else
                count[0]++;
            cost += BODYPART_COST[body[i]];
        }
        renewCeil = cost / 2.5 / body.length;
        moveToPartRatio = count[1] / count[0];
        console.log();
        console.log("************************************************************************************");
        console.log("Body type: " + body);
        console.log("Costs: " + cost + " energy to spawn");
        console.log("Time Cost: " + timeCost + " ticks");
        console.log("Movement ratio: " + count[1] + "/" + count[0] + " or: " + moveToPartRatio.toFixed(2));
        console.log(" .5 or higher required for full movement (on roads)");
        console.log("Renew cost: " + renewFloor.toFixed(2) + "-" + renewCeil.toFixed(2));
        console.log("************************************************************************************");


    },

    /**
     *@param {Array} body - Array of body parts
     *@returns {number}
     **/
    calculateTimeCost: function(body) {
        return body.length * 3;
    },

    /**
     *@param {String} room - room name
     **/
    getContainerEnergy: function(room) {
        let sum = 0;
        let containers = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });
        for (var i = 0; i < containers.length; i++) {
            sum += containers[i].store[RESOURCE_ENERGY];
        }
        return sum;
    },

    convertOldHomes: function() {
        for (let i in Game.creeps) {
            let currCreep = Game.creeps[i];
            let type = typeof (currCreep.memory.homeSource);
            if (type == "string") {
                console.log("new");

            } else if (currCreep.memory.homeSource && type === "object") {
                var source = require("helperFunctions").getRoomPosition(currCreep.memory.homeSource).lookFor(LOOK_SOURCES);
                source = source[0];
                currCreep.memory.homeSource = source.id;
            }
        }
    },

    addControllerToReserve: function(controller) {
        if (controller instanceof StructureController) {
            Memory.reservedControllers[controller.id] = controller.pos;
        } else {
            console.log("Target is not a controller or you do not have vision");
        }
    },


    /**
     *  @param {RoomPosition} src Starting position
     * @param {RoomPosition} dst target position
     */
    get_path_to_adjacent_empty_tile(src, dst) {
        let adjacent_tiles = this.get_adjacent_empty_tiles(dst);
        let path;
        if (adjacent_tiles.length > 0) {
            path = src.findPathTo(adjacent_tiles[0]);
        } else {
            console.log("NO ADJACENT PATH FOND");
            path = src.findPathTo(dst, { ignoreCreeps: true });
        }
        return path;
    }


};

module.exports = utilities;
