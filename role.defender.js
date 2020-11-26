var roleDefender = {

    /**
     @param {Creep} creep - the creep performing the actions
     @param {Creep[]} hostiles - array of creeps
     **/
    run: function(creep, hostiles) {
        var closestHostile;
        if (!Memory.warTime) {
            //creep.moveTo(Game.getObjectById('596666418693760a549ccb62'));
            creep.moveTo(Game.flags["Defender"]);
        } else {
            //console.log(hostiles);
            if (hostiles && hostiles.length > 0) {

                closestHostile = creep.pos.findClosestByRange(hostiles);
                if (!closestHostile) closestHostile = hostiles[0];
                var result = creep.attack(closestHostile);
                //Move to the hostile if they are a ranged creep
                if (result === ERR_NOT_IN_RANGE && this.hasBodyPart(closestHostile, RANGED_ATTACK)) {
                    creep.moveTo(closestHostile);
                }
                //Move to a rampart if they are not
                else if (result === ERR_NOT_IN_RANGE) {
                    let closestRampart = closestHostile.pos.findClosestByRange(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_RAMPART } });
                    creep.moveTo(closestRampart);
                }
            }
        }
    },

    /**
     Searches the current creep body for the passed body part type.
     Returns true if the part is found.
     @returns {Boolean}
     @param {Creep} enemyCreep
     @param {string} part - body part constant to search for
     **/
    hasBodyPart: function(enemyCreep, part) {
        var body = enemyCreep.body;
        for (let i = 0; i < body.length; i++) {
            let currPart = enemyCreep.body[i];
            if (currPart.type === part)
                return true;
        }
        return false;
    }

};

module.exports = roleDefender;
