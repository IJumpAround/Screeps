interface Memory {
  spawnRooms: {}
  mySources: {}
  warTime: boolean
  creeps: CreepMemory[]
  rooms: RoomMemory[]
}

interface SerializedRoomPosition {
  x: number
  y: number
  roomName: string
}

interface RoomMemory {
  controller_source_paths: {}
  mySources: { [name: string]: SerializedRoomPosition };
  harvester_slots: {}
}


interface CreepMemory {
  homeSource: string
  upgrading: boolean
  role: string
  spawnerRoom: string
  building: boolean
  target: { [id: string]: SerializedRoomPosition }
}

interface CreepCount {
  "harvester": number,
  "mover": number,
  "upgrader": number,
  "builder": number,
  "claimer": number,
  "defender": number

}

declare const SpawnOptions;