<template>
	<!-- <p> {{ props.data }} </p> -->
	<v-col class="text-center">
		<v-card overflow-auto fluid>
			<canvas hidden ref="canvasElementRef" class="display" width="300" height="300"></canvas>
		</v-card>
	</v-col>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { arrayToCoords, euclideanDistance, getLimits, normalizeCoordinates, type Coordinate, mengerCurvature, sumArray, getTranslationVector, translateCoordinate, rotateCoordinate } from '@/composables/pathmath';
import { drawPolygon, drawLine, drawDots, drawGrid, drawPolygonFill } from '@/composables/drawFuncs';

const canvasElementRef = ref<HTMLCanvasElement>()

const origin = ref<Coordinate>()

const pathLengthLowerBound = ref(0)
const pathTimeLowerBound = ref(0)

const proximityLimit = ref<number>(0.005) // m
const pxPerMeter = ref<number>(200) // 1/m
const vMax = ref<number>(1.1) // m/s
const vMin = ref<number>(0.15) // m/s
const kCrit = ref<number>(0.5) // 1/m
const kMax = ref<number>(10) // 1/m
const border = pxPerMeter.value / 2
				
const data = {
	path: Array<Coordinate>(),
	robot: Array<Coordinate>(),
	gadget: Array<Coordinate>(),
	distance: Array<number>(),
	curvature: Array<number>(),
	speed: Array<number>(),
	time: Array<number>(),
	gadgetPath: Array<Array<Coordinate>>(),
	area: 0
}

defineExpose({
	useProvidedData,
})

const emit = defineEmits([
	'resultsReady'
])

function useProvidedData(e: any, f: any) {

	updateParameters(f)

	data.robot = [...arrayToCoords(e.robot)]
	data.gadget = [...arrayToCoords(e.cleaning_gadget)]
	data.path = [...arrayToCoords(e.path)]

	// clean up the path with gps coordinates that lie closer together than radius 'accuracy'
	cleanPath(proximityLimit.value)

	// calulate distance between each path node
	calculateDistance()

	// calculate length of the path
	pathLengthLowerBound.value = sumArray(data.distance)

	// get curvature from path
	calculateCurvature()

	// get speed from curvature
	calculateSpeed()

	// get time values
	calculateTime()

	// calculate time for the path
	pathTimeLowerBound.value = sumArray(data.time)
	

	// calculate the path both points of the gadget take
	calculateGadgetPath()

	// prepare for render
	let limits = getLimits([...data.path, ...data.robot, ...data.gadget])
	origin.value = limits.min

	// adjust display according to a predefined border in px and pixels per meter
	adjustDisplay(limits.max, limits.min)
	calculateArea()
	drawDisplay()

	emit("resultsReady", pathLengthLowerBound.value, pathTimeLowerBound.value, data.area,)
}

function updateParameters(params: any) {
	/* takes provided parameters */

	proximityLimit.value = params.proximityLimit // m
	pxPerMeter.value = params.pxPerMeter // 1/m
	vMax.value = params.vMax // m/s
	vMin.value = params.vMin // m/s
	kCrit.value = params.kCrit // 1/m
	kMax.value = params.kMax // 1/m
}

function calculateDistance() {
	/* calculate distance between each node and the one before, array length =(path.length - 1) */
	let distances: number[] = []
	for (let i = 1; i < data.path.length; i++) {
		let distance = euclideanDistance(data.path[i], data.path[i-1])
		distances.push(distance)
	}
	data.distance = distances // in m
}

function calculateCurvature() {
	/* calculate curvature with func from pathmath, 3 points are needed so first and last one are assumed to be above max */
	let curvatures: number[] = [kMax.value]
	for (let i = 1; i < data.path.length-1; i++) {
		let curvature = mengerCurvature(
			data.path[i-1],
			data.path[i],
			data.path[i+1]
		)
		// clamp to kCrit and Kmax because why not
		// curvature = Math.min(Math.max(curvature, kCrit.value), kMax.value);
		curvatures.push(curvature)
	}
	curvatures.push(kMax.value)
	data.curvature = curvatures // in 1/m
}

function calculateSpeed() {
	/* takes the given linear speed formula and applies it, clamps above kMax and below kCrit */
	if (!data.curvature) return

	let speeds:number[] = []
	for (const k of data.curvature) {
		let v : number
		// k > Kmax and k >= kmax lead to the same result, with the latter needing less calculation
		if (k >= kMax.value) { 
			v = vMin.value 
		}
		else if (k <= kCrit.value) { 
			v = vMax.value 
		}
		else { 
			v = vMax.value - (vMax.value - vMin.value) * (k - kCrit.value) / (kMax.value - kCrit.value)
		}
		speeds.push(v)
	}
	data.speed = speeds // in m/s
}

function calculateTime() {
	/* Calulates the time needed from one path node to the next one.
 	   Since our speed values are node based, we assume that the speed changes linearly.
	   This results in an easy speed calculation because the integral is just (v(i) + v(i+1)) / 2
	*/
	let times: number[] = []

	for (let i = 0; i < data.distance.length; i++) {
		// (i+1) works since distances.length = speed.length - 1
		let v: number = (data.speed[i] + data.speed[i+1]) / 2
		let s: number = data.distance[i]
		
		// v = s/t <=> t = s/v (v is clamped between vMax and vMin, so never 0)
		let t: number = s/v
		times.push(t)
	}
	data.time = times // in s
}

function calculateGadgetPath() {
	/* calculates the position of the 2 points defining cleaning gadget at every step of the path */
	const gadgetPath : Coordinate[][] = [data.gadget]
	const baseLink : Coordinate = data.path[0]

	// get reference translation vector representing the oppsite of direction of travel
	// this assumes that the coordinates of the robot are always given as A (left back), B (right back), C (right front) and D (left front)
	// so that vector DA is defnitely opposite to the initial direction of travel

	const referenceVector : Coordinate = getTranslationVector(data.robot[3], data.robot[0])

	for(let i = 1; i < data.path.length; i++) {
		// translate gadget to currrent path node
		let translatedCoordinateA: Coordinate = translateCoordinate(baseLink, data.gadget[0], data.path[i])
		let translatedCoordinateB: Coordinate = translateCoordinate(baseLink, data.gadget[1], data.path[i])

		// rotate and use initial path of travel as reference
		let referenceCoordinate : Coordinate = {
			x: data.path[i].x + referenceVector.x,
			y: data.path[i].y + referenceVector.y
		}
		let rotatedCoordinateA: Coordinate = rotateCoordinate(data.path[i], referenceCoordinate, translatedCoordinateA, data.path[i-1])
		let rotatedCoordinateB: Coordinate = rotateCoordinate(data.path[i], referenceCoordinate, translatedCoordinateB, data.path[i-1])

		let newGadgetPosition : Coordinate[] = [
			{x: rotatedCoordinateA.x, y: rotatedCoordinateA.y},
			{x: rotatedCoordinateB.x, y: rotatedCoordinateB.y}
		]
		// let newGadgetPosition : Coordinate[] = [
		// 	{x: translatedCoordinateA.x, y: translatedCoordinateA.y},
		// 	{x: translatedCoordinateB.x, y: translatedCoordinateB.y}
		// ]
		gadgetPath.push(newGadgetPosition)
	}
	data.gadgetPath = gadgetPath
}

function cleanPath(accuracy: number) {
	/* cleans up the path by removing coordinates that are too close together (closer than accuracy in m) */
	let newPath = [data.path[0]]
	for (let i = 1; i < data.path.length; i++) {
		let d = euclideanDistance(data.path[i], newPath[newPath.length-1])
		if (d > accuracy) {
			newPath.push(data.path[i])
		}
	}
	data.path = newPath
}

function adjustDisplay(max: Coordinate, min: Coordinate) {
	/* sets canvas size so it can display all POIs dependant on pixPerMeter and border */

	let xRange = max.x - min.x
	let yRange = max.y - min.y

	if (canvasElementRef && canvasElementRef.value) {
		canvasElementRef.value.width = Math.ceil((xRange * pxPerMeter.value + 2*border) / 10) *10
		canvasElementRef.value.height = Math.ceil((yRange * pxPerMeter.value + 2*border) / 10) *10
	}
}

function calculateArea() {
	/* calculate area by drawing it all on a canvas and then counting pixels (i know its stupid) */
	if (canvasElementRef && canvasElementRef.value) {
		let ctx = canvasElementRef.value.getContext('2d')
		if (ctx && data && origin.value) {
			// clear canvas
			let width = ctx.canvas.width
			let height = ctx.canvas.height
			ctx.clearRect(0, 0, width, height);

			// draw Polygon
			for (let i = 1; i < data.gadgetPath.length; i++) {
				let hPolygon : Array<Coordinate> = normalizeCoordinates(
					origin.value, 
					[...data.gadgetPath[i], data.gadgetPath[i-1][1], data.gadgetPath[i-1][0]]
				)
				drawPolygonFill(ctx, hPolygon, pxPerMeter.value, border)
			}

			// this doenst seem to work, maybe image is not yet done drawing?
			const imageData : ImageData = ctx.getImageData(0, 0, width, height)
			
			// let white = 0
			let black = 0

			for (let i : number = 0; i < imageData.data.length; i += 4)
			{
				if (imageData.data[i + 3] != 0) black++ 
				// else white++

				// if(imageData.data[i+3] != 0) imageData.data[i] = 123
			}

			// ctx.putImageData(imageData, 0, 0)
			// canvasElementRef.value.removeAttribute('hidden')

			data.area = black / (pxPerMeter.value**2)
		}
	}
}

function drawDisplay() {
	/*  */
	if (canvasElementRef && canvasElementRef.value) {
		let ctx = canvasElementRef.value.getContext('2d')
		if (ctx && data && origin.value) {
			// clear canvas
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			
			// normalize data with minimal x and y values
			let hRobot : Array<Coordinate> = normalizeCoordinates(origin.value, [...data.robot])
			let hCleaningGadget : Array<Coordinate> = normalizeCoordinates(origin.value, [...data.gadget])
			let hPath : Array<Coordinate> = normalizeCoordinates(origin.value, [...data.path])
			
			
			drawGrid(ctx, origin.value, pxPerMeter.value, border)
			drawLine(ctx, hPath, pxPerMeter.value, border)
			drawDots(ctx, hPath, pxPerMeter.value, border)
			drawPolygon(ctx, hRobot, pxPerMeter.value, border)

			for (let i = 1; i < data.gadgetPath.length; i++) {
				let hPolygon : Array<Coordinate> = normalizeCoordinates(
					origin.value, 
					[...data.gadgetPath[i], data.gadgetPath[i-1][1], data.gadgetPath[i-1][0]]
				)
				drawPolygon(ctx, hPolygon, pxPerMeter.value, border)
			}

			drawLine(ctx, hCleaningGadget, pxPerMeter.value, border, "rgb(35 140 150)")

			canvasElementRef.value.removeAttribute('hidden')
		}
	}
}

</script>

<style scoped>
.display {
	border:1px solid #000000;
	background-color: #e3e3e3;
}
</style>