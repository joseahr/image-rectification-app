<template>
  <v-card 
    class="mx-3 mt-3" 
    :color="path == actualImage ? 'green' : 'white'" 
    :dark="path == actualImage" 
    :light="path != actualImage"
  >
    <v-toolbar
      :dark="path == actualImage" 
      :light="path != actualImage"
      :color="path == actualImage ? 'green' : 'white'" 
      style="z-index: 1;"
      flat
    >
      <v-toolbar-title>{{getBasename(path)}}</v-toolbar-title>

        <v-btn
          class="btn-add-cp"
          small
          absolute
          bottom
          right
          fab
          @click="toggleCapturingControlPoints"
          :disabled="actualImage != path"
          :color="capturingControlPoints ? 'green darken-4' : 'white'"
        >
        
          <v-icon
            :color="path == actualImage && capturingControlPoints ? 'white' : 'black'"
          >add</v-icon>
        </v-btn>

    </v-toolbar>

    <v-card-media height="150px">
      <img :src="path" alt="" style="width: 100%; height: 100%; object-fit: cover;">
    </v-card-media>
    <v-card-actions>

      <v-tooltip top>
        <v-btn 
          flat icon 
          :dark="path == actualImage"
          :light="path != actualImage"
          @click="deleteImage(path)"
          slot="activator"
          :disabled="actualImage == path"
        >
          <v-icon color="red">delete</v-icon>
        </v-btn>
        <span>Eliminar Imagen</span>
      </v-tooltip>

      <v-spacer></v-spacer>

      <v-tooltip top>
        <v-btn
          color="green darken-4"
          icon
          :disabled="path != actualImage"
          @click="controlPointListOpened = true"
          slot="activator"
        >
          <span class="white--text">{{controlPoints.length}}</span>
        </v-btn>
        <span>Puntos de apoyo</span>
      </v-tooltip>


      <v-tooltip top>
        <v-btn 
          flat icon 
          :dark="path == actualImage"
          :light="path != actualImage"
          @click="actualImage = actualImage == path ? null : path"
          slot="activator"
        >
          <v-icon>{{actualImage == path ? 'close' : 'open_in_new'}}</v-icon>
        </v-btn>
        <span>{{actualImage == path ? 'Cerrar' : 'Abrir'}} imagen</span>
      </v-tooltip>

    </v-card-actions>
  </v-card>
</template>

<script>
import nodePath from 'path'

export default {
  data() {
    return {
      clickHandler: null
    }
  },
  props: ['path'],
  methods: {
    getBasename(p) {
      return nodePath.basename(p)
    },

    toggleCapturingControlPoints() {
      this.capturingControlPoints = !this.capturingControlPoints
    },

    deleteImage(image) {
      this.$store.dispatch('deleteImage', image)
    }
  },

  computed: {

    controlPointListOpened: {
      get() { return this.$store.getters.controlPointListOpened },
      set(value) { this.$store.dispatch('setControlPointListOpened', value) }
    },

    actualImage: {
      get() { return this.$store.getters.actualImage },
      set(image) { this.$store.dispatch('setActualImage', image)}
    },

    capturingControlPoints: {
      get() { return this.$store.getters.capturingControlPoints },
      set(value) { this.$store.dispatch('setCapturingControlPoints', value) }
    },

    controlPoints() {
      return this.$store.getters.controlPoints[this.path] || []
    }
  }
}
</script>
