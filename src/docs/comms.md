# Communications

## Classes

Communication interface | Server implementation | Client implementation
--- | --- | ---
Pool | Server | Client
Instance | Shard | Canvas
Map | Grid | Board
Location | Cell | Square
Occupant | Thing | Ru
World
Kind
Mode



## Class diagram

```mermaid
classDiagram
	class Instance {
		<<interface>>

	}
	
	class instance_client{

	}

	class instance_server{

	}

	class Kind{

	}

	class Location{

	}

	class Map{

	}

	class Mode{

	}

	class Occupant{

	}

	class Reality{

	}

	class World{

	}

	%% Instance
	Instance <|.. instance_client : implements
	Instance <|.. instance_server : implements
```