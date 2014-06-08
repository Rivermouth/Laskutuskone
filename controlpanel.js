/***
 * Control panel
 */

(function(win, doc) {
    
    /* Elements */
    var controlPanel = doc.querySelector("#controls");
    var saveNameInputEl = doc.querySelector("#save-name");
    var saveButtonEl = doc.querySelector("#save");
    var loadButtonEl = doc.querySelector("#load");
    var newButtonEl = doc.querySelector("#new");
    var savedBillsEl = doc.querySelector("#saved-bills");
    
    var notification = function(msg) {
        var el = doc.createElement("div");
        el.className = "notification";
        el.textContent = msg;
        
        controlPanel.appendChild(el);
        setTimeout(function() {
            el.className += " active";
        }, 100);
        setTimeout(function() {
            el.className = el.className.replace(" active", "");
        }, 1000);
        setTimeout(function() {
            el.remove();
        }, 1300);
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
        return !hasChanges || confirm("All unsaved changes will be lost! Proceed?");
    };
    
    var deleteSaved = function(name) {
        if (confirm("Really delete saved bill?")) {
            localStorage.removeItem(name);
            loadSavedList();
            notification("Deleted");
        };
    };
    
    var openSaved = function(name) {
        if (hasChangesCheck()) {
            BillMachine.initPage();
            BillMachine.loadFromJSON(JSON.parse(localStorage[name]));
            saveNameInputEl.value = name;
            setHasChangesFalse();
            notification("Loaded");
            return true;
        }
        return false;
    };
    
    var save = function(name) {
        setHasChangesFalse();
        localStorage[name] = JSON.stringify(BillMachine.getJSON());
        notification("Saved");
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
            alert("Please, give proper name");
            return false;
        }
        return name;
    };
    
    saveButtonEl.addEventListener("click", function() {
        var name = getSaveName();
        if(name) {
            save(name);
        }
    }, false);
    
    if (loadButtonEl) loadButtonEl.addEventListener("click", function() {
        var name = getSaveName();
        if(name) {
            openSaved(name);
        }
    }, false);
    
    newButtonEl.addEventListener("click", function() {
        if (hasChangesCheck()) {
            location.reload()
        }
    }, false);
    
    BillMachine.initPage();
    loadSavedList();

})(window, document);