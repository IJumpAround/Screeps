let planner = {

    source_paths: {},
    /**
     *
     * @param {string} room_name
     */
    source_roads: function (room_name) {
        let room_obj = Game.rooms[room_name]
        let find_results = room_obj.find(FIND_SOURCES)

        console.log('hasownproprsource', JSON.stringify(find_results))
        for (let index = 0; index < find_results.length; index++) {

            let id = find_results[index].id
            let source = Game.getObjectById(id)
            if (!this.source_paths.hasOwnProperty(id)) {
                let path = this.lay_road_plans(room_obj, source)
                this.store_source_path(room_name, id, path)

            }
        }
    },

    /**
     *
     * @param {Room} room_obj
     * @param {Source} source
     */
    lay_road_plans: function(room_obj, source) {
        let controller_loc = room_obj.controller.pos
        let path = controller_loc.findPathTo(source.pos, {ignoreCreeps: true})
        let path_pos = path.map((step) => new RoomPosition(step.x, step.y, room_obj.name))
        Game.rooms[room_obj.name].visual.poly(path_pos, {stroke: '#ffffff', strokeWidth: .8, opacity: .4, lineStyle: 'solid'})

        for (let i in path) {
            let step = path[i]
            let res = room_obj.createConstructionSite(step.x, step.y, STRUCTURE_ROAD)
            console.log("Creating road construction site ", res )
        }

        return path

    },

    init : function() {

        for (let room_name in Memory.rooms) {
            let mem_room = Memory.rooms[room_name]
            if(mem_room.hasOwnProperty('controller_source_paths')) {
                let serialized_paths = mem_room.controller_source_paths
                this.load_source_paths(serialized_paths)
                this.source_paths = serialized_paths.map((path) => Room.deserializePath(path))
            } else {
                mem_room['controller_source_paths'] = {}
            }
        }
    },

    /**
     * @param {string} room_name
     * @param {string} source_id
     * @param {PathStep[]} path
     */
    store_source_path(room_name, source_id, path) {
        this.source_paths[source_id] = path
        memory_interface.store_source_path(room_name, source_id, path)
    },

    /**
     *
     * @param {}serialized_paths
     */
    load_source_paths: function(serialized_paths) {
        for (let source_id in serialized_paths) {
            if (serialized_paths.hasOwnProperty(source_id)) {
                let path = serialized_paths[source_id]
                this.source_paths[source_id] = Room.deserializePath(path)
                // this.source_paths[source_id] = paths.map((path) => Room.deserializePath(path))
            }
        }
    }
}

module.exports = planner