const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () =>{
    const win = new BrowserWindow({
        width: 1400,
        height: 1000,
    
        webPreferences: {
            devTools: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false,
        },

    })
    win.webContents.openDevTools = true;
    win.loadFile('dist/aurum/browser/index.html')
}

async function getPath(){
        const sessionPath = app.isPackaged
        ? newPath = app.getPath('userData')
        : newPath = __dirname
        return sessionPath
}
app.whenReady().then(() => {
    ipcMain.handle('sessionPath', getPath)
    createWindow()
})