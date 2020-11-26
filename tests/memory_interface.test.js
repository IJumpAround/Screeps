let memory_interface = require("../memory_interface");
let Creep = require("./__mocks__/creep");
let Mem = require("./__mocks__/memory");
let RoomPosition = require("./__mocks__/room_position");

// test("Test retrieving creeps home source from the interface", () => {
//   let creep = MockCreep()
// })

beforeAll(() => {
    global.CreepMemory = require("./__mocks__/creepMemory");
    global.RoomMemory = require("./__mocks__/roomMemory");
    global.RoomPosition = require("./__mocks__/room_position");

});

beforeEach(() => {
    global.Memory = new Mem();
    this.room = "test_room";
});

test("store_source interface properly stores position under source id", () => {

    Memory.rooms[this.room] = new RoomMemory();
    let test_source = "FakeSourceId123123213";
    let test_position = new RoomPosition(1, 5, this.room);
    console.log(CreepMemory);
    memory_interface.store_source(test_source, test_position);

    let mem_sources = Memory.rooms[this.room].mySources;
    expect(mem_sources[test_source]).toEqual(test_position);
    expect(mem_sources[test_source]).not.toBeNull();
});

test("Retrieving stored source via interface", () => {
    Memory.rooms[this.room] = new RoomMemory();
    let test_source = "FakeSourceId123123213";
    let test_position = new RoomPosition(1, 5, this.room);
    console.log(CreepMemory);
    memory_interface.store_source(test_source, test_position);

    let result = memory_interface.get_source(this.room, test_source);

    expect(result).toEqual(test_position);
    expect(result).not.toBeNull();
});


test("Test setting creep's home source", () => {
    let creep = new Creep();
    let test_source = "TEST SOURCE1231231";

    memory_interface.set_creep_home_source(creep, test_source);

    let mem_src = Memory.creeps[creep.name].homeSource;
    expect(mem_src).toEqual(test_source);
    expect(mem_src).not.toBeNull();
});

test("Getting creep's home source through interface", () => {
    let creep = new Creep();
    let test_source = "TEST SOURCE1231231";

    memory_interface.set_creep_home_source(creep, test_source);

    let result = memory_interface.get_creep_home_source(creep);
    expect(result).toEqual(test_source);
    expect(result).not.toBeNull();
});

test("Serialize Room position", () => {
    let expected = "1010room123";
    let a = new RoomPosition(10, 10, "room123");
    let serialized = memory_interface.serialize_room_position(a);

    expect(serialized).toEqual(expected);

});

test("Serialize Room position single digit coordinate", () => {
    let expected = "0910room123";
    let a = new RoomPosition(9, 10, "room123");
    let serialized = memory_interface.serialize_room_position(a);

    expect(serialized).toEqual(expected);

});

test("Serialize Room position both coords single digit", () => {
    let expected = "0902room123";
    let a = new RoomPosition(9, 2, "room123");
    let serialized = memory_interface.serialize_room_position(a);

    expect(serialized).toEqual(expected);

});

test("Deserialze room position returns a RoomPosition", () => {

    let serialized = "0104roomname";

    let pos = memory_interface.deserialize_room_position(serialized);
    expect(pos.x).toEqual(1);
    expect(pos.y).toEqual(4);
    expect(pos.roomName).toEqual("roomname");
});

test("Deserialize another position", () => {

    let serialized = "0134room11";

    let pos = memory_interface.deserialize_room_position(serialized);
    expect(pos.x).toEqual(1);
    expect(pos.y).toEqual(34);
    expect(pos.roomName).toEqual("room11");
});