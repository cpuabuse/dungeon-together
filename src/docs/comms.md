# Communications

## Classes

Communication interface | Server implementation | Client implementation
--: | --- | --- | ---
Pool | Server | Client
Instance | Shard | Canvas
Mappa | Area | Grid
Location | Place | Square
Occupant | Thing | Animation

## Class diagram

```mermaid
classDiagram
	class Instance {
		<<interface>>
		+Mappa [0..*] maps
	}
	
	class Shard{
		+Area [0..*] maps
	}

	class Canvas{
		+Grid [0..*] maps
	}

	class Mappa{
		<<interface>>
	}

	class Area{

	}

	class Grid{

	}

	class Location{
		<<interface>>
	}

	class Occupant{
		<<interface>>
	}

	%% Core
	Instance <|.. Shard : implements
	Instance <|.. Canvas : implements

	%% Auxiliary
	Mappa <|.. Area : implements
	Mappa <|.. Grid : implements
```