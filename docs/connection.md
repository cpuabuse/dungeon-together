# Connection

## Universe and shard

```mermaid
classDiagram
	class CoreUniverse{
		+Map~Uuid，CoreShard~ shards
		+Map~Uuid，CoreConnection~ connections
	}
	<<Abstract>> CoreUniverse

	class ServerUniverse{
		+Map~Uuid，ServerShard~ shards
		+Map~Uuid，ServerConnection~ connections
	}

	class ClientUniverse{
		+Map~Uuid，ClientShard~ shards
		+Map~Uuid，ServerConnection~ connections
	}

	class CoreShard{
		+Uuid connectionUuid;
	}

	class ServerShard{
		+Map~Uuid，Player~ players
		+Map~Uuid，EntityPathExtended~ units
	}

	class ClientShard{
		+Uuid playerUuid
		+Set~Uuid~ units
	}

	class Player{
		+dictionary
	}
	<<Interface>> Player

	%% Contains
	CoreUniverse "1" --> "0..*" CoreShard : contains
	ServerUniverse "1" --> "0..*" ServerShard : contains
	ClientUniverse "1" --> "0..*" ClientShard : contains
	ServerShard "1" --|> "0..*" Player : contains

	%% Extends
	ServerUniverse --|> CoreUniverse : extends
	ClientUniverse --|> CoreUniverse : extends
	ServerShard --|> CoreShard : extends
	ClientShard --|> CoreShard : extends

	%% Implements
	ClientShard ..|> Player : implements

	%% Note - uses generic comma hack https://github.com/mermaid-js/mermaid/issues/3188
```

## Core connection


```mermaid
classDiagram
	class CoreUniverse{
		+Map~Uuid，CoreShard~ shards
		+Map~Uuid，CoreConnection~ connections
	}
	<<Abstract>> CoreUniverse

	class CoreShard{
		+Uuid connectionUuid;
	}

	class CoreConnection{
		+Uuid connectionUuid
		+CoreSocket socket
		+registerShard(Uuid shardUuid, Uuid playerUuid)
	}
	<<Abstract>> CoreConnection

	class CoreSocket{
		-queue
		+send()
		+readQueue()
		+writeQueue()
	}
	<<Abstract>> CoreSocket
	
	class StandaloneSocket{
		+StandaloneSocket target
	}

	class WebSocket{

	}

	%% Contains
	CoreUniverse "1" --> "0..*" CoreConnection : contains
	CoreUniverse "1" --> "0..*" CoreShard : contains
	CoreConnection "1" --> "1" CoreSocket : contains

	%% Extends
	StandaloneSocket --|> CoreSocket : extends
	WebSocket --|> CoreSocket : extends
```

## Server and client connection


The more is moved from client/server connections into the core connection, the more we get to the stage, where client connection can support multiple shards, which goes against the design.


```mermaid
classDiagram
	class ServerUniverse{
		+Map~Uuid，ServerShard~ shards
		+Map~Uuid，ServerConnection~ connections
	}
	
	class ServerShard{
		+Map~Uuid，Player~ players
		+Map~Uuid，EntityPathExtended~ units
	}

	class ClientUniverse{
		+Map~Uuid，ClientShard~ shards
		+Map~Uuid，ClientConnection~ connections
	}

	class ClientShard{
		+Uuid playerUuid
		+Set~Uuid~ units
	}

	class CoreConnection{
		+Uuid connectionUuid
		+CoreSocket socket
		+registerShard(Uuid shardUuid, Uuid playerUuid)
	}
	<<Abstract>> CoreConnection

	class ServerConnection{
		+Map~Uuid，Uuid~ players
	}
	note for ServerConnection "`players` is a map of shard Uuids to player Uuids.<br>That map order assures uniqueness of shards.<br>That is OK, since we are connecting shard to shard, that have player in it."

	class ClientConnection{
		+Set~Uuid~ shards
	}

	class Player{
		+dictionary
	}
	<<Interface>> Player

	%% Contains
	ServerUniverse "1" --> "0..*" ServerShard : contains
	ServerUniverse "1" --> "0..*" ServerConnection : contains
	ClientUniverse "1" --> "0..*" ClientShard : contains
	ClientUniverse "1" --> "0..*" ClientConnection : contains
	ServerShard "1" --|> "0..*" Player : contains

	%% Extends
	ServerConnection --|> CoreConnection : extends
	ClientConnection --|> CoreConnection : extends

	%% Implements
	ClientShard ..|> Player : implements
```

---

Note - File uses mermaid generic comma hack - https://github.com/mermaid-js/mermaid/issues/3188); Although that makes abstract members impossible