var targeting = {

    /**
    @param {string} creepType - creep's role
    @param {object[]} targets - array of targets
    **/
    balanceTargets: function(creepType, targets){
        var theseCreeps = _.filter(Game.creeps, (c) => c.memory.role == creepType);
        var alreadyTargeted = _.map(theseCreeps, (c) => c.memory.target.id);

        var balancedTargets = _.remove(targets,alreadyTargeted)
    }
};
module.exports = targeting;
