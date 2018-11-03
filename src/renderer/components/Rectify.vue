<template>
  <v-navigation-drawer dark fixed v-model="dialogRectifyOpened" disable-resize-watcher>
    <v-list class="py-0">
      <v-list-tile>
        <v-list-tile-action>
          <v-btn icon @click="dialogRectifyOpened = false">
            <v-icon>arrow_back</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-title>
          <h2>Rectificación</h2>
        </v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
    </v-list>

    <v-container fluid>

      <v-card light class="mt-2">
        <v-card-actions>
          <v-btn block light @click="showSaveDialog" flat color="green">Guardar como</v-btn>
        </v-card-actions>
        <v-card-text v-show="!!savePath">{{savePath}}</v-card-text>
      </v-card>

      <v-card light class="mt-2">
        <v-card-text style="align-self: center;">
          <h3>Rectificar mediante puntos de fuga</h3>
        </v-card-text>
        <v-card-actions>
          <v-checkbox light v-model="vanishingPointsMethod" label="Vanishing Points"></v-checkbox>
        </v-card-actions>
      </v-card>

      <!-- Añadir una cámara -->
      <v-card light class="mt-2">
        <v-card-text> 
          <v-select
            :items="cameras"
            v-model="selectedCamera"
            label="Selecciona la cámara"
            light
            chips
            max-height="auto"
            :disabled="vanishingPointsMethod"
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
                  <v-icon>photo</v-icon>
                </v-avatar>
                {{ data.item.name }}
              </v-chip>
            </template>
            <template slot="item" slot-scope="data">
              <v-list-tile-avatar>
                <v-icon>photo</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
                <!-- <v-list-tile-sub-title v-html="'Puntos de Control: ' + (controlPoints[data.item] || []).length"></v-list-tile-sub-title> -->
              </v-list-tile-content>
            </template>
          </v-select>
        </v-card-text>
      </v-card>

      <v-card light class="mt-2">
        <v-card-text> 
          <v-select
            :items="validImages"
            v-model="selectedImage"
            label="Selecciona las imágenes"
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
          <v-btn :disabled="!vanishingPointsMethod && !(selectedCamera && selectedImage && !!savePath)" block light @click="calculateRectification" flat color="green">Rectificar</v-btn>
        </v-card-actions>
      </v-card>

    </v-container>

  </v-navigation-drawer>
</template>

<script>
import nodePath from 'path'
import { spawn } from 'child_process'

import * as CameraUtil from '../../lib/dlt'

export default {
  data() {
    return {
      savePath: null,
      selectedImage: null,
      selectedCamera: null,
      vanishingPointsMethod: false
    }
  },

  methods: {

    getBasename(path) {
      return nodePath.basename(path)
    },

    isValidImageForParameters(path) {
      const controlPoints = this.controlPoints[path] || []
      const numControlPoints = controlPoints.length

      return numControlPoints >= 6
    },

    showSaveDialog() {
      this.savePath = this.$electron.remote.dialog
        .showSaveDialog(this.$electron.remote.BrowserWindow.getFocusedWindow(),
          { filters: [{name: 'Imágenes (JPG)', extensions: ['jpg']}]})
      console.log(this.savePath)
    },

    calculateCameraParameters() {
      const controlPoints = this.controlPoints[this.selectedImage]

      const points2d = controlPoints.map(([p2d, p3d]) => p2d)
      const points3d = controlPoints.map(([p2d, p3d]) => p3d)

      return CameraUtil.getCameraParameters(points2d, points3d)
    },

    calculateRectification() {

      if(this.vanishingPointsMethod) {
        const cp = this.controlPoints[this.selectedImage]

        const pycv = spawn('python', [
          nodePath.resolve(__dirname, '../../opencv/rectify/rectify.py'),
          this.selectedImage.replace('file:///', ''),
        ])

        pycv.stdout.on('data', (data) => console.log(data.toString(), 'data'))

        pycv.stdout.on('error', error => {
          console.log(error, 'error')
        })

        pycv.stdout.on('close', () => console.log('close'))
      } else {
        const internal = this.selectedCamera.params.internal
        const distortions = this.selectedCamera.params.distortions
        const external = this.calculateCameraParameters().external

        const f = internal.f
        const h = internal.h
        const R = external.R.valueOf()

        const fx = f
        const fy = f * h

        const cx = internal.xo
        const cy = internal.yo

        const r1 = R[0]
        const r2 = R[1]
        const r3 = R[2]

        console.log(R, distortions)

        const pycv = spawn('python', [
          nodePath.resolve(__dirname, '../../opencv/rectify/main.py'),
          this.selectedImage.replace('file:///', ''),
          this.savePath,
          fx, fy, cx, cy,
          ...r1, ...r2, ...r3,
          ...(distortions || [])
        ])


        pycv.stdout.on('data', (data) => console.log(data.toString(), 'data'))

        pycv.stdout.on('error', error => {
          console.log(error, 'error')
        })

        pycv.stdout.on('close', () => console.log('close'))
      }

    }
  },

  computed: {

    validImages() {
      if(this.vanishingPointsMethod) {
        return this.images
      }

      return this.images.filter(this.isValidImageForParameters)
    },

    images() {
      return this.$store.getters.images
    },

    controlPoints() {
      return this.$store.getters.controlPoints
    },

    dialogRectifyOpened: {
      get() {
        return this.$store.getters.dialogRectifyOpened
      },
      set(value) {
        this.$store.dispatch('setDialogRectifyOpened', value)
      }
    },

    cameras() {
      const cameras = this.$store.getters.cameras
      const cameraNames = Object.keys(cameras)

      return cameraNames.map(name => ({name, params: { ...cameras[name] }}))
    }
  },
}
</script>
