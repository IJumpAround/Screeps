class Creep {
    name = "";

    constructor() {
        console.log("MOCK creep constructor was called");
        this.name = "Test name";
        Memory.creeps[this.name] = new CreepMemory();
        this.memory = Memory.creeps[this.name];
    }


}

module.exports = Creep;