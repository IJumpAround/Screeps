utils = require("./utilities");

let roleBuilder =
    {
        /** @param {Creep} creep **/
        run: function(creep) {
            // console.log(`${creep.name} START OF RUN: building: ${creep.memory.building} usedCapacity: ${creep.store.getUsedCapacity(RESOURCE_ENERGY)}
            //  building: ${creep.memory.building}  capacity: ${creep.store.getCapacity(RESOURCE_ENERGY)}`);
            //Creep needs to collect resources
            if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
                this.end_build_mode(creep);
                creep.say("🔄 Pickup");
            }
            //creep has resources and can build or repair
            else if (!creep.memory.building && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
                creep.memory.target = null;     //reset target
                creep.memory.building = true;
                creep.say("🚧 build");
            }

            //Begin build logic
            else if (creep.memory.building) {
                let done_building = this.build(creep);

            } else if (creep.memory.repairing) {
                this.repair(creep);
            }
            //Retrieve some resources
            else {
                this.retrieve(creep);
            }

        },


        search_for_build_targets() {
            let targets = [];
            let rooms = memory_interface.safe_rooms;
            for (let room_name in rooms) {
                if (Game.rooms[room_name]) {
                    let temp = Game.rooms[room_name].find(FIND_CONSTRUCTION_SITES);
                    if (temp.length > 0) {
                        targets = targets.concat(temp);
                        console.log(`targets? ${targets}`);
                    }

                }
            }
            return targets;
        },
        //
        // validate_build_sites_cache() {
        //     this.build_sites.forEach((site) => {
        //         try {
        //             this.build_sites
        //             site.pos
        //             console.log(`${site}`);
        //         } catch(expection) {
        //             console.log(expection.stack);
        //             this.build_sites = []
        //         }
        //     })

        // },

        /**
         *
         * @param {Creep} creep
         * @param {ConstructionSite[]} sites
         * @return {ConstructionSite}
         */
        find_closest_construction_site(creep, sites) {
            // let closestTarget = creep.pos.findClosestByRange(sites);
            let dist = 100;
            let site;
            console.log(`${creep.name} sites sites`);
            console.log(`potential sites ${sites.length}`);
            for (let i = 0; i < sites.length; i++) {
                let site_pos = sites[i].pos;
                let curr_dist = Math.ceil(Math.sqrt(Math.pow(site_pos.x - creep.pos.x, 2) + Math.pow(site_pos.y - creep.pos.y, 2)));

                if (curr_dist < dist) {
                    dist = curr_dist;
                    site = sites[i];
                }
            }
            return site;
        },

        /**
         * Disable necessary memory attributes to stop building
         * @param creep
         */
        end_build_mode(creep) {
            creep.memory.target = null;
            creep.memory.building = false;
        },
        end_retrieve_mode(creep) {
            creep.memory.target = null;
            creep.memory.building = true;
        },

        /**
         * @param {Creep} creep
         * @param {CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH} result
         */
        handle_build_result(creep, result, target) {
            switch (result) {
                case ERR_NOT_ENOUGH_RESOURCES:
                    this.end_build_mode(creep);
                    break;

                case ERR_INVALID_TARGET:
                    // let i = this.build_sites.indexOf(target)
                    // if (i === -1)
                    //     this.build_sites.splice(i,1)
                    creep.memory.target = null;
                    break;
                case OK:
                    return true;

            }
        },


        /**
         * Do what the function name says!
         * @param {Creep} creep
         * @param {ConstructionSite} target
         */
        build_or_move_to_target(creep, target) {
            if (!creep.pos.inRangeTo(target, 3)) {
                // creep.move_next_to_destination(target.pos, target.id)
                creep.moveTo(target.pos, { visualizePathStyle: { stroke: "#2f9831" } });
                return false;
            } else {
                let result = creep.build(target);
                return this.handle_build_result(creep, result, target);
            }
        },

        /**
         *
         * @param {Creep} creep
         * @returns {ConstructionSite}
         */
        get_build_target(creep) {
            let closest_target;
            let targets = [];
            //search for targets in any room listed in MY_SAFEROOMS


            targets = this.search_for_build_targets();

            //attempt to find the closest target in the list
            if (targets.length > 0) {
                closest_target = this.find_closest_construction_site(creep, targets);
                console.log(`${creep.name} closest target ${closest_target}`);
                creep.setTarget(closest_target);
            } else {
                console.log("No targets at all!?!?");
            }

            return closest_target;
        },

        /**
         Finds a construction site somewhere in our visible rooms and builds it
         @param {Creep} creep - the creep to perform the build action
         @returns {Boolean} - true if the creep is building false if there are no build sites found
         **/
        build: function(creep) {
            let done_building = false;
            creep.say("🚧 Build");
            let target;

            let valid_target = creep.isValidTarget(MY_ACTION_BUILD);
            if (!valid_target) {
                target = this.get_build_target(creep);
            }
            //creep already has a target
            else {
                target = creep.getTarget();
            }

            if (target) {
                done_building = this.build_or_move_to_target(creep, target);
            } else {
                creep.say("Need target");
            }

            return done_building;

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
            throw new DOMException();
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
         *
         * @param {Creep} creep
         */
        get_resource_target(creep) {
            let target;
            creep.say(`new 🎯`);
            console.log(`*****${creep.name} not valid target`);
            target = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 40);
            target = target[0];
            if (target) {
                creep.setTarget(target);
            }
                //NOTE this stops after the first storage is found
            //Get the location of the storage structure
            else {
                let rooms = Memory.spawnRooms;
                for (let i in rooms) {
                    let room = Game.rooms[i];
                    target = room.storage;
                    if (target)
                        break;
                }
                //console.log(creep.name + ' ' + storage);
                console.log(`looked through saferooms and got ${target}`);
                if (target) {
                    creep.setTarget(target);
                }
            }
            return target;
        },

        /**
         *
         * @param {Creep} creep
         * @param target
         */
        retrieve_or_move(creep, target) {
            let action_result;
            if (target) {
                if (!creep.pos.isNearTo(target)) {
                    // action_result = creep.move_next_to_destination(target.pos, target.id);
                    action_result = creep.moveTo(target.pos, { visualizePathStyle: { stroke: "#008888" } });
                } else {
                    if (target instanceof Resource) {
                        action_result = creep.pickup(target);
                    } else {
                        action_result = creep.withdraw(target, RESOURCE_ENERGY);
                    }

                    if (action_result === OK) {
                        this.end_retrieve_mode(creep);
                    }
                }
            } else {
                console.log(`${creep.name} No retrieve target available`);
            }
        },

        /**
         @param {Creep} creep - creep performing the retrieving
         @param {Structure} [target=null] -optional target container or storage
         **/
        retrieve: function(creep) {
            //TODO Fix all this dumb shit and refactor
            // remove construction sites from list when done
            creep.say("🔙");
            let target;
            //Creep needs to choose a new target
            target = creep.isValidTarget(MY_ACTION_RETRIEVE);
            if (!target) {
                console.log("INVALID RETRIEVE TARGET");
                target = this.get_resource_target(creep);
            }
            //Creep already has a target
            this.retrieve_or_move(creep, target);

        }
    };

module.exports = roleBuilder;
