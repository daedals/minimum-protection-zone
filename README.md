# The minimum protection zone is 1K

This is a public repository showing my results of a coding challenge. It is a vue-app using vuetify. The exact details of this challenge were intentionally held vague.

## Important Links

The web-app is hostet [here](https://daedals.github.io/minimum-protection-zone/).

## Prerequisites

Given a .json containing 3 arrays with a number of coordinates (in m) describing a robot, a gadget and a path:
- Display them visually,
- calculate the length of the path in m,
- calculate the time it takes the robot to cover the distance of that path while its speed abides to given rules and
- calculate the area the gadget covers during the robots travel.

## Approach

The chosen solution is explained in the following paragraph. All design decisions and their implementation are neglected in the explanation, this is purely an explanation for the mathematical approach:

0. Proximity-based path clean-up:
In a given example .json the last ~30 path nodes were centered around the same coordinate and presumably only due to gps-inaccuracy. They may be cleaned up in the paraeters section, when given a appropriate proximity value.

1. **Calculating the distance between paths nodes:**
The [pathmath](https://github.com/daedals/minimum-protection-zone/blob/main/src/composables/pathmath.ts)-Composable exposes a lot of arithmetic functions to the components. The total distance is calculated using the formula for arithmetic distance between two carthesian coordinates (path nodes here) and then summing up all individual distances in [Display](https://github.com/daedals/minimum-protection-zone/blob/main/src/components/Display.vue). This approach represents a lower bound and is suboptimal, I will discuss a better approach in a latter section.

2. **Calculate curvature:**
The function mengerCurvature(...) in [pathmath](https://github.com/daedals/minimum-protection-zone/blob/main/src/composables/pathmath.ts) calculates the curvature of a node in the path by assuming all points are on the radius of an unique circle and using the [Menger Formula](https://en.wikipedia.org/wiki/Menger_curvature). Since three consecutive points are necessary, the first and last path nodes are assumed to be ~infinite. All other nodes have a unique curvature.

3. **Calculate the speed:**
The description of the challenge gave a formula for determining the speed in dependance on the curvature. We apply that formula in the [Display](https://github.com/daedals/minimum-protection-zone/blob/main/src/components/Display.vue)-Component.

4. **Calculate travel time between nodes:**
We have a path node based speed value. We assume that the speed changes linearly between nodes which makes the calculation simply (v(i) + v(i+1))/2. Together with the determined distance we apply the formula for time: t = s/v (v is never 0 since v is capped by vMin)

5. **Determine the path of the attached gadget:**
The gadget moves together with the robot which means it has its reference point in baseLink exactly as the robot (and the same rotation as the robot too). We assume that upon reaching a path node the robots direction of travel is opposite to the vector from the current path node to the one before. Using the gadgets coordinates, the baseLink-coordinates and the current path node we can determine a translation vetor. The gadgets base rotation is given by the rotation of the robots initial position, using this and the current and previous path node we can apply a rotation matrix to the gadgets translated coordinates.

6. **"Calculating" the area covered by the gadget:**
The area of the resulting polygon from Step 5 could easily be calculated using the [Shoelace Formula](https://en.wikipedia.org/wiki/Shoelace_formula) but since areas that are covered multiple times should be counted only once this becomes more difficult. The least time-consuming method I found (implementation-wise) was to paint the known polygon onto a HTML-canvas and count the amount of colored pixels. The pixels per meter are defined by pxPerMeter in the [Display](https://github.com/daedals/minimum-protection-zone/blob/main/src/components/Display.vue)-Component. The area covered by the gadget can now be calculated by A = n(pixel) / pxPerMeter**2

This concludes the explanation of my approach to finding the required values.

## Possible impovements

Following improvements could be made:

- The calculation of the distance between path nodes is currently made using the euclidean distance which is inaccurate and only represents a lower bound. Instead we could calculate the curvature first since its not dependant on the distance and give a more accurate approximation of the derivates using discreet differences explained [here](https://stackoverflow.com/questions/67674535/how-to-calculate-the-point-by-point-radius-of-curvature-of-a-trajectory-that-is) (further reference [here](https://math.stackexchange.com/questions/2707900/finding-a-smooth-path-between-points-on-a-2d-map-with-maximum-curvature), [here](https://www.mathworks.com/matlabcentral/answers/2096886-what-is-the-best-way-of-calculating-the-path-length-of-a-freely-moving-tracked-animal) and [here](https://www.researchgate.net/publication/242547898_Path_Estimation_from_GPS_Tracks)).
- The accuracy of the area calculation is dependant on the value of pxPerMeter, the whole approach should either be changed. A possible replacement could be a marching square algorithm to determine the borders of the polygon.
- Input sanitization is rudimentary, this needs to be adressed.
- Visualization of the data is rudimentary, can be improved.

## Design choices

- No Store Manager was used since it is a single page application with three components.
- No routing was used for the same reason.
- All UI components are standard vuetify-components.
- Colors were chosen based on the coorporate identity of a certain company.

## Using the [website](https://daedals.github.io/minimum-protection-zone/)

1. Choose a .json-file from your computer using the File Picker,
2. click the "Upload"-button.
3. Confirm the parameterization is accurate:
- Variables vMin and vMax were given, but may be edited.
- Variables kCrit and kMax were given, but may be edited.
- Variable proximity limit defines the limit for path clean up as described in [Solution](#solution).
- Variable pixel per meter changes the size of the canvas and also the accuracy of the calculation of the area.
4. Hit "Apply".
5. See result!

## 📑 License
[MIT](http://opensource.org/licenses/MIT)
