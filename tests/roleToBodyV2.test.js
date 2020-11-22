

require("./mocks");
require("../constants");
const role_to_body = require("../updatedSpawning").roleToBodyV2;

test.each( [MY_ROLE_MOVER, MY_ROLE_UPGRADER, MY_ROLE_HARVESTER, MY_ROLE_BUILDER,
   ])('.roleToBodyV2(%s', (r) => {
  let energy = 300;
  let res = role_to_body(r, energy);

  expect(res).toContain(CARRY);
  expect(res).toContain(WORK);
  expect(res).toContain(MOVE);

} );


test("Test Healer gets 1 of each base part", () => {
    let energy = 310;
    let res = role_to_body(MY_ROLE_HEALER, energy);

    expect(res).toContain(HEAL);
    expect(res).toContain(TOUGH);
    expect(res).toContain(MOVE);

} );

test("Test Defender gets one of each base part", () => {
    let energy = 300;
    let res = role_to_body(MY_ROLE_DEFENDER, energy);

    expect(res).toContain(ATTACK);
    expect(res).toContain(TOUGH);
    expect(res).toContain(MOVE);

} );

test("Test Claimer gets one of each base part", () => {
    let energy = 650;
    let res = role_to_body(MY_ROLE_CLAIMER, energy);

    expect(res).toContain(MOVE);
    expect(res).toContain(CLAIM);

} );

calc_cost = function(parts) {
    let sum = 0

    parts.forEach((part) => {
        sum += BODYPART_COST[part]
    })
    return sum
}

test.each([MY_ROLE_MOVER, MY_ROLE_UPGRADER, MY_ROLE_HARVESTER, MY_ROLE_BUILDER, MY_ROLE_DEFENDER, MY_ROLE_CLAIMER, MY_ROLE_HEALER])
("Cost of returned parts for %s does not exceed alloted energy", (role) => {
    let energy = 828
    let result = role_to_body(role, energy)

    let cost = calc_cost(result)
    expect(cost).toBeLessThanOrEqual(energy)

})


