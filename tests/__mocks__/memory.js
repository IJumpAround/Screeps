class Memory {
  constructor() {
    console.log('Memory mock')
    this.creeps = {}
    this.rooms = {}
    this.warTime = false
    this.spawnRooms = {}
  }

}

module.exports = Memory