# Communications

## Classes

Communication interface | Server implementation | Client implementation
--: | --- | --- | ---
Pool | Server | Client
Poolable | Serverable | Clientable
Instance | Shard | Canvas
Mappa | Area | Grid
Location | Place | Square
Occupant | Thing | Animation

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
```

# Pool classes