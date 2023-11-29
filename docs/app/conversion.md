# Conversion

## Data conversion

### Conversion groups

Usage | Acronym | Description
--- | --- | ---
Compile output (from compilation) | `compile` | Result of compilation to be consumed by the server
Server input (for initialization) | `system` | Initialization and debug updates performed by application itself
Server input (for bulk message from client) ||
Server output (for client) | `show` | Extraction from server to send to client
Client input (for updates from server) | `show` | Data received from server to show on screen
Client output (for debug) ||
Client output (for bulk message to server) ||

### Process

```mermaid
flowchart LR
	subgraph server[Server]
		subgraph server_system[system]
			direction TB
			server_input_raw([Raw input])
			server_input_args[Args input]
		end
		server_comms[Server state]
		subgraph server_show[show]
			direction TB
			server_output_args[Args output]
			server_output_raw([Raw output])
		end

		%% Server relationships
		server_comms --> server_comms
		server_input_raw --> server_input_args
		server_system --> server_comms
		server_comms --> server_show
		server_output_args --> server_output_raw
	end

	subgraph client[Client]
		subgraph client_show[show]
			direction TB
			client_input_raw([Raw input])
			client_input_args[Args input]
		end
		client_comms[Client state]
		client_output_args[Args output]
		client_output_raw([Raw output])

		%% Client relationships
		client_comms --> client_comms
		client_input_raw --> client_input_args
		client_show --> client_comms
		client_comms --> client_output_args
		client_output_args --> client_output_raw
	end

	%% Top-level relationships
	client <-- Communication --> server
```

## Communication

The communication happens using the `Connection` class, using WebSocket. The server and client send `Message`.