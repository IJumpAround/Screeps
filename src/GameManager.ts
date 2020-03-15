import {ErrorMapper} from "./utils/ErrorMapper";

export namespace  GameManager {

  export function init() {
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


   // @ts-ignore
  export const loop = ErrorMapper.wrapLoop(() => {
    console.log(global.consts)
    console.log(ENERGY_DECAY);
    console.log(`Current game tick is ${Game.time}`);
    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];

      }
    }
  });
}

