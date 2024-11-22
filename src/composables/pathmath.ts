
export type Coordinate = { x: number, y: number}

export function arrayToCoords(array: Array<Array<number>>) : Array<Coordinate> {
	let coordinates = []
	for(const [x,y] of array) {
		const coord : Coordinate = {x: x, y: y}
		coordinates.push(coord)
	}
	return coordinates
}

export function euclideanDistance(pointA: Coordinate, pointB: Coordinate) : number {
	/* calculates the euclidean distance between two Points */
	let dXPow : number = (pointB.x - pointA.x)**2
	let dYPow : number = (pointB.y - pointA.y)**2

	let result = Math.sqrt(dXPow + dYPow)

	return result
}

export function sumArray(array: Array<number>) : number {
	/* sums up all values of an array */
	let sum: number = array.reduce((a, b) => {
		return a + b
	},0);

	return sum
}

export function areaOfTriangle(pointA: Coordinate, pointB: Coordinate, pointC: Coordinate) : number {
	/* calculates the area of a triangle given by 3 distinct coordinates using the determinant form */
	let area : number = 0.5 * Math.abs(
		pointA.x*(pointB.y - pointC.y) + 
		pointB.x*(pointC.y - pointA.y) + 
		pointC.x*(pointA.y - pointB.y)
	)
	return area
}

export function mengerCurvature(pointA: Coordinate, pointB: Coordinate, pointC: Coordinate) : number {
	/* calculates curvature of 3 points using the menger curvature formula */
	let sideAB : number = euclideanDistance(pointA, pointB)
	let sideBC : number = euclideanDistance(pointB, pointC)
	let sideCA : number = euclideanDistance(pointC, pointA)

	// points are not distinct
	if (sideAB == 0 || sideBC == 0 || sideCA == 0) return 0

	let area = areaOfTriangle(pointA, pointB, pointC)

	// points are collinear
	if (area == 0) return 0 

	return 4 * area / (sideAB * sideBC * sideCA)
}

export function getLimits(coordinates: Array<Coordinate>) {
	/* gets a minimum and maximum values of x and y coordinates seperately and returns them as coordinates */
	let minX = coordinates[0].x
	let maxX = coordinates[0].x
	let minY = coordinates[0].y
	let maxY = coordinates[0].y
	for (const coord of coordinates) {
		minX = (coord.x < minX) ? coord.x : minX
		minY = (coord.y < minY) ? coord.y : minY
		maxX = (coord.x > maxX) ? coord.x : maxX
		maxY = (coord.y > maxY) ? coord.y : maxY
	}
	return {min: {x: minX, y: minY}, max: {x: maxX, y: maxY}}
}

export function normalizeCoordinates(offset: Coordinate, coordinates: Array<Coordinate>) : Array<Coordinate> {
	/* i hate this function */
	let newCoordinates : Array<Coordinate> = []
	for (const coord of coordinates) {
		let newCoord = {
			x: coord.x - offset.x,
			y: coord.y - offset.y
		}
		newCoordinates.push(newCoord)
	}
	return newCoordinates
}

export function getTranslationVector(origin: Coordinate, target: Coordinate) : Coordinate {
	/* returns translation vector from origin to target as a Coordinate */
	let translationVector : Coordinate = { x: target.x - origin.x, y: target.y - origin.y }
	return translationVector
}

export function translateCoordinate(origin: Coordinate, reference: Coordinate, target: Coordinate) : Coordinate {
	/* Uses both translation vectors from origin to reference/target to find the translated coordinate
	   so that the tbd coordinate is located to target like reference is located to origin */
	let referenceVector : Coordinate = getTranslationVector(origin, reference)
	let translationVector : Coordinate = getTranslationVector(origin, target)

	let translationResult : Coordinate = { 
		x: origin.x + referenceVector.x + translationVector.x,
		y: origin.y + referenceVector.y + translationVector.y
	}
	return translationResult
}

export function getAngle(center: Coordinate, centerReference: Coordinate, targetReference: Coordinate) : number {
	// get vectors from center to reference points
	let vectorCToCRef : Coordinate = getTranslationVector(center, centerReference)
	let vectorCToTRef : Coordinate = getTranslationVector(center, targetReference)

	let referenceAngle = Math.atan2(vectorCToCRef.y, vectorCToCRef.x) - Math.atan2(vectorCToTRef.y, vectorCToTRef.x)

	return referenceAngle // rad
}

export function rotateCoordinate(center: Coordinate, centerReference: Coordinate, target: Coordinate, targetReference: Coordinate) : Coordinate {
	/* rotates target around center so that the new Coordinate has the same rotation to targetReference as target has to centerReference  */
	// angle from refcenter - center - target is defined by 2 translation vectors

	let referenceAngle = -getAngle(center, centerReference, targetReference)

	// get vector from center to target
	let vectorCtoTarget : Coordinate = getTranslationVector(center, target)

	let rotatedVector : Coordinate = {
		x: Math.cos(referenceAngle) * vectorCtoTarget.x - Math.sin(referenceAngle) * vectorCtoTarget.y,
		y: Math.sin(referenceAngle) * vectorCtoTarget.x + Math.cos(referenceAngle) * vectorCtoTarget.y
	}

	// apply reference angle to vector
	let rotationResult : Coordinate = {
		x: center.x + rotatedVector.x,
		y: center.y + rotatedVector.y
	}

	return rotationResult
}
