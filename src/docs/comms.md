# Communications

## Classes

Communication interface | Explanation | Server implementation | Client implementation
--: | --- | --- | --- | ---
Pool | Is a collection of instances, the collection of connections | Server | Client
Instance | Is an independent operational unit of the application, for synchronization between server and client | Shard | Canvas
Mappa | A collection of locis | Area | Grid
Locus | A collection of occupants | Place | Square
Occupant | The smallest game unit | Thing | Scene

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
		+Locus [0..*] locis
	}

	class MappaPath{
		<<interface>>
		+MappaUuid mappa
	}

	class Area{
		+Place [0..*] locis
	}

	class Grid{
		+Square [0..*] locis
	}

	class Locus{
		<<interface>>
		+Occupant [0..*] occupants
	}

	class LocusPath{
		<<interface>>
		+LocusUuid locus
	}

	class Place{
		+Thing [0..*] occupants
	}

	class Square{
		+Scene [0..*] occupants
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

	class Scene{
	}

	%% Comms
	InstancePath <|-- Instance : extends
	Instance "1" o-- "0..*" Mappa : contains
	MappaPath <|-- Mappa : extends
	Mappa "1" o-- "0..*" Locus : contains
	LocusPath <|-- Locus : extends
	Locus "1" o-- "0..*" Occupant : contains
	OccupantPath <|-- Occupant : extends

	%% Paths
	InstancePath <|-- MappaPath : extends
	MappaPath <|-- LocusPath : extends
	LocusPath <|-- OccupantPath : extends

	%% Server
	Instance <|.. Shard : implements
	Shard "1" o-- "0..*" Area : contains
	Mappa <|.. Area : implements
	Area "1" o-- "0..*" Place : contains
	Locus <|.. Place : implements
	Place "1" o-- "0..*" Thing : contains
	Occupant <|.. Thing : implements
	
	%% Client
	Instance <|.. Canvas : implements
	Canvas "1" o-- "0..*" Grid : contains
	Mappa <|.. Grid : implements
	Grid "1" o-- "0..*" Square : contains
	Locus <|.. Square : implements
	Square "1" o-- "0..*" Scene : contains
	Occupant <|.. Scene : implements

	%% Associations
	Shard -- Canvas : Instance
	Area -- Grid : Mappa
	Place -- Square : Locus
	Thing -- Scene : Occupant
```

# Pool classes