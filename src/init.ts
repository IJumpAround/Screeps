
export namespace  test {

  export function catalogRooms() {
    console.log('RAN INIT');
    const knownRooms = Memory.rooms;
    for (const room of Object.values(Game.rooms)) {
      if (_.find(knownRooms, room)) {
        console.log('Found ' + room)
      } else {
        console.log('add room ' + room);

        let owner;
        if (typeof room.controller !== "undefined") {
          owner = room.controller.owner.username === 'Nickka';
        } else {
          owner = false
        }
        Memory.rooms[room.name] = {isMine: owner};
      }
    }
  }

}
