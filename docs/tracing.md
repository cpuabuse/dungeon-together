# Tracing

## Projectiles

Client sends vector information of relative direction from the player to the target.
Vectors are precompiled in server for performance, and store information of nav change for each sequential movement towards the target.

### Algorithm

$$
\left\{\begin{aligned}
	&s^2 = x^2 + y^2 + z^2\\
	&n = x + y + z\\
	&P = \{ 1, 2, \dots, n\}
\end{aligned}\right.
\implies
\left(\begin{align}
	s / n \leq 1\\
	\forall p \in P :
			\left\{\begin{aligned}
				&x_p = \frac{p * x}{n}\\
				&y_p = \frac{p * y}{n}\\
				&z_p = \frac{p * z}{n}
			\end{aligned}\right.
\end{align}\right)
$$

- There is a 3D tracing array in the server, for each `x`, `y` and `z`, that contains a sequence of `Nav`s
	1. $s / n$ guaranteed to be less than `1`, so each algorithm step will end at or before next possible change in coordinates
	1. Algorithm increments `p`, and on change of $\{ x_p, y_p, z_p \}$, adds `Nav` corresponding to change
- For grid with sides of `128`, array size is several megabytes, but there still should be a maximum limit around that number, if grid sides are bigger than that
- `n` must be checked to be greater than `0`, otherwise special handling triggers
- Final sub-array's length will vary from grid's side length to double that

## Visibility

### Server

Similar to projectiles, server stores tracing array, but instead of `Nav`s it stores coordinate changes.
It also contains a coordinate array, mapping coordinates to cells.
For all changed cells, tracing determines which changed cells need to be aggregated and sent to client, by sequentially checking visibility of entities, in cells of coordinate array, indexed by tracing array.

### Client

Client stores similar tracing and coordinates arrays, and infers visibility from entities.