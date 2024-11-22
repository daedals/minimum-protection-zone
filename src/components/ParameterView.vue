<template>
	<v-expansion-panel>
		<v-expansion-panel-title>
			<template v-slot:default="{ expanded }">
				<v-row no-gutters>
					<v-col class="d-flex justify-start" cols="4"> 2. Edit parameters </v-col>
					<v-col class="text-grey" cols="8">
						<span v-if="expanded" key="0"> Edit the parameters to your liking and apply them. </span>
						<span v-else key="1"></span>
					</v-col>
				</v-row>
			</template>
		</v-expansion-panel-title>
		<v-expansion-panel-text>
			<v-form v-model="valid">
				<v-container>
					<v-row>
						<v-col
						cols="12"
						md="6"
						>
						<v-text-field
							v-model="vMin"
							:rules="rules"
							label="vMin in m/s"
							required
						></v-text-field>
						</v-col>

						<v-col
						cols="12"
						md="6"
						>
						<v-text-field
							v-model="vMax"
							:rules="rules"
							label="vMax in m/s"
							required
						></v-text-field>
						</v-col>
					</v-row>
					<v-row>
						<v-col
						cols="12"
						md="6"
						>
						<v-text-field
							v-model="kCrit"
							:rules="rules"
							label="kCrit in 1/m"
							required
						></v-text-field>
						</v-col>

						<v-col
						cols="12"
						md="6"
						>
						<v-text-field
							v-model="kMax"
							:rules="rules"
							label="kMax in 1/m"
							required
						></v-text-field>
						</v-col>
					</v-row>
					<v-row>
						<v-col
						cols="12"
						md="6"
						>
						<v-text-field
							v-model="pxPerMeter"
							:rules="rules"
							label="pixel per meter in 1/m"
							required
						></v-text-field>
						</v-col>

						<v-col
						cols="12"
						md="6"
						>
						<v-text-field
							v-model="proximityLimit"
							:rules="rules"
							label="proximity limit in m"
							required
						></v-text-field>
						</v-col>
					</v-row>
				</v-container>
			</v-form>
			<v-col class="text-right">
				<v-btn
					text="Reset"
					:disabled="btnDisabled"
					@click="resetParams"
				></v-btn>
				<v-btn
					text="Apply"
					:disabled="btnDisabled"
					@click="applyParameters"
				></v-btn>
			</v-col>
		</v-expansion-panel-text>
	</v-expansion-panel>
</template>

<script setup lang="ts">
	import { ref, type Ref } from 'vue'

	// UI refs
	const btnDisabled : Ref<boolean> = ref(false)
	const valid : Ref<boolean> = ref(false)

	// logic refs
	const proximityLimit = ref<number>() // m
	const pxPerMeter = ref<number>() // 1/m
	const vMax= ref<number>() // m/s
	const vMin= ref<number>() // m/s
	const kCrit= ref<number>() // 1/m
	const kMax= ref<number>() // 1/m

	resetParams()
	
	// emit 
	const emit = defineEmits(['parametersApplied'])

	// define upload rules
	const rules = ref([
		(value: any) => {
			return (!value /*|| typeof(value)*/ || value < 1000 || value > 0 || "Arbitrary rules for someone to implement :)")
		}
	])			
	function applyParameters() {

		// if (!valid.value) return;

		const parameters = {
			proximityLimit: proximityLimit.value,
			pxPerMeter: pxPerMeter.value,
			vMin: vMin.value,
			vMax: vMax.value,
			kCrit: kCrit.value,
			kMax: kMax.value
		}

		emit('parametersApplied', parameters)
	}

	function resetParams() {
		proximityLimit.value = 0.005
		pxPerMeter.value = 200
		vMax.value = 1.1
		vMin.value = 0.15
		kCrit.value = 0.5
		kMax.value = 10
	}

</script>