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

        NO_SAVE_FILE_NAME_NOTIF     = "Anna tiedostonimi.",
        CONFIRM_LOST_UNSAVED        = "Tallentamattomat tiedot menetetään. Haluatko jatkaa?",
        CONFIRM_BILL_DELETE         = "Haluatko varmasti poistaa tallennetun laskun?"
    ;

    /* Elements */
    var body = doc.getElementsByTagName("body")[0];
    var controlPanel = doc.querySelector("#controls");
    var saveNameInputEl = doc.querySelector("#save-name");
    var saveButtonEl = doc.querySelector("#save");
    var saveToDriveButtonEl = doc.querySelector("#save-to-drive");
    var loadButtonEl = doc.querySelector("#load");
    var newButtonEl = doc.querySelector("#new");
    var openFromDriveEl = doc.querySelector("#open-from-drive");
    var savedBillsEl = doc.querySelector("#saved-bills");
    var tilisiirtoEl = doc.querySelector("#tilisiirto");
    var showTilisiirtoEl = doc.querySelector("#show-tilisiirto");
    var toggleAdditionalSettingsEl = doc.querySelector("#toggle-additional-settings");
    var additionalSettingsEl = doc.querySelector("#additional-settings");
    var showInDriveEl = doc.querySelector("#show-in-drive");

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
        };
    };

    var openNew = function() {
        if (hasChangesCheck()) {
            location.reload();
            setDriveFile(null);
        }
    };

    var open = function(name, json) {
        BillMachine.loadFromJSON(json);
        saveNameInputEl.value = name;
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

    var saveToDrive = function(name, callback) {
        if (!BillMachine.folderId) {
            Drive.openFolderPicker(function(resp) {
                setDriveFolderId(resp.id);
                saveToDrive(name, callback);
            });
            return;
        }

        var data = JSON.stringify(BillMachine.getJSON());
        var blob = new Blob([data], {type: BillMachine.MIME_TYPE});
        blob.fileName = name + ".rlk";

        Drive.insertFile(blob, BillMachine.folderId, BillMachine.fileId, function(file) {
            setDriveFile(file);
            saveNotifySuccess(SAVED_TO_DRIVE);
            if (callback) callback(true);
        });
    };

    var saveToLocal = function(name) {
        var data = JSON.stringify(BillMachine.getJSON());
        localStorage[name] = data;
        saveNotifySuccess();
    };

    var prevSavedSel = undefined;
    var addOpenSavedOnClickEvent = function(el) {
        el.addEventListener("click", function() {
            if (openSaved(this.textContent)) {
                if (prevSavedSel != undefined) {
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
        };

        savedBillsEl.innerHTML = "";
        savedBillsEl.appendChild(d);
    };

    var getSaveName = function() {
        var name = saveNameInputEl.value;
        if (name <= 0) {
            alert(NO_SAVE_FILE_NAME_NOTIF);
            return false;
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

    saveButtonEl.addEventListener("click", function() {
        var name = getSaveName();
        if(name) {
            saveToLocal(name);
        }
    }, false);

    saveToDriveButtonEl.addEventListener("click", function() {
        var self = this;
        var name = getSaveName();
        if(name) {
            self.disabled = true;
            saveToDrive(name, function() {
                self.disabled = false;
            });
        }
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
