import {GameManager} from "./GameManager";
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code


GameManager.init()

//
// var  loop = ErrorMapper.wrapLoop(() => {
//   console.log(global.consts)
//   console.log(ENERGY_DECAY);
//   console.log(`Current game tick is ${Game.time}`);
//   // Automatically delete memory of missing creeps
//   for (const name in Memory.creeps) {
//     if (!(name in Game.creeps)) {
//       delete Memory.creeps[name];
//
//     }
//   }
// });


module.exports.loop = function(){
  GameManager.loop()
};
