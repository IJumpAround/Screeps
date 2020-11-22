

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
    mySources: {[name: string]: SerializedRoomPosition};
}



interface CreepMemory {
    homeSource: string
    upgrading: boolean
    role: string
    spawnerRoom: string
}

interface CreepCount {
        'harvester': number,
        'mover': number,
        'upgrader': number,
        'builder': number,
        'claimer' : number,
        'defender' : number

}

declare const SpawnOptions