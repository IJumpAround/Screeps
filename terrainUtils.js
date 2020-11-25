let terrainUtils = {
  /**
   *  @param {RoomPosition} src Starting position
   * @param {RoomPosition} dst target position
   */
  get_path_to_adjacent_empty_tile(src, dst) {
    let adjacent_tiles = this.get_adjacent_empty_tiles(dst)
    let path
    if (adjacent_tiles.length > 0) {
      path = src.findPathTo(adjacent_tiles[0])
    } else {
      path = src.findPathTo(dst, { ignoreCreeps: true })
    }
    return path
  },

  get_adjacent_empty_tiles(pos) {
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

    tiles = tiles.filter((feature) => {
      let terrain_features = feature.terrain
      if (terrain_features.terrain !== 'wall')
        return true

    })
    return tiles
  },


}