import electron, { app, BrowserWindow } from 'electron'

const { ipcMain, dialog, Menu } = electron

const winURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080/#updatepoint`
: `file://${__dirname}/index.html#updatepoint`

let mainWindow

export let window

export function createWindow(index, x, y, X, Y, Z) {

  const url = `${winURL}/${index}/${x}/${y}/${X}/${Y}/${Z}`

  mainWindow = BrowserWindow.getFocusedWindow()

  window = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    height: 300,
    useContentSize: true,
    width: 500,
    resizable: false,
    webPreferences: {
      // devTools: false,
      // webSecurity: false
    }
  })

  window.loadURL(url)

  window.on('closed', () => {
    mainWindow
      .webContents
      .send('win-add-point-closed')
    window = null
  })

  window.setMenu(menu)

  return window
}

// Menú
const menuTemplate = [
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
