let memorySetup = {

    load_owned_rooms : function() {
        try {
            console.log("Loading owned rooms into memory")
            let rooms = Object.values(Game.rooms);
            console.log(rooms)
            for (let i = 0; i < rooms.length; i++) {
                let room = rooms[i];

                if (room.controller.owner.username === "Nickka") {
                    let name = room.name;
                    if (!Memory.mySources.hasOwnProperty(name)) {
                        Memory.mySources[name] = {};
                    }

                    if (!Memory.spawnRooms[name]) {
                        Memory.spawnRooms[name] = 1;
                    }

                    let sources = room.find(FIND_SOURCES);
                    let ids = sources.map(a => a.id)
                    if (ids.toString() !== Object.keys(Memory.mySources[name]).toString()) {
                        console.log("Adding new sources into memory")
                        for (let s = 0; s < sources.length; s++) {
                            let source = sources[s];
                            let sourceID = source.id;
                            Memory.mySources[name][sourceID] = source.pos;

                        }

                    }
                }
            }
        }
        catch (ex) {
            this.init_memory()
        }
    },

    init_memory : function() {
        try {
            if (Memory.spawnRooms === undefined) {
                console.log("Spawn room memory needs initialization")
                Memory.spawnRooms = {}
            }

        } catch (ex) {
            console.log(ex)
        }
    }


}

module.exports = memorySetup;