/***
 * Control panel
 */

(function(win, doc, BillMachine) {

    /* Strings */
    var SAVE            = "Tallenna",
        SAVED           = "Tallennettu",
        SAVED_TO_DRIVE  = "Tallennettu Driveen",
        LOADED          = "Ladattu",
        DELETED         = "Poistettu",
        NEW             = "Uusi",

        NO_SAVE_FILE_NAME_NOTIF     = "Anna tiedostonimi:",
        CONFIRM_LOST_UNSAVED        = "Tallentamattomat tiedot menetetään. Haluatko jatkaa?",
        CONFIRM_BILL_DELETE         = "Haluatko varmasti poistaa tallennetun laskun?",
        GIVE_FILE_NAME              = "Anna tiedostonimi:",

        GIVE_FILE_GROUP_NAME        = "Anna ryhmän nimi:"
    ;

    /* Elements */
    var body = doc.getElementsByTagName("body")[0];
    var pageEl = doc.querySelector("#page");
    var controlPanel = doc.querySelector("#controls");
    var saveNameEl = doc.querySelector("#save-name");
    var saveButtonEl = doc.querySelector("#save");
    var saveToDriveButtonEl = doc.querySelector("#save-to-drive");
    var saveToDriveAsButtonEl = doc.querySelector("#save-to-drive-as");
    var loadButtonEl = doc.querySelector("#load");
    var newButtonEl = doc.querySelector("#new");
    var openFromDriveEl = doc.querySelector("#open-from-drive");
    var savedBillsEl = doc.querySelector("#saved-bills");
    var tilisiirtoEl = doc.querySelector("#tilisiirto");
    var showTilisiirtoEl = doc.querySelector("#show-tilisiirto");
    var toggleAdditionalSettingsEl = doc.querySelector("#toggle-additional-settings");
    var additionalSettingsEl = doc.querySelector("#additional-settings");
    var showInDriveEl = doc.querySelector("#show-in-drive");
    var fileGroupsEl = doc.querySelector("#file-groups");
    var newFileGroupEl = doc.querySelector("#new-file-group");

    var documentTitleBnO = new bn.O();
    documentTitleBnO.onChange = function(value) {
        document.title = (value.length > 0 ? value : "Laskutuskone");
    };
    var fileNameBn = new bn(documentTitleBnO, ".file-name");

    var notification = function(msg, type) {
        BillMachine.notification(msg, type);
    };

    var hasChanges = false;

    var hasChangesEvent = function() {
        hasChanges = true;
        win.removeEventListener(hasChangesEvent);
    };

    var setHasChangesFalse = function() {
        hasChanges = false;
        win.addEventListener("keydown", hasChangesEvent, false);
        win.addEventListener("contextmenu", hasChangesEvent, false);
    };

    setHasChangesFalse();

    var hasChangesCheck = function() {
        return !hasChanges || confirm(CONFIRM_LOST_UNSAVED);
    };

    var deleteSaved = function(name) {
        if (confirm(CONFIRM_BILL_DELETE)) {
            localStorage.removeItem(name);
            loadSavedList();
            notification(DELETED);
        }
    };

    var openNew = function() {
        if (hasChangesCheck()) {
            setDriveFile(null);
            location.search = "";
            location.reload();
        }
    };

    var open = function(name, json) {
        BillMachine.loadFromJSON(json);
        fileNameBn.setValue(name);
        setHasChangesFalse();
        notification(LOADED);
    };

    var openSavedFromDrive = function(fileId) {
        if (!fileId) {
            console.warn("No file id given. Opening Drive Picker instead.");
            return openSavedFromDriveWithPicker();
        }
        var request = gapi.client.drive.files.get({
            'fileId': fileId
        });
        request.execute(function(file) {
            Drive.downloadFile(file, function(resp) {
                setDriveFile(file);
                open(file.title.split(".")[0], JSON.parse(resp));
            });
        });
    };

    var openSavedFromDriveWithPicker = function() {
        Drive.openPicker(BillMachine.MIME_TYPE, function(file) {
            if (!file) return false;
            openSavedFromDrive(file.id);
        }, false);
    };

    var openSaved = function(name) {
        if (hasChangesCheck()) {
            open(name, JSON.parse(localStorage[name]));
            return true;
        }
        return false;
    };

    var saveNotifySuccess = function(text) {
        setHasChangesFalse();
        notification(text || SAVED);
    };

    var saveToDatastore = function(data) {

    };

    var saveToDrive = function(name, callback) {
        if (!BillMachine.folderId) {
            Drive.openFolderPicker(function(resp) {
                if (!resp && callback) {
                    callback(false);
                    return;
                }
                setDriveFolderId(resp.id);
                saveToDrive(name, callback);
            });
            return;
        }

        var data = JSON.stringify(BillMachine.getJSON());
        var blob = new Blob([data], {type: BillMachine.MIME_TYPE});
        blob.fileName = name + ".rlk";

        html2canvas(pageEl, {
            onrendered: function(canvas) {
                Drive.insertFile(blob, BillMachine.folderId, BillMachine.fileId, canvas.toDataURL("image/png"), function(file) {
                    setDriveFile(file);
                    saveNotifySuccess(SAVED_TO_DRIVE);
                    if (callback) callback(true);
                });
            },
            background: "#fff"
        });
    };

    var saveToLocal = function(name) {
        var data = JSON.stringify(BillMachine.getJSON());
        localStorage[name] = data;
        saveNotifySuccess();
    };

    var prevSavedSel;
    var addOpenSavedOnClickEvent = function(el) {
        el.addEventListener("click", function() {
            if (openSaved(this.textContent)) {
                if (prevSavedSel !== undefined) {
                    prevSavedSel.className = prevSavedSel.className.replace(" selected", "");
                }
                prevSavedSel = this;
                this.className += " selected";
            }
        }, false);
    };

    var addDeleteSavedEvent = function(el) {
        el.addEventListener("contextmenu", function(evt) {
            evt.preventDefault();
            deleteSaved(this.textContent);
        }, false);
    };

    var loadSavedList = function() {
        var tempEl = doc.createElement("div");
        tempEl.className = "list-item";

        var d = doc.createDocumentFragment();
        for (var k in localStorage) {
            var el = tempEl.cloneNode(true);
            el.textContent = k;

            d.appendChild(el);
            addOpenSavedOnClickEvent(el);
            addDeleteSavedEvent(el);
        }

        savedBillsEl.innerHTML = "";
        savedBillsEl.appendChild(d);
    };

    var getSaveName = function() {
        var name = fileNameBn.getValue();
        if (name === undefined || name <= 0) {
            name = prompt(NO_SAVE_FILE_NAME_NOTIF);
            if (name) {
                return name;
            }
            else return false;
        }
        return name;
    };

    var setDriveFolderId = function(folderId) {
        if (folderId) {
            BillMachine.folderId = folderId;
            showInDriveEl.href = "https://drive.google.com/drive/u/0/#folders/" + folderId;
            bn.removeClass(showInDriveEl, "disabled");
        }
        else {
            BillMachine.folderId = undefined;
            showInDriveEl.href = "#";
            bn.addClass(showInDriveEl, "disabled");
        }
    };

    var setDriveFile = function(file) {
        if (!file) {
            setDriveFolderId(null);
            BillMachine.fileId = null;
        }
        else {
            setDriveFolderId(file.parents[0].id);
            BillMachine.fileId = file.id;
        }
    };

    var saveToDriveClickEvent = function(self, evt) {
        var name = getSaveName();
        if(name) {
            self.disabled = true;
            saveToDrive(name, function(resp) {
                self.disabled = false;
                if (resp) {
                    fileNameBn.setValue(name);
                }
            });
        }
    };

    var FileGroup = {
        listEl: doc.querySelector("#file-groups-list")
    };
    FileGroup.url = window.location.href.replace("8000", "8080") + "filegroup";
    FileGroup.save = function(id, name) {
        var params = [];
        if (id !== null) params.push("id=" + id);
        params.push("name=" + name);
        bn.postAjax(FileGroup.url + "?" + params.join("&"), function(resp) {
            console.log(resp);
        });
    };
    FileGroup.load = function(id) {
        bn.getAjax(FileGroup.url + "?id=" + id, function(resp) {
        });
    };
    FileGroup.loadList = function(callback) {
        bn.getAjax(FileGroup.url, function(resp) {
            callback(JSON.parse(resp));
        });
    };
    FileGroup.renderList = function() {
        FileGroup.listEl.innerHTML = "";
        FileGroup.loadList(function(groups) {
            var d = doc.createDocumentFragment();
            for (var i = 0, l = groups.length; i < l; ++i) {
                var group = groups[i];
                var option = doc.createElement("option");
                option.textContent = group.name;
                option.name = group.id;
            }
            FileGroup.listEl.appendChild(d);
        });
    };
    FileGroup.createNew = function() {
        var newName = prompt(GIVE_FILE_GROUP_NAME);
        if (newName !== null) {
            FileGroup.save(newName);
        }
    };


    /* Event listeners */
    saveButtonEl.addEventListener("click", function() {
        var name = getSaveName();
        if(name) {
            saveToLocal(name);
        }
    }, false);

    saveToDriveButtonEl.addEventListener("click", function(evt) {
        saveToDriveClickEvent(this, evt);
    }, false);

    saveToDriveAsButtonEl.addEventListener("click", function(evt) {
        fileNameBn.setValue(null);
        setDriveFile(null);

        saveToDriveClickEvent(this, evt);
    }, false);

    if (loadButtonEl) loadButtonEl.addEventListener("click", function() {
        var name = getSaveName();
        if(name) {
            openSaved(name);
        }
    }, false);

    newButtonEl.addEventListener("click", function() {
        openNew();
    }, false);

    openFromDriveEl.addEventListener("click", function() {
        openSavedFromDrive();
    });

    fileGroupsEl.addEventListener("change", function(evt) {
        var selectedOption = this[this.selectedIndex];
        switch (selectedOption.name) {
            default:
                if (selectedOption.id === newFileGroupEl.id) {
                    FileGroup.createNew();
                }
        }
    }, false);

    /* END Event listeners */


    var showTilisiirtoBn = new bn(showTilisiirtoEl);
    showTilisiirtoBn.onChange = function(value) {
        if (value) {
            tilisiirtoEl.style.display = "block";
        }
        else {
            tilisiirtoEl.style.display = "none";
        }
    };

    var additionalSettingsElHeight = additionalSettingsEl.offsetHeight;
    toggleAdditionalSettingsEl.addEventListener("click", function(evt) {
        evt.preventDefault();
        var isActive = bn.toggleClass(additionalSettingsEl, "active");
        additionalSettingsEl.style.height = (isActive ? additionalSettingsElHeight : 0) + "px";
    }, false);
    additionalSettingsEl.style.height = "0px";

    BillMachine.loadSavedList = loadSavedList;
    BillMachine.openFromDrive = openSavedFromDrive;

})(window, document, bn.BillMachine);
