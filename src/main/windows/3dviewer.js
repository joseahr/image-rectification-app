import electron, { app, BrowserWindow } from 'electron'

const { ipcMain, Menu, dialog } = electron

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#3dviewer`
  : `file://${__dirname}/index.html#3dviewer`

export let window

export function createWindow(x, y) {
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

  return window
}


const menuTemplate = [
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Abrir OBJ',
        click: openOBJ
      },
      {
        label: 'Abrir MTL+OBJ',
        click: openMTL
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)


function openOBJ() {
  const result = dialog.showOpenDialog(window, {
    title: 'Abrir objeto 3D',
    properties: ['openFile'],
    filters: [{ name: '3D Object (OBJ)', extensions: ['obj'] }]
  })

  if(!result) {
    return
  }
  console.log(result[0])
  window.webContents.send('load-obj', result[0])
  
}

function openMTL() {
  const result = dialog.showOpenDialog(window, {
    title: 'Abrir objeto 3D',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Material (MTL) and 3D Object (OBJ)', extensions: ['mtl', 'obj'] }]
  })

  if(!result || result.length != 2) { return }

  const obj = result.find(p => p.endsWith('.obj'))
  const mtl = result.find(p => p.endsWith('.mtl'))

  if(!obj || !mtl) { return }

  window.webContents.send('load-mtl-obj', [obj, mtl])

}