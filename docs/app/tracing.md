# Tracing

## Projectiles

Client sends vector information of relative direction from the player to the target.
Vectors are precompiled in server(as `projectiles` array) for performance, and store information of nav change for each sequential movement towards the target.

### Algorithm

$$
\begin{cases}
	&\lbrace x, y, z \rbrace \in \mathbb{Z}\\
	&s^2 = x^2 + y^2 + z^2\\
	&n = |x| + |y| + |z|\\
	&n > 0\\
	&P = \lbrace 1, \dots, n \rbrace
\end{cases}
\implies
\left(\begin{align}
	s / n \leq 1\\
	\forall p \in P
			\begin{cases}
				&x_p = \frac{p * x}{n}\\
				&y_p = \frac{p * y}{n}\\
				&z_p = \frac{p * z}{n}
			\end{cases}
\end{align}\right)
$$

Name | Description
--- | ---
$s$ | Distance
$x, y, z$ | Target coordinates
$n$ | Number of steps in algorithm
$x_p, y_p, z_p$ | Coordinates for step $p$

By tracing an imaginary line trough grid to a cell with target coordinates:
1. $s / n$ (distance traveled per step) is guaranteed to be less than `1`, so with each step the line will not cross more than one cell (all cells line crosses will be counted)
1. For each step `p`, if $\{ x_p, y_p, z_p \}$ changed, a corresponding `Nav` is produced

Notes:
- Algorithm generates a 3D `projectiles` array in the server, mapping `x`, `y` and `z`, to a path (in `Nav`s) needed to be taken to reach it
- For grid with sides of `128`, array size is several megabytes, but there still should be a maximum limit around that number, if grid sides are bigger than that
- For tracing beyond array limits, array could be reused with re-centering at the edge cutoff, with decreased effective accuracy
- Lengths of sequences of `Nav`s will vary from grid's smallest side length to sum of lengths of 3 sides (or the limit)

## Visibility

Visibility is coordinate based, and does not adhere to movement/projectiles, which is `Nav`-based.
Both server and client store `cellIndex` array, containing cells indexed by vectors, and `visibility` array.
Visibility array is recursive, each entry containing a cell, distance to that cell, and more entries for potential cells to trace. Effectively, visibility array is remapped and deduplicated for performance projectile array.

### Server

Visibility tracing determines which cells need to be aggregated and sent to client, by sequentially checking visibility of entities, in cells of visibility array, up until view distance is reached.
Since dealing with entities(sending all visible entities to client) is costlier compared to dealing with cells(indexing), modified cells, as well as cells synchronized in the previous tick for each player, will be separately tracked. Effectively, only newly visible cells, and cells that remained visible, but were modified during last tick will be sent to client.

### Client

Client only infers visibility similarly to server, from the data it has.