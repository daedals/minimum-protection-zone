<template>
<v-app>
	<v-main>
		<v-container>
        <v-row>
          <v-col cols="16" md="12" >
            <v-sheet rounded="lg">
				<v-col class="text-center">
					<h1>The minimum protection zone is 1K</h1>
				</v-col>
				<v-expansion-panels
					v-model="panel"
					:readonly="readonly"
				>
					<FilePicker @data-ready="onDataReady" />
					<ParameterView @parameters-applied="onParametersApplied"/>
				</v-expansion-panels>
				<Display ref="displayElementRef" />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
	</v-main>
</v-app>
</template>

<script setup lang="ts">
	import { ref, type Ref } from 'vue'

	const data = ref()
	const parameters = ref()
	const displayElementRef = ref()

	const panel = ref([0])
	const readonly : Ref<boolean> = ref(true)

	function onDataReady(e: any) {
		data.value = e
		// displayElementRef.value.useProvidedData(e)
		panel.value = [1]
	}

	function onParametersApplied(e: any) {
		parameters.value = e
		displayElementRef.value.useProvidedData(data.value, parameters.value)
	}

</script>
