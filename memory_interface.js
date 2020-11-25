let memory_interface = {

    /**
     * @param {string} room_name
     * @param {string} source_id
     * @param {PathStep[]} path
     */
    store_source_path(room_name, source_id, path) {
        if (!Memory.rooms[room_name].controller_source_paths) {
            Memory.rooms[room_name].controller_source_paths = {}
        }
        Memory.rooms[room_name].controller_source_paths[source_id] = Room.serializePath(path)
    },

    /**
     *
     * @param {Creep} creep
     * @param {PathStep[]} path
     */
    store_adjacent_path(creep, path) {
        let tick = Game.time
        creep.memory.adjacent_path = {'t': tick, 'p': Room.serializePath(path), 'ttl':5}
    },

    get_adjacent_path(creep) {
        let tick = Game.time

        let rec = creep.memory.adjacent_path

        if (rec && tick - rec.t > rec.ttl) {
            return Room.deserializePath(rec.p)
        } else {
            creep.memory.adjacent_path = null
            return null
        }
    },

    /**
     *
     * @param {string} source_id
     * @param {RoomPosition} position
     */
    store_source(source_id, position) {
        let pos = {x: position.x, y: position.y, roomName: position.roomName}
        let mySources = Memory.rooms[pos.roomName].mySources

        if (!mySources) {
            mySources = {}
        }

        Memory.rooms[pos.roomName].mySources[source_id] = pos
    },

    /**
     * Return stored source position if available
     * @param {string|null} room_name
     * @param id
     * @returns {SerializedRoomPosition| null}
     */
    get_source(room_name, id) {
        if (room_name === null) {
            return this._lookup_source_by_id(id)
        }

        let mySources = Memory.rooms[room_name]
        if(!mySources) {
            mySources[id] = {}
        }
        return Memory.rooms[room_name].mySources[id]
    },

    _lookup_source_by_id(id) {
        let result = {}
        for (let room in Memory.rooms) {
            if (Memory.rooms.hasOwnProperty(room)) {
                let result = this.get_source(room, id)
                if (result !== null) {
                    break
                }
            }
        }
        return result
    },

    is_source_stored(room_name, id) {
        return this.get_source(room_name, id) !== undefined
    },

    list_sources(room) {
        let mem_room = Memory.rooms[room]
        let result = []
        if(mem_room) {

            result = Object.keys(mem_room.mySources)
        }
        return result
    },

    /**
     *
     * @param {Creep} creep
     */
    get_creep_home_source(creep) {
        let source = null;
        try {
            source = creep.memory.homeSource

        } catch (ex) {
            console.log(`Exception retrieving home source for ${creep.name}`);
            console.log(ex.stack);
        }
        return source
    },

    /**
     * Set the creeps home source in memory to the passed value
     * @param {Creep} creep
     * @param source
     */
    set_creep_home_source(creep, source) {

        creep.memory.homeSource = source;
    },


    get safe_rooms() {
        let rooms = MY_SAFEROOMS

        if (rooms.length === 0) {
            rooms = Memory.spawnRooms
        }
        return rooms
    }


}

module.exports = memory_interface