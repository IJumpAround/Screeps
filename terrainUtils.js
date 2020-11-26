let terrainUtils = {
    // get_path_to_adjacent_empty_tile(src, dst) {
    //   let adjacent_tiles = this.get_adjacent_empty_tiles(dst)
    //   let path
    //   if (adjacent_tiles.length > 0) {
    //     path = src.findPathTo(adjacent_tiles[0])
    //   } else {
    //     path = src.findPathTo(dst, { ignoreCreeps: true })
    //   }
    //   return path
    // },
    /**
     *  @param {RoomPosition} pos
     */
    get_adjacent_empty_tiles(pos, any_terrain = false) {
        let tiles = [];
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (x === 0 && y === 0) {
                    continue;
                }
                let checking_pos = new RoomPosition(pos.x + x, pos.y + y, pos.roomName);
                let features = checking_pos.lookFor(LOOK_TERRAIN);
                tiles.push({ pos: checking_pos, terrain: features });


            }
        }
        console.log(JSON.stringify(tiles));
        console.log(tiles.length);

        let result = tiles.filter((feature) => {
            let terrain_features = feature.terrain;
            return !terrain_features.find((entry) => entry === "wall");

        });
        console.log("tiles ", JSON.stringify(tiles));
        console.log("returning ", JSON.stringify(result));
        return result;
    },


    /**
     *
     * @param {Room} room
     * @private
     */
    _load_harvester_spots(room) {
        let sources = room.find(FIND_SOURCES);

        sources.forEach((source) => {
            let tiles = this.get_adjacent_empty_tiles(source.pos);
            console.log("calling store harverset with ", JSON.stringify(tiles));
            memory_interface.store_harvester_slot(source.id, tiles);

        });
        console.log("loaded");


    }

};

module.exports = terrainUtils;