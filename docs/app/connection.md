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
	CoreShard "1" o-- "0..*" CorePlayer : contains

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
	PlayerEntry --o CorePlayer : contains
	CoreConnection "1" <-- "0..1" CorePlayer : references

	class PlayerEntry{
		<<interface>>
		+Uuid shardUuid
		+CorePlayer player
	}
	CoreShard "1" <-- "1" PlayerEntry : references
	PlayerEntry "1" *-- "1" CorePlayer : composes

	class CoreConnection{
		<<Abstract>>
		+Map~Uuid，PlayerEntry~ playerEntries
		+Uuid connectionUuid
		+CoreUniverse universe
		+CoreSocket socket
		+Set~Uuid~ shardUuids
	}
	CoreUniverse "1" <-- "1" CoreConnection : references
	CoreConnection "1" *-- "1" CoreSocket : contains
	CoreShard "1" <-- "0..*" CoreConnection : references

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

	class WebSocket
	CoreSocket --|> WebSocket : extends
```
---

Note - File uses mermaid generic comma hack - https://github.com/mermaid-js/mermaid/issues/3188); Although that makes abstract members impossible