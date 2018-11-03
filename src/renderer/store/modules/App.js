import Vue from 'vue'
import util from 'util'
const gm = require('gm').subClass({imageMagick: true})

const state = {
  renderer: null,

  imagesMenuOpened: false,
  mainMenuOpened: false,
  controlPointListOpened: false,
  dialogCalculateCameraOpened: false,
  dialogRectifyOpened: false,
  dialogMosaicOpened: false,

  miniMenu: false,

  actualImage: null,
  controlPoints: {
    //"pathImagen": [ [[x, y], [X, Y, Z]], [[x, y], [X, Y, Z]] ]
  },

  capturingControlPoints: false,
  updatingControlPointImageCoords: false,

  images: [],
  cameras: {
    
  }
}

let imageId = 0

const SET_RENDERER_MUTATION = 'SET_RENDERER'
const SET_ACTUAL_IMAGE_MUTATION = 'SET_ACTUAL_IMAGE'
const ADD_IMAGES_MUTATION = 'ADD_IMAGES'
const OPEN_MAIN_MENU_MUTATION = 'OPEN_MAIN_MENU'
const OPEN_IMAGES_MENU = 'OPEN_IMAGES_MENU'
const SET_MINI_MENU_MUTATION = 'SET_MINI_MENU'

const DELETE_IMAGE_MUTATION = 'DELETE_IMAGE'

const ADD_CONTROL_POINT_MUTATION = 'ADD_CONTROL_POINT'

const UPDATE_CONTROL_POINT_MUTATION = 'UPDATE_CONTROL_POINT'

const DELETE_CONTROL_POINT = 'DELETE_CONTROL_POINT'


const SET_CAPTURING_CONTROL_POINTS_MUTATION = 'SET_CAPTURING_CONTROL_POINTS'

const SET_UPDATING_CONTROL_POINT_IMAGE_COORDS = 'SET_UPDATING_CONTROL_POINT_IMAGE_COORDS'

const SET_MENU_CONTROL_POINTS_OPENED = 'SET_MENU_CONTROL_POINTS_OPENED'

const SET_DIALOG_CALCULATE_CAMERA_OPENED = 'SET_DIALOG_CALCULATE_CAMERA_OPENED'
const SET_DIALOG_RECTIFY_OPENED = 'SET_DIALOG_RECTIFY_OPENED'
const SET_DIALOG_MOSAIC_OPENED = 'SET_DIALOG_MOSAIC_OPENED'


const ADD_CAMERA = 'ADD_CAMERA'
const DELETE_CAMERA = 'DELETE_CAMERA'


const mutations = {
  [SET_RENDERER_MUTATION] (state, renderer) {
    console.log('MUTATION SET RENDERER', renderer)
    state.renderer = renderer
  },

  [SET_ACTUAL_IMAGE_MUTATION] (state, image) {
    state.capturingControlPoints = false
    state.actualImage = image
  },

  [ADD_IMAGES_MUTATION] (state, images) {
    // console.log(images.map(path => ({ path, id: imageId++ }) ))
    for(const path of images) {
      if(state.images.findIndex(p => p == path) == -1) {
        gm(path).autoOrient().write(path, (err) => {console.log(err)})
        state.images.push(path)
      }
    }
  },

  [DELETE_IMAGE_MUTATION](state, image) {
    const idx = state.images.findIndex(path => path == image)

    state.images.splice(idx, 1)

    delete state.controlPoints[image]
  },

  [OPEN_MAIN_MENU_MUTATION] (state, opened) {
    state.mainMenuOpened = opened

    if(!opened) {
      state.imagesMenuOpened = false
      state.controlPointListOpened = false
      state.dialogCalculateCameraOpened = false
    }
  },

  [SET_MINI_MENU_MUTATION] (state, mini) {
    state.miniMenu = mini
  },

  [OPEN_IMAGES_MENU] (state, opened) {
    state.imagesMenuOpened = opened
  },

  [ADD_CONTROL_POINT_MUTATION] (state, controlPoint) {
    if(!state.controlPoints[state.actualImage]) {
      state.controlPoints = {...state.controlPoints, [state.actualImage]: [] }
    }
    console.log('Changed', state.actualImage)

    state.controlPoints = {...state.controlPoints, [state.actualImage]: [...state.controlPoints[state.actualImage], controlPoint] }
  },

  [DELETE_CONTROL_POINT] (state, index) {
    const copy = state.controlPoints[state.actualImage].slice()
    copy.splice(index, 1)
    state.controlPoints = {...state.controlPoints, [state.actualImage]: copy}
  },

  [UPDATE_CONTROL_POINT_MUTATION] (state, values) {
    const { coordsImage, coordsObject, index } = values

    const controlPointsState = state.controlPoints[state.actualImage].slice()

    console.log(controlPointsState, index)

    const _cp = controlPointsState[index].slice()

    const controlPoint = [coordsImage || _cp[0] || [], coordsObject || _cp[1] || []]

    controlPointsState[index] = controlPoint

    state.controlPoints = {...state.controlPoints, [state.actualImage]: controlPointsState }
  },

  [SET_CAPTURING_CONTROL_POINTS_MUTATION](state, value) {
    state.capturingControlPoints = !!value
  },

  [SET_UPDATING_CONTROL_POINT_IMAGE_COORDS] (state, value) {
    state.updatingControlPointImageCoords = value
  },

  [SET_MENU_CONTROL_POINTS_OPENED] (state, value) {
    state.controlPointListOpened = value
  },

  [SET_DIALOG_CALCULATE_CAMERA_OPENED] (state, value) {
    state.dialogCalculateCameraOpened = value
  },

  [SET_DIALOG_MOSAIC_OPENED] (state, value) {
    state.dialogMosaicOpened = value
  },

  [SET_DIALOG_RECTIFY_OPENED] (state, value) {
    state.dialogRectifyOpened = value
  },

  [ADD_CAMERA](state, [name, cameraParams]) {
    state.cameras = {...state.cameras, [name]: cameraParams}
  },

  [DELETE_CAMERA](state, name) {
    delete state.cameras[name]
    state.cameras = {...state.cameras}
  },

  loadProject(state, newState) {
    state.controlPoints = {}
    state.images = newState.images
    state.controlPoints = newState.controlPoints
    state.cameras = newState.cameras
  },

}

const actions = {
  setRenderer ({ commit }, renderer) {
    console.log('ACTION ST RENDERER', renderer)
    commit(SET_RENDERER_MUTATION, renderer)
  },
  setActualImage ({ commit }, image) {
    console.log('SET ACTUAL IMAGE', image)
    commit(SET_ACTUAL_IMAGE_MUTATION, image)
  },

  setImages({commit}, images) {
    commit(ADD_IMAGES_MUTATION, images)
  },

  deleteImage({commit}, image) {
    commit(DELETE_IMAGE_MUTATION, image)
  },

  openMainMenu({commit}, opened) {
    commit(OPEN_MAIN_MENU_MUTATION, opened)
  },

  setMiniMenu({commit}, mini) {
    commit(SET_MINI_MENU_MUTATION, mini)
  },

  openImagesMenu({commit}, opened) {
    if(opened) {
      commit(SET_MINI_MENU_MUTATION, false)
      // commit(OPEN_MAIN_MENU_MUTATION, true)
    }
    commit(OPEN_IMAGES_MENU, opened)
  },

  addControlPoint({commit}, controlPoint) {
    commit(ADD_CONTROL_POINT_MUTATION, controlPoint)
  },

  updateControlPoint({commit}, values) {
    commit(UPDATE_CONTROL_POINT_MUTATION, values)
  },

  deleteControlPoint({commit}, index) {
    commit(DELETE_CONTROL_POINT, index)
  },

  setCapturingControlPoints({commit}, value) {
    commit(SET_CAPTURING_CONTROL_POINTS_MUTATION, value)
  },

  setUpdateControlPointImageCoords({commit}, value) {
    commit(SET_UPDATING_CONTROL_POINT_IMAGE_COORDS, value)
  },

  setControlPointListOpened({commit}, value) {
    commit(SET_MENU_CONTROL_POINTS_OPENED, value)
  },

  setDialogCalculateCameraOpened({commit}, value) {
    commit(SET_DIALOG_CALCULATE_CAMERA_OPENED, value)
  },

  setDialogRectifyOpened({commit}, value) {
    commit(SET_DIALOG_RECTIFY_OPENED, value)
  },

  setDialogMosaicOpened({commit}, value) {
    commit(SET_DIALOG_MOSAIC_OPENED, value)
  },

  addCamera({commit}, value) {
    commit(ADD_CAMERA, value)
  },

  deleteCamera({commit}, value) {
    commit(DELETE_CAMERA, value)
  },

  loadProject({commit}, value) {
    commit('loadProject', value)
  },
}

const getters = {
  renderer({renderer}) {
    return renderer
  },
  actualImage({actualImage}) {
    return actualImage
  },

  images({images}) {
    return images
  },

  mainMenuOpened({mainMenuOpened}) {
    return mainMenuOpened
  },

  miniMenu({miniMenu}) {
    return miniMenu
  },

  imagesMenuOpened({imagesMenuOpened}) {
    return imagesMenuOpened
  },

  controlPoints({controlPoints}) {
    return controlPoints
  },

  capturingControlPoints({capturingControlPoints}) {
    return capturingControlPoints
  },

  updatingControlPointImageCoords({updatingControlPointImageCoords}) {
    return updatingControlPointImageCoords
  },

  controlPointListOpened({controlPointListOpened}) {
    return controlPointListOpened
  },

  dialogCalculateCameraOpened({dialogCalculateCameraOpened}) {
    return dialogCalculateCameraOpened
  },

  dialogRectifyOpened({dialogRectifyOpened}) {
    return dialogRectifyOpened
  },

  dialogMosaicOpened({dialogMosaicOpened}) {
    return dialogMosaicOpened
  },

  cameras({cameras}) {
    return cameras
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
