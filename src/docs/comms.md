# Communications

## Classes

Communication interface | Explanation | Server implementation | Client implementation
--: | --- | --- | --- | ---
Pool | Is a collection of instances, the collection of connections | Server | Client
Poolable | Is an object, that belongs to a pool | Serverable | Clientable
Instance | Is an independent operational unit of the application, for synchronization between server and client | Shard | Canvas
Mappa | A collection of locations | Area | Grid
Location | A collection of occupants | Place | Square
Occupant | The smallest game unit | Thing | Animation

## Classes

```mermaid
classDiagram
	class Instance {
		<<interface>>
		+Mappa [0..*] maps
	}
	
	class InstancePath{
		<<interface>>
		+InstanceUuid instance
	}
	
	class Shard{
		+Area [0..*] maps
	}

	class Canvas{
		+Grid [0..*] maps
	}

	class Mappa{
		<<interface>>
		+Location [0..*] locations
	}

	class MappaPath{
		<<interface>>
		+MappaUuid mappa
	}

	class Area{
		+Place [0..*] locations
	}

	class Grid{
		+Square [0..*] locations
	}

	class Location{
		<<interface>>
		+Occupant [0..*] occupants
	}

	class LocationPath{
		<<interface>>
		+LocationUuid location
	}

	class Place{
		+Thing [0..*] occupants
	}

	class Square{
		+Animation [0..*] occupants
	}

	class Occupant{
		<<interface>>
		+KindUuid: kind
		+ModeUuid: mode
		+KindUuid: world
	}

	class OccupantPath{
		<<interface>>
		+OccupantUuid occupant
	}

	class Thing{
	}

	class Animation{
	}

	%% Comms
	InstancePath <|-- Instance : extends
	Instance "1" o-- "0..*" Mappa : contains
	MappaPath <|-- Mappa : extends
	Mappa "1" o-- "0..*" Location : contains
	LocationPath <|-- Location : extends
	Location "1" o-- "0..*" Occupant : contains
	OccupantPath <|-- Occupant : extends

	%% Paths
	InstancePath <|-- MappaPath : extends
	MappaPath <|-- LocationPath : extends
	LocationPath <|-- OccupantPath : extends

	%% Server
	Instance <|.. Shard : implements
	Shard "1" o-- "0..*" Area : contains
	Mappa <|.. Area : implements
	Area "1" o-- "0..*" Place : contains
	Location <|.. Place : implements
	Place "1" o-- "0..*" Thing : contains
	Occupant <|.. Thing : implements
	
	%% Client
	Instance <|.. Canvas : implements
	Canvas "1" o-- "0..*" Grid : contains
	Mappa <|.. Grid : implements
	Grid "1" o-- "0..*" Square : contains
	Location <|.. Square : implements
	Square "1" o-- "0..*" Animation : contains
	Occupant <|.. Animation : implements

	%% Associations
	Shard -- Canvas : Instance
	Area -- Grid : Mappa
	Place -- Square : Location
	Thing -- Animation : Occupant
```

# Pool classes