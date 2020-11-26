let terrainUtils = require("./terrainUtils");

let planner = {

        source_paths: {},
        walls: {},
        lines: {},

        /**
         *
         * @param lines
         * @param {Room} room
         */
        draw_lines(lines, room) {
            lines.forEach(pos => {
                room.visual.line(pos[0], pos[pos.length - 1]);
                let midpoint = Math.floor(pos.length / 2);
                room.visual.text("🚪", pos[midpoint]);
            });
        },

        /**
         *
         * @param {Room} room
         */
        test_draw_lines(room) {
            // console.log(JSON.stringify(room));
            let lines = this.initial_find_exits(room);
            this.draw_lines(lines, room);
        },


        /**
         *
         * @param {Room} room
         */
        initial_find_exits(room) {
            if (!this.lines[room.name]) {
                let exits = room.find(FIND_EXIT);
                let adjacency_list = this._make_adjacency_list(exits);
                let walls = {};
                let lines = this.get_lines(adjacency_list);

                let exit_lines = lines.map(row => row.map(index => exits[index]));

                exit_lines.forEach(row => {
                    row.sort((a, b) => {
                        if (a.x === b.x)
                            return a.y - b.y;
                        else
                            return a.x - b.x;
                    });
                });
                this.lines[room.name] = exit_lines;
            }
            return this.lines[room.name];
        },


        get_lines(adjacency_list) {
            let queue = [];
            let visited = Array.from({ length: adjacency_list.length }).map(x => false);
            let lines = Array.from({ length: adjacency_list.length }).map(x => []);
            for (let j = 0; j < adjacency_list.length; j++) {
                queue.push(j);
                while (queue.length !== 0) {
                    let node = queue.shift();
                    let neighbors = adjacency_list[node];
                    for (let i = 0; i < neighbors.length; i++) {
                        let neighbor = neighbors[i];
                        if (visited[neighbor.num] === false) {

                            lines[j].push(neighbor.num);
                            neighbor.visited = true;
                            visited[neighbor.num] = true;
                            queue.push(neighbor.num);
                        }
                    }
                }
            }
            lines = lines.filter(row => row.length > 0);
            return lines;
        },


        /**
         *
         * @param {[]} vertices
         * @returns {any[][]}
         * @private
         */
        _make_adjacency_list(vertices) {
            let adjacency_list = Array.from({ length: vertices.length }).map(x => Array());
            for (let i = 0; i < vertices.length; i++) {
                for (let j = 0; j < vertices.length; j++) {
                    if (this.is_adjacent(vertices[i], vertices[j])) {
                        adjacency_list[i].push({ num: j, visited: false });
                    }
                }
            }
            return adjacency_list;
        },

        /**
         * Check whether two points are adjacent or not
         * @param {RoomPosition} pos1
         * @param {RoomPosition} pos2
         * @return {boolean} true if points are adjacent false otherwise
         */
        is_adjacent(pos1, pos2) {
            let delta_x = Math.abs(pos1.x - pos2.x);
            let delta_y = Math.abs(pos1.y - pos2.y);
            return (delta_x <= 1 && delta_y === 0) || (delta_x === 0 && delta_y <= 1);
        },

        /**
         * Generate road construction sites between each source in a room and the controller
         * @param {string} room_name
         */
        source_roads: function(room_name) {

            let room_obj = Game.rooms[room_name];
            let find_results = room_obj.find(FIND_SOURCES);
            console.log(`source ${JSON.stringify(find_results)}`);
            for (let index = 0; index < find_results.length; index++) {

                let id = find_results[index].id;
                let source = Game.getObjectById(id);
                if (!this.is_source_path_stored(source)) {
                    let path = this.lay_road_plans(room_obj, source);
                    this.store_source_path(room_name, id, path);

                } else {
                    console.log("Running upkeep on source roads");
                    this.upkeep_roads(find_results, room_obj);
                }
            }
        },

        /**
         * Replace roads if they've decayed
         * @param {Source[]} sources
         * @param {Room} room
         */
        upkeep_roads(sources, room) {
            sources.forEach((source) => {
                let path = this.source_paths[source.id];

                if (path) {
                    path.forEach((step) => {
                        if (step.x !== source.pos.x && step.y !== source.pos.y) {
                            room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                        } else {
                            console.log("Skipping construction site under source");
                        }
                    });
                }
            });

        },


        /**
         * Actually create the construction sites for each path
         * @param {Room} room_obj
         * @param {Source} source
         */
        lay_road_plans: function(room_obj, source) {
            let controller_loc = room_obj.controller.pos;
            let path = controller_loc.findPathTo(source.pos, { ignoreCreeps: true });
            let path_pos = path.map((step) => new RoomPosition(step.x, step.y, room_obj.name));
            Game.rooms[room_obj.name].visual.poly(path_pos, {
                stroke: "#ffffff",
                strokeWidth: .8,
                opacity: .4,
                lineStyle: "solid"
            });

            let source_pos = source.pos;
            for (let i in path) {
                let step = path[i];
                let step_pos = RoomPosition(step.x, step.y, source_pos.roomName);
                if (step_pos !== source.pos) {
                    let res = room_obj.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
                    console.log("Creating road construction site ", res);
                }
            }

            return path;

        },

        init: function() {

            for (let room_name in Memory.rooms) {
                let mem_room = Memory.rooms[room_name];
                if (mem_room.hasOwnProperty("controller_source_paths")) {
                    let serialized_paths = mem_room.controller_source_paths;
                    this.load_source_paths(serialized_paths);
                    this.source_paths = serialized_paths.map((path) => Room.deserializePath(path));
                } else {
                    mem_room["controller_source_paths"] = {};
                }
            }
        },

        /**
         * @param {string} room_name
         * @param {string} source_id
         * @param {PathStep[]} path
         */
        store_source_path(room_name, source_id, path) {
            this.source_paths[source_id] = path;
            memory_interface.store_source_path(room_name, source_id, path);
        },

        /**
         * Load serialized paths from memory into game objects and store them on this object
         * @param serialized_paths
         */
        load_source_paths: function(serialized_paths) {
            for (let source_id in serialized_paths) {
                if (serialized_paths.hasOwnProperty(source_id)) {
                    let path = serialized_paths[source_id];
                    this.source_paths[source_id] = Room.deserializePath(path);
                }
            }
        },

        /**
         *
         * @param {string} room
         */
        load_source_paths_from_room(room) {
            return this.load_source_paths(Memory.rooms[room].controller_source_paths);
        },

        /**
         *
         * @param {Source} source
         * @returns {boolean}
         */
        is_source_path_stored(source) {

            if (this.source_paths[source.id] !== undefined) {
                console.log("stored");
                return true;
            } else {
                this.load_source_paths_from_room(source.room.name);
                console.log(JSON.stringify(this.source_paths));
                return (this.source_paths[source.id] !== undefined);
            }
        },

        /**
         *
         * @param {Room} room
         */
        // TODO pickup here with choosing a chest location
        find_valid_source_chest_locations(room) {
            let sources = Memory.rooms[room.name].mySources;
            if (sources) {
                let source_ids = Object.keys(sources);
                let harvester_spot_sets = source_ids.map((id) => {
                    return memory_interface.get_harvester_slots(room.name, id);
                });
                let harvester_spots = harvester_spot_sets.flat(1);

                let candidate_squares = harvester_spots.map((spot) => {
                    return terrainUtils.get_adjacent_empty_tiles(spot);
                });

                candidate_squares.filter((square) => {

                });
            }
        }
    }
;

module.exports = planner;