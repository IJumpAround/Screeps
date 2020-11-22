//NOTE: don't forget when calling findClosestByRange() on an array of targets,
//      targets in other rooms are NOT returned.
/*TODO: Create generic build process

-balance all functions so we can have another spawn room

-Wartime stuff: economy creeps need to flee from hostiles if they are being attacked
-improve strategy immensly

-repair jobs need to be more balanced. how about a multiplier to the ratio values when the
 initial check returns no targets

-Set up better tower logic

-Fix pathing so paths are saved using the newly implemented creep.memory.target



COMPLETE:


CHANGED: Upgraders and builders no longer harvest
CHANGED: Movers now spawn balanced across sources
CHANGED: Write function to calculate cost of a body type
CHANGED: Harvesters spawn balanced among sources
CHANGED: Harvesters place energy into containers next to them
CHANGED: Movers empty buffer chest next to harvesters NOTE this is hardcoded
CHANGED: Layout of spawn logic has been reworked
CHANGED: Layout of builder logic reworked
CHANGED: Basic tower logic implemented
CHANGED: Spawning based on TTL implemented, and is now balanced when spawning
         before the creep is dead
CHANGED: Creeps can mine from the adjacent room
CHANGED: Removed containers except for buffer containers
CHANGED: Movers' and Harvesters' home source is now a position object.
         Spawning functions places the home source in the creep memory initially
CHANGED: Repair prioritizes lower hp structures first NOTE: this can still be extended
CHANGED: Basic war code is setup, defender is always spawned and a healer will spawn when enemies are detected
CHANGED: Movers are now set to one per source, the remaining movers reside within a room
         they can pickup resources and take from storage only
CHANGED: Memory targeting implemented, creep now has a memory.target = {id,pos}
         getPos and setPos implemented as prototypes in the creep object
*/
