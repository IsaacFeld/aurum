const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')
contextBridge.exposeInMainWorld('electronAPI', {
    addFile : (currentPath, fileId) => addFile(currentPath, fileId),
    addFolder : (currentPath, folderId) => addFolder(currentPath, folderId),
    removeFile : (currentPath, fileId) => removeFile(currentPath, fileId),
    removeFolder : (currentPath, folderId) => removeFolder(currentPath, folderId),
    move : (currentPath, fileId, targetId, isFolder) => move(currentPath, fileId, targetId, isFolder),
    getFilemap: () => getFilemap(),
    setFilemap: (fileMap) => setFilemap(fileMap),
    getMarkdown: (currentPath, fileId) => getMarkdown(currentPath, fileId),
    setMarkdown: (currentPath, fileId, md) => setMarkdown(currentPath, fileId, md),
    getJSON: (currentPath, fileId) => getJSON(currentPath, fileId),
    setJSON: (currentPath, fileId, html) => setJSON(currentPath, fileId, html)

  // we can also expose variables, not just functions
})
function addFile(currentPath, fileId){
  fs.writeFileSync(`save/${currentPath}${fileId}.md`, '')
  fs.writeFileSync(`save/${currentPath}${fileId}.json`, '')
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
    if(isFolder){
      fs.moveSync(`save/${currentPath}${fileId}`, `save/${currentPath}${targetId}/${fileId}`) // markdown string

    }
    else{
      fs.moveSync(`save/${currentPath}${fileId}.md`, `save/${currentPath}${targetId}/${fileId}.md`) // markdown string
      fs.moveSync(`save/${currentPath}${fileId}.json`, `save/${currentPath}${targetId}/${fileId}.json`) // renderedHTML
    }

  }
  else{
    console.log({before: currentPath})
    let returnPath = currentPath.split('/')   
    returnPath.splice(returnPath.length - 2, 1)
    returnPath = returnPath.join('/');
    console.log({after: returnPath})
    console.log(fileId)
    console.log(targetId)
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
function setFilemap(fileMap){
  console.log(fileMap)
  if(fileMap){
    fs.writeFileSync('save/filemap.json', JSON.stringify([...fileMap], null, 2))
  }
}
function getMarkdown(currentPath, fileId) {
  return fs.readFileSync(`save/${currentPath}${fileId}.md`, 'utf-8')
}
function setMarkdown(currentPath, fileId, md){
  fs.writeFileSync(`save/${currentPath}${fileId}.md`, md.join('\n'))
}
function getJSON(currentPath, fileId){
  return fs.readFileSync(`save/${currentPath}${fileId}.json`, 'utf-8')
}
function setJSON(currentPath, fileId, html){
  console.log(html)
  fs.writeFileSync(`save/${currentPath}${fileId}.json`, JSON.stringify(html))
}
