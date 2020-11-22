var defense = {
    run: function(roomName) {

        var hostiles = [];
        var room = getRoom(roomName);
        if(room){
            var tower = room.find(FIND_MY_STRUCTURES,{filter: {structureType: STRUCTURE_TOWER}});
            tower = tower[0];
            let rooms = Object.keys(Memory.spawnRooms)
            for (let room in rooms){
                if(Game.rooms[room])
                    hostiles = hostiles.concat(Game.rooms[room].find(FIND_HOSTILE_CREEPS));
            }

            if (hostiles.length > 0)
            {
                if(!Memory.warTime){
                    console.log("Hostile creep detected");
                    Memory.warTime = true;
                }
                var closestHostile = tower.pos.findClosestByRange(hostiles);
                if(closestHostile && tower)
                    tower.attack(closestHostile);

            }
            else{
                if(Memory.warTime){
                    Memory.warTime = false;
                    console.log('area secure');
                }
                if(tower){
                    let repairs = tower.pos.findClosestByRange(FIND_STRUCTURES,{filter: (i) => i.structureType == STRUCTURE_ROAD && i.hits<i.hitsMax});
                
                    tower.repair(repairs);
                }

            }
            if(hostiles) return hostiles;
        }
    }
};
module.exports = defense;
