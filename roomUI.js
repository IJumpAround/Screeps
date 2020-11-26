let roomUI = {

    drawCounters: function() {
        let sources = Game.spawns.Spawn1.room.find(FIND_SOURCES);
        for (let i in sources) {
            let source = sources[i];
            let x, y;
            //console.log(source);
            x = source.pos.x;
            y = source.pos.y;
            let visual = source.room.visual;

            visual.text("Slots used " + source.memory.slots + "/" + source.memory.maxSlots, x + 3, y);
            //console.log (visual.roomName);
            //console.log('sourcevisual object: ' + source1Visual.roomName);
        }
    },

    drawContainerLabels: function() {
        let containers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } });

        for (let i in containers) {
            let container = containers[i];
            let x, y;
            x = container.pos.x;
            y = container.pos.y - 1;
            let percent = Math.floor(100 * (container.store[RESOURCE_ENERGY] / container.store.getCapacity()));
            let visual = container.room.visual;
            visual.text("%" + percent, x, y);
        }
    },

    /**
     [0]=harvester [1]=upgrader [2]=builder [3]=mover
     *@param {object} counterArr - {creeptype: counter}
     **/
    drawHud: function(counterArr, roomName) {
        let numHarv = counterArr[MY_ROLE_HARVESTER];
        let numUpg = counterArr[MY_ROLE_UPGRADER];
        let numBuild = counterArr[MY_ROLE_BUILDER];
        let numMov = counterArr[MY_ROLE_MOVER];
        let numClaim = counterArr[MY_ROLE_CLAIMER];
        let pos = new RoomPosition(0, 1, roomName);
        let room = Game.rooms[roomName];
        let visual = room.visual;

        let storedTotal = "";
        if (room.storage)
            storedTotal = room.storage.store[RESOURCE_ENERGY];
        else
            storedTotal = "N/A";

        visual.text("Harvesters: " + numHarv, pos, { align: "left" });
        visual.text("Upgraders: " + numUpg, pos.x, pos.y + 1, { align: "left" });
        visual.text("Builders: " + numBuild, pos.x, pos.y + 2, { align: "left" });
        visual.text("Movers: " + numMov, pos.x, pos.y + 3, { align: "left" });
        visual.text("Claimers: " + numClaim, pos.x, pos.y + 4, { align: "left" });
        visual.text("Spawn Energy: " + room.energyAvailable + "/" + room.energyCapacityAvailable,
            pos.x, pos.y + 5, { align: "left" });
        let total = require("utilities").getContainerEnergy(room);
        visual.text("Container Energy: " + total, pos.x, pos.y + 6, { align: "left" });
        let droppedTotal = this.getDroppedEnergy(room);
        visual.text("Dropped Energy: " + droppedTotal, pos.x, pos.y + 7, { align: "left" });
        visual.text("Stored Energy: " + storedTotal.toLocaleString(), pos.x, pos.y + 8, { align: "left" });

    },
    /**
     *@param {room} room
     **/
    getDroppedEnergy: function(room) {
        let dropped = room.find(FIND_DROPPED_RESOURCES);
        let total = 0;
        for (let i = 0; i < dropped.length; i++) {
            total += dropped[i].amount;
        }

        return total;
    }

};

module.exports = roomUI;
