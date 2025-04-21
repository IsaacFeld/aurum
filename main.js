const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () =>{
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }

    })
    win.loadFile('dist/aurum/browser/index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('api.ADD', () => 'ping')
    ipcMain.on('message', (event, message) => {
        console.log(message)
    })
    createWindow()
})