import electron, { app, BrowserWindow } from 'electron'
import fs from 'fs'
import { createWindow as create3DWindow } from './3dviewer'

import StartEvents from './ipcMain'


const { ipcMain, Menu, dialog } = electron

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

export let window
  
export function createWindow() {
  /**
   * Initial window options
   */
  window = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      webSecurity: false,
      // devTools: false
    }
  })

  window.loadURL(winURL)

  window.on('closed', () => {
    window = null
  })

  window.setMenu(menu)

  StartEvents()

  return window
}


// Menú
const menuTemplate = [
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Guardar proyecto',
        accelerator: 'CmdOrCtrl+S',
        click: saveProject
      },
      {
        label: 'Abrir Proyecto',
        accelerator: 'CmdOrCtrl+O',
        click: loadProject
      }
    ]
  },
  {
    label: 'Edición',
    submenu: [
      {
        accelerator: 'CmdOrCtrl+M',
        label: 'Alternar Menú',
        click: openApplicationMenu
      },
      {
        accelerator: 'CmdOrCtrl+I',
        label: 'Añadir Imágenes',
        click: loadImages
      },
      {
        accelerator: 'CmdOrCtrl+3',
        label: 'Abrir Visor 3D',
        click: create3DWindow
      }
    ]
  },

  {
    label: 'Tareas',
    submenu: [
      {
        label: 'Rectificación',
      },
      {
        label: 'Mosaico',
      }
    ]
  },

  {
    label: 'Developer',
    submenu: [
      {
        label: 'Open Dev Tools',
        click: () => window.webContents.openDevTools()
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)


/**
 * Función para abrir/cerrar el menú principal
 * 
 */
function openApplicationMenu() {
  window.webContents.send('toggle-main-menu')
}

/**
 * Función para mostrar un diálogo y cargar múltiples imágenes
 * 
 */
export function loadImages() {
  console.log('Load images')
  const result = dialog.showOpenDialog(window, {
    title: 'Añadir imágenes al proyecto',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Imágenes (PNG, JPG)', extensions: ['png', 'jpg'] }]
  })

  if(!result) {
    return
  }
  
  // console.log(result, 'result')
  window.webContents.send('load-images', result.map(path => `file:///${path}`))
}

function saveProject() {
  console.log('Guardando proyecto')
  ipcMain.once('return-state', (event, state) => {
    console.log(state)
    const { images, controlPoints, cameras } = state

    const file = JSON.stringify({ images, controlPoints, cameras })

    const path = dialog.showSaveDialog(window, { message: file, filters: [{name: 'Project Files', extensions: ['rm.json']}]})

    if(!path) {
      return
    }

    console.log(path)
    fs.writeFile(path, file, { encoding: 'utf-8' })
  })
  
  window.webContents.send('get-state')
}

function loadProject() {
  console.log('Cargando Proyecto')
  const [path] = dialog.showOpenDialog(window, { filters: [{name: 'Project Files', extensions: ['rm.json'] }]}) || []
  console.log(path)
  if(!path) {
    return
  }

  const projectFile = fs.readFileSync(path, { encoding: 'utf-8' })

  console.log(projectFile, 'project')
  const projectObject = JSON.parse(projectFile)
  window.webContents.send('load-project', projectObject)
}