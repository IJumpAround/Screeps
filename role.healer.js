var roleHealer = {
    /**
     @param {Creep} creep
     **/
    run: function(creep) {
        var defenders = creep.room.find(FIND_MY_CREEPS, { filter: { memory: { role: MY_ROLE_DEFENDER } } });
        //var defenders = creep.room.find(FIND_MY_CREEPS);

        if (defenders.length > 0) {
            var closeDefender = creep.pos.findClosestByRange(defenders);
            //console.log(creep.pos.findClosestByRange(FIND_MY_CREEPS));
            if (!closeDefender) {
                closeDefender = defenders[0];
            }
            if (closeDefender.hits < closeDefender.hitsMax) {
                var result = creep.heal(closeDefender);
                if (result === ERR_NOT_IN_RANGE)
                    creep.moveTo(closeDefender);
            }

        }

    }
};
module.exports = roleHealer;
