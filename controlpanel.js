/***
 * Control panel
 */

(function(win, doc) {
    
    /* Strings */
    var SAVE        = "Tallenna",
        SAVED       = "Tallennettu",
        LOADED      = "Ladattu",
        DELETED     = "Poistettu",
        NEW         = "Uusi",
        
        NO_SAVE_FILE_NAME_NOTIF     = "Anna tiedostonimi.",
        CONFIRM_LOST_UNSAVED        = "Tallentamattomat tiedot menetetään. Haluatko jatkaa?",
        CONFIRM_BILL_DELETE         = "Haluatko varmasti poistaa tallennetun laskun?"
    ;
    
    /* Elements */
    var body = doc.getElementsByTagName("body")[0];
    var controlPanel = doc.querySelector("#controls");
    var saveNameInputEl = doc.querySelector("#save-name");
    var saveButtonEl = doc.querySelector("#save");
    var loadButtonEl = doc.querySelector("#load");
    var newButtonEl = doc.querySelector("#new");
    var savedBillsEl = doc.querySelector("#saved-bills");
    var tilisiirtoEl = doc.querySelector("#tilisiirto");
    var showTilisiirtoEl = doc.querySelector("#show-tilisiirto");
    
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
    
    var openSaved = function(name) {
        if (hasChangesCheck()) {
            BillMachine.loadFromJSON(JSON.parse(localStorage[name]));
            saveNameInputEl.value = name;
            setHasChangesFalse();
            notification(LOADED);
            return true;
        }
        return false;
    };
    
    var save = function(name) {
        setHasChangesFalse();
        localStorage[name] = JSON.stringify(BillMachine.getJSON());
        notification(SAVED);
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
            location.reload();
        }
    }, false);
    
    var showTilisiirtoBn = new bn(showTilisiirtoEl);
    showTilisiirtoBn.onChange = function(value) {
        if (value) {
            tilisiirtoEl.style.display = "block";
        }
        else {
            tilisiirtoEl.style.display = "none";
        }
    };
    
    BillMachine.new();
    loadSavedList();

})(window, document);