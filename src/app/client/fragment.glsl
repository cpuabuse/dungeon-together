#define PI 3.1415926538
precision mediump float;
varying float relativeWidth;
varying float relativeHeight;
uniform vec3 edgeColor;
uniform vec3 primaryArmColor;
uniform vec3 secondaryArmColor;
uniform vec3 centerColor;
uniform float primaryArmRotation;
uniform float secondaryArmRotation;
uniform float centerCurve;
uniform float primaryArmCurve;
uniform float secondaryArmCurve;
uniform float primaryArmThicknessCurve;
uniform float secondaryArmThicknessCurve;
uniform float fadeOutStart;
uniform float fadeOutEnd;
uniform float maxEdgeAlpha;
uniform float baseAlphaCurve;

/*
	Returns an `x` coordinate, resulted by axis rotation of cartesian plane by angle.
*/
float rotateAxisX(float x, float y, float angle) {
	return y * cos(angle) - x * sin(angle);
}

/*
	Returns an `y` coordinate, resulted by axis rotation of cartesian plane by angle.
*/
float rotateAxisY(float x, float y, float angle) {
	return x * cos(angle) + y * sin(angle);
}

/*
	Returns a positive `atan` component, resulted by axis rotation of cartesian plane by angle.
	Produces values between `0` and `π` (produces symmetry, if used as operand of `sin`).
*/
float getAtanComponent(float x, float y, float angle) {
	return atan(rotateAxisX(x, y, angle), rotateAxisY(x, y, angle)) + PI;
}

/*
	Fill between arms.Has to be multiplied with hypotenuse to make center to arm color transition smooth, has to be hypo corrected to scale hollow center extension with center curve, effectively reducing all of center color
	Has to be multiplied with hypotenuse to make center to arm color transition smooth.
	Hypotenuse has to be corrected by curve to scale hollow "arms" by effectively proportionately reducing center color.
	Produces values from `0` to `1`.
*/
float getShiftedRatio(float ratio, float hypotenuse, float armThicknessCurve) {
	return (ratio - 1.0) / (armThicknessCurve * hypotenuse + 1.0) + 1.0;
}

void main() {
	// Get hypotenuse and skip calculation if it is beyond the circle; Positive value
	float hypotenuse = sqrt(relativeWidth * relativeWidth + relativeHeight * relativeHeight);

	// Return if outside of circle, to save computation
	if(hypotenuse > 1.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
	}

	// Number of primary arms; Integer with values of `2` or greater (for symmetry)
	int primaryArmNumber = 5;
	// Number of secondary arms; Integer with values of `2` or greater (for symmetry) 
	int secondaryArmNumber = 16;

	//#endregion Uniform block

	//#region Color
	// Curve hypotenuse value with center curve; Positive values; `+ 1.0` in divisor is added, so that `centerCurve` can "start" from `0` rather than `1`
	float curvedHypotenuse = (hypotenuse - 1.0) / ((centerCurve - 1.0) * hypotenuse + 1.0) + 1.0;

	// Atan color components
	float primaryAtanComponent = getAtanComponent(relativeWidth, relativeHeight, hypotenuse * primaryArmCurve);
	float secondaryAtanComponent = getAtanComponent(relativeWidth, relativeHeight, hypotenuse * secondaryArmCurve);

	// Ratio for primary arm presense; Values from `0` to `1`
	float primaryRatio = (1.0 + sin(primaryAtanComponent * float(primaryArmNumber) + primaryArmRotation)) / 2.0;
	float secondaryRatio = (1.0 + sin(secondaryAtanComponent * float(secondaryArmNumber) + secondaryArmRotation)) / 2.0;

	// Shifted ratios, to thicken the arms
	float shiftedPrimaryRatio = getShiftedRatio(primaryRatio, curvedHypotenuse, primaryArmThicknessCurve);
	float shiftedSecondaryRatio = getShiftedRatio(secondaryRatio, curvedHypotenuse, secondaryArmThicknessCurve);

	// Effective colors, multiplied by ratio
	vec3 effectivePrimaryArmColor = primaryArmColor * shiftedPrimaryRatio;
	vec3 effectiveSecondaryArmColor = secondaryArmColor * shiftedSecondaryRatio;

	// Simple composite for fast compute
	vec3 notNormalizedArmColor = effectivePrimaryArmColor + effectiveSecondaryArmColor;

	// Set fill color
	vec3 fillColor = mix(centerColor, edgeColor, hypotenuse);

	// Arm color ratio, values from `0` to `2`
	// To optimize speed, colors are added producing extreme burning effect, and then normalized
	float armColorRatio = (shiftedPrimaryRatio + shiftedSecondaryRatio) * curvedHypotenuse;

	// Non normalized color vectors; `fillColor` is multiplied by `2.0` to compensate for arm color having double value
	vec3 notNormalizedBaseColor = mix(fillColor * 2.0, notNormalizedArmColor, armColorRatio);

	// Normalizing base color
	vec3 baseColor = min(notNormalizedBaseColor, max(fillColor, max(effectivePrimaryArmColor, effectiveSecondaryArmColor)));
	//#endregion Color

	//#region Alpha
	// Base alpha based on hypotenuse; Values from `0` to `1`
	float boxAlpha = max(0.0, (1.0 - pow(hypotenuse, baseAlphaCurve)));

	// Difference between fadeout start and end; Positive values excluding zero
	float fadeOutDifference = fadeOutEnd - fadeOutStart;

	// Correct fadeout to `1%` if it is `0`
	if(fadeOutDifference == 0.0) {
		fadeOutDifference = 0.01;
	}

	// Alpha based on center fade out; Positive values including zero
	float centerAlpha = max(0.0, (fadeOutEnd - hypotenuse) / fadeOutDifference + maxEdgeAlpha);

	// Ratio of arm presense; Values from `0` to `1`
	float armRatio = (primaryRatio + secondaryRatio) / 2.0;

	// Mask to substract for hollowness(center color); Positive values including zero
	float hollowAlphaMask = hypotenuse * (1.0 - armRatio);

	// Set alpha
	float alpha = boxAlpha * (centerAlpha - hollowAlphaMask);

	// Normalize Alpha
	if(alpha < 0.0) {
		alpha = 0.0;
	} else if(alpha > 1.0) {
		alpha = 1.0;
	}
	//#endregion Alpha

	// Premultiply alpha
	gl_FragColor = vec4(baseColor * alpha, alpha);
}