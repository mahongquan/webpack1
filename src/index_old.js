import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './react-contextmenu.css'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Client from "./Client";
var createReactClass = require('create-react-class');

function buildGetChildrenUrl(path) {
        return  "/fs/children?path="+path;
}

function buildGetParentUrl(path) {
        return  "/fs/parent?path="+path;
}

function buildRenameUrl(path, name) {
        return  "/fs/rename2?path="+path+"&name="+name;
}

function buildRemoveUrl(path) {
        return  "/fs/remove?path="+path;
}
function buildGetContentUrl(path) {
        return "/static/"+path;
}

function buildUploadUrl(path, name) {
        return "/fs/upload?path="+path+"&name="+name;
}

function buildMkdirUrl(path, name) {
        return "/fs/mkdir?path="+path+"&name="+name;
}


function getParent(path, onSuccess) {
    Client.getRaw(buildGetParentUrl(path), onSuccess);
}

var File = createReactClass({

        glyphClass: function() {
                var className = "glyphicon ";
                className += this.props.isdir ? "glyphicon-folder-open" : "glyphicon-file";
                return className;
        },



    remove: function() {
            Client.getRaw(
              buildRemoveUrl(this.props.path),
              ()=>{this.props.browser.reloadFilesFromServer();}
            );
    },

    rename: function(updatedName) {
            Client.getRaw(
              buildRenameUrl(this.props.path,  updatedName),
              ()=>{this.props.browser.reloadFilesFromServer();}
            );
    },

    onRemove: function(e,data) {
            console.log("onRemove");
            var type = this.props.isdir ? "folder" : "file";
            var remove =window.confirm("Remove "+type +" '"+ this.props.path +"' ?");
            if (remove)
                    this.remove();
    },

    onRename: function(e,data) {
            console.log("onRename");
            var type = this.props.isdir ? "folder" : "file";
            var updatedName = prompt("Enter new name for "+type +" "+this.props.name);
            if (updatedName != null)
                    this.rename(updatedName);
    },

    renderList: function() {
            var dateString =  new Date(this.props.time*1000).toGMTString()
            var glyphClass = this.glyphClass();
            return (<tr id={this.props.id} ref={this.props.path}>
                            <td>
                            <ContextMenuTrigger id={""+this.props.id}>
                            <a onClick={this.props.onClick}><span style={{fontSize:"1.5em", paddingRight:"10px"}} className={glyphClass}/>{this.props.name}</a>
                            </ContextMenuTrigger>
                            <ContextMenu id={""+this.props.id}>
                                <MenuItem data={{a:1}} onClick={this.onRemove}>remove</MenuItem>
                                <MenuItem data={{a:2}} onClick={this.onRename}>rename</MenuItem>
                              </ContextMenu>
                            </td>
                            <td>{File.sizeString(this.props.size)}</td>
                            <td>{dateString}</td>
                            </tr>);
    },
    renderGrid: function() {
            var glyphClass = this.glyphClass();
            return (<div ref={this.props.path} className="col-xs-6 col-md-3">
                <ContextMenuTrigger id={""+this.props.id}>
                    <a id={this.props.id} onClick={this.props.onClick}>
                    <span style={{fontSize:"3.5em"}} className={glyphClass}/>

                    </a>
                </ContextMenuTrigger>
                            <ContextMenu id={""+this.props.id}>
                                <MenuItem data={{a:1}} onClick={this.onRemove}>remove</MenuItem>
                                <MenuItem data={{a:2}} onClick={this.onRename}>rename</MenuItem>
                              </ContextMenu>
                    <div className="caption">
                    <h4 className="heading">{this.props.name}</h4>
                    </div>
                    </div>);
    },

    render: function() {
            return this.props.gridView ? this.renderGrid() : this.renderList();
    }
});

File.id = function() {return (Math.pow(2,31) * Math.random())|0; }

File.timeSort = function(left, right){return left.time - right.time;}

File.sizeSort = function(left, right){return left.size - right.size;}

File.pathSort = function(left, right){return left.path.localeCompare(right.path);}

File.sizes = [{count : 1, unit:"bytes"}, {count : 1024, unit: "kB"}, {count: 1048576 , unit : "MB"}, {count: 1073741824, unit:"GB" } ]

File.sizeString =  function(sizeBytes){
        var iUnit=0;
        var count=0;
        for (iUnit=0; iUnit < File.sizes.length;iUnit++) {
                count = sizeBytes / File.sizes[iUnit].count;
                if (count < 1024)
                        break;
        }
        return "" + (count|0) +" "+ File.sizes[iUnit].unit;
}
var Browser = createReactClass({
        getInitialState: function() {
            return {
              paths : ["."],
              files: [],
              sort: File.pathSort,
              gridView: false,
              current_path:"",
              displayUpload:"none",
          };
        },

    loadFilesFromServer: function(path) {
        var self=this;
           Client.getRaw(
              buildGetChildrenUrl(path),
              (data)=>{
                    var files = data.children.sort(self.state.sort);
                    var paths = self.state.paths;
                    if (paths[paths.length-1] !== path)
                    paths = paths.concat([path])
                    self.setState(
                            {files: files,
                                    paths: paths,
                            sort: self.state.sort,
                            gridView: self.state.gridView});
                    self.updateNavbarPath(self.currentPath());
              }
            );
    },
    updateNavbarPath:function(path){
         // var elem  = document.getElementById("pathSpan");
        // elem.innerHTML = '<span class="glyphicon glyphicon-chevron-right"/>' +path;
        this.setState({current_path:path});

    },
    reloadFilesFromServer: function() {
        this.loadFilesFromServer(this.currentPath())
    },

    currentPath : function() {
            return this.state.paths[this.state.paths.length-1]
    },

    onBack : function() {
            if (this.state.paths.length <2) {
                    alert("Cannot go back from "+ this.currentPath());
                    return;
            }
            this.setState({paths:this.state.paths.slice(0,-1)});
            this.loadFilesFromServer(this.currentPath());
    },

    onUpload: function() {
            this.setState({displayUpload:""});
    },

    onParent: function() {
            var onSuccess = function(data) {
                    var parentPath = data.path;
                    this.updatePath(parentPath);
            }.bind(this);
            getParent(this.currentPath(), onSuccess);
    },

    alternateView: function() {
            var updatedView = !  this.state.gridView;

            this.setState(
              {
                    gridView: updatedView
              });
    },


    uploadFile: function() {
            return function (evt) {
                    var path = this.currentPath();
                    var readFile = evt.target.files[0];
                    var name = readFile.name;
                    console.log(readFile);

                    var formData = new FormData();
                    formData.append("file", readFile, name);

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', buildUploadUrl(path, name) , true);
                    xhr.onreadystatechange=function()
                    {
                            if (xhr.readyState !== 4)
                                    return;

                            if (xhr.status === 200){
                                    alert("Successfully uploaded file "+ name +" to "+ path);
                                    this.reloadFilesFromServer();
                            }
                            else
                                   ;// console.log(request.status);
                    }.bind(this);
                    xhr.send(formData);
            }.bind(this)
    },


    componentDidMount: function() {
            var path = this.currentPath();
            this.loadFilesFromServer(path);
    },

    updateSort: function(sort) {
            var files  = this.state.files
                    var lastSort = this.state.sort;
            if  (lastSort === sort)
                    files = files.reverse();
            else
                    files = files.sort(sort);

            this.setState({files: files, sort: sort,  paths: this.state.paths, gridView: this.state.gridView});
    },

    timeSort: function() {
            this.updateSort(File.timeSort);
    },
    pathSort: function() {
            this.updateSort(File.pathSort);
    },
    sizeSort: function() {
            this.updateSort(File.sizeSort);
    },
    updatePath: function(path) {
            this.loadFilesFromServer(path);
    },
    getContent: function(path) {
        console.log("getContent");
        var url = buildGetContentUrl(path);
        console.log(url);
        //window.location.href=url;
    },

    mkdir: function() {

            var newFolderName = prompt("Enter new folder name");
            if (newFolderName == null)
                    return;
            Client.getRaw(
              buildMkdirUrl(this.currentPath(),newFolderName),
              this.reloadFilesFromServer
            );
    },
    onClick:function(f){
        console.log("onClick");
        console.log(f);
        if (f.isdir){
          this.updatePath(f.path);
        }
        else{
           this.getContent(f.path);
        }
    },
    mapfunc:function(f, idx){
      var id  =  File.id(f.name);
      return (<File key={idx}  id={id} gridView={this.state.gridView} onClick={()=>this.onClick(f)} 
      path={f.path} name={f.name} isdir={f.isdir} size={f.size} time={f.time} browser={this}
      />)
    },
    render: function() {
            // var files = this.state.files.map(function(f) {
            //         var id  =  File.id(f.name);
            //         var onClick = f.isdir ? function(event){
            //                 this.updatePath(f.path);
            //         }.bind(this) :
            //                 function(event) {
            //                         this.getContent(f.path);
            //                 }.bind(this)
            //                 return (<File id={id} gridView={this.state.gridView} onClick={onClick} path={f.path} name={f.name} isdir={f.isdir} size={f.size} time={f.time} browser={this}/>)
            // }.bind(this));

    const files = this.state.files.map(this.mapfunc);

            var gridGlyph = "glyphicon glyphicon-th-large";
            var listGlyph = "glyphicon glyphicon-list";
            var className = this.state.gridView ? listGlyph : gridGlyph;
            var  contextMenu = (<div id="context-menu">
                            <ul className="dropdown-menu" role="menu">
                            <li><a tabIndex="-1">Rename</a></li>
                            <li className="divider"></li>
                            <li><a tabIndex="-1">Remove</a></li>
                            </ul>
                            </div>);

            var toolbar=(<div>
            <nav className="navbar navbar-inverse ">
                        <div className="navbar-header">
                                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#example-navbar-collapse">
                                        <span className="sr-only">Toggle navigation</span>
                                        <span className="icon-bar"></span>
                                        <span className="icon-bar"></span>
                                        <span className="icon-bar"></span>
                                </button>
                        </div>
                        <div className="collapse navbar-collapse" id="example-navbar-collapse">
                                <ul className="nav navbar-nav">
                                        <li id="backButton"><a onClick={this.onBack}><span className="glyphicon glyphicon-arrow-left"/></a></li>
                                        <li id="parentButton"><a onClick={this.onParent} ><span className="glyphicon glyphicon-arrow-up"/></a></li>
                                        <li id="uploadButton"><a onClick={this.onUpload} ><span className="glyphicon glyphicon-upload"/></a></li>
                                        <li id="mkdirButton"><a onClick={this.mkdir} ><span className="glyphicon glyphicon-folder-open"/></a></li>
                                        <li id="alternateViewButton"><a onClick={this.alternateView}>
                                       <span ref="altViewSpan" className={className} />
                                        </a></li>
                                        <li><a id="pathSpan"><span className="glyphicon glyphicon-chevron-right"/>{this.state.current_path}</a></li>
                                </ul>
                        </div>
                </nav>
    <input type="file" id="uploadInput" onChange={this.uploadFile()} style={{display:this.state.displayUpload}} /></div>);
            if (this.state.gridView)
            {
                    return (<div>{toolbar}
                                    {files}
                                    {contextMenu}
                                    </div>)


            }
            else{
              var sortGlyph = "glyphicon glyphicon-sort";
              return (<div>
                              {toolbar}
                              <table className="table table-responsive table-striped table-hover">
                              <thead><tr>
                              <th><button onClick={this.pathSort} className="btn btn-default"><span className={sortGlyph}/>Path</button></th>
                              <th><button onClick={this.sizeSort} className="btn btn-default"><span className={sortGlyph}/>Size</button></th>
                              <th><button onClick={this.timeSort} className="btn btn-default"><span className={sortGlyph}/>Last modified time</button></th>
                              </tr></thead>
                              <tbody>
                              {files}
                              </tbody>
                              </table>
                              {contextMenu}

                </div>)
            }
    }
});

ReactDOM.render(
                <Browser/>,
                document.getElementById('root')
            );
