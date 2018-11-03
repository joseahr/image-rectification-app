<template>
  <v-navigation-drawer dark fixed v-model="dialogMosaicOpened" disable-resize-watcher>
    <v-list class="py-0">
      <v-list-tile>
        <v-list-tile-action>
          <v-btn icon @click="dialogMosaicOpened = false">
            <v-icon>arrow_back</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-title>
          <h2>Mosaico</h2>
        </v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
    </v-list>

    <v-container fluid>
      <v-card light class="mt-2">
        <v-card-actions>
          <v-btn :disabled="!images.length || !!!savePath" block light @click="calculateMosaic" flat color="green">Crear Mosaico</v-btn>
        </v-card-actions>
      </v-card>
      
      <v-card light class="mt-2">
        <v-card-actions>
          <v-btn block light @click="showSaveDialog" flat color="green">Guardar como</v-btn>
        </v-card-actions>
        <v-card-text v-show="!!savePath">{{savePath}}</v-card-text>
      </v-card>

      <v-card light class="mt-2">
        <v-card-actions>
          <v-btn block light @click="openImages" flat color="green">Abrir Imágenes</v-btn>
        </v-card-actions>
        
        <v-card-text v-show="!!images.length">
          <v-list light class="py-0">
            <v-list-tile class="py-1" v-for="(image, index) in images" :key="index">
              <v-list-tile-action>
                <v-avatar>
                  <img :src="image" alt="">
                </v-avatar>
              </v-list-tile-action>
              <v-list-tile-title>
                <p>{{getBasename(image)}}</p>
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>

  </v-navigation-drawer>
</template>

<script>
import nodePath from 'path'
import { spawn } from 'child_process'

export default {
  data() {
    return {
      images: [],
      savePath: null
    }
  },

  methods: {
    getBasename(path) {
      return nodePath.basename(path)
    },

    showSaveDialog() {
      this.savePath = this.$electron.remote.dialog
        .showSaveDialog(this.$electron.remote.BrowserWindow.getFocusedWindow(),
          { filters: [{name: 'Imágenes (JPG)', extensions: ['jpg']}]})
    },

    openImages() {
      console.log(this.$electron)
      this.images = (this.$electron.remote.dialog.showOpenDialog(this.$electron.remote.BrowserWindow.getFocusedWindow(), {
        title: 'Añadir imágenes al mosaico',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Imágenes (JPG, PNG)', extensions: ['png', 'jpg'] }]
      }) || []).map(path => `file:///${path}`)
    },

    calculateMosaic() {
      console.log('calculating mosaic', nodePath.resolve(__dirname, '../../opencv/mosaic/main.py'))
      const pycv = spawn('python', [
        nodePath.resolve(__dirname, '../../opencv/mosaic/main.py'),
        this.savePath,
        ...this.images.map(str => str.replace('file:///', ''))
      ])

      pycv.stdout.on('data', (data) => console.log(data.toString(), 'data'))

      pycv.stdout.on('error', error => {
        console.log(error, 'error')
      })

      pycv.stdout.on('close', () => console.log('close'))

    }
  },

  computed: {
    dialogMosaicOpened: {
      get() {
        return this.$store.getters.dialogMosaicOpened
      },
      set(value) {
        this.$store.dispatch('setDialogMosaicOpened', value)
      }
    }
  },
}
</script>
