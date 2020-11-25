var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function(creep) {
    //Return to harvesting
    if (creep.memory.upgrading && creep.store.energy === 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    //Return to upgrading
    if (!creep.memory.upgrading && creep.store.energy === creep.store.getCapacity()) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    //Start upgrading controller
    if (creep.memory.upgrading) {
      if (!creep.pos.inRangeTo(creep.room.controller.pos, MY_UPGRADE_RANGE)) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: { stroke: "#ffffff" } });
      } else {
        creep.upgradeController(creep.room.controller)
      }
    }
    //pick up resources
    else {
      let containers = creep.room.find(FIND_STRUCTURES, {
        filter: (i) => i.structureType === STRUCTURE_STORAGE &&
          i.store[RESOURCE_ENERGY] > i.store.getCapacity() * 0.02
      });
      //Withdraw from containers first
      if (containers.length > 0) {
        let closest = creep.pos.findClosestByPath(containers);
        if (!creep.pos.isNearTo(closest)) {
          creep.moveTo(closest, {visualizePathStyle: { stroke: "#ffaa00" } });

        } else {
          creep.withdraw(closest, RESOURCE_ENERGY);
        }

      } else {
        let droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

        if (!creep.pos.isNearTo(droppedEnergy)) {
          creep.moveTo(droppedEnergy, {visualizePathStyle: { stroke: "#ffaa00" } });
        } else {

          creep.pickup(droppedEnergy);

        }
      }
    }
  }
};

module.exports = roleUpgrader;
