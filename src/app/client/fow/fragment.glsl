/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

#define TWOPI 6.2831853072
#define SCENE_ZOOM_COEFFICIENT 0.01
#define SCENE_TIME_SHIFT_COEFFICIENT 0.00005
#define SCENE_SHIFT_MULTI 1000.0
#define DOT_X 15.0
#define DOT_Y 80.0
#define DOT_MULTI 45000.0
#define FBM_TIME_COEFFICIENT 0.001
#define FBM_AMP_INIT 0.5
#define FBM_OCTAVE_NUM 7
#define FBM_AMP_MULTI 0.5
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
