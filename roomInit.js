let roomInit = {
    init : function()
    {
        var spawns = Game.spawns;
        creeps = Game.creeps;
        for (var spawn in spawns)
        {
            //Get list of sources in this room
            if(Game.spawns[spawn].owner.username === 'Nickka')
            {
                //console.log("Initializing sources in room: " + spawns[spawn].room.name);
                var sources  = spawns[spawn].room.find(FIND_SOURCES);
                for (var source in sources )
                {
                    if (sources[source].memory.maxSlots === undefined)
                    {
                        console.log('Initialized Source: ' + sources[source].id);
                        sources[source].memory.maxSlots = 3;
                        sources[source].memory.slots = 0;
                    }
                }
            }
        }
    }

};

module.exports = roomInit;
