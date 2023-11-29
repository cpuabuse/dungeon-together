# Application

```mermaid
classDiagram
	class CoreApplication {
		-universes
		+addUniverse()
	}

	class ClientLoader {
		-application
		+addUniverse()
	}

	class ServerLoader {
		-application
		+addUniverse()
	}

	%% Application
	CoreApplication <|-- ClientApplication : extends
	CoreApplication <|-- StandaloneApplication : extends
	CoreApplication <|-- ServerApplication : extends


	%% Contains
	ClientApplication "1" --> "1" ClientLoader
	StandaloneApplication "1" --> "1" ClientLoader
	ServerApplication "1" --> "1" ServerLoader
	StandaloneApplication "1" --> "1" ServerLoader
```

## Loaders

- Using application functionality to create respective universes
- Not aware of sockets used

## Applications
- Directly manage sockets
- Should be extended for additional functionality
	- Authentication
