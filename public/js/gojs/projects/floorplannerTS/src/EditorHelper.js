/*
 * goeditor-setup.js
 * Called before init() events in every goeditor app
 * Initializes the diagrams, palettes, GoCloudStorage, and the Inspector
 * You may need to edit or override things in your own code
 * DO NOT edit this file -- make app-specific overrides or custom changes in your own code
 * DO NOT delete or rename this file
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../../release/go", "../../storage/GoCloudStorageManager", "../../storage/GoDropBox", "../../storage/GoGoogleDrive", "../../storage/GoLocalStorage", "../../storage/GoOneDrive", "./DataInspector"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var go = require("../../../release/go");
    var GoCloudStorageManager_1 = require("../../storage/GoCloudStorageManager");
    var GoDropBox_1 = require("../../storage/GoDropBox");
    var GoGoogleDrive_1 = require("../../storage/GoGoogleDrive");
    var GoLocalStorage_1 = require("../../storage/GoLocalStorage");
    var GoOneDrive_1 = require("../../storage/GoOneDrive");
    var DataInspector_1 = require("./DataInspector");
    var EditorHelper = /** @class */ (function () {
        function EditorHelper(diagramsCount, palettesCount, pathToStorage, diagramsType, JQUERY) {
            // GoCloudStorage helpers
            this.isAutoSavingCheckbox = document.getElementById('isAutoSavingCheckbox');
            this.isAutoSavingP = document.getElementById('isAutoSavingP');
            if (diagramsType === null || !diagramsType) {
                diagramsType = go.Diagram;
            }
            JQUERY = JQUERY;
            // build diagrams
            var $ = go.GraphObject.make; // for conciseness in defining templates
            this.diagrams = [];
            this.overviews = [];
            var editorHelper = this;
            for (var i = 0; i < diagramsCount; i++) {
                var diagram = new diagramsType('ge-diagram-' + i); // create a Diagram for the DIV HTML element
                diagram.undoManager.isEnabled = true;
                // When diagram is modified, change title to include a *
                diagram.addChangedListener(function (e) {
                    // maybe update the file header
                    var currentFile = document.getElementById('ge-filename');
                    if (editorHelper.isAutoSavingCheckbox.checked && editorHelper.storageManager.currentStorage.currentDiagramFile.name != null)
                        return;
                    if (currentFile) {
                        var idx = currentFile.textContent.indexOf('*');
                        if (e.diagram.isModified) {
                            if (idx < 0)
                                currentFile.textContent = currentFile.textContent + '*';
                        }
                        else {
                            if (idx >= 0)
                                currentFile.textContent = currentFile.textContent.substr(0, idx);
                        }
                    }
                });
                this.diagrams[i] = diagram;
                // make an overview for each diagram
                var overview = $(go.Overview, 'ge-overview-' + i, { observed: diagram });
                this.overviews[i] = overview;
            }
            // if there are no diagrams, there will be no overviews, so do not list that option in View menu
            if (diagramsCount < 1) {
                var viewOverviewsOption = document.getElementById('ge-viewoption-overviews');
                viewOverviewsOption.parentNode.removeChild(viewOverviewsOption);
            }
            // build palette(s)
            this.palettes = [];
            for (var i = 0; i < palettesCount; i++) {
                var palette = $(go.Palette, 'ge-palette-' + i);
                this.palettes[i] = palette;
            }
            // Go Cloud Storage stuff
            this.defaultModel = undefined; // change this if you want -- so GoCloudStorage documentation
            var iconsDir = pathToStorage + '/goCloudStorageIcons/';
            this.gls = new GoLocalStorage_1.GoLocalStorage(this.diagrams, this.defaultModel, iconsDir);
            this.god = new GoOneDrive_1.GoOneDrive(this.diagrams, 'f9b171a6-a12e-48c1-b86c-814ed40fcdd1', this.defaultModel, iconsDir);
            this.ggd = new GoGoogleDrive_1.GoGoogleDrive(this.diagrams, '16225373139-n24vtg7konuetna3ofbmfcaj2infhgmg.apps.googleusercontent.com', 'AIzaSyDBj43lBLpYMMVKw4aN_pvuRg7_XMVGf18', this.defaultModel, iconsDir);
            this.gdb = new GoDropBox_1.GoDropBox(this.diagrams, '3sm2ko6q7u1gbix', this.defaultModel, iconsDir);
            this.storages = [this.gls, this.god, this.ggd, this.gdb];
            this.storageManager = new GoCloudStorageManager_1.GoCloudStorageManager(this.storages, iconsDir);
            var span = document.getElementById('currentStorageSpan');
            span.innerHTML = '';
            var imageSrc = this.storageManager.getStorageIconPath(this.storageManager.currentStorage.className);
            var img = document.createElement('img');
            img.src = imageSrc;
            img.style.width = '20px';
            img.style.height = '20px';
            img.style.cssFloat = 'left';
            span.appendChild(img);
            var fileInput = document.getElementById('file-input');
            fileInput.accept = '.csv';
            this.storageManager.currentStorage.isAutoSaving = this.isAutoSavingCheckbox.checked;
            this.isAutoSavingCheckbox.addEventListener('change', function () {
                editorHelper.storageManager.storages.iterator.each(function (storage) {
                    storage.isAutoSaving = editorHelper.isAutoSavingCheckbox.checked;
                });
                // update the title to reflect the save
                var currentFile = document.getElementById('ge-filename');
                var currentFileTitle = currentFile.innerText;
                if (currentFileTitle[currentFileTitle.length - 1] === '*' && editorHelper.storageManager.currentStorage.currentDiagramFile.name != null) {
                    currentFile.innerText = currentFileTitle.substr(0, currentFileTitle.length - 1);
                    editorHelper.storageManager.currentStorage.save();
                }
            });
            // enable hotkeys
            document.body.addEventListener('keydown', function (e) {
                var keynum = e.which;
                if (e.ctrlKey) {
                    e.preventDefault();
                    switch (keynum) {
                        case 83:
                            editorHelper.handlePromise('Save');
                            break; // ctrl + s
                        case 79:
                            editorHelper.handlePromise('Load');
                            break; // ctrl + o
                        case 68:
                            editorHelper.handlePromise('New');
                            break; // ctrl + d
                        case 82:
                            editorHelper.handlePromise('Delete');
                            break; // ctrl + r
                        case 80:
                            editorHelper.geHideShowWindow('ge-palettes-window');
                            break;
                        case 69:
                            editorHelper.geHideShowWindow('ge-overviews-window');
                            break; // ctrl + e
                        case 73:
                            editorHelper.geHideShowWindow('ge-inspector-window');
                            break; // ctrl + i
                    }
                }
            });
            this.updateAutoSaveVisibility();
            // Format the inspector for your specific needs. You may need to edit the DataInspector class
            this.inspector = new DataInspector_1.Inspector('ge-inspector', this.diagrams[0], {
                includesOwnProperties: true
            });
            function makeGCSWindowsDraggable() {
                // special -- make sure all gcs windows are draggable via jQuery UI classes
                // do so by wrapping the filepicker divs in a draggable ge-window div -- with a handle
                var gcsWindows = document.getElementsByClassName('goCustomFilepicker');
                gcsWindows = [].slice.call(gcsWindows);
                var gcsManagerMenu = document.getElementById('goCloudStorageManagerMenu');
                gcsWindows.push(gcsManagerMenu);
                var _loop_1 = function (i) {
                    var gcsWindow = gcsWindows[i];
                    // possibly delete pre-existing window
                    var id = 'ge-' + gcsWindow.id + '-window';
                    var windowParent = document.getElementById(id);
                    if (windowParent !== null && windowParent !== undefined) {
                        windowParent.parentNode.removeChild(windowParent);
                    }
                    // construct window wrapper for gcs menu
                    windowParent = document.createElement('div');
                    windowParent.id = id;
                    windowParent.classList.add('ge-draggable');
                    windowParent.classList.add('ui-draggable');
                    windowParent.classList.add('ge-menu');
                    windowParent.style.visibility = 'hidden';
                    var handle = document.createElement('div');
                    handle.id = id + '-handle';
                    handle.classList.add('ge-handle');
                    handle.classList.add('ui-draggable-handle');
                    handle.innerText = 'Storage';
                    var button = document.createElement('button');
                    button.id = id + '-close';
                    button.innerText = 'X';
                    button.classList.add('ge-clickable');
                    button.classList.add('ge-window-button');
                    button.onclick = function () {
                        var ci = button.id.indexOf('-close');
                        var wpid = button.id.substring(0, ci);
                        var windowParentAgain = document.getElementById(wpid);
                        editorHelper.geHideShowWindow(windowParentAgain.id);
                        for (var j = 0; j < windowParentAgain.children.length; j++) {
                            var child = windowParentAgain.children[j];
                            if (!child.classList.contains('ge-handle')) {
                                child.style.visibility = windowParentAgain.style.visibility;
                            }
                        }
                    };
                    handle.appendChild(button);
                    windowParent.appendChild(handle);
                    windowParent.appendChild(gcsWindow);
                    document.body.appendChild(windowParent);
                    var observer = new MutationObserver(function (mutations) {
                        var newVis = mutations[0].target.style.visibility;
                        var pn = mutations[0].target.parentNode;
                        pn.style.visibility = newVis;
                    });
                    observer.observe(gcsWindow, {
                        attributes: true,
                        attributeFilter: ['style']
                    });
                };
                for (var i = 0; i < gcsWindows.length; i++) {
                    _loop_1(i);
                }
            }
            //   JQUERY(function() {
            //     let draggables = document.getElementsByClassName("ge-draggable");
            //     for (let i = 0; i < draggables.length; i++) {
            //       let draggable = draggables[i];
            //       let id = "#" + draggable.id; let hid = id + "-handle";
            //       JQUERY(id).draggable({ handle: hid, stack: ".ge-draggable", containment: "window", scroll: false });
            //     }
            //   });
            // }
            // makeGCSWindowsDraggable();
        }
        // choose new storage service; then, update the current storage span with the correct picture of the current storage service being used
        EditorHelper.prototype.updateCurrentStorageSpan = function () {
            var editorHelper = this;
            editorHelper.storageManager.selectStorageService().then(function (storage) {
                var span = document.getElementById('currentStorageSpan');
                span.innerHTML = '';
                var imageSrc = editorHelper.storageManager.getStorageIconPath(storage.className);
                var img = document.createElement('img');
                img.src = imageSrc;
                img.style.width = '20px';
                img.style.height = '20px';
                img.style.cssFloat = 'left';
                span.appendChild(img);
                storage.isAutoSaving = editorHelper.isAutoSavingCheckbox.checked;
                editorHelper.updateAutoSaveVisibility();
            });
        };
        // update the title on page to reflect newly loaded diagram title
        EditorHelper.prototype.updateTitle = function () {
            var editorHelper = this;
            var currentFile = document.getElementById('ge-filename');
            if (editorHelper.storageManager.currentStorage.currentDiagramFile.path !== null) {
                var storage = editorHelper.storageManager.currentStorage;
                if (storage.currentDiagramFile.path)
                    currentFile.innerHTML = storage.currentDiagramFile.path;
                else
                    currentFile.innerHTML = storage.currentDiagramFile.name;
            }
            else {
                currentFile.innerHTML = 'Untitled';
                // (storageTag as HTMLElement).innerHTML = 'Unsaved'; /// ??? what is storageTag???
            }
        };
        // can only use the auto save checkbox if the file is already saved to the current storage service
        EditorHelper.prototype.updateAutoSaveVisibility = function () {
            var cdf = this.storageManager.currentStorage.currentDiagramFile;
            this.isAutoSavingP.style.visibility = (cdf.name === null) ? 'hidden' : 'visible';
        };
        /**
         * Promise handler for core functions
         * @param {String} action Accepted values: Load, Delete, New, Save
         */
        EditorHelper.prototype.handlePromise = function (action) {
            var editorHelper = this;
            // tslint:disable-next-line:no-shadowed-variable
            function handleFileData(action, fileData) {
                var words = [];
                switch (action) {
                    case 'Load':
                        words = ['Loaded', 'from'];
                        break;
                    case 'Delete':
                        words = ['Deleted', 'from'];
                        break;
                    case 'New':
                        words = ['Created', 'at'];
                        break;
                    case 'Save':
                        words = ['Saved', 'to'];
                        break;
                    case 'SaveAs':
                        words = ['Saved', 'to'];
                        break;
                }
                var storageServiceName = editorHelper.storageManager.currentStorage.serviceName;
                if (fileData.id && fileData.name && fileData.path) {
                    editorHelper.storageManager.showMessage(words[0] + ' ' + fileData.name + ' (file ID ' + fileData.id + ') ' +
                        words[1] + ' path ' + fileData.path + ' in ' + storageServiceName, 1.5);
                    // tslint:disable-next-line:no-console
                }
                else
                    console.error(fileData); // may have an explanation for why fileData isn't complete
                editorHelper.updateTitle();
                editorHelper.updateAutoSaveVisibility();
            }
            switch (action) {
                case 'Load':
                    editorHelper.storageManager.load().then(function (fileData) {
                        handleFileData(action, fileData);
                    }, function (e) {
                        console.log(e);
                    });
                    break;
                case 'Delete':
                    editorHelper.storageManager.remove().then(function (fileData) {
                        handleFileData(action, fileData);
                    });
                    break;
                case 'New':
                    var saveBefore = false;
                    var currentFile = document.getElementById('ge-filename');
                    // only prompt to save current changes iff there is some modified state
                    var currentFileTitle = currentFile.innerText;
                    if (currentFileTitle.substr(currentFileTitle.length - 1, 1) === '*') {
                        saveBefore = true;
                    }
                    editorHelper.storageManager.create(saveBefore).then(function (fileData) {
                        handleFileData(action, fileData);
                    });
                    break;
                case 'SaveAs':
                    editorHelper.storageManager.save().then(function (fileData) {
                        handleFileData(action, fileData);
                    });
                    break;
                case 'Save':
                    editorHelper.storageManager.save(false).then(function (fileData) {
                        handleFileData(action, fileData);
                    });
                    break;
            }
        };
        // Small, generic helper functions
        EditorHelper.prototype.refreshDraggableWindows = function () {
            this.JQUERY('.gt-menu').draggable({ handle: '.gt-handle', stack: '.gt-menu', containment: 'window', scroll: false });
        };
        // makes images of each diagram
        EditorHelper.prototype.makeDiagramImage = function () {
            var editorHelper = this;
            for (var i = 0; i < editorHelper.diagrams.length; i++) {
                var diagram = editorHelper.diagrams[i];
                var imgdata = diagram.makeImageData({ maxSize: new go.Size(Infinity, Infinity), scale: 2, padding: 10, background: diagram.div.style.background });
                var a = document.createElement('a');
                var filename = document.getElementById('ge-filename').innerText;
                filename.split('.');
                filename = filename[0];
                a.download = filename;
                if (imgdata !== null) {
                    a.href = imgdata;
                }
                a.target = '_blank';
                a.click();
            }
        };
        // make SVG files of each diagram
        EditorHelper.prototype.makeDiagramSvg = function () {
            var editorHelper = this;
            for (var i = 0; i < editorHelper.diagrams.length; i++) {
                var diagram = editorHelper.diagrams[i];
                var svgDataEl = diagram.makeSvg();
                var s = new XMLSerializer();
                var svgData = s.serializeToString(svgDataEl);
                var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                var svgUrl = URL.createObjectURL(svgBlob);
                var downloadLink = document.createElement('a');
                downloadLink.href = svgUrl;
                var filename = document.getElementById('ge-filename').innerText;
                var filenameArr = filename.split('.');
                filename = filenameArr[0];
                downloadLink.download = filename + '.svg';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        };
        EditorHelper.prototype.geHideShowWindow = function (id, doShow) {
            var geWindow = document.getElementById(id);
            var vis = null;
            if (doShow === undefined)
                vis = geWindow.style.visibility === 'visible' ? 'hidden' : 'visible';
            else if (doShow)
                vis = 'visible';
            else
                vis = 'hidden';
            var pn = null;
            if (geWindow.parentNode.classList.contains('ge-menu')) {
                pn = geWindow.parentNode;
            }
            if (pn) {
                pn.style.visibility = vis;
            }
            geWindow.style.visibility = vis;
        };
        return EditorHelper;
    }());
    exports.EditorHelper = EditorHelper;
});
