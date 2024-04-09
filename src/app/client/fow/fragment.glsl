/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

#define TWOPI 6.2831853072

/*
	Adjusts the FOW's zoom level. Increasing the value zooms in.
*/
#define SCENE_ZOOM_COEFFICIENT 0.01

/*
	Adjusts the rotation speed of the scene. Higher values increase speed.
*/
#define SCENE_TIME_SHIFT_COEFFICIENT 0.00005

/*	
	Adjusts the scene's circular motion. Increasing the value enlarges the circle of movement.
*/
#define SCENE_SHIFT_MULTI 1000.0

/*
	Coordinates for the dot product in the hash function, chosen randomly, affects the pseudo-random number output between 0 and 1 used for creating noise patterns. Changes to this value alter smoke pattern.
*/
#define DOT_X 15.0
#define DOT_Y 80.0

/*
	Randomly chosen multiplier for the dot product in the hash function influences the pseudo-random output of the hash function. Modifying this value alters the smoke pattern.
*/
#define DOT_MULTI 45000.0

/*
	Adjusts the speed of circular movement of layers within FBM. Increasing it makes smoke jiggle faster.
*/
#define FBM_TIME_COEFFICIENT 0.001

/*
	The initial amplitude in the fractional brownian motion function influences each layer's contribution to the final noise pattern. Increasing the amplitude enhances the first layer's contribution, adding larger, broader patterns, while decreasing it reduces the contribution, adding smaller, finer patterns.
*/
#define FBM_AMP_INIT 0.5

/*
	The number of octaves in the FBM function determines the complexity and detail of the noise pattern and smoke effect. More octaves lead to more complex, detailed effects, while fewer octaves result in simpler, less detailed effects.
*/
#define FBM_OCTAVE_NUM 7

/*
	The multiplier for the amplitude in the FBM function affects the contribution of each noise layer to the final pattern. Increasing it emphasizes small-scale, high-frequency features, while decreasing it can highlight large-scale, low-frequency features in the smoke effect.
*/
#define FBM_AMP_MULTI 0.5

/*
	The curve or multiplier for the frequency in consecutive layers in the FBM function, which affects the detail and granularity of the noise pattern and smoke effect. Increasing it results in a more grainy effect.
*/
#define FBM_FREQ_MULTI 2.2

precision mediump float;
uniform float time;

/*
	Random number generator for noise function.
	The returned value is between 0 and 1.
*/
float hash(vec2 v) {
	return fract(sin(dot(v, vec2(DOT_X, DOT_Y))) * DOT_MULTI);
}

/*
	Noise function with 2D grid and bilinear interpolation.
*/
float noise(vec2 v) {
	// Split into integer and fractional parts with smoothing
	vec2 i = floor(v);
	vec2 f = smoothstep(0.0, 1.0, fract(v));

	// Grid interpolation
	float bottom = mix(hash(i /* + vec2(0.0, 0.0) */), hash(i + vec2(1.0, 0.0)), f.x);
	float top = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x);

	// Interpolated noise value
	float t = mix(bottom, top, f.y);

	return t;
}

/*
	Fractional brownian motion function for cloud pattern.
*/
float fbm(vec2 v, float t) {
	// Noise layers sum
	float value = 0.00;

	// Original amplitude
	float amplitude = FBM_AMP_INIT;

	// Frequency
	vec2 frequency = v;

	// Noise layers loop
	for(int i = 0; i < FBM_OCTAVE_NUM; i++) {
		// Coefficient to rotate each layer in time with a circular motion, symmetrically
		float shiftCoefficient = t + TWOPI * float(i) / float(FBM_OCTAVE_NUM);

		// Add noise layer; Adjust with time shift coefficient for each layer
		value += amplitude * noise(vec2(frequency.x + sin(shiftCoefficient), frequency.y + cos(shiftCoefficient)));

		// Adjust amplitude and frequency
		amplitude *= FBM_AMP_MULTI;
		frequency *= FBM_FREQ_MULTI;
	}
	return value;
}

/*
	Main function to render the smoke shader.
*/
void main() {
	// How fast the scene moves
	float sceneShiftCoefficient = time * SCENE_TIME_SHIFT_COEFFICIENT;

	// Coordinates for a scene that is moved and zoomed
	vec2 v = vec2(gl_FragCoord.x + sin(sceneShiftCoefficient) * SCENE_SHIFT_MULTI, gl_FragCoord.y + cos(sceneShiftCoefficient) * SCENE_SHIFT_MULTI) * SCENE_ZOOM_COEFFICIENT;

	// Call the fractional brownian motion function to generate the noise
	float t = fbm(v, time * FBM_TIME_COEFFICIENT);

	gl_FragColor = vec4(t * 0.5, 0.0, 0.0, 1.0);
}
