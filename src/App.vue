<template>
<v-app>
	<v-main>
		<v-container>
			<v-row>
				<v-col cols="16" md="12" >
					<v-sheet rounded="lg">
						<v-container class="text-center">
							<h1 rounded="lg" style="color: #FFDE00">The minimum protection zone is 1K</h1>
						</v-container>
						<v-expansion-panels v-model="panel" :readonly="readonly" >
							<FilePicker @data-ready="onDataReady" />
							<ParameterView @parameters-applied="onParametersApplied"/>
						</v-expansion-panels>
					</v-sheet>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="16" md="12">
					<v-expand-transition>
						<v-sheet rounded="lg" v-show="expand">
							<ResultTable 
								:distance="distance"
								:time="time"
								:area="area"
							/>
							<Display ref="displayElementRef" @results-ready="onResultsReady"/>
						</v-sheet>
					</v-expand-transition>
				</v-col>
			</v-row>
		</v-container>
	</v-main>
</v-app>
</template>

<script setup lang="ts">
	import { ref, type Ref } from 'vue'

	const displayElementRef = ref()

	const data = ref()
	const parameters = ref()

	const distance = ref(0)
	const time = ref(0)
	const area = ref(0)

	const expand = ref(false)
	const panel = ref([0])
	const readonly : Ref<boolean> = ref(true)

	function onDataReady(e: any) {
		data.value = e
		// displayElementRef.value.useProvidedData(e)
		panel.value = [1]
	}

	function onParametersApplied(e: any) {
		parameters.value = e
		expand.value = true
		displayElementRef.value.useProvidedData(data.value, parameters.value)
	}

	function onResultsReady(vDistance: number, vTime: number, vArea: number) {
		distance.value = vDistance
		time.value = vTime
		area.value = vArea
	}

</script>
