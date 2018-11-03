<template>
  <main>
    <v-snackbar right bottom absolute :timeout="0" v-model="capturingControlPoints">Haz click sobre la imagen para añadir puntos de control</v-snackbar>
    <v-snackbar right bottom absolute :timeout="0" v-model="updatingControlPointImageCoords">Mueve el punto a una nueva posición</v-snackbar>
  </main>
</template>

<script>
export default {
  computed: {
    capturingControlPoints() {
      return this.$store.getters.capturingControlPoints
    },

    updatingControlPointImageCoords() {
      return this.$store.getters.updatingControlPointImageCoords
    }
  }
}
</script>
