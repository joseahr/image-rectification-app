<template>
  <v-navigation-drawer dark fixed v-model="dialogCalculateCameraOpened" disable-resize-watcher>
    <v-list class="py-0">
      <v-list-tile>
        <v-list-tile-action>
          <v-btn icon @click="dialogCalculateCameraOpened = false">
            <v-icon>arrow_back</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-title>
          <h2>Cámaras</h2>
        </v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
    </v-list>

    <v-tabs
      v-model="tabs"
      centered
      show-arrows
      slider-color="white"
      color="transparent"
    >
      <v-tab>
        <v-icon>list_alt</v-icon>
      </v-tab>
      <v-tab>
        <v-icon>add_a_photo</v-icon>
      </v-tab>
    </v-tabs>

    <v-container fluid>
      <v-tabs-items v-model="tabs">
        <!-- Camaras guardadas -->
        <v-tab-item>

          <v-card light v-for="(cam, idx) in cameras" :key="idx" class="my-2">
            <v-card-actions>
              <h1> <span class="green--text">#</span> {{cam.name}}</h1>
              <v-spacer></v-spacer>
              <v-btn icon light flat color="green" @click="toggleInfo(cam.name)">
                <v-icon>{{ indexOpened.has(cam.name) ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}}</v-icon>
              </v-btn>
            </v-card-actions>

            <v-slide-y-transition>
              <v-card-text v-show="indexOpened.has(cam.name)">
                <v-flex xs12 class="mx-3" style="border-top: 1px solid #000; opacity: 0.35;"></v-flex>
                <v-container grid-list-md text-xs-center>

                  <v-subheader light>
                    Orientación Interna
                  </v-subheader>

                  <v-layout row wrap v-for="(key, idx) of Object.keys(cam.params.internal)" :key="'internal-' + idx">
                    <v-flex xs4>
                      <v-card dark color="green lighten-2">
                        <v-card-text class="px-0">{{key}}</v-card-text>
                      </v-card>
                    </v-flex>
                    <v-flex xs8>
                      <v-card dark color="green">
                        <v-card-text class="px-0">{{cam.params.internal[key].toFixed(4)}}</v-card-text>
                      </v-card>
                    </v-flex>
                  </v-layout>

                  <template v-if="cam.params.distortions">
                    <v-subheader light>
                      Distorsiones
                    </v-subheader>

                    <v-layout row wrap v-for="(value, idx) of cam.params.distortions" :key="'distorsiones-' + idx">
                      <v-flex xs4>
                        <v-card dark color="green lighten-2">
                          <v-card-text class="px-0">{{distortionParamsMapping[cam.params.distortions.length][idx]}}</v-card-text>
                        </v-card>
                      </v-flex>
                      <v-flex xs8>
                        <v-card dark color="green">
                          <v-card-text class="px-0">{{value.toFixed(4)}}</v-card-text>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </template>

                  <!-- <v-subheader light>
                    Orientación Externa
                  </v-subheader>

                  <v-layout row wrap v-for="(key, idx) of Object.keys(cam.params.external)" :key="idx + 1000000">
                    
                    <v-flex xs4>
                      <v-card dark color="green lighten-2">
                        <v-card-text class="px-0">{{key}}</v-card-text>
                      </v-card>
                    </v-flex>
                    <v-flex xs8>
                      <v-card dark color="green">
                        <v-card-text class="px-0" style="align-text: left;">{{toFixed(cam.params.external[key]._data, 8)}}</v-card-text>
                      </v-card>
                    </v-flex>
                  </v-layout> -->

                </v-container>
              </v-card-text>
            </v-slide-y-transition>
          </v-card>
        </v-tab-item>

        <!-- Añadir una cámara -->
        <v-tab-item>
          <v-card light>
            <v-card-text>
              <v-text-field light label="Nombre de la cámara" v-model="newCameraName"  class="ma-0"></v-text-field>
            </v-card-text>
          </v-card>

          <v-card light class="mt-2">
            <v-card-text>
              <v-select :items="parametersOpt" v-model="selectedParameters" light label="Parámetros a calcular" ></v-select>
              <v-select v-show="selectedParameters == optionsParametersKeys.ORIENTATIONS_DISTORTIONS" :items="[4, 5, 8]" :hint="distortionParamsMapping[numParams].join(', ')" persistent-hint light v-model="numParams" label="Número de parámetros"></v-select>
            </v-card-text>
          </v-card>

          <v-card light class="mt-2">
            <v-card-text> 
              <v-select
                :items="validImages"
                v-model="selectedImage"
                label="Selecciona la imagen"
                light
                chips
                max-height="auto"
              >
                <template slot="selection" slot-scope="data">
                  <v-chip
                    :selected="data.selected"
                    :key="JSON.stringify(data.item)"
                    close
                    light
                    class="chip--select-multi"
                    @input="data.parent.selectItem(data.item)"
                  >
                    <v-avatar>
                      <img :src="data.item">
                    </v-avatar>
                    {{ getBasename(data.item) }}
                  </v-chip>
                </template>
                <template slot="item" slot-scope="data">
                  <v-list-tile-avatar>
                    <img :src="data.item">
                  </v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title v-html="getBasename(data.item)"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="'Puntos de Control: ' + (controlPoints[data.item] || []).length"></v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-card-text>
          </v-card>

          <v-card light class="mt-2">
            <v-card-actions>
              <v-btn block light :disabled="!formValid" @click="calculateCameraParameters" flat color="green">Calcular</v-btn>
            </v-card-actions>
          </v-card>


        </v-tab-item>

      </v-tabs-items>
    </v-container>

  </v-navigation-drawer>
</template>

<script>
import nodePath from 'path'

import * as CameraUtil from '../../lib/dlt'


export default {
  data() {
    return {
      indexOpened: new Set([]),

      tabs: null,
      newCameraName: null,
      optionsParametersKeys: {
        "ORIENTATIONS": "OI, OE",
        "ORIENTATIONS_DISTORTIONS": "OI, OE, distorsiones"
      },
      optionsParameters: {
        "OI, OE": 6,
        "OI, OE, distorsiones": -1
      },
      selectedParameters: 'OI, OE',
      selectedImage: null,

      distortionParamsMapping: {
        //"numParamsTotal": [paramsK, paramsP]
        4: ['K1', 'K2', 'P1', 'P2'],
        5: ['K1', 'K2', 'K3', 'P1', 'P2'],
        8: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'P1', 'P2'],
      },

      numParams: 4
    }
  },

  methods: {
    toFixed(array) {
      const nArr = []
      for(const x of array) {
        if(Array.isArray(x)) {
          nArr.push(this.toFixed(x))
        } else {
          nArr.push(+x.toFixed(4))
        }
      }

      return nArr
    },

    resetForm() {
      this.newCameraName = null
      this.selectedImage = null
    },

    getBasename(path) {
      return nodePath.basename(path)
    },

    toggleInfo(name) {
      console.log(name, this.indexOpened, this.indexOpened.has(name))
      if(this.indexOpened.has(name)) {
        this.indexOpened.delete(name)
      } else {
        this.indexOpened.add(name)
      }

      this.indexOpened = new Set([...this.indexOpened])
    },

    isValidImageForParameters(path) {
      const controlPoints = this.controlPoints[path] || []
      const numControlPoints = controlPoints.length

      let minNumberPoints = this.optionsParameters[this.selectedParameters]

      if(minNumberPoints == -1) {
        minNumberPoints = Math.ceil((11 + this.numParams) / 2)
      }

      return numControlPoints >= minNumberPoints
    },

    calculateCameraParameters() {
      const controlPoints = this.controlPoints[this.selectedImage]

      const points2d = controlPoints.map(([p2d, p3d]) => p2d)
      const points3d = controlPoints.map(([p2d, p3d]) => p3d)

      console.log(points2d, points3d)

      let result = null
 
      switch(this.selectedParameters) {
        case "OI, OE":
          result = CameraUtil.getCameraParameters(points2d, points3d)
        break;
        case "OI, OE, distorsiones": 
          result = CameraUtil.getCameraParameters(points2d, points3d, this.numParams)
        break;
      }

      this.$store.dispatch('addCamera', [this.newCameraName, result])

      this.resetForm()
    }
  },

  computed: {
    formValid() {
      return !!this.newCameraName && !!this.selectedImage && !!this.selectedParameters
    },

    parametersOpt() {
      return Object.keys(this.optionsParameters)
    },

    validImages() {
      return this.images.filter(this.isValidImageForParameters)
    },

    images() {
      return this.$store.getters.images
    },

    controlPoints() {
      return this.$store.getters.controlPoints
    },

    dialogCalculateCameraOpened: {
      get() {
        return this.$store.getters.dialogCalculateCameraOpened
      },
      set(value) {
        this.$store.dispatch('setDialogCalculateCameraOpened', value)
      }
    },

    cameras() {
      const cameras = this.$store.getters.cameras
      const cameraNames = Object.keys(cameras)

      return cameraNames.map(name => ({name, params: { ...cameras[name] }}))
    }
  },

  watch: {
    selectedParameters() {
      this.selectedImage = null
    }
  }
}
</script>
