<template>
  <v-app>
    <app-navigation></app-navigation>
    <app-image-gallery></app-image-gallery>
    <app-control-point-list></app-control-point-list>
    <app-calculate-camera-dialog></app-calculate-camera-dialog>

    <app-rectify></app-rectify>
    <app-mosaic></app-mosaic>

    <v-content style="max-height: 100vh;">
      <router-view></router-view>
      <app-snackbars></app-snackbars>
    </v-content>
  </v-app>
</template>

<script>

  import AppNavigation from './components/Navigation'
  import AppImageGallery from './components/ImageGallery'
  import AppControlPointList from './components/ControlPointList'
  import AppCalculateCameraDialog from './components/CalculateCamera'

  import AppRectify from './components/Rectify'
  import AppMosaic from './components/Mosaic'

  import AppSnackbars from './components/SnackBars'

  export default {
    name: 'patrimonio-electron-vue',
    created() {
      this.$electron.ipcRenderer.on('toggle-main-menu', () => {
        console.log('Main Menu Open')
        this.$store.dispatch('openMainMenu', !this.$store.getters.mainMenuOpened)
      })

      this.$electron.ipcRenderer.on('load-images', (event, images) => {
        console.log('images', images)
        this.$store.dispatch('setImages', images)
      })

      this.$electron.ipcRenderer.on('add-control-point-mw', (event, data) => {
        console.log('Add control point MW')
        this.$store.dispatch('addControlPoint', data)
      })

      this.$electron.ipcRenderer.on('delete-control-point-mw', (event, index) => {
        this.$store.dispatch('deleteControlPoint', index)
      })

      this.$electron.ipcRenderer.on('update-terrain-coords-control-point-mw', (event, data) => {
        console.log('Add control point MW')
        const [index, coordsObject] = data
        this.$store.dispatch('updateControlPoint', {index, coordsObject})
      })

      this.$electron.ipcRenderer.on('get-state', () => {
        this.$electron.ipcRenderer.send('return-state', this.$store.getters)
      })

      this.$electron.ipcRenderer.on('load-project', (event, state) => {
        this.$store.dispatch('loadProject', state)
      })

    },
    components: {
      AppNavigation,
      AppControlPointList,
      AppImageGallery,
      AppCalculateCameraDialog,

      AppRectify,
      AppMosaic,

      AppSnackbars
    },
    computed: {
      drawer: {
        get() { return this.$store.getters.mainMenuOpened },
        set(opened) { this.$store.dispatch('openMainMenu', opened)}
      },
    }
  }
</script>