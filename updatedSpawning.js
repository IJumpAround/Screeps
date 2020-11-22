var updatedSpawning = {
    /**
        @param {object} numCreeps - number of creeps per role from the given room - numCreeps[creepRole] = #
        @param {Structure} spawner - the spawner
        @param {number} [tier] -  tier of the creep body to spawn
    **/
    run : function(creepsSpawnedHere, numCreeps, spawner, tier=null)
    {
        let capacity = spawner.room.energyCapacityAvailable

        if (capacity < 600){
            tier = 1;
        }
        else {
            tier = 2;
        }


        var body;
        var creepRole = this.decideWhoToSpawn(numCreeps);
        if(creepRole != null){
            body = this.roleToBody(creepRole,numCreeps,tier);

            if(spawner.canCreateCreep(body) !== 0)
                return;
            else{
                this.spawn(creepsSpawnedHere, creepRole,body,spawner);
            }
        }
    },

/**
 *  @param {object} creepsSpawnedHere
    @param {string} creepRole - creep role const
    @param {string[]} body - array of body parts
    @param {StructureSpawn} spawner
**/
    spawn : function(creepsSpawnedHere, creepRole, body, spawner){
        var creepName = this.makeCreepName(creepRole);
        var roomName = spawner.room.name;
        var timeCost = require('utilities').calculateTimeCost(body);
        //console.log(creepRole);

        switch(creepRole){

            case MY_ROLE_HARVESTER:{
                let creepHome = this.genericGetHome(creepsSpawnedHere, creepRole, timeCost);
                spawner.createCreep(body,creepName,{role: creepRole, homeSource: creepHome,spawnerRoom: roomName });
                break;
            }
            case MY_ROLE_MOVER:{
                let creepHome = this.genericGetHome(creepsSpawnedHere, creepRole,timeCost);
                if(creepHome)
                    spawner.createCreep(body,creepName,{role: creepRole, homeSource: creepHome,homeRoom: null, retrieving: true,spawnerRoom: roomName});
                else
                    spawner.createCreep(body,creepName,{role: creepRole,homeSource: null, homeRoom: roomName, retrieving: true, spawnerRoom: roomName});
                break;
            }
            //fallthrough

            case MY_ROLE_CLAIMER:{
                let controllerHome = this.getClaimerHome();
                spawner.createCreep(body,creepName,{role: creepRole,homeController: controllerHome, spawnerRoom: roomName});
                break;
            }
            case MY_ROLE_HEALER:
            case MY_ROLE_DEFENDER:
            case MY_ROLE_UPGRADER:
                {
                      spawner.createCreep(body,creepName,{role: creepRole, spawnerRoom: roomName, upgrading: false});
                break;
                }
            case MY_ROLE_BUILDER:
            default:{
                spawner.createCreep(body,creepName,{role: creepRole, spawnerRoom: roomName});
                break;
            }
        }
    },



//*************************************************************************************************
    //Generates a valid creepName in the form baseName+random number
    //ex: Harvester1234
    //The creepname is returned as a string
    /** @param {string} baseName - String placed in front of the random number **/
    makeCreepName : function(baseName) {
        let creepName = baseName+ Math.floor(Math.random()*1000);
        while (Game.creeps[creepName])
            creepName = baseName+ Math.floor(Math.random()*1000);
        return creepName;
    },

    //Decide which controller the claimer should reserve
    getClaimerHome : function(){
            //list of claimers
            var claimerList = _.filter(Game.creeps, (c) => c.memory.role === MY_ROLE_CLAIMER && c.ticksToLive > 50);
            var idList = Object.keys(Memory.reservedControllers);    //id list
            counter = {}; //{controllerid,counter}
            //intialize counter
            for(let i in idList){
                let id = idList[i];
                counter[id] = 0;
            }
            //count controllers used
            for(let creep in claimerList){
                counter[claimerList[creep].memory.homeController]++;
            }

            return _.min(_.keys(counter), function (k) {
                return counter[k];
            });

    },

    /**
    *@param {Creep[]} creeps - list of all creeps produced by this spawn
    *@param {string} role - creep roletype
    *@param {number} bodyTimeCost - number of ticks to spawn the creep
    *@returns {string} - id of the homeSource
    **/
    genericGetHome: function(creeps, role, bodyTimeCost) {
        var creepList = _.filter(creeps, (c) => c.memory.role === role && c.ticksToLive > bodyTimeCost);

        let name;
        if(creepList.length > 0)
            name = creepList[0].room.name;
        else
            name = Object.keys(Memory.mySources)[0]

        let idList;
        if (Memory.mySources)
            idList = Object.keys(Memory.mySources[name]);    //id list
        else
            idList = [];


        counter = {}; //{sourceID,counter}
        //intialize counter
        for(let i in idList){
            let id = idList[i];
            counter[id] = 0;
        }
        //count sources occupied
        for(let creep in creepList){

//NOTE the memory.homeSource structure does not support this
            //should be changed to an ID that can lookup the position in memory
            counter[creepList[creep].memory.homeSource]++;
        }
        //console.log(JSON.stringify(counter));
        var lowest = _.min(_.keys(counter), function(k) { return counter[k]; });
        //console.log(lowest);
        let lowVal = counter[lowest];
        if(role === MY_ROLE_MOVER){
            if(lowVal > MY_MOVERS_PER_SOURCE){
                lowest = false;
            }
        }

        //throw SQLException();
        return lowest;
    },

//*************************************************************************************************
    /**
        Decides which source a creep should call its home based on the
        other creeps of the specified type that already exist.
        Attempts to balance the distribution of creeps among sources.
        if a creep dying in the next 50 ticks that creep is passed through the
        home parameter.

        @return {string} - ID of the source the creep should call home
        @param {String} roleType -The type of role of the creep being spawned
        @param {Object} home     -Key/Val object where the key is the creepRole and val is [creepname,creepSource]
                                  Any creeps passed by this param are dying within the next 50 ticks
    **/
    getCreepsHome: function(roleType,home) {

        var dying = false;       //spawning a replacment creep or new creep?
        var dyingName = '';     //name of the dying creep if any
        let creepHome = "";
        let allCreepsWithHomes = [];
        //if creep memory is passed in then it is dying
        if(home[roleType] !== undefined){
            dying = true;
            dyingName = home[roleType][0];
        }
        else
            dyingName = null;



        //Get an array of all the creeps of type roleType
        for (let index in Game.creeps)
        {
            //populate list of creeps of the given type
            if (Game.creeps[index].memory.role == roleType){
                allCreepsWithHomes.push(Game.creeps[index]);
            }
        }

        //initialize array with length equal to number of sources containing all zeroes
        //will contain list of sources with number of creeps that have that source as their home
        //Source1: 1 Source2 : 2 Source 3: 1.. etc
        let counter = {};
        //NOTE uses .pos object of the source as the index
        for (let i in MY_SOURCES){
            counter[JSON.stringify(Memory.mySources[MY_SOURCES.E84N97[i]])] = 0;
        }

        //count the number of creeps that have a given source as their home
        for (var curr in allCreepsWithHomes){
            let currCreep = allCreepsWithHomes[curr];
            //if the current creep is dying do not count it towards the source counter
            if(dyingName != null && currCreep.name === dyingName){
                //skip this creep
            }
            else
                counter[currCreep.memory.homeSource]++;
        }


        var low = "";           //sourcePos of lowest populated source
        var lowVal = 500;       //lowest count found
        var balanced = false;

        //find source with the lowest number of creeps attatched to it
        for (let sourcePos in counter)
        {
            if(counter[sourcePos] <= lowVal){
                lowVal = counter[sourcePos];
                low = sourcePos;
            }
        }
        if(roleType === MY_ROLE_HARVESTER || lowVal === 0)
            creepHome = JSON.parse(low);
        else if(roleType === MY_ROLE_MOVER){
            if(lowVal > MY_MOVERS_PER_SOURCE){
                creepHome = false;
            }
        }
        return creepHome;
   },


//****************************************************************************
/**
    @returns {String} - A creep role constant is returned
*   @param {Object} numCreeps - Object containing the number of each creep type
    @param {number} numCreeps.roleType - Current number of this role that are alive
**/
   decideWhoToSpawn : function(numCreeps){
       var creepType = null;
       var numHarvesters,numUpgraders,numBuilders,numMovers,numClaimers,numDefenders,numHealers;
       numHarvesters = numCreeps[MY_ROLE_HARVESTER];
       numUpgraders = numCreeps[MY_ROLE_UPGRADER];
       numBuilders = numCreeps[MY_ROLE_BUILDER];
       numMovers = numCreeps[MY_ROLE_MOVER];
       numClaimers = numCreeps[MY_ROLE_CLAIMER];
       numDefenders = numCreeps[MY_ROLE_DEFENDER];
       numHealers = numCreeps[MY_ROLE_HEALER];

       if(Memory.warTime)
       {
           if(numHealers < 1 && numDefenders > 0 )
           {
               return MY_ROLE_HEALER;
           }
           else if(numDefenders < MY_MAX_DEFENDERS)
                return MY_ROLE_DEFENDER;
       }

       //Check for harvesters and movers first
       if ((numHarvesters < MY_MAX_HARVESTERS || numMovers < MY_MAX_MOVERS) && !(numUpgraders === 0 || numBuilders=== 0  && numMovers > 0 && numHarvesters > 0)){

           //MOVERS
           if((numHarvesters > numMovers && numMovers < MY_MAX_MOVERS) || (numMovers < MY_MAX_MOVERS && numHarvesters === MY_MAX_HARVESTERS)){
               //Spawn mover
               creepType = MY_ROLE_MOVER;
           }
           //HARVESTERS
           else if(numHarvesters < MY_MAX_HARVESTERS){
               //Spawn harvester
               creepType = MY_ROLE_HARVESTER;
           }
       }
       //UPGRADERS 3rd
       else if(numUpgraders < MY_MAX_UPGRADERS){
           //spawn upgrader
           creepType = MY_ROLE_UPGRADER;

       }
       //BUILDERS 4th
       else if(numBuilders < MY_MAX_BUILDERS){
           //spawn builders
           creepType = MY_ROLE_BUILDER;
       }
       //CLAIMERS 5th
       else if(numClaimers < MY_MAX_CLAIMERS){
           //spawn claimer
           creepType = MY_ROLE_CLAIMER;
       }
       //DEFENDERS last
       else if(numDefenders < MY_MAX_DEFENDERS){
           creepType = MY_ROLE_DEFENDER;
       }

       return creepType;
   },

//****************************************************************************
   /**
    turns the creep role constant into an array of body parts
    @return {string} Body type to pass to the spawner
    @param {string} role - String constant for the creep role
    @param numCreeps
    @param {number} [tier=null] - body type tier to use
    **/
   roleToBody : function(role, numCreeps, tier = null){

       var bodyList = {};

       switch (tier){
           case 1:{
               return [WORK,CARRY,MOVE];
               break;}
           case 2:{
               bodyList = MY_TIER2_BODY_TYPES;
               break;}
           case 3:{
               bodyList = MY_TIER3_BODYTYPES;
               break;
           }
          case 4:{
              bodyList = MY_TIER4_BODY_TYPES;
              break;
          }
          default :{
              bodyList = MY_TIER5_BODY_TYPES;
              break;
          }
       }
       if(numCreeps[MY_ROLE_HARVESTER] <= 1 || numCreeps[MY_ROLE_MOVER] <= 1){
           bodyType = [WORK,CARRY,MOVE];
       }
       else
            bodyType= bodyList[role];

       return bodyType;
   }

};

module.exports = updatedSpawning;
