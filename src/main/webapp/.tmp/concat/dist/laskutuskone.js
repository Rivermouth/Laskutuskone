(function(win, doc, bn) {
    var JobRow = function(rowEl) {
        this.totalBnO = new bn.O();
        this.totalBnO.isJobBn = true;

        this.el = JobRow.newJobRowEl.cloneNode(true);
        this.el.id = "";
        this.el.className = "job-row";

        JobRow.newJobRowEl.parentElement.insertBefore(this.el, JobRow.newJobRowEl);
        this.addDelEvent();

        this.descEl = this.el.querySelector(".desc");
        this.countEl = this.el.querySelector(".count");
        this.countUnitEl = this.el.querySelector(".count-unit");
        this.apriceEl = this.el.querySelector(".aprice");
        this.alvpEl = this.el.querySelector(".alvp");
        this.alveEl = this.el.querySelector(".alve");
        this.sumEl = this.el.querySelector(".sum");

        this.apriceEl.onblur = function() {
            this.textContent = bn.des2str(bn.elVal(this));
        }

        this.addBind();
    };
    JobRow.CONFIRM_DELETE = "Haluatko varmasti poistaa kyseisen kohteen?";
    JobRow.newJobRowEl = doc.querySelector("#new-job-row");
    JobRow.prototype.remove = function() {
        this.el.remove();
        this.deleted = true;
    };
    JobRow.prototype.delEvent = function(evt) {
        evt.preventDefault();
        if (confirm(JobRow.CONFIRM_DELETE)) {
            this.totalBnO.remove();
            this.remove();
        }
    };
    JobRow.prototype.addDelEvent = function() {
        var _this = this;
        this.el.addEventListener("contextmenu", function(evt) {
            _this.delEvent(evt);
        }, false);
    };
    JobRow.prototype.count = function() {
        var alve = bn.elVal(this.countEl) * bn.elVal(this.apriceEl) * (bn.elVal(this.alvpEl)/100);
        var sum = bn.elVal(this.countEl) * bn.elVal(this.apriceEl) + alve;

        this.alveEl.textContent = bn.des2str(alve);
        this.sumEl.textContent = bn.des2str(sum);

        this.totalBnO.vat = alve;
        this.totalBnO.total = sum;

        this.totalBnO.link.notify();
    };
    JobRow.prototype.addBind = function() {
        this.totalBnO.vat = 0;
        this.totalBnO.total = 0;

        var jobBn = new bn.oneway(this.countEl, this.apriceEl, this.alvpEl);
        var _this = this;
        jobBn.onChange = function(value) {
            _this.count();
        };
    };
    JobRow.prototype.toJSON = function() {
        var o = {
            description: bn.text(this.descEl),
            count: bn.text(this.countEl),
            count_unit: bn.text(this.countUnitEl),
            aprice: bn.text(this.apriceEl),
            alvp: bn.text(this.alvpEl),
            avle: bn.text(this.alveEl),
            sum: bn.text(this.sumEl)
        };
        return o;
    };
    JobRow.prototype.fromJSON = function(json) {
        bn.text(this.descEl, json.description);
        bn.text(this.countEl, json.count);
        bn.text(this.countUnitEl, json.count_unit);
        bn.text(this.apriceEl, json.aprice);
        bn.text(this.alvpEl, json.alvp);

        this.count();
    };

    bn.JobRow = JobRow;
})(window, document, bn);

/***
 * BillMachine
 */

(function(win, doc, JobRow) {

    /* Elements */
    var billerNameEl = doc.querySelector("#biller-name");
    var paymentReceiverEl = doc.querySelector("#payment-receiver");
    var billInfoTable = doc.querySelector("#bill-info-table");
    var billIdEl = doc.querySelector("#bill-id");
    var billNameEl = doc.querySelector("#bill-name");
    var refnumEl = doc.querySelector("#refnum");
    var dateEl = doc.querySelector("#date");
    var datePayEl = doc.querySelector("#date-pay");
    var datesToPayEl = doc.querySelector("#dates-to-pay");
    var payInterestEl = doc.querySelector("#pay-interest");
    var accountNumberEl = doc.querySelector("#account-number");
    var accountShortCodeEl = doc.querySelector("#account-shortcode");
    var clientEl = doc.querySelector("#client-info");
    var additionalInfoEl = doc.querySelector("#additional-info");
    var jobsTableEl = doc.querySelector("#jobs-table");
    var novatTotalEl = doc.querySelector("#novat-total");
    var vatTotalEl = doc.querySelector("#vat-total");
    var totalEl = doc.querySelector("#total");
    var notesEl = doc.querySelector("#notes");
    var footer1El = doc.querySelector("#footer-1");
    var footer2El = doc.querySelector("#footer-2");
    var footer3El = doc.querySelector("#footer-3");
    var barcodeEl = doc.querySelector("#barcode");


    var jobRows = [];

    var isUpdating = false;

    var date;
    var totalBn;
    var totalElBn = new bn(".total");

    var totalBnListener = new bn.O();
    totalBnListener.onChange = function() {
        calcRowsTotal();
    };

    var billInfoDatePayBn = new bn(".date-pay");

    var billInfoDatePayBnO = new bn.O();
    billInfoDatePayBnO.onChange = function(value) {
        this.value = getDatePay(value);
        datePayEl.textContent = this.value;
        billInfoDatePayBn.setValue(this.value);
    };

    var refNumBnO = new bn.O();
    refNumBnO.onChange = function(value) {
        this.value = calcRefNum(value);
        refnumEl.textContent = this.value;
    };

    var datesToPayElBnE = new bn.E(datesToPayEl);

    var accountNumberBn = new bn("#account-number");
    var accountShortCodeBn = new bn(".account-shortcode");
    var clientInfoBn = new bn(".client-info");
    var dateBn = new bn(billInfoDatePayBnO, datesToPayElBnE);
    var refnumBn = new bn(refNumBnO, billIdEl, ".bill-id");

    var barcodeBnListener = new bn(dateBn, refnumBn, accountNumberBn, totalElBn);
    barcodeBnListener.onChange = function() {
        var sum = (""+totalElBn.getValue()).split(".");
        var d = (""+billInfoDatePayBnO.getValue()).split(".");

        if (!isUpdating) {
            try {
                Pankkiviivakoodi.strict = true;
                Pankkiviivakoodi.luo(barcodeEl, accountNumberBn.getValue(),
                                     sum[0], sum[1], (""+refNumBnO.getValue()),
                                     d[0], d[1], d[2]);
            }
            catch(e) {
                console.warn(e);
                BillMachine.notification(e, BillMachine.notification.TYPE_WARN);
            }
        }
    };

    var dateChangeBnListener = new bn(dateEl);
    dateChangeBnListener.onChange = function() {
        date = bn.stringToDate(bn.text(dateEl));
        dateBn.notify();
    };

    var calcRefNum = function(billId) {
        var wc = 0;

        var weights = [7, 3, 1];
        var weightsCount = 3;
        var c = 0;
        for (var i=billId.length-1; i>=0; --i) {
            wc += bn.val(billId.charAt(i)) * weights[c%weightsCount];
            c++;
        }

        var checkNum = (Math.ceil(wc/10)*10) - wc;
        if (checkNum == "10") checkNum = 0;

        return billId +""+ checkNum;
    };

    var deleteAllJobRows = function() {
        for (var i=0, l=jobRows.length; i<l; ++i) {
            jobRows[i].remove();
        }
        jobRows = [];
    };

    var addJobRow = function() {
        var jobRow = new JobRow();
        jobRow.el.children[0].focus();
        jobRows.push(jobRow);
        totalBn.add(jobRow.totalBnO);
        return jobRow;
    }

    var calcRowsTotal = function() {
        var vatTotal = 0;
        var total = 0;

        for (var i=0, l=totalBn.items.length; i<l; ++i) {
            var bno = totalBn.items[i];
            if (bno == undefined || bno.isJobBn == undefined) continue;

            vatTotal += bno.vat;
            total += bno.total;
        }
        novatTotalEl.textContent = bn.des2str(total - vatTotal);
        vatTotalEl.textContent = bn.des2str(vatTotal);
        totalEl.textContent = bn.des2str(total);

        totalElBn.setValue(bn.des2str(total));
    };

    var fillDateTodays = function() {
        var dateTodays = doc.querySelectorAll(".date-today");
        var dateToday = bn.dateToString(date);
        for (var i=0, l=dateTodays.length; i<l; ++i) {
            dateTodays[i].textContent = dateToday;
        }
    };

    var getDatePay = function(datesToPay) {
        datesToPay = bn.val(datesToPay);
        var datesToPayMillis = datesToPay * 24 * 60 * 60 * 1000;
        var d = new Date(+date + datesToPayMillis);
        return bn.dateToString(d);
    };

    var BillMachine = {};

    BillMachine.initPage = function() {
        date = new Date();

        totalBn = new bn(totalBnListener);

        deleteAllJobRows();
    };
    BillMachine.update = function() {

        accountNumberBn.setValue(bn.text(accountNumberEl));
        accountShortCodeBn.setValue(bn.text(accountShortCodeEl));
        clientInfoBn.setValue(bn.text(clientEl));

        refnumBn.setValue(bn.text(billIdEl));

        fillDateTodays();

        datesToPayElBnE.notify();
        accountNumberBn.notify();

        JobRow.newJobRowEl.addEventListener("click", addJobRow, false);
    };

    BillMachine.init = function() {
        isUpdating = true;
        BillMachine.initPage();
        BillMachine.update();
        isUpdating = false;
    };

    BillMachine.addJobRow = addJobRow;

    BillMachine.getJobRows = function() {
        return jobRows;
    };

    BillMachine.getJobRowsJSON = function() {
        var arr = [];
        for (var i=0, l=jobRows.length; i<l; ++i) {
            if (!jobRows[i].deleted) {
                arr.push(jobRows[i].toJSON());
            }
        }
        return arr;
    };

    BillMachine.setJobRowsFromJSON = function(json) {
        deleteAllJobRows();
        for (var i=0, l=json.length; i<l; ++i) {
            addJobRow().fromJSON(json[i]);
        }
    };

    BillMachine.getJSON = function() {
        return {
            biller_name: bn.text(billerNameEl),
            payment_receiver: bn.text(paymentReceiverEl),

            bill_name: bn.text(billNameEl),
            bill_id: bn.text(billIdEl),
            ref_num: bn.text(refnumEl),

            date: bn.text(dateEl),
            date_pay: bn.text(datePayEl),
            days_to_pay: bn.text(datesToPayEl),
            pay_interest: bn.text(payInterestEl),

            client: bn.text(clientEl),
            additional_info: bn.text(additionalInfoEl),

            no_vat_total: bn.text(novatTotalEl),
            vat_total: bn.text(vatTotalEl),
            total: bn.text(totalEl),

            account_number: bn.text(accountNumberEl),
            account_shortcode: bn.text(accountShortCodeEl),

            job_rows: BillMachine.getJobRowsJSON(),

            footer1: bn.text(footer1El),
            footer2: bn.text(footer2El),
            footer3: bn.text(footer3El),

            notes: bn.text(notesEl)
        };
    };

    BillMachine.loadFromJSON = function(json) {
        isUpdating = true;
        BillMachine.initPage();

        bn.text(billerNameEl, json.biller_name);
        bn.text(paymentReceiverEl, json.payment_receiver);

        bn.text(billNameEl, json.bill_name);
        bn.text(billIdEl, json.bill_id);

        date = bn.stringToDate(json.date);
        bn.text(datesToPayEl, json.days_to_pay);
        bn.text(payInterestEl, json.pay_interest);

        bn.text(clientEl, json.client);
        bn.text(additionalInfoEl, json.additional_info);

        bn.text(accountNumberEl, json.account_number);
        bn.text(accountShortCodeEl, json.account_shortcode);

        BillMachine.setJobRowsFromJSON(json.job_rows);

        bn.text(footer1El, json.footer1);
        bn.text(footer2El, json.footer2);
        bn.text(footer3El, json.footer3);

        bn.text(notesEl, json.notes);

        BillMachine.update();
        isUpdating = false;
        barcodeBnListener.onChange();
    };

    BillMachine.notification = function(msg, type) {
        if (!type) type = BillMachine.notification.TYPE_OK;

        var el = doc.createElement("div");
        el.className = "notification " + type;
        el.textContent = msg;

        doc.body.appendChild(el);

        setTimeout(function() {
            el.className += " active ";
        }, 100);
        setTimeout(function() {
            el.className = el.className.replace(" active", "");
        }, 1000);
        setTimeout(function() {
            el.remove();
        }, 1300);
    };
    BillMachine.notification.TYPE_OK = "ok";
    BillMachine.notification.TYPE_WARN = "warn";
    BillMachine.MIME_TYPE = "application/vnd.google.drive.ext-type.rlk";
    BillMachine.folderId = undefined;
    BillMachine.fileId = undefined;

    bn.BillMachine = BillMachine;

})(window, document, bn.JobRow);

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
