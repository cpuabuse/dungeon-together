# Connection

The more is moved from client/server connections into the core connection, the more we get to the stage, where client connection can support multiple shards, which goes against the design.

## Connection, player and socket
```mermaid
classDiagram
	class CoreUniverse{
		<<External>>
		+Map~Uuid，CoreShard~ shards
		+Map~Uuid，CoreConnection~ connections
	}
	CoreUniverse "1" o-- "0..*" CoreShard : contains
	CoreUniverse "1" o-- "0..*" CoreConnection : contains

	class CoreShard{
		<<External>>
		+Map~Uuid，Player~ players
	}

	class CoreConnection{
		+Uuid connectionUuid
		+CoreUniverse universe
		+CoreSocket socket
		+Set~Uuid~ shardUuids
	}
	<<Abstract>> CoreConnection
	CoreConnection "1" --> "1" CoreUniverse : references
	CoreConnection "1" *-- "1" CoreSocket : contains
	CoreConnection "1" --> "0..*" CoreShard: references

	class CorePlayer{
		<<Abstract>>
		+dictionary
		+CoreConnection|undefined connection
		+isConnected boolean
		+Uuid playerUuid
		+Set~Uuid~ units
		+connect(CoreConnection connection)
		+disconnect()
	}
	CoreConnection "1" <-- "0..1" CorePlayer : references

	class CoreSocket{
		<<Abstract>> 
		-queue
		+send()
		+readQueue()
		+writeQueue()
	}
	
	class StandaloneSocket{
		+StandaloneSocket target
	}
	CoreSocket --|> StandaloneSocket : extends

	class WebSocket{
	}
	CoreSocket --|> WebSocket : extends
```

## Server

```mermaid
classDiagram
	class ServerShard{
		<<External>>
		+Map~Uuid，Player~ players
		+Map~Uuid，EntityPathExtended~ units
		+CoreDictionary dictionary
	}
	ServerShard "1" o-- "0..*" ServerPlayer : contains

	class CorePlayer{
		<<External>>
	}

	class ServerPlayer{
	}
	ServerPlayer --|> CorePlayer : extends

	class CoreConnection{
		<<External>>
	}

	class ServerConnection{
		+Map~Uuid，PlayerEntry~ playerEntries
	}
	CoreConnection <|-- ServerConnection : extends
	ServerConnection o-- PlayerEntry : contains

	class PlayerEntry{
		<<interface>>
		+Uuid shardUuid
		+ServerPlayer player
	}
	PlayerEntry "1" --> "1" ServerShard : references
	PlayerEntry "1" *-- "1" ServerPlayer : composes
```

## Client

```mermaid
classDiagram
	class ClientUniverse{
		+Map~Uuid，ClientShard~ shards
		+Map~Uuid，ServerConnection~ connections
	}
	ClientUniverse "1" o-- "0..*" ClientShard : contains
	ClientUniverse "1" o-- "0..*" ClientConnection : contains
	ClientShard "1" o-- "1" ClientPlayer : contains

	class ClientShard{
		+Set~Uuid~ units
		+Player player
	}

	class CorePlayer{
		<<External>>
	}

	class ClientPlayer{

	}
	ClientPlayer --|> CorePlayer : extends

	class CoreConnection{
		<<External>>
	}

	class ClientConnection{

	}
	ClientConnection --|> CoreConnection : extends
```

---

Note - File uses mermaid generic comma hack - https://github.com/mermaid-js/mermaid/issues/3188); Although that makes abstract members impossible