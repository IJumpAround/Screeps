global.CreepMemory = require("./__mocks__/creepMemory");
global.RoomMemory = require("./__mocks__/roomMemory");
let MEM = require("./__mocks__/memory");


let reset_memory = function() {
    global.Memory = new MEM();
};

module.exports = reset_memory;
