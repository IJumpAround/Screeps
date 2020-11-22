let memory_interface = {

    /**
     * @param {string} room_name
     * @param {string} source_id
     * @param {PathStep[]} path
     */
    store_source_path(room_name, source_id, path) {
        if (!Memory.rooms.hasOwnProperty(room_name)) {
            Memory.rooms[room_name].controller_source_paths = {}
        }
        Memory.rooms[room_name].controller_source_paths[source_id] = Room.serializePath(path)
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
     * @param room_name
     * @param id
     * @returns {SerializedRoomPosition| null}
     */
    lookup_source(room_name, id) {
        let mySources = Memory.rooms[room_name]
        if(!mySources) {
            mySources[id] = {}
        }
        return Memory.rooms[room_name].mySources[id]
    },

    is_source_stored(room_name, id) {
        return this.lookup_source(room_name, id) !== undefined
    }
}

module.exports = memory_interface