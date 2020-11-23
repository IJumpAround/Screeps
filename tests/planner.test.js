let reset_memory = require('./load_memory_mocks')

beforeAll(() => {
  global.Memory = new (require('./__mocks__/memory'))()
})

beforeEach(() => {
  this.planner = require('../planner')
  reset_memory()
})

test("Test checking if a source path is stored in object", () => {
  let test_source_id = "test source idd"
  this.planner.source_paths[test_source_id] = [1, 2, 3, 4,]

  let fake_source = {id: test_source_id}
  let result = this.planner.is_source_path_stored(fake_source)
  expect(result).toEqual(true)
})

test("Test is_source_path_stored when path is in memory", () => {

  global.Room = {
    deserializePath(path) {
      console.log('deserializePath called with ', path);
      return `deserialized ${path}`
    }
  }

  let test_source_id = "test source idd"
  Memory.rooms['room1'] = new RoomMemory()
  Memory.rooms['room1'].controller_source_paths[test_source_id] = "123123123123123"

  let fake_source = {id: test_source_id, room: {name: 'room1'}}
  let result = this.planner.is_source_path_stored(fake_source)
  expect(result).toEqual(true)
})


test("Test adjacency list gets created properly", () => {
  let test = [{x: 0, y:0}, {x:0, y:1}, {x:2, y:3}, {x:2, y:4}, {x:2, y:5}, {x:3, y:0}, {x:3, y:1},
    {x:3, y:2}]
  let num_vertices = test.length
  let list = this.planner._make_adjacency_list(test)
  expect(list.length).toEqual(num_vertices)

  console.log(test);
  console.log(list);
})

test("Test getting wall lines from exits", () => {
  let adjacency_list =  [
    [ { num: 0, visited: false }, { num: 1, visited: false } ],
    [ { num: 0, visited: false }, { num: 1, visited: false } ],
    [ { num: 2, visited: false }, { num: 3, visited: false } ],
    [
      { num: 2, visited: false },
      { num: 3, visited: false },
      { num: 4, visited: false }
    ],
    [ { num: 3, visited: false }, { num: 4, visited: false } ],
    [ { num: 5, visited: false }, { num: 6, visited: false } ],
    [
      { num: 5, visited: false },
      { num: 6, visited: false },
      { num: 7, visited: false }
    ],
    [ { num: 6, visited: false }, { num: 7, visited: false } ]
  ]

  let expected = [ [ 0, 1 ], [ 2, 3, 4 ], [ 5, 6, 7 ] ]
  let lines = this.planner.get_lines(adjacency_list)

  expect(lines).toEqual(expected)

  console.log(JSON.stringify(lines));
})


test("Test initial find exits returns exit positions as lines", () => {
  global.FIND_EXIT = ''
  let room_mock = {
    find(param) {
      return [{x: 0, y:0}, {x:3, y:1}, {x:0, y:1, roomName: 'test'}, {x:2, y:4}, {x:2, y:3}, {x:2, y:5}, {x:3, y:0},
        {x:3, y:2}]
    }
  }
  let expected = [
    [ { x: 0, y: 0 }, { x: 0, y: 1, roomName: 'test' } ],
    [ { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 } ],
    [ { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 } ]
  ]

  let result = this.planner.initial_find_exits(room_mock)
  console.log(result);
  expect(result).toEqual(expected)
})