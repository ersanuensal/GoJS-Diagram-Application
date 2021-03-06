const { ipcRenderer } = require('electron')
const opn = require('opn');
const maxResBtn = document.getElementById('maxResBtn')
const mySidebar = document.getElementById('mySidebar')
const ipc = ipcRenderer
var isLeftMenuActive = false


function openLink(link){
    opn(link);
}


// minimize app
minimizeBtn.addEventListener('click', ()=>{
    console.log('minimizing');
    ipc.send('minimizeApp')
})

// maximize app
function changeMaxResBtn(isMaximizedApp){
    if(isMaximizedApp){
        maxResBtn.title = 'Restore'
        maxResBtn.classList.remove('maximizeBtn')
        maxResBtn.classList.add('restoreBtn')
    } else {
        maxResBtn.title = 'Maximize'
        maxResBtn.classList.remove('restoreBtn')
        maxResBtn.classList.add('maximizeBtn')
    }
}
maxResBtn.addEventListener('click', ()=>{
    ipc.send('maximizeRestoreApp')
})
ipc.on('isMaximized', ()=> { changeMaxResBtn(true) })
ipc.on('isRestored', ()=> { changeMaxResBtn(false) })

// close app
closeBtn.addEventListener('click', ()=>{
    ipc.send('closeApp')
})

// toggle sidebar
showHideMenus.addEventListener('click', ()=>{
    if(isLeftMenuActive){
        console.log("Left Menu closed");
        mySidebar.style.width = '0px'
        isLeftMenuActive = false
    } else {
        mySidebar.style.width = '280px'
        isLeftMenuActive = true
    }
})
