// example declaration file - remove these and add your own custom typings

// memory extension samples
interface  CreepMemory {
  role: string;
  room: string;
  working: boolean;
  target: Target;
}

interface Target {
  id: Id<string>;
  room: string;
  pos: RoomPosition;
}

interface RoomMemory {
  isMine: boolean;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    consts: any;
  }
}
