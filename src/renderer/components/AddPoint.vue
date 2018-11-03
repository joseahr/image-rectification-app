<template>
  <v-layout justify-center>
    <v-flex xs12 sm10 md8 lg6>
      <v-card ref="form">
        <v-card-text>

          <v-subheader>Coordenadas Imagen</v-subheader>

          <v-text-field
            disabled
            label="x"
            placeholder="Coordenada x"
            v-model="x"
            required
            ref="x"
            :value="x"
            suffix="px"
          ></v-text-field>

          <v-text-field
            disabled
            label="y"
            placeholder="Coordenada y"
            v-model="y"
            required
            ref="y"
            :value="y"
            suffix="px"
          ></v-text-field>

          <v-subheader>Coordenadas Terreno/Objeto</v-subheader>

          <v-text-field
            label="X"
            placeholder="Coordenada X"
            v-model="X"
            required
            ref="X"
            :rules="[() => !!X || 'Este campo es requerido', () => !isNaN(+X) || 'El campo debe ser numérico']"
            :error-messages="errorMessages"
            :value="X"
          ></v-text-field>

          <v-text-field
            label="Y"
            placeholder="Coordenada Y"
            v-model="Y"
            required
            ref="Y"
            :rules="[() => !!Y || 'Este campo es requerido', () => !isNaN(+Y) || 'El campo debe ser numérico']"
            :error-messages="errorMessages"
            :value="Y"
          ></v-text-field>

          <v-text-field
            label="Z"
            placeholder="Coordenada Z"
            v-model="Z"
            required
            ref="Z"
            :rules="[() => !!Z || 'Este campo es requerido', () => !isNaN(+Z) || 'El campo debe ser numérico']"
            :error-messages="errorMessages"
            :value="Z"
          ></v-text-field>

        </v-card-text>
        <v-divider class="mt-5"></v-divider>
        <v-card-actions style="position: fixed; bottom: 0px; width: 100%; background: white;">

          <v-btn flat @click="closeWindow">Cancelar</v-btn>

          <v-spacer></v-spacer>

          <v-slide-x-reverse-transition>
            <v-tooltip
              left
              v-if="action == 1"
            >
              <v-btn
                icon
                @click="deletePoint"
                slot="activator"
                class="my-0"
              >
                <v-icon color="red">delete</v-icon>
              </v-btn>
              <span>Eliminar punto</span>
            </v-tooltip>
          </v-slide-x-reverse-transition>

          <v-slide-x-reverse-transition>
            <v-tooltip
              left
              v-if="formHasErrors"
            >
              <v-btn
                icon
                @click="resetForm"
                slot="activator"
                class="my-0"
              >
                <v-icon>refresh</v-icon>
              </v-btn>
              <span>Limpiar Formulario</span>
            </v-tooltip>
          </v-slide-x-reverse-transition>

          <v-btn color="primary" flat :disabled="formHasErrors" @click.stop="submit">{{action == 0 ? 'Añadir' : 'Actualizar'}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>

const ACTION_CREATE = 0
const ACTION_UPDATE = 1

export default {
  data() {
    return {
      index: null,
      x: null, y: null,
      X: null, Y: null, Z: null,
      errorMessages: [],
      formHasErrors: false,
      action: null
    }
  },
  created() {
    // console.log(this.$route)

    this.action = !!this.$route.fullPath.match(/updatepoint/)
      ? ACTION_UPDATE
      : ACTION_CREATE

    const { index, x, y, X, Y, Z } = this.$route.params

    if (this.action == ACTION_UPDATE) {
      this.index = +index
      this.x = +x
      this.y = +y
      this.X = X
      this.Y = Y
      this.Z = Z
    } else {
      this.x = +x
      this.y = +y
    }

  },

  computed: {
    form() {
      return {
        X: +this.X, Y: +this.Y, Z: +this.Z,
      }
    }
  },

  methods: {
    closeWindow() {
      this.$electron.remote.getCurrentWindow().close()
    },

    resetForm() {
      this.errorMessages = []
      this.formHasErrors = false

      Object.keys(this.form).forEach(f => {
        this.$refs[f].reset()
      })
    },

    deletePoint() {
      this.$electron.ipcRenderer.send('delete-control-point', this.index)
      this.closeWindow()
    },

    submit() {

      this.formHasErrors = false

      Object.keys(this.form).forEach(f => {
        if (isNaN(this.form[f])) this.formHasErrors = true

        this.$refs[f].validate(true)
      })

      console.log('SUBMIT', this.formHasErrors)

      if(!this.formHasErrors) {
        if(this.action == ACTION_CREATE) {
          this.$electron.ipcRenderer.send('add-control-point', 
                                          [ [this.x, this.y], 
                                            [this.X, this.Y, this.Z] ])
        } else {
          this.$electron.ipcRenderer.send('update-terrain-coords-control-point', 
                                          [ this.index,
                                            [this.X, this.Y, this.Z] ])
        }

        this.closeWindow()
      }
    }

  }
}
</script>
