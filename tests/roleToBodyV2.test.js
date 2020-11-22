require("./mocks");
require("../constants");
const role_to_body = require("../updatedSpawning").roleToBodyV2;


test("Base 300 energy spawner spawns all creeps with at least 1 of each MOVE, CARRY, WORK", (values, exepected) => {
  let roles = [MY_ROLE_MOVER, MY_ROLE_UPGRADER, MY_ROLE_HARVESTER, MY_ROLE_DEFENDER, MY_ROLE_BUILDER,
    MY_ROLE_HEALER, MY_ROLE_DECONSTRUCTOR];
  let energy = 300;

    for (let i = 0; i < roles.length; i++) {
        let roles_result = role_to_body(roles[i], energy);

        expect(roles_result).toContain(CARRY);
        expect(roles_result).toContain(WORK);
        expect(roles_result).toContain(MOVE);
    }
});


test.each( [MY_ROLE_MOVER, MY_ROLE_UPGRADER, MY_ROLE_HARVESTER, MY_ROLE_DEFENDER, MY_ROLE_BUILDER,
  MY_ROLE_HEALER, MY_ROLE_DECONSTRUCTOR])('.roleToBodyV2(%s', (r) => {
  let energy = 300;
  let res = role_to_body(r, energy);

  expect(res).toContain(CARRY);
  expect(res).toContain(WORK);
  expect(res).toContain(MOVE);

} );

