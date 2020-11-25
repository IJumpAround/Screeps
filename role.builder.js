utils = require("./utilities");

let roleBuilder =
    {
        build_sites: [],
        /** @param {Creep} creep **/
        run: function(creep) {
            // console.log(`${creep.name} START OF RUN: building: ${creep.memory.building} usedCapacity: ${creep.store.getUsedCapacity(RESOURCE_ENERGY)}
            //  building: ${creep.memory.building}  capacity: ${creep.store.getCapacity(RESOURCE_ENERGY)}`);
            //Creep needs to collect resources
            if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
                this.end_build_mode(creep)
                creep.say("🔄 Pickup");
            }

            //creep has resources and can build or repair
            if (!creep.memory.building && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
                creep.memory.target = null;     //reset target
                creep.memory.building = true;
                creep.say("🚧 build");
            }

            //Begin build logic
            if (creep.memory.building) {
                let sitesLeft = this.build(creep);
                console.log(`creep ${creep.name} sites left: ${sitesLeft}`);
                //There are no construction sites so start repairing
                if (this.build_sites.length === 0)
                    this.repair(creep);
            }
            //Retrieve some resources
            else {
                this.retrieve(creep);
            }

        },

        search_for_build_targets() {
            let targets = []
            console.log(`saferooms ${MY_SAFEROOMS}`);
            for (let i in MY_SAFEROOMS) {
                let room = MY_SAFEROOMS[i];

                if (Game.rooms[room]) {
                    let temp = Game.rooms[room].find(FIND_CONSTRUCTION_SITES);
                    if (temp.length > 0) {
                        targets = targets.concat(temp);
                        this.build_sites = targets
                    }

                }
            }
        },

        /**
         *
         * @param {Creep} creep
         * @param {ConstructionSite[]} sites
         * @return {ConstructionSite}
         */
        find_closest_construction_site(creep, sites) {
            // let closestTarget = creep.pos.findClosestByRange(sites);
            let dist = 100
            let site;

            for (let i = 0; i < sites.length; i++) {
                let site_pos = sites[i].pos
                let curr_dist = Math.ceil(Math.sqrt(Math.pow(site_pos.x, 2) + Math.pow(site_pos.y, 2)))

                if (curr_dist < dist) {
                    dist = curr_dist
                    site = sites[i]
                }
            }

            return site
        },

        /**
         * Disable necessary memory attributes to stop building
         * @param creep
         */
        end_build_mode(creep) {
            creep.memory.target = null
            creep.memory.building = false
        },

        /**
         * @param {Creep} creep
         * @param {CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH} result
         */
        handle_build_result(creep, result) {
            switch (result) {
                case ERR_NOT_ENOUGH_RESOURCES:
                    this.end_build_mode(creep);
                    break;

                case ERR_INVALID_TARGET:
                    creep.memory.target = null

            }
        },

        /**
         * Do what the function name says!
         * @param {Creep} creep
         * @param {ConstructionSite} target
         */
        build_or_move_to_target(creep, target) {
            if (!creep.pos.inRangeTo(target, 3)) {
                creep.moveTo(target.pos, { reusePath: 0, visualizePathStyle: { stroke: "#2f962c" } });
                return true;
            } else {
                let result = creep.build(target);
                this.handle_build_result(creep, result)
            }
        },

        /**
         *
         * @param {Creep} creep
         * @returns {ConstructionSite}
         */
        get_build_target(creep) {
            let closest_target;
            let targets = []
            //search for targets in any room listed in MY_SAFEROOMS
            if (this.build_sites.length === 0) {
                targets = this.search_for_build_targets()
            } else {
                targets = this.build_sites
            }

            //attempt to find the closest target in the list
            if (targets.length > 0) {
                closest_target = creep.pos.findClosestByRange(targets);
                closest_target = this.find_closest_construction_site(creep, targets)
                creep.setTarget(closest_target);
            }

            return closest_target
        },

        /**
         Finds a construction site somewhere in our visible rooms and builds it
         @param {Creep} creep - the creep to perform the build action
         @returns {Boolean} - true if the creep is building false if there are no build sites found
         **/
        build: function(creep) {
            creep.say('🚧 Build')
            let target;

            let valid_target = creep.isValidTarget(MY_ACTION_BUILD);
            if (!valid_target) {
                target = this.get_build_target(creep)
            }
            //creep already has a target
            else {
                target = creep.getTarget();
            }

            this.build_or_move_to_target(creep, target)

        },

        /**Filter passed into the find method to determine which structures are below
         their minimum health percent
         @returns {Boolean}
         @param {Boolean} useMinimum - false for any damaged building, true for
         buildings weaker than a constant threshold
         **/
        repairFilter: function(useMinimum) {
            /**@param {Structure} structure **/
            return function(structure) {
                let type = structure.structureType;
                if (!useMinimum) {
                    return (structure.hits < structure.hitsMax);
                } else {

                    let ratio = Math.round(structure.hits * 1000) / Math.round(structure.hitsMax * 1000);
                    //console.log(JSON.stringify(structure) + ' ' + ratio);
                    //console.log(type + ': ' + Math.round(ratio*100000) + ' ' + Math.round(MY_MIN_REPAIR_PERCENT[type]*100000));
                    return (Math.round(ratio * 100000) < Math.round(MY_MIN_REPAIR_PERCENT[type] * 100000));
                }

            };
        },

        /** This function first searches for very damaged building based on the repair
         ratio constant. After all of those have been repaired all damaged structures
         are returned
         @param {Structure} [target=null] - the target to repair
         @returns {Array|Structure} - Array of damaged buildings or single building
         if the target was passed in
         **/
        findRepairTargets: function(target = null) {
            let room;
            let temp;
            let targets = [];

            if (target != null) {
                //supplied target
                return target;
            } else {
                //First look for very weak targets

                for (let i in MY_SAFEROOMS) {
                    room = Game.rooms[MY_SAFEROOMS[i]];
                    if (room)
                        temp = room.find(FIND_STRUCTURES, { filter: this.repairFilter(true) });

                    //append targets from each room to final list
                    if (temp.length > 0)
                        targets = targets.concat(temp);
                }
                //Look for the remaining damaged targets
                if (targets.length === 0) {

                    for (let i in MY_SAFEROOMS) {
                        room = Game.rooms[MY_SAFEROOMS[i]];
                        //Find structures in this room with any damage
                        if (room)
                            temp = room.find(FIND_STRUCTURES, { filter: this.repairFilter(false) });

                        if (temp.length > 0)
                            targets = targets.concat(temp);
                    }
                }
                return targets;
            }
        },

        /** calls the other functions to find targets and then performs repairs on them
         @param {Creep} creep - the creep object performing the repair
         @param {Structure} [target] -optional target structure to repair
         **/
        repair: function(creep, target = null) {
            creep.say("🔧");
            let result;
            //check if we need to get a target
            if (!creep.isValidTarget(MY_ACTION_REPAIR)) {
                //get all targets
                let targets = this.findRepairTargets();
                //console.log(targets);
                if (targets.length > 0) {
                    target = creep.pos.findClosestByRange(targets);
                    if (!target)
                        target = targets[0];
                    console.log(`${creep.name} (REPAIR) targets ${targets}`);
                    creep.setTarget(target);
                    if (creep.pos.inRangeTo(target, 3)) {
                        result = creep.repair(target);
                    } else {
                        creep.say("=> 🛠1");
                        creep.moveTo(target.pos, { reusePath: 0, visualizePathStyle: { stroke: "#91ff00" } });
                    }
                }

            }
            //creep already has a target
            else {
                creep.say("=> 🛠2");
                let this_target = creep.getTarget();
                result = creep.repair(this_target);
                if (result === ERR_NOT_IN_RANGE)
                    creep.moveTo(this_target.pos, { reusePath: 0, visualizePathStyle: { stroke: "#91ff00" } });
            }
        },

        /**
         @param {Creep} creep - creep performing the retrieving
         @param {Structure} [target=null] -optional target container or storage
         **/
        retrieve: function(creep, target = null) {
            creep.say("🔙");
            let result;
            //Creep needs to choose a new target
            if (!creep.isValidTarget(MY_ACTION_RETRIEVE)) {
                creep.say(`new 🎯`);
                console.log(`*****${creep.name} not valid target`);
                let dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 40);
                dropped = dropped[0];
                if (dropped) {
                    creep.setTarget(dropped);
                    result = creep.pickup(dropped);
                    if (result === ERR_NOT_IN_RANGE)
                        creep.moveTo(dropped.pos, { reusePath: 0, visualizePathStyle: { stroke: "#e7218e" } });
                }
                    //NOTE this stops after the first storage is found
                //Get the location of the storage structure
                else {
                    let storage;
                    for (let i in MY_SAFEROOMS) {
                        let room = Game.rooms[MY_SAFEROOMS[i]];
                        storage = room.storage;
                        if (storage)
                            break;
                    }
                    //console.log(creep.name + ' ' + storage);
                    if (storage) {
                        creep.setTarget(storage);
                        result = creep.withdraw(storage, RESOURCE_ENERGY);
                        if (result === ERR_NOT_IN_RANGE)
                            creep.moveTo(storage.pos, { reusePath: 0, visualizePathStyle: { stroke: "#ff0033" } });
                    }
                }
            }
            //Creep already has a target
            else {
                let target_res = creep.getTarget();
                console.log(`${creep.name} => 🎯 GET TARGET ${JSON.stringify(target_res)}\n instanceof Resource ${target_res instanceof Resource}`);
                if (target_res instanceof Resource) {

                    creep.say(`=> 🎯 ${result}`);
                    // result = ERR_NOT_IN_RANGE
                    if (!creep.pos.isNearTo(target_res.pos)) {
                        let test123 = creep.move_next_to_destination(target_res.pos)
                        creep.say(`🚜 ${test123}`);

                        creep.room.visual.text(`🎯`, target_res.pos);
                    } else {
                        creep.say("Pickup");
                        console.log(`${creep.name} waiting ${result}`);
                        result = creep.pickup(target_res);
                    }
                } else {
                    console.log(`${creep.name} withdraw`);
                    creep.say("Withdraw");
                    result = creep.withdraw(target_res, RESOURCE_ENERGY);
                    if (result === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target_res.pos, { reusePath: 0, visualizePathStyle: { stroke: "#ffaa00" } });
                    }
                }

            }
        }
    };

module.exports = roleBuilder;
