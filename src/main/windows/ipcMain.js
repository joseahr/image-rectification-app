
import electron from 'electron'

import { createWindow as createAddPointWindow } from './add-point'
import { createWindow as createUpdatePointWindow } from './update-point'


import { loadImages } from './main'

const { ipcMain } = electron

// Main

export default () => {
    // Abrir menú para seleccionar múltiples imágenes
    ipcMain.on('open-images-menu', loadImages)

    ipcMain.on('add-control-point', (event, data) => {
        // console.log('ADD CONTROL POINT IPCMAIN')
        electron.BrowserWindow
            .getFocusedWindow()
            .getParentWindow()
            .send('add-control-point-mw', data)
    })

    ipcMain.on('update-terrain-coords-control-point', (event, data) => {
        electron.BrowserWindow
            .getFocusedWindow()
            .getParentWindow()
            .send('update-terrain-coords-control-point-mw', data)
    })

    // Añadir punto
    ipcMain.on('open-add-point-dialog', (event, data) => {
        const [x, y] = data
        createAddPointWindow(x, y)
    })

    ipcMain.on('open-update-point-dialog', (event, data) => {
        const {index, coordsObject, coordsImage} = data
        const [x, y] = coordsImage
        const [X, Y, Z] = coordsObject
        createUpdatePointWindow(index, x, y, X, Y, Z)
    })

    ipcMain.on('delete-control-point', (event, index) => {
        electron.BrowserWindow
            .getFocusedWindow()
            .getParentWindow()
            .send('delete-control-point-mw', index)
    })

}

