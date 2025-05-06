const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')
const path = require('path')
let fileMapIndex = new Map()

contextBridge.exposeInMainWorld('electronAPI', {
    addFile : (currentPath, fileId) => addFile(currentPath, fileId),
    addFolder : (currentPath, folderId) => addFolder(currentPath, folderId),
    removeFile : (currentPath, fileId) => removeFile(currentPath, fileId),
    removeFolder : (currentPath, folderId) => removeFolder(currentPath, folderId),
    move : (currentPath, fileId, targetId, isFolder) => move(currentPath, fileId, targetId, isFolder),
    getFilemap: () => getFilemap(),
    setFilemap: (fileMap) => setFilemap(fileMap),
    saveFile : (fileElement) => saveFile(fileElement)
})
function addFile(currentPath, fileId){
  fs.writeFileSync(path.join(__dirname, `save/${currentPath}${fileId}.md`), '')
}   
function addFolder(currentPath, folderId){
  fs.mkdirSync(path.join(__dirname, `save/${currentPath}${folderId}`))
}
function removeFile(currentPath, fileId){
  fs.rmSync(path.join(__dirname, `save/${currentPath}${fileId}.md`))
}
function removeFolder(currentPath, folderId){
  fs.rmSync(path.join(__dirname, `save/${currentPath}${folderId}`), {recursive: true, force: true })
}
function move(currentPath, fileId, targetId, isFolder){
  if(targetId != undefined){ // Not a return dir case
    lastPath = currentPath + targetId + '/'
    if(isFolder){
      fs.moveSync(path.join(__dirname, `save/${currentPath}${fileId}` ), path.join(__dirname,`save/${currentPath}${targetId}/${fileId}`)) // markdown string

    }
    else{
      fs.moveSync(path.join(__dirname, `save/${currentPath}${fileId}.md`), path.join(__dirname, `save/${currentPath}${targetId}/${fileId}.md`)) // markdown string
    }

  }
  else{
    let returnPath = currentPath.split('/')   
    returnPath.splice(returnPath.length - 2, 1)
    returnPath = returnPath.join('/');
    if(isFolder){
      fs.moveSync(path.join(__dirname, `save/${currentPath}${fileId}`), path.join(__dirname, `save/${returnPath}${fileId}`)) // markdown string
    }
    else{
      fs.moveSync(path.join(__dirname, `save/${currentPath}${fileId}.md`), path.join(__dirname, `save/${returnPath}${fileId}.md`)) // markdown string
    }


  }
}
function getFilemap(){
  return fs.readFileSync(path.join(__dirname, 'save/filemap.json'), 'utf-8')
}
function setFilemap(fileMap){ // initial setting of indexes ( this needs to be called multiple times )
  let i = 0; // maybe more efficient way?  Could put this into front end, and use the length to update indexes of newly added files?
  fileMap.forEach(fileElement => {
    fileMapIndex.set(fileElement.id, i)
    i++
  });
  if(fileMap){
    fs.writeFileSync(path.join(__dirname, 'save/filemap.json'), JSON.stringify([...fileMap], null, 2))
  }
}
function saveFile(fileElement){
  fileMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'save/filemap.json'), 'utf-8')) // overwrites filemap.json array using position based on set filemap function
  if(fileElement){ // If it's a delete event on a new file, file element will be null
    fileMap[fileMapIndex.get(fileElement.id)][0] = fileElement.id 
    fileMap[fileMapIndex.get(fileElement.id)][1] = fileElement
    if(fileElement.md && fileElement.md.length != 0){
      fs.writeFile(path.join(__dirname, `save/${fileElement.path}${fileElement.id}.md`), fileElement.md.join('\n'))
    } 
  }


  fs.writeFileSync(path.join(__dirname, 'save/filemap.json'), JSON.stringify([...fileMap],null, 2 ))
}

/*
- Save Indicator - Check if md == currentFile.md
- Color customization with css injections && ability to save colors as profiles?
- Save Notification 
*/
