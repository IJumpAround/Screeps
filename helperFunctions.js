var helperFunctions = {

    /**
     * @param {number|object} x
     * @param {number} [y]
     * @param {string} [roomName]
     * @returns {RoomPosition|boolean}
     */
     getRoomPosition : function (x, y, roomName) {
        if (!x) return false;
        console.log('test' + JSON.stringify(x))
        if (typeof x == 'object') {
            var object = x;

            x = object.x;
            y = object.y;
            roomName = object.roomName || object.room;
        }
       // console.log("x= " + x + "y= " + y + "roomname= " + roomName)
        return new RoomPosition(x, y, roomName);
    },

    /**
    *@param {string} name
    *@returns {Room|boolean}
    **/
    getRoomObject : function (name){
        if(!name)
            return false;
        else
            return Game.rooms[name];
    },

    /**
    *Converts a source id into a sourceposition Object
    *@requires - either vision of the source or the source position has been catalogued in memory
    *@param {string} id - source id
    *@returns {RoomPosition} - position object of the source
    **/
    getSourcePosition: function(id){
        if(!id) {
            return false;
        }
        if(typeof id == 'string'){
            let source = Game.getObjectById(id);
            if(source)
                return source.pos;
            else
                return getPos(Memory.mySources[id]);
        }
    }
};



module.exports = helperFunctions;


// Usage:
/*
creep.memory.target = creep.room.find(FIND_SOURCES)[0];

creep.moveTo(pos(creep.memory.target));
*/
