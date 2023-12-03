# Entity kind

```mermaid
classDiagram
	class ServerCell{
		+Map~Uuid，ServerCell~ entities
	}

	class ServerEntity{
		+BaseKind kind
	}

	class BaseKind{
		+ServerEntity entity
		+emits() Record~string，any~
		+action(action) void
	}

	%% Relationships
	ServerCell "1" o-- "1..*" ServerEntity : contains
	ServerEntity "1" *-- "1" BaseKind : contains
```

## Kind emits

Kind can emit arbitrary data, to be transferred to client, per entity.

## Kind action

Action can be performed onto a kind by another entity.

### Example

Moving a guy to the right.

```mermaid
sequenceDiagram
User->>Client: Movement input
Client-->Client: Locate target cell and check entities' emits
alt Target cell contains monster(`hasAction` emit is `true`)
	Client->>Server: Action message
	Note over Client,Server: Default action<br>Right direction<br>Monster UUID
	Server-->Server: Action
	Note over Server,Server: Must reach target cell<br>Default action is attack
else Target cell is empty(`hasAction` emit is `false` or `undefined`)
	Client->>Server: Movement message
	Note over Client,Server: Right direction
	Server-->Server: Move guy to the right
end
Server-->Server: Tick
Server->>Client: Update message
Client-->User: Render
```