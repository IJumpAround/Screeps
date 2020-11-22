let memory_interface = {

    /**
     * @param {string} room_name
     * @param {string} source_id
     * @param {PathStep[]} path
     */
    store_source_path(room_name, source_id, path) {
        if (!Memory.rooms.hasOwnProperty(room_name)) {
            Memory.rooms[room_name] = {'controller_source_paths': {}}
        }
        Memory.rooms[room_name].controller_source_paths[source_id] = Room.serializePath(path)
    },
}

module.exports = memory_interface