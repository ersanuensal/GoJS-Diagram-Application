const {
  app,
  BrowserWindow,
  Menu
} = require('electron')
const path = require('path')

//establishing connection to MongoDB
var mongo = require('mongoose');
var mongourl = "mongodb://app:Adv4nc3d-Pr0gr4mm1ng@46.101.207.27:27017/advpro"

mongo.connect(mongourl);

mongo.connection.once('open', function() {
  console.log('connected to Database');
}).on('error', function(error) {
  console.log('error is', error);
});
const Cat = mongo.model('Cat', {
  name: String
});

const kitty = new Cat({
  name: 'Zildjian'
});
kitty.save().then(() => console.log('meow'));



function createWindow() {
  const win = new BrowserWindow({
    width: 2000,
    height: 2000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.webContents.openDevTools()

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [{
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services'
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? {
        role: 'close'
      } : {
        role: 'quit'
      }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [{
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      ...(isMac ? [{
          role: 'pasteAndMatchStyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectAll'
        },
        {
          type: 'separator'
        },
        {
          label: 'Speech',
          submenu: [{
              role: 'startSpeaking'
            },
            {
              role: 'stopSpeaking'
            }
          ]
        }
      ] : [{
          role: 'delete'
        },
        {
          type: 'separator'
        },
        {
          role: 'selectAll'
        }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [{
        role: 'reload'
      },
      {
        role: 'forceReload'
      },
      {
        role: 'toggleDevTools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetZoom'
      },
      {
        role: 'zoomIn'
      },
      {
        role: 'zoomOut'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [{
        role: 'minimize'
      },
      {
        role: 'zoom'
      },
      ...(isMac ? [{
          type: 'separator'
        },
        {
          role: 'front'
        },
        {
          type: 'separator'
        },
        {
          role: 'window'
        }
      ] : [{
        role: 'close'
      }])
    ]
  },
  {
    role: 'help',
    submenu: [{
      label: 'Documentation',
      click: async () => {
        const {
          shell
        } = require('electron')
        await shell.openExternal('https://github.com/ersanuensal/Advanced-Programming/blob/main/README.md')
      }
    }]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
