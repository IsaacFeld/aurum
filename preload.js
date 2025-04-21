const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage : (message) => ipcRenderer.send('message', message),
    communicate : () => communicate()

  // we can also expose variables, not just functions
})

function communicate(){
    console.log('hello from electron')
}

