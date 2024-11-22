<template>
	<v-expansion-panel>
		<v-expansion-panel-title>
			<template v-slot:default="{ expanded }">
				<v-row no-gutters>
					<v-col class="d-flex justify-start" cols="4"> 1. File Upload </v-col>
					<v-col class="text-grey" cols="8">
						<span v-if="expanded" key="0"> Please choose a .json-file and upload it. </span>
						<span v-else key="1"> {{ filename }} </span>
					</v-col>
				</v-row>
			</template>
		</v-expansion-panel-title>
		<v-expansion-panel-text>
			<v-file-input 
				label="File input" 
				variant="outlined"
				type="file"
				accept=".json"
				:rules="rules"
				show-size
				@change="onFileChange($event)"
				@click:clear="clear()">
			</v-file-input>
			<v-col class="text-right">
				<v-btn
					text="Upload"
					:disabled="btnDisabled"
					@click="uploadFile"
					></v-btn>
			</v-col>
		</v-expansion-panel-text>
	</v-expansion-panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// UI refs
const filename = ref("")
const btnDisabled = ref(true)

// data refs
const file = ref<File | null>()
const data = ref<string>()

// emit 
const emit = defineEmits(['dataReady'])

// define upload rules
const rules = ref([
	(value: any) => {
		return (!value || !value.length || value[0].size < 2000000 || "Arbitrary rules for someone to implement :)")
	}
])

function onFileChange($event: Event) {
	/* prepares */
	const target = $event.target as HTMLInputElement
	if(target && target.files && target.files[0].type == "application/json") {
		filename.value = target.files[0].name
		file.value = target.files[0]
		btnDisabled.value = false
	}
}

function uploadFile() {
	if(file && file.value) {
		const reader = new FileReader()

		reader.onload = (e) => {
			//@ts-ignore
			data.value = JSON.parse(e.target!.result)
			if (checkData()) {
				emit('dataReady', data.value)
			}
		}

		reader.readAsText(file.value)
	}
}

function clear() {
	file.value = null
	btnDisabled.value = true
}

function checkData() : boolean {
	/* check data for valid input format, */
	return data.value != null &&
		Object.prototype.hasOwnProperty.call(data.value, 'robot') && //@ts-ignore
		data.value.robot.length > 2 && 
		Object.prototype.hasOwnProperty.call(data.value, 'cleaning_gadget') && //@ts-ignore
		data.value.cleaning_gadget.length == 2 &&
		Object.prototype.hasOwnProperty.call(data.value, 'path')
}

</script>