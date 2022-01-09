# Communications

## Hierarchy

Common name | Explanation | Communication interface | Server implementation | Client implementation
--: | --- | --- | --- | ---
Universe | Is a collection of shards, the collection of connections | CommsUniverse | ServerUniverse | ClientUniverse
Shard | Is an independent operational unit of the application, for synchronization between server(ServerUniverse) and client(ClientUniverse) | CommsShard | ServerShard | ClientShard
Grid | A collection of cells | CommsGrid | ServerGrid | ClientGrid
Cell | A collection of entities | CommsCell | ServerCell | ClientCell
Entity | The smallest game unit | CommsEntity | ServerEntity | ClientEntity

## General hierarchy

```mermaid
	graph TB
		core[Core] --> universe_object[UniverseObject] --> arg[Arg]
		server[Server] --> core
		client[Client] --> core
```

## Classes

```mermaid
classDiagram
	%% Shard
	class ShardPath{
		<<interface>>
		+Uuid shardUuid
	}

	class CommsShard {
		<<interface>>
		+CommsGrid [0..*] grids
	}

	class ServerShard{
		+ServerGrid [0..*] grids
	}

	class ClientShard{
		+ClientGrid [0..*] grids
	}

	%% Grid
	class GridPath{
		<<interface>>
		+Uuid gridUuid
	}

	class CommsGrid{
		<<interface>>
		+CommsCell [0..*] cells
	}

	class ServerGrid{
		+ServerCell [0..*] cells
	}

	class ClientGrid{
		+ClientCell [0..*] cells
	}

	%% Cell
	class CellPath{
		<<interface>>
		+Uuid cellUuid
	}

	class CommsCell{
		<<interface>>
		+CommsEntity [0..*] entities
	}

	class ServerCell{
		+ServerEntity [0..*] entities
	}

	class ClientCell{
		+ClientEntity [0..*] entities
	}

	%% Entity
	class EntityPath{
		<<interface>>
		+Uuid entityUuid
	}

	class CommsEntity{
		<<interface>>
		+Uuid: kindUuid
		+Uuid: modeUuid
		+Uuid: worldUuid
	}

	class ServerEntity{
	}

	class ClientEntity{
	}

	%% Comms
	ShardPath <|-- CommsShard : extends
	CommsShard "1" o-- "0..*" CommsGrid : contains
	GridPath <|-- CommsGrid : extends
	CommsGrid "1" o-- "0..*" CommsCell : contains
	CellPath <|-- CommsCell : extends
	CommsCell "1" o-- "0..*" CommsEntity : contains
	EntityPath <|-- CommsEntity : extends

	%% Paths
	ShardPath <|-- GridPath : extends
	GridPath <|-- CellPath : extends
	CellPath <|-- EntityPath : extends

	%% Server
	CommsShard <|.. ServerShard : implements
	ServerShard "1" o-- "0..*" ServerGrid : contains
	CommsGrid <|.. ServerGrid : implements
	ServerGrid "1" o-- "0..*" ServerCell : contains
	CommsCell <|.. ServerCell : implements
	ServerCell "1" o-- "0..*" ServerEntity : contains
	CommsEntity <|.. ServerEntity : implements
	
	%% Client
	CommsShard <|.. ClientShard : implements
	ClientShard "1" o-- "0..*" ClientGrid : contains
	CommsGrid <|.. ClientGrid : implements
	ClientGrid "1" o-- "0..*" ClientCell : contains
	CommsCell <|.. ClientCell : implements
	ClientCell "1" o-- "0..*" ClientEntity : contains
	CommsEntity <|.. ClientEntity : implements

	%% Associations
	ServerShard -- ClientShard : Shard
	ServerGrid -- ClientGrid : Grid
	ServerCell -- ClientCell : Cell
	ServerEntity -- ClientEntity : Entity
```

## Core infrastructure

Grid, shard and core args omitted for simplicity.

```mermaid
classDiagram
	%% Arg
	class ArgWithPath{
		<<interface>>
		+Uuid argUuid
	}

	class ArgWithoutPath{
		<<interface>>
		+string id
	}

	class Arg{
		<<interface>>
	}

	ArgWithPath "1" <|-- "0..1" Arg : extends if with path
	ArgWithoutPath "1" <|-- "0..1" Arg : extends if without path

	%% Universe Object
	class UniverseObject{
		<<abstract>>
		+void terminateUniverseObject()
	}

	%% Universe Object Container
	class UniverseObjectContainer{
		<<abstract>>
		+void addUniverseObject(universeObject: UniverseObject)
		+void removeUniverseObject(arg: ArgWithPath)
		+void getUniverseObject(arg: ArgWithPath)
	}

	class UniverseObjectContainerImplements{
		<<interface>>
		+UUID defaultUniverseObjectUuid
	}

	Arg <|-- UniverseObject : extends with path
	UniverseObjectContainer <..> UniverseObjectContainerImplements
	UniverseObjectContainer <|-- UniverseObject : extends if contains
	UniverseObjectContainer "1" o-- "1..*" UniverseObject : contains
	ArgWithPath <.. UniverseObjectContainer : use
	UniverseObject <.. UniverseObjectContainer : use

	%% Core
	class CoreCell{
		<<abstract>>
		+UUID defaultUniverseObjectUuid
	}

	%% Core
	class CoreEntity{
		<<abstract>>
		+UUID defaultUniverseObjectUuid
	}

	UniverseObject <|-- CoreCell : extends, containing entity
	UniverseObjectContainerImplements <|.. CoreCell : implements
	UniverseObject <|-- CoreEntity : extends
	UniverseObjectContainerImplements <|.. CoreEntity : implements
	CoreCell "1" o-- "0..*" CoreEntity : contains
```
