var manager = {
	data: null,
	url: url.substring(0,url.lastIndexOf('\\'))+"\\files\\",
	
	selected: {status: false, id: null, cache: null},
	
	init: function() {
		this.hide("delete");
		this.hide("update");
		this.disable("filename");
		this.disable("author");
		this.disable("description");
		
		this.loadData();
		this.list();
	},
	
	loadData: function() {
		if (!this.getData()) {
			this.setData({"data": []});
		}
		
		fs.exists(this.url,(exists) => {
			if (!exists) {
				fs.mkdir(this.url,() => {/**/})	
			}
		});
		
		this.data = JSON.parse(this.getData());
		
		if (this.data.data.length > 0) {
			this.syncData(this.data.data.length);
		}
	},
	
	syncData: function(length) {
		if (length == 0) {
			this.setData(this.data);
			this.data = JSON.parse(this.getData());
		} else {
			getContent(length-1);
			
			window.setTimeout(function(){
				manager.syncData(length-1);
			},150);
		}
	},
	
	getData: function() {
		return window.localStorage.getItem("data");
	},
	
	setData: function(data) {
		window.localStorage.setItem("data",JSON.stringify(data));
	},
	
	list: function() {
		var list = "";
		
		for (var i = 0; i < this.data.data.length; ++i) {
			list += "<div id='"+this.data.data[i].id+"' class='item-holder' onclick='manager.click(this.id);' onmouseout='manager.select(this.id);' ondblclick='manager.editor(this.id);'><table><tr><td><div class='item center'></div></td></tr><tr><td><div class='center'><span>"+this.data.data[i].filename+this.data.data[i].type+"</span></div></td></tr></table></div>";
		}
		
		this.getElem("list").innerHTML = list;
		
		if (this.data.data.length > 0) {
			this.getElem("count").innerHTML = "<span>"+this.data.data.length+" "+(this.data.data.length == 1 ? 'item': 'items')+"</span>";
		} else {
			this.getElem("count").innerHTML = "<span>0 item</span>";
		}
	},
	
	click: function(id) {
		this.selected.status = true;
		
		if (this.getElem("delete").style.display === 'none') this.show("delete");
		
		this.getElem("filename").value = this.data.data[id].filename;
		this.getElem("author").value = this.data.data[id].author;
		this.getElem("description").value = this.data.data[id].description;
		this.getElem("size").innerHTML = "<span>" + this.data.data[id].size + "</span>";
		this.getElem("created").innerHTML = "<span>" + this.data.data[id].date_created + "</span>";
		this.getElem("modified").innerHTML = "<span>" + this.data.data[id].date_modified + "</span>";
		this.getElem("level").innerHTML = "<span>" + this.data.data[id].coolness_level + "</span>";
		
		if (this.getElem("filename").disabled) this.enable("filename");
		if (this.getElem("author").disabled) this.enable("author");
		if (this.getElem("description").disabled) this.enable("description");
	},
	
	select: function(id) {
		if (this.selected.status) {
			if (!this.hasClass(id,"selected")) this.addClass(id,"selected");
			
			this.selected.id = id;
			this.selected.status = false;
		}
	},
	
	deSelect: function() {
		if (this.selected.id) {
			if (this.hasClass(this.selected.id,"selected")) {
				this.removeClass(this.selected.id,"selected");
				
				if (!this.selected.status) {
					if (this.getElem("delete").style.display === 'block') this.hide("delete");
					
					this.getElem("filename").value = this.getElem("author").value = this.getElem("description").value = this.getElem("size").innerHTML = this.getElem("created").innerHTML = this.getElem("modified").innerHTML = this.getElem("level").innerHTML = null;
					
					if (!this.getElem("filename").disabled) this.disable("filename");
					if (!this.getElem("author").disabled) this.disable("author");
					if (!this.getElem("description").disabled) this.disable("description");
				}
				
				this.selected.cache = this.selected.id;
				this.selected.id = null;
				
				if (this.getElem("update").style.display === 'block') this.hide("update");
			}
		}
	},
	
	currentTime: function() {
		var date = new Date();
		
		return (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+" "+(date.getHours()>12?date.getHours()-12:date.getHours())+":"+date.getMinutes()+" "+(date.getHours()<12?"AM":"PM");
	},
	
	getElem: function(elem) {
		return document.getElementById(elem);
	},
	
	show: function(elem) {
		this.getElem(elem).style.display = 'block';
	},
	
	hide: function(elem) {
		this.getElem(elem).style.display = 'none';
	},
	
	disable: function(elem) {
		this.getElem(elem).disabled = true;
	},
	
	enable: function(elem) {
		this.getElem(elem).disabled = false;
	},
	
	hasClass: function(elem,classname) {
		return this.getElem(elem).classList.contains(classname)
	},
	
	addClass: function(elem,classname) {
		this.getElem(elem).classList.add(classname)
	},
	
	removeClass: function(elem,classname) {
		this.getElem(elem).classList.remove(classname)
	},
	
	pushScreen: function(screen) {
		window.location = screen;
	},
	
	create: function() {
		if (!this.getElem("filename").value) {
			window.alert("Filename is missing","Error");
		} else {
			var filename = this.getElem("filename").value;
			var path = this.url+filename+".txt";
			
			var file = {"filename": filename, "type": ".co", "author": this.getElem("author").value, "description": this.getElem("description").value, "folder_path": path, "size": "0 bytes", "date_created": this.currentTime(), "date_modified": "", "id": this.data.data.length, "content": "", "coolness_level": 0.00};
			
			for (var i = 0; i < this.data.data.length; ++i) {
				if (filename == this.data.data[i].filename) {
					window.alert("Filename already in use","Error");
					return;
				}
			}
			
			this.data.data.push(file);
			this.setData(this.data);
			
			saveFile(path,"");
			
			window.alert("File created successfully","Success");
			
			this.getElem("filename").value = this.getElem("author").value = this.getElem("description").value = null;
			
			window.location = "index.html";
		}
	},
	
	delete: function() {
		deleteFile(this.data.data[this.selected.cache].folder_path);
		
		this.data.data.splice(this.selected.cache,1);
        
		for (var i = 0; i < this.data.data.length; ++i) {
        	this.data.data[i].id = i;
        }
        
		this.setData(this.data);
        
		this.init();
	},
	
	update: function() {
		if (this.getElem("filename").value)	{
			var found = false;
			
			for (var i = 0; i < this.data.data.length; ++i) {
				if (this.getElem("filename").value == this.data.data[i].filename && this.selected.id != i) {
					var found = true;
					break;
				}
			}
			
			if (!found) {
				this.data.data[this.selected.id].filename = this.getElem("filename").value;
				this.data.data[this.selected.id].author = this.getElem("author").value;
				this.data.data[this.selected.id].description = this.getElem("description").value;
				
				var oldPath = this.data.data[this.selected.id].folder_path;
				
				this.data.data[this.selected.id].folder_path = this.url+this.data.data[this.selected.id].filename+".txt";
				this.data.data[this.selected.id].date_modified = this.currentTime();
				
				this.setData(this.data);
				
				renameFile(oldPath, this.data.data[this.selected.id].folder_path);
				
				this.init();
				
				this.click(this.selected.id);
				this.select(this.selected.id);
			} else {
				window.alert("Filename already in use","Error");
			}
		} else {
			window.alert("Filename is missing","Error")
			
			this.getElem("filename").value = this.data.data[this.selected.id].filename;
		}
	},
	
	editor: function(id) {
		this.pushScreen("editor.html?id="+id);
	},
	
	loadFile: function() {
		var url = window.location.href;
		this.selected.id = parseInt(url.substr(url.indexOf('=')+1));
		
		this.getElem("title").innerHTML = "<span>"+this.data.data[this.selected.id].filename+this.data.data[this.selected.id].type+"</span>";
		this.getElem("editor").value = this.data.data[this.selected.id].content;

		this.charCount();
	},
	
	save: function() {
		this.data.data[this.selected.id].content = this.getElem("editor").value;
		this.data.data[this.selected.id].date_modified = this.currentTime();
		this.data.data[this.selected.id].size = this.size(this.getElem("editor").value.length);
		this.data.data[this.selected.id].coolness_level += 0.01;
		
		this.setData(this.data);
		
		saveFile(this.data.data[this.selected.id].folder_path,this.data.data[this.selected.id].content)
		
		window.alert("File saved successfully","Success");
	},
	
	charCount: function() {
		if (this.getElem("editor").value.length > 0) {
			this.getElem("count").innerHTML = "<span>"+this.getElem("editor").value.length+" "+(this.getElem("editor").value.length == 1 ? 'char': 'chars')+"</span>";
		} else {
			this.getElem("count").innerHTML = "<span>0 char</span>";
		}
	},
	
	size: function(char) {
		var size = char;
		
		if (size > 1023) {
			size /= 1024;
			size *= 100;
			size = Math.round(size)
			size /= 100;
			
			return size+" KB";
		} else {
			return char+" bytes";
		}
	},
}