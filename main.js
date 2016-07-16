const {app} = require('electron');

const {BrowserWindow} = require('electron');

const fs = require('fs');

var url = `${__dirname}`;

app.on('ready', () => {
	let win = new BrowserWindow({width: 683, height: 414, resizable: false, fullscreenable: false});
	win.loadURL(`file://${__dirname}/index.html`);
	
	let webContents = win.webContents;
	//webContents.openDevTools();
	
	win.on('closed', () => {
		win = null;
	});
});

app.on('window-all-closed', () => {
	app.quit();
});

function saveFile(path,content) {
	fs.writeFile(path,content,false);
}

function deleteFile(path) {
	fs.exists(path,(exists) => {
		if (exists) {
			fs.unlink(path,(e) => {/**throw away**/});		
		}
	});
}

function renameFile(path,newPath) {
	fs.rename(path,newPath,(err) => {
		if (err) throw err;
		fs.stat(newPath,(err,stats) => {
			if (err) throw err;
			console.log(`stats: ${JSON.stringify(stats)}`);
		});
	});
}

function getContent(id) {
	fs.readFile(manager.data.data[id].folder_path,'utf8',(e,data) => {
		window.setTimeout(function(){
			manager.data.data[id].content = data;
		},100);
	});
}