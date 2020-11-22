var roleClaimer = {
    //Memory.reservedControllers = {id: {x,y,roomname}}
    run : function(creep,numClaimers = 0){
        var homeControllerId = creep.memory.homeController;
        var controllerPos = getPos(Memory.reservedControllers[homeControllerId]);
        //console.log(JSON.stringify(controllerPos));
        //console.log(JSON.stringify(Memory.reservedControllers));
        //console.log(homeControllerId);
        var inRange = creep.pos.inRangeTo(controllerPos,1);
        //console.log(inRange);
        if(inRange == true)
            creep.reserveController(creep.room.controller);
        else{
            var test = creep.moveTo(controllerPos);
        }


    }



};

module.exports = roleClaimer;
