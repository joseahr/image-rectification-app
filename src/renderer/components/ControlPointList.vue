<template>
  <v-navigation-drawer dark fixed v-model="controlPointListOpened" disable-resize-watcher>
    <v-list class="pt-0">
      <v-list-tile>
        <v-list-tile-action>
          <v-btn icon @click="controlPointListOpened = false">
            <v-icon>arrow_back</v-icon>
          </v-btn>
        </v-list-tile-action>
        <v-list-tile-title>
          <h2>Puntos de Apoyo</h2>
        </v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
    </v-list>

    <v-card light v-for="(cp, idx) in controlPoints" :key="idx" class="mx-3 my-2">
      <v-card-actions>
        <h1> <span class="green--text">#</span> {{cp.index}}</h1>
        <v-spacer></v-spacer>
        <v-btn icon light flat color="green" @click="toggleInfo(cp.index)">
          <v-icon>{{ indexOpened.has(cp.index) ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}}</v-icon>
        </v-btn>
      </v-card-actions>

      <v-slide-y-transition>
        <v-card-text v-show="indexOpened.has(cp.index)">
          <v-flex xs12 class="mx-3" style="border-top: 1px solid #000; opacity: 0.35;"></v-flex>
          <v-container grid-list-md text-xs-center>
            <v-layout row wrap>

              <v-subheader light>
                <v-icon light color="green">photo</v-icon> Coordenadas Imagen
              </v-subheader>

              <v-flex xs4>
                <v-card dark color="green lighten-2">
                  <v-card-text class="px-0">x</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs8>
                <v-card dark color="green">
                  <v-card-text class="px-0">{{cp.x.toFixed(4)}}</v-card-text>
                </v-card>
              </v-flex>

              <v-flex xs4>
                <v-card dark color="green lighten-2">
                  <v-card-text class="px-0">y</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs8>
                <v-card dark color="green">
                  <v-card-text class="px-0">{{cp.y.toFixed(4)}}</v-card-text>
                </v-card>
              </v-flex>

              <v-subheader light>
                <v-icon light color="green">terrain</v-icon> Coordenadas Terreno/Objeto
              </v-subheader>

              <v-flex xs4>
                <v-card dark color="green lighten-2">
                  <v-card-text class="px-0">X</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs8>
                <v-card dark color="green">
                  <v-card-text class="px-0">{{(+cp.X).toFixed(4)}}</v-card-text>
                </v-card>
              </v-flex>


              <v-flex xs4>
                <v-card dark color="green lighten-2">
                  <v-card-text class="px-0">Y</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs8>
                <v-card dark color="green">
                  <v-card-text class="px-0">{{(+cp.Y).toFixed(4)}}</v-card-text>
                </v-card>
              </v-flex>

              <v-flex xs4>
                <v-card dark color="green lighten-2">
                  <v-card-text class="px-0">Z</v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs8>
                <v-card dark color="green">
                  <v-card-text class="px-0">{{(+cp.Z).toFixed(4)}}</v-card-text>
                </v-card>
              </v-flex>

            </v-layout>

          </v-container>
        </v-card-text>
      </v-slide-y-transition>
    </v-card>

  </v-navigation-drawer>    
</template>

<script>
export default {

  data() {
    return {
      indexOpened: new Set([])
    }
  },

  methods: {
    toggleInfo(index) {
      console.log(index, this.indexOpened, this.indexOpened.has(index))
      if(this.indexOpened.has(index)) {
        this.indexOpened.delete(index)
      } else {
        this.indexOpened.add(index)
      }

      this.indexOpened = new Set([...this.indexOpened])
    }
  },

  computed: {
    controlPointListOpened: {
      get() { return this.$store.getters.controlPointListOpened },
      set(value) { this.$store.dispatch('setControlPointListOpened', value) }
    },

    controlPoints() {
      const cp = this.$store.getters.controlPoints[this.$store.getters.actualImage]
      return (cp || [])
        .map(([[x, y], [X, Y, Z]], index) => ({index, x, y, X, Y, Z}) )
    }
  }
}
</script>
