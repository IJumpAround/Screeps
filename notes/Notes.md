```
//NOTE: don't forget when calling findClosestByRange() on an array of targets, targets in 
other rooms are NOT returned.
   
```
# **Long term goals**  
1. #### Task Based OS style model  
    Rework the entire decision making structure. Central decision making should decide on `tasks` and  
should assign tasks to creeps, instead of creeps deciding for themselves. This way the central  
handler can divvy out tasks and be aware of what everyone is doing. It could help prevent  
overlapping work and multiple creeps doing the same job.  
**__Design with multiple room expansion in mind!!!__**  

1. #### Better Pathfinding  
    A lot of CPU cycles are wasted on pathfinding as it stands. A lot of collisions are happening  
and a lot of wasted time is spent traversing bad terrain when a better path could be chosen.  
1. #### Further divide roles  
    Right now we have 7 different creep roles  
`Builder, Claimer, Defender, Harvester, Healer, Mover, and Upgrader`  

    Some of the roles could be further divided.  
    * `Builder` - is filling the role of construction and repair. Should this be the case?  
    * `Harvester` - Currently feels good, but what about remote mining? Does it make sense to have  
    a faster harvester for those situations? Having an option is nice.  
    * `Mover` - This is the big one. Movers fill too many roles right now. What roles are those?  
    Currently, movers cover all of the following jobs:  
        * `Filling extensions and spawn`  
        * `Taking from storages`  
        * `Picking up dropped resources`
        * `Supplying towers`
  


 

## Shorter Term Goals
- Create more automated build process.  
   `Should be based on the current max energy storage from extensions and the spawner`  
   `Currently tiers are set manually`  
   ```
  Ideally we would pick parts that are effective for a particular job, and combine them  
  in a way such that their total cost is near our max storage
  ```
  
- balance all functions so we can have another spawn room  
    - This would be implemented alongside the task based model
    
   
- Wartime stuff: economy creeps need to flee from hostiles if they are being attacked
 improve strategy immensly

- repair jobs need to be more balanced. how about a multiplier to the ratio values when the
 initial check returns no targets

- Set up better tower logic

* Fix pathing so paths are saved using the newly implemented creep.memory.target

---
## Completed changes:



 **✔**: Upgraders and builders no longer harvest
  
 **✔**: Movers now spawn balanced across sources
  
 **✔**: Write function to calculate cost of a body type
  
 **✔**: Harvesters spawn balanced among sources
  
 **✔**: Harvesters place energy into containers next to them
  
 **✔**: Movers empty buffer chest next to harvesters NOTE this is hardcoded
  
 **✔**: Layout of spawn logic has been reworked
  
 **✔**: Layout of builder logic
   

 **✔**: Basic tower logic implemented 
 
 **✔**: Spawning based on TTL implemented, and is now balanced when spawning  
         before the creep is dead  
          
 **✔**: Creeps can mine from the adjacent room
  
 **✔**: Removed containers except for buffer containers
  
 **✔**: Movers' and Harvesters' home source is now a position object.
             Spawning functions places the home source in the creep memory initially  
               
 **✔**: Repair prioritizes lower hp structures first NOTE: this can still be extended  
  
 **✔**: Basic war code is setup, defender is always spawned and a healer will spawn when enemies are detected  

 **✔**: Movers are now set to one per source, the remaining movers reside within a room    
         they can pickup resources and take from storage only  
           
 **✔**: Memory targeting implemented, creep now has a memory.target = {id,pos}  
         getPos and setPos implemented as prototypes in the creep object
           

