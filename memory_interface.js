let memory_interface = {

    /**
     * @param {string} room_name
     * @param {string} source_id
     * @param {PathStep[]} path
     */
    store_source_path(room_name, source_id, path) {
        if (!Memory.rooms[room_name].controller_source_paths) {
            Memory.rooms[room_name].controller_source_paths = {};
        }
        Memory.rooms[room_name].controller_source_paths[source_id] = Room.serializePath(path);
    },

    clear_adjacent_path(creep) {
        creep.memory.adjacent_path = {};
    },

    _format_single_digit_num_with_leading_zero(value) {
        return ("0" + value).slice(-2);
    },

    serialize_room_position(pos) {
        console.log("serializing ", pos);
        let x = this._format_single_digit_num_with_leading_zero(pos.x);
        let y = this._format_single_digit_num_with_leading_zero(pos.y);
        let name = pos.roomName;
        return x + y + name;
    },

    /**
     *
     * @param {String} string
     */
    deserialize_room_position(string) {
        let x = string.slice(0, 2);
        let y = string.slice(2, 4);
        let roomname = string.slice(4);
        return new RoomPosition(parseInt(x), parseInt(y), roomname);
    },

    get_build_sites(room) {

    },

    reset_build_sites(room) {

    },


    /**
     *
     * @param {Creep} creep
     * @param {PathStep[]} path
     * @param {string} id
     */
    store_adjacent_path(creep, path, id) {
        let tick = Game.time;
        creep.memory.adjacent_path = { "t": tick, "p": Room.serializePath(path), "ttl": 5, "id": id };
    },

    get_adjacent_path(creep, id) {
        let tick = Game.time;

        let rec = creep.memory.adjacent_path;

        if (rec && (tick - rec.t < rec.ttl) && rec.id === id) {
            return Room.deserializePath(rec.p);
        } else if (rec && rec.id !== id) {
            console.log("IDS did not match");
            console.log(`id: ${rec.id} id: ${id}`);
            creep.memory.adjacent_path = null;
            return null;
        } else {
            creep.memory.adjacent_path = null;
            return null;
        }
    },

    /**
     *
     * @param {string} source_id
     * @param {RoomPosition} position
     */
    store_source(source_id, position) {
        let pos = { x: position.x, y: position.y, roomName: position.roomName };
        let mySources = Memory.rooms[pos.roomName].mySources;

        if (!mySources) {
            mySources = {};
        }

        Memory.rooms[pos.roomName].mySources[source_id] = pos;
    },

    /**
     * Return stored source position if available
     * @param {string|null} room_name
     * @param id
     * @returns {SerializedRoomPosition| null}
     */
    get_source(room_name, id) {
        if (room_name === null) {
            return this._lookup_source_by_id(id);
        }

        let mySources = Memory.rooms[room_name];
        if (!mySources) {
            mySources[id] = {};
        }
        return Memory.rooms[room_name].mySources[id];
    },

    _lookup_source_by_id(id) {
        let result = {};
        for (let room in Memory.rooms) {
            if (Memory.rooms.hasOwnProperty(room)) {
                let result = this.get_source(room, id);
                if (result !== null) {
                    break;
                }
            }
        }
        return result;
    },

    is_source_stored(room_name, id) {
        return this.get_source(room_name, id) !== undefined;
    },

    list_sources(room) {
        let mem_room = Memory.rooms[room];
        let result = [];
        if (mem_room) {

            result = Object.keys(mem_room.mySources);
        }
        return result;
    },

    /**
     *
     * @param {Creep} creep
     */
    get_creep_home_source(creep) {
        let source = null;
        try {
            source = creep.memory.homeSource;

        } catch (ex) {
            console.log(`Exception retrieving home source for ${creep.name}`);
            console.log(ex.stack);
        }
        return source;
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

        let rooms = Memory.spawnRooms;

        return rooms;
    },


    /**
     *
     * @param {string} source_id
     * @param {RoomPosition[]} positions
     */
    store_harvester_slot(source_id, positions) {
        let harvester_slots = Memory.rooms[positions[0].pos.roomName].harvester_slots;

        if (!harvester_slots) {
            Memory.rooms[positions[0].pos.roomName].harvester_slots = {};
        }
        harvester_slots[source_id] = positions.map((position) => {
            return this.serialize_room_position(position.pos);
        });
    },

    /**
     *
     * @param {String} room_name
     * @param {String} source_id
     * @return {RoomPosition[]}
     */
    get_harvester_slots(room_name, source_id) {
        let val;
        let serialized = Memory.rooms[room_name].harvester_slots[source_id];
        if (serialized) {
            val = this.deserialize_room_position(serialized);
        }
        return val;
    },

    list_harvester_slots(room_name, source_id) {
        let slots = Memory.rooms[room_name.harvester_slots];
        let positions = [];

        if (slots) {
            slots = slots[source_id];
        }

        for (let slot in slots) {
            if (slots.hasOwnProperty(slot)) {
                positions.push(this.deserialize_room_position(slots[slot]));
            }
        }
        return positions;
    }


};

module.exports = memory_interface;