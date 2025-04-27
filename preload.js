const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')
let lastPath = null
let lastId = null
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
  fs.writeFileSync(`save/${currentPath}${fileId}.md`, '')
}   
function addFolder(currentPath, folderId){
  fs.mkdirSync(`save/${currentPath}${folderId}`)
}
function removeFile(currentPath, fileId){
  fs.rmSync(`save/${currentPath}${fileId}.md`)
  fs.rmSync(`save/${currentPath}${fileId}.json`)
}
function removeFolder(currentPath, folderId){
  fs.rmSync(`save/${currentPath}${folderId}`, {recursive: true, force: true })
}
function move(currentPath, fileId, targetId, isFolder){
  if(targetId != undefined){ // Not a return dir case
    lastPath = currentPath + targetId + '/'
    if(isFolder){
      fs.moveSync(`save/${currentPath}${fileId}`, `save/${currentPath}${targetId}/${fileId}`) // markdown string

    }
    else{
      fs.moveSync(`save/${currentPath}${fileId}.md`, `save/${currentPath}${targetId}/${fileId}.md`) // markdown string
      fs.moveSync(`save/${currentPath}${fileId}.json`, `save/${currentPath}${targetId}/${fileId}.json`) // renderedHTML
    }

  }
  else{
    let returnPath = currentPath.split('/')   
    returnPath.splice(returnPath.length - 2, 1)
    returnPath = returnPath.join('/');
    if(isFolder){
      fs.moveSync(`save/${currentPath}${fileId}`, `save/${returnPath}${fileId}`) // markdown string
    }
    else{
      fs.moveSync(`save/${currentPath}${fileId}.md`, `save/${returnPath}${fileId}.md`) // markdown string
      fs.moveSync(`save/${currentPath}${fileId}.json`, `save/${returnPath}${fileId}.json`) // renderedHTML
    }


  }
}
function getFilemap(){
  return fs.readFileSync('save/filemap.json', 'utf-8')
}
function setFilemap(fileMap){ // initial setting of indexes ( this needs to be called multiple times )
  let i = 0; // maybe more efficient way?  Could put this into front end, and use the length to update indexes of newly added files?
  fileMap.forEach(fileElement => {
    fileMapIndex.set(fileElement.id, i)
    i++
  });
  if(fileMap){
    fs.writeFileSync('save/filemap.json', JSON.stringify([...fileMap], null, 2))
  }
}
function saveFile(fileElement){
  fileMap = JSON.parse(fs.readFileSync('save/filemap.json', 'utf-8')) // overwrites filemap.json array using position based on set filemap function
  fileMap[fileMapIndex.get(fileElement.id)][0] = fileElement.id 
  fileMap[fileMapIndex.get(fileElement.id)][1] = fileElement 
  fs.writeFileSync('save/filemap.json', JSON.stringify([...fileMap],null, 2 ))
}

/*
On file switch => save

More consistent path tracking ex: texteditor needs to update current file path before executing saveFile()
- this means the text editor needs to know returndir, movedir, and delete events in ngOnChanges | should be easy

Check for other path-related bugs

Check if a file was active, if so render it automatically!


So many possible UI changes:
- Font size slider
- Color customization with css injections && ability to save colors as profiles?
- Save Notification 

*/
