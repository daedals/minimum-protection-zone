# The minimum protection zone is 1K

This is a public repository showing my results of a coding challenge. It is a vue-app using vuetify. The exact details of this challenge were intentionally held vague.

## Important Links

The web-app is hostet [here](https://daedals.github.io/minimum-protection-zone/).

## Challenge

Given a .json containing 3 arrays with a number of coordinates (in m) describing a robot, a gadget and a path:
- Display them visually,
- calculate the length of the path in m,
- calculate the time it takes the robot to cover the distance of that path while its speed abides to given rules and
- calculate the area the gadget covers during the robots travel.

## Solution

The chosen solution is explained in the following paragraph. All design decisions and their implementation are neglected in the explanation, this is purely an explanation for the mathematical approach:

0. Proximity-based path clean-up:
In a given example .json the last ~30 path nodes were centered around the same coordinate and presumably only due to gps-inaccuracy. They may be cleaned up in the paraeters section, when given a appropriate proximity value.

1. Calculating the distance between paths nodes:
The [pathmath](https://github.com/daedals/minimum-protection-zone/blob/main/src/composables/pathmath.ts)-Composable exposes a lot of arithmetic functions to the components. The total distance is calculated using the formula for arithmetic distance between two carthesian coordinates (path nodes here) and then summing up all individual distances in [Display](https://github.com/daedals/minimum-protection-zone/blob/main/src/components/Display.vue). This approach represents a lower bound and is suboptimal, I will discuss a better approach in a latter section.

2. Calculate curvature:
The function mengerCurvature(...) in [pathmath](https://github.com/daedals/minimum-protection-zone/blob/main/src/composables/pathmath.ts) calculates the curvature of a node in the path by assuming all points are on the radius of an unique circle and using the [Menger Formula](https://en.wikipedia.org/wiki/Menger_curvature). Since three consecutive points are necessary, the first and last path nodes are assumed to be ~infinite. All other nodes have a unique curvature.

3. Calculate the speed:
The challenge description gave a formula for determining the speed in dependance on the curvature. We apply that formula in the [Display](https://github.com/daedals/minimum-protection-zone/blob/main/src/components/Display.vue)-Component.

4. Calculate travel time between nodes:
We have a path node based speed value. We assume that the speed changes linearly between nodes which makes the calculation simply (v(i) + v(i+1))/2. Together with the determined distance we apply the formula for time: t = s/v (v is never 0 since v is capped by vMin)

5. Determine the path of the attached gadget
The gadget moves together with the robot which means it has its reference point in baseLink exactly as the robot (and the same rotation as the robot too). We assume that upon reaching a path node the robots direction of travel is opposite to the vector from the current path node to the one before. Using the gadgets coordinates, the baseLink-coordinates and the current path node we can determine a translation vetor. The gadgets base rotation is given by the rotation of the robots initial position, using this and the current and previous path node we can apply a rotation matrix to the gadgets translated coordinates.

6. "Calculating" the area covered by the gadget
The area of the resulting polygon from Step 5 could easily be calculated using the [Shoelace Formula](https://en.wikipedia.org/wiki/Shoelace_formula) but since areas that are covered multiple times should be counted once this becomes more difficult. THe least time-consuming method I found was to paint the known polygon onto a HTML-canvas and count the amount of colored pixels. The pixels per meter are defined by pxPerMeter in the [Display](https://github.com/daedals/minimum-protection-zone/blob/main/src/components/Display.vue)-Component. The area covered by the gadget can now be calculated by A = n(pixel) / pxPerMeter**2

This concludes the explanation of my approach to finding the required values.


## ✨ Features

- 🖼️ **Optimized Front-End Stack**: Leverage the latest Vue 3 and Vuetify 3 for a modern, reactive UI development experience. [Vue 3](https://v3.vuejs.org/) | [Vuetify 3](https://vuetifyjs.com/en/)
- 🗃️ **State Management**: Integrated with [Pinia](https://pinia.vuejs.org/), the intuitive, modular state management solution for Vue.
- 🚦 **Routing and Layouts**: Utilizes Vue Router for SPA navigation and vite-plugin-vue-layouts for organizing Vue file layouts. [Vue Router](https://router.vuejs.org/) | [vite-plugin-vue-layouts](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)
- 💻 **Enhanced Development Experience**: Benefit from TypeScript's static type checking and the ESLint plugin suite for Vue, ensuring code quality and consistency. [TypeScript](https://www.typescriptlang.org/) | [ESLint Plugin Vue](https://eslint.vuejs.org/)
- ⚡ **Next-Gen Tooling**: Powered by Vite, experience fast cold starts and instant HMR (Hot Module Replacement). [Vite](https://vitejs.dev/)
- 🧩 **Automated Component Importing**: Streamline your workflow with unplugin-vue-components, automatically importing components as you use them. [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- 🛠️ **Strongly-Typed Vue**: Use vue-tsc for type-checking your Vue components, and enjoy a robust development experience. [vue-tsc](https://github.com/johnsoncodehk/volar/tree/master/packages/vue-tsc)

These features are curated to provide a seamless development experience from setup to deployment, ensuring that your Vuetify application is both powerful and maintainable.


### Starting the Development Server

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000):

```bash
yarn dev
```

(Repeat for npm, pnpm, and bun with respective commands.)

> Add NODE_OPTIONS='--no-warnings' to suppress the JSON import warnings that happen as part of the Vuetify import mapping. If you are on Node [v21.3.0](https://nodejs.org/en/blog/release/v21.3.0) or higher, you can change this to NODE_OPTIONS='--disable-warning=5401'. If you don't mind the warning, you can remove this from your package.json dev script.

### Building for Production

To build your project for production, use:

```bash
yarn build
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.

## 💪 Support Vuetify Development

This project is built with [Vuetify](https://vuetifyjs.com/en/), a UI Library with a comprehensive collection of Vue components. Vuetify is an MIT licensed Open Source project that has been made possible due to the generous contributions by our [sponsors and backers](https://vuetifyjs.com/introduction/sponsors-and-backers/). If you are interested in supporting this project, please consider:

- [Requesting Enterprise Support](https://support.vuetifyjs.com/)
- [Sponsoring John on Github](https://github.com/users/johnleider/sponsorship)
- [Sponsoring Kael on Github](https://github.com/users/kaelwd/sponsorship)
- [Supporting the team on Open Collective](https://opencollective.com/vuetify)
- [Becoming a sponsor on Patreon](https://www.patreon.com/vuetify)
- [Becoming a subscriber on Tidelift](https://tidelift.com/subscription/npm/vuetify)
- [Making a one-time donation with Paypal](https://paypal.me/vuetify)

## 📑 License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present Vuetify, LLC
