import {assert} from "chai";
import {Game, Memory} from "./mock";
import {GameManager} from "../../src/GameManager";
import '../../src/constants'
import loop = GameManager.loop;


describe("loop", () => {
  before(() => {
    // runs before all test in this block

  });

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should export a loop function", () => {
    assert.isTrue(typeof loop === "function");
  });

  it("should return void when called with no context", () => {
    assert.isUndefined(loop());
  });

  it("Test global constants accessible", () => {
    assert.equal(global.consts.MY_ROLE_MOVER, 'Mover')
  })
});
