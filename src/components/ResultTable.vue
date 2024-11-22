<template>
	<v-table>
		<tbody>
			<tr>
				<td> Calculated distance of travel: </td>
				<td>{{ props.distance }} m </td>
			</tr>
			<tr>
				<td> Calculated time of travel: </td>
				<td>{{ props.time }} s </td>
			</tr>
			<tr>
				<td> Calculated covered area: </td>
				<td>{{ props.area }} m<sup>2</sup> </td>
			</tr>
		</tbody>
	</v-table>
</template>

<script setup lang="ts">

	const props = defineProps(["distance", "time", "area"])

</script>