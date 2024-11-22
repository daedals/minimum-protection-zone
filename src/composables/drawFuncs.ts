import { he } from "vuetify/locale"
import type { Coordinate } from "./pathmath"

export function drawLine(ctx : CanvasRenderingContext2D, line : Array<Coordinate>, pxPerMeter : number, offset : number, strokeStyle : string = "#000000") {
	if (ctx) {
		let startX = line[0].x * pxPerMeter + offset
		let startY = line[0].y * pxPerMeter + offset

		ctx.beginPath()
		ctx.strokeStyle = strokeStyle
		ctx.moveTo(startX, startY)

		for (let i = 1; i < line.length; i++) {
			let x = line[i].x * pxPerMeter + offset
			let y = line[i].y * pxPerMeter + offset
			ctx.lineTo(x, y)
		}
		ctx.stroke()
		ctx.strokeStyle = "#000000"
	}
}

export function drawPolygon(ctx : CanvasRenderingContext2D, polygon : Array<Coordinate>, pxPerMeter : number, offset : number) {
	if (ctx) {
		let startX = polygon[polygon.length-1].x * pxPerMeter + offset
		let startY = polygon[polygon.length-1].y * pxPerMeter + offset

		ctx.beginPath()
		ctx.moveTo(startX, startY)

		for(const coord of polygon) {
			ctx.lineTo(coord.x * pxPerMeter + offset, coord.y * pxPerMeter + offset)
		}

		// ctx.closePath()
		ctx.stroke()
	}
}

export function drawPolygonFill(ctx : CanvasRenderingContext2D, polygon : Array<Coordinate>, pxPerMeter : number, offset : number) {
	if (ctx) {
		let startX = polygon[polygon.length-1].x * pxPerMeter + offset
		let startY = polygon[polygon.length-1].y * pxPerMeter + offset

		ctx.beginPath()
		ctx.moveTo(startX, startY)

		for(const coord of polygon) {
			ctx.lineTo(coord.x * pxPerMeter + offset, coord.y * pxPerMeter + offset)
		}

		// ctx.closePath()
		ctx.fill()
	}
}

export function drawDots(ctx : CanvasRenderingContext2D, dots : Array<Coordinate>, pxPerMeter : number, offset : number, radius : number = 2) {
	if (ctx) {
		let iMax = dots.length
		let i = 0
		for(const coord of dots) {
			ctx.beginPath();
			ctx.fillStyle = "rgb(182 26 45 / " + Math.ceil(100 - i * 60/iMax) + "%)"
			i++
			ctx.arc(
				coord.x * pxPerMeter + offset, 
				coord.y * pxPerMeter + offset, 
				radius,
				0, // begin radian
				Math.PI * 2, // end radian
				true);
			ctx.closePath()
			ctx.fill()
		}
		ctx.fillStyle = "#000000"
	}
}

export function drawGrid(ctx : CanvasRenderingContext2D, origin : Coordinate, pxPerMeter : number, offset: number) {
	let width = ctx.canvas.width;
	let height = ctx.canvas.height;

	let translatedOrigin : Coordinate = {
		x: origin.x * pxPerMeter + offset,
		y: origin.y * pxPerMeter + offset
	}
	
	ctx.strokeStyle = "rgb(12 34 56 / 50%)"
	for (let x = -translatedOrigin.x % pxPerMeter; x < width; x += pxPerMeter/2) {
		ctx.beginPath()
		ctx.moveTo(x, 0)
		ctx.lineTo(x, height)
		ctx.stroke()
	}
	for (let y = -translatedOrigin.y % pxPerMeter; y < height; y += pxPerMeter/2) {
		ctx.beginPath()
		ctx.moveTo(0, y)
		ctx.lineTo(width, y)
		ctx.stroke()
	}
	ctx.strokeStyle = "#000000"
}