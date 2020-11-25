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

                    if(!Memory.rooms.hasOwnProperty(name)) {
                        Memory.rooms[name] = {}
                    }

                    if(!Memory.rooms[name].hasOwnProperty('mySources')) {
                        Memory.rooms[name].mySources = {}
                    }


                    if (!Memory.spawnRooms[name]) {
                        Memory.spawnRooms[name] = 1;
                    }

                    let sources = room.find(FIND_SOURCES);
                    let ids = sources.map(a => a.id)

                    if (ids.toString() !== Object.keys(Memory.rooms[name].mySources).toString()) {
                        console.log("Adding new sources into memory")
                        for (let s = 0; s < sources.length; s++) {
                            let source = sources[s];
                            let sourceID = source.id;
                            memory_interface.store_source(sourceID, source.pos)
                        }

                    } else {
                        console.log("No new sources to add into memory")
                    }
                }
            }
        }
        catch (ex) {
            console.log(ex);
            console.log(ex.stack)
            this.init_memory()
        }
    },

    init_memory : function() {
        try {
            if (Memory.spawnRooms === undefined) {
                console.log("Spawn room memory needs initialization")
                Memory.spawnRooms = {}
            }

            // Remove old rooms after a new spawn
            for (let room in Memory.spawnRooms) {
                console.log(room);
                if (!Game.rooms[room] || !Game.rooms[room].owner || Game.rooms[room].owner.username  !== "Nickka") {
                    delete Memory.spawnRooms[room]
                }
            }

        } catch (ex) {
            console.log(ex)
            console.log(ex.stack);
        }
    }


}

module.exports = memorySetup;