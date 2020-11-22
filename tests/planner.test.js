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
      console.log('deserializepath called with ', path);
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