<template>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="mini"
      dark
      fixed
      app
    >
      <v-list class="pa-1">
        <v-list-tile v-if="mini" @click.stop="mini = !mini">
          <v-list-tile-action>
            <v-icon>chevron_right</v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile avatar tag="div">
          <v-list-tile-avatar>
            <img src="https://mobilendo.com/wp-content/uploads/2014/03/upv-mobilendo-logo.png" >
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title><h3>ETSIGCT</h3></v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon @click.stop="mini = !mini">
              <v-icon>chevron_left</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-list class="pt-0" dense>
        <v-divider light></v-divider>
        
        <v-list-tile class="pt-0" @click="$store.dispatch('openImagesMenu', true)">
          <v-list-tile-action>
            <v-badge overlap color="orange">
              <span slot="badge">{{images.length}}</span>
              <v-icon>photo</v-icon>
            </v-badge>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title><h3>Imágenes</h3></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-for="item in items" :key="item.title" @click="item.click">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title><h3>{{ item.title }}</h3></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>
</template>


<script>
  export default {
    data () {
      return {
        items: [
          { title: 'Añadir Imágenes', icon: 'add_a_photo', click: this.openMenuForSelectImages },
          { title: 'Cámaras', icon: 'camera', click: this.openCalculateCameraDialog },
          { title: 'Rectificación', icon: 'aspect_ratio', click: this.openRectifyDialog },
          { title: 'Mosaico', icon: 'panorama_horizontal', click: this.openMosaicDialog },

        ],
      }
    },

    methods: {
      openMenuForSelectImages() {
        console.log('Send images')
        this.$electron.ipcRenderer.send('open-images-menu')
      },

      openCalculateCameraDialog() {
        this.$store.dispatch('setDialogCalculateCameraOpened', true)
      },

      openRectifyDialog() {
        this.$store.dispatch('setDialogRectifyOpened', true)
      },

      openMosaicDialog() {
        this.$store.dispatch('setDialogMosaicOpened', true)
      }
    },

    computed: {
      images: {
        get() { return this.$store.getters.images }
      },
      drawer: {
        get() { return this.$store.getters.mainMenuOpened },
        set(opened) { this.$store.dispatch('openMainMenu', opened)}
      },
      mini: {
        get() { return this.$store.getters.miniMenu },
        set(mini) { this.$store.dispatch('setMiniMenu', mini)}
      },
    }
  }
</script>