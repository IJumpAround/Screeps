let updatedSpawning = {

  /**
   *  @param {Creep[]} creepsSpawnedHere
   @param {CreepCount} numCreeps - number of creeps per role from the given room - numCreeps[creepRole] = #
   @param {StructureSpawn} spawner - the spawner
   **/
  run: function(creepsSpawnedHere, numCreeps, spawner) {
    let capacity = spawner.room.energyCapacityAvailable;
    let creepRole = this.decideWhoToSpawn(numCreeps);

    if (creepRole != null) {
      let body = this.roleToBody(creepRole, capacity);
      if(body == null) {
        console.log(`Not spawning creep, please adjust when ${creepRole} can spawn`);
      }

      let dry_run = spawner.spawnCreep(body, "Dry run", { dryRun: true });
      console.log(`dry run spawn result: ${dry_run}`);
      if (dry_run === 0) {
        this.spawn(creepsSpawnedHere, creepRole, body, spawner);
      }
    }
  },

  /**
   *  @param {Creep[]} creepsSpawnedHere
   @param {string} creepRole - creep role const
   @param {BodyPartConstant[]} body - array of body parts
   @param {StructureSpawn} spawner
   **/
  spawn: function(creepsSpawnedHere, creepRole, body, spawner) {
    console.log(`trying to spawn ${creepRole} with ${body}`);
    let creepName = this.makeCreepName(creepRole);
    let roomName = spawner.room.name;
    let timeCost = require("utilities").calculateTimeCost(body);
    //console.log(creepRole);

    let options = { memory: { role: creepRole } };
    switch (creepRole) {
      case MY_ROLE_HARVESTER: {
        options.memory.homeSource = this.genericGetHome(creepsSpawnedHere, creepRole, timeCost, roomName);
        options.memory.spawnerRoom = roomName;
        spawner.spawnCreep(body, creepName, options);
        break;
      }
      case MY_ROLE_MOVER: {
        let creepHome = this.genericGetHome(creepsSpawnedHere, creepRole, timeCost, roomName);
        options.memory.homeSource = creepHome;
        options.memory.homeRoom = null;
        options.memory.retrieving = true;
        options.memory.spawnerRoom = roomName;
        if (creepHome) {
          spawner.spawnCreep(body, creepName, options);
        } else {
          options.memory.homeRoom = roomName;
          options.memory.homeSource = null;
          spawner.spawnCreep(body, creepName, options);
        }
        break;
      }
      //fallthrough

      case MY_ROLE_CLAIMER: {
        options.memory.homeController = this.getClaimerHome();
        options.memory.spawnerRoom = roomName;
        spawner.spawnCreep(body, creepName, options);
        break;
      }
      case MY_ROLE_HEALER:
      case MY_ROLE_DEFENDER:
      case MY_ROLE_UPGRADER: {
        options.memory.spawnerRoom = roomName;
        options.memory.upgrading = false;
        spawner.spawnCreep(body, creepName, options);
        break;
      }
      case MY_ROLE_BUILDER:
      default: {
        options.memory.spawnerRoom = roomName;
        spawner.spawnCreep(body, creepName, options);
        break;
      }
    }
  },


//*************************************************************************************************
  //Generates a valid creepName in the form baseName+random number
  //ex: Harvester1234
  //The creepname is returned as a string
  /** @param {string} baseName - String placed in front of the random number **/
  makeCreepName: function(baseName) {
    let creepName = baseName + Math.floor(Math.random() * 1000);
    while (Game.creeps[creepName])
      creepName = baseName + Math.floor(Math.random() * 1000);
    return creepName;
  },

  //Decide which controller the claimer should reserve
  getClaimerHome: function() {
    //list of claimers
    let claimerList = _.filter(Game.creeps, (c) => c.memory.role === MY_ROLE_CLAIMER && c.ticksToLive > 50);
    let idList = Object.keys(Memory.reservedControllers);    //id list
    let counter = {}; //{controllerid,counter}
    //intialize counter
    for (let i in idList) {
      let id = idList[i];
      counter[id] = 0;
    }
    //count controllers used
    for (let creep in claimerList) {
      counter[claimerList[creep].memory.homeController]++;
    }

    return _.min(_.keys(counter), function(k) {
      return counter[k];
    });

  },

  /**
   *@param {Creep[]} creeps - list of all creeps produced by this spawn
   *@param {string} role - creep roletype
   *@param {number} bodyTimeCost - number of ticks to spawn the creep
   * @param {string} spawn_room
   *@returns {string} - id of the homeSource
   **/
  genericGetHome: function(creeps, role, bodyTimeCost, spawn_room) {
    let creepList = _.filter(creeps, (c) => c.memory.role === role && c.ticksToLive > bodyTimeCost);
    let room_name;
    if (creepList.length > 0)
      room_name = creepList[0].room.name;
    else {
      room_name = spawn_room;
    }


    //intialize counter
    let idList = memory_interface.list_sources(room_name);
    let counter = {}; //{sourceID:counter}
    idList.forEach((source_id) => {
      counter[source_id] = 0
    })

    //count sources occupied
    creepList.forEach((creep) => {
      let homesource = memory_interface.get_creep_home_source(creep)
      counter[homesource]++
    })

    let lowest = _.min(_.keys(counter), function(k) {
      return counter[k];
    });

    let lowVal = counter[lowest];
    if (role === MY_ROLE_MOVER) {
      if (lowVal > MY_MOVERS_PER_SOURCE) {
        lowest = false;
      }
    }

    return lowest;
  },


//****************************************************************************
  /**
   @returns {String} - A creep role constant is returned
   *   @param {CreepCount} numCreeps - Object containing the number of each creep type
   **/
  decideWhoToSpawn: function(numCreeps) {
    let creepType = null;
    let numHarvesters, numUpgraders, numBuilders, numMovers, numClaimers, numDefenders, numHealers;
    numHarvesters = numCreeps[MY_ROLE_HARVESTER];
    numUpgraders = numCreeps[MY_ROLE_UPGRADER];
    numBuilders = numCreeps[MY_ROLE_BUILDER];
    numMovers = numCreeps[MY_ROLE_MOVER];
    numClaimers = numCreeps[MY_ROLE_CLAIMER];
    numDefenders = numCreeps[MY_ROLE_DEFENDER];
    numHealers = numCreeps[MY_ROLE_HEALER];

    if (Memory.warTime) {
      if (numHealers < 1 && numDefenders > 0) {
        return MY_ROLE_HEALER;
      } else if (numDefenders < MY_MAX_DEFENDERS)
        return MY_ROLE_DEFENDER;
    }

    //Check for harvesters and movers first
    if ((numHarvesters < MY_MAX_HARVESTERS || numMovers < MY_MAX_MOVERS) && !(numUpgraders === 0 || numBuilders === 0 && numMovers > 0 && numHarvesters > 0)) {

      //MOVERS
      if ((numHarvesters > numMovers && numMovers < MY_MAX_MOVERS) || (numMovers < MY_MAX_MOVERS && numHarvesters === MY_MAX_HARVESTERS)) {
        //Spawn mover
        creepType = MY_ROLE_MOVER;
      }
      //HARVESTERS
      else if (numHarvesters < MY_MAX_HARVESTERS) {
        //Spawn harvester
        creepType = MY_ROLE_HARVESTER;
      }
    }
    //UPGRADERS 3rd
    else if (numUpgraders < MY_MAX_UPGRADERS) {
      //spawn upgrader
      creepType = MY_ROLE_UPGRADER;

    }
    //BUILDERS 4th
    else if (numBuilders < MY_MAX_BUILDERS) {
      //spawn builders
      creepType = MY_ROLE_BUILDER;
    }
    //CLAIMERS 5th
    else if (numClaimers < MY_MAX_CLAIMERS) {
      //spawn claimer
      creepType = MY_ROLE_CLAIMER;
    }
    //DEFENDERS last
    else if (numDefenders < MY_MAX_DEFENDERS) {
      creepType = MY_ROLE_DEFENDER;
    }

    return creepType;
  },



  /**
   * Convert a role to a set of body parts for spawning
   * If the energy capacity is too low to spawn a basic version of the target role, then null will be returned.
   * @param {String} role
   * @param {number} energy_capacity
   * @returns BodyPartConstant[] | null
   */
  roleToBody: function(role, energy_capacity) {
    let weights = MY_ROLE_BODY_PART_RATIOS[role];
    let final_parts = [];

    let parts = Object.keys(weights);
    let remaining_energy = energy_capacity;
    //Ensure we get 1 of each part at a minimum
    parts.forEach((part) => {
      remaining_energy -= BODYPART_COST[part];
    });

    if (remaining_energy < 0) {
      console.log("ERROR Creep is too expensive to create!");
      return null;
    }

    final_parts.concat(parts);


    parts.forEach((part) => {

      let cost = BODYPART_COST[part];
      let target_spending = weights[part] * remaining_energy;
      let target_num_parts = Math.floor(target_spending / cost);
      // Minimum of 1 of each part
      let num_parts = (target_num_parts > 0) ? target_num_parts : 1;

      remaining_energy -= num_parts * cost;

      let parts = Array.from({ length: num_parts }).map(x => part);
      final_parts = final_parts.concat(parts);

    });

    return final_parts;
  }
};

module.exports = updatedSpawning;
