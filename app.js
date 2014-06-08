var BillMachine = {};

BillMachine.initPage = function() {
    
    var win = window;
    var doc = document;
    
    /* 
     * Helper functions 
     */
    var text = function(el, txt) {
        if (txt) el.textContent = txt;
        else return el.textContent;
    };
    
    var html = function(el, h) {
        if (h) el.innerHTML = h;
        else return el.innerHTML;
    };
    
    var val = function(str) {
        var o = parseFloat(str);
        if (!o) o = 0;
        return o;
    };
    
    var elVal = function(el) {
        return val(el.textContent);
    };
    
    var des2str = function(num) {
        return num.toFixed(2);
    };
    
    var dateToString = function(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return d + "." + m + "." + y;
    };
    
    var stringToDate = function(str) {
        var d = new Date();
        var p = str.split(".");
        d.setDate(p[0]);
        d.setMonth(p[1]-1);
        d.setFullYear(p[2]);
        
        return d;
    };
    /* 
     * END
     * Helper functions 
     */
    
    var billInfoTable = doc.querySelector("#bill-info-table");
    var billIdEl = doc.querySelector("#bill-id");
    var refnumEl = doc.querySelector("#refnum");
    var dateEl = doc.querySelector("#date");
    var datePayEl = doc.querySelector("#date-pay");
    var datesToPayEl = doc.querySelector("#dates-to-pay");
    var payInterestEl = doc.querySelector("#pay-interest");
    var accountNumberEl = doc.querySelector("#account-number");
    var accountShortCodeEl = doc.querySelector("#account-shortcode");
    var clientEl = doc.querySelector("#client-info");
    var jobsTableEl = doc.querySelector("#jobs-table");
    var newJobRowEl = doc.querySelector("#new-job-row");
    var novatTotalEl = doc.querySelector("#novat-total");
    var vatTotalEl = doc.querySelector("#vat-total");
    var totalEl = doc.querySelector("#total");
    var footer1El = doc.querySelector("#footer-1");    
    var footer2El = doc.querySelector("#footer-2");    
    var footer3El = doc.querySelector("#footer-3");
    var barcodeEl = doc.querySelector("#barcode");
    
    var date = new Date();
    
    var calcRefNum = function(billId) {
        var wc = 0;
        
        var weights = [7, 3, 1];
        var weightsCount = 3;
        var c = 0;
        for (var i=billId.length-1; i>=0; --i) {
            wc += val(billId.charAt(i)) * weights[c%weightsCount];
            c++;
        }
        
        var checkNum = (Math.ceil(wc/10)*10) - wc;
        if (checkNum == "10") checkNum = 0;
        
        return billId +""+ checkNum;
    };
    
    var delEvent = function(evt) {
        evt.preventDefault();
        if (confirm("Really delete?")) {
            this.remove();
        }
    };
    
    var addDelEvent = function(el) {
        el.addEventListener("contextmenu", delEvent, false);
    };
    
    var totalElBn = new bn(".total");
    
    var totalBnListener = new bn.O();
    totalBnListener.onChange = function() {
        calcRowsTotal();
    };
    
    var totalBn = new bn(totalBnListener);
    
    var jobRows = [];
    
    var deleteAllJobRows = function() {
        for (var i=0, l=jobRows.length; i<l; ++i) {
            jobRows[i].remove();
        }
    };
    
    var JobRow = function(rowEl) { 
        this.totalBnO = new bn.O();
        this.totalBnO.isJobBn = true;
        
        this.el = newJobRowEl.cloneNode(true);
        this.el.id = "";
        this.el.className = "job-row";
        
        newJobRowEl.parentElement.insertBefore(this.el, newJobRowEl);
        addDelEvent(this.el);
        
        var _this = this;
        this.el.addEventListener("contextmenu", function() {
            totalBn.remove(_this.totalBnO);
            this.remove();
            totalBn.notify();
        }, false);
        
        this.descEl = this.el.querySelector(".desc");
        this.countEl = this.el.querySelector(".count");
        this.countUnitEl = this.el.querySelector(".count-unit");
        this.apriceEl = this.el.querySelector(".aprice");
        this.alvpEl = this.el.querySelector(".alvp");
        this.alveEl = this.el.querySelector(".alve");
        this.sumEl = this.el.querySelector(".sum");
        
        this.addBind();
    };
    JobRow.prototype.remove = function() {
        this.el.remove();
        delete this;
    };
    JobRow.prototype.count = function() {
        var alve = elVal(this.countEl) * elVal(this.apriceEl) * (elVal(this.alvpEl)/100);
        var sum = elVal(this.countEl) * elVal(this.apriceEl) + alve;

        this.apriceEl.textContent = des2str(elVal(this.apriceEl));
        this.alveEl.textContent = des2str(alve);
        this.sumEl.textContent = des2str(sum);

        this.totalBnO.vat = alve;
        this.totalBnO.total = sum;

        totalBn.notify();
    };
    JobRow.prototype.addBind = function() {
        this.totalBnO.vat = 0;
        this.totalBnO.total = 0;
        
        var jobBn = new bn.oneway(this.countEl, this.apriceEl, this.alvpEl);
        var _this = this;
        jobBn.onChange = function(value) {
            _this.count();
        };
        
        totalBn.add(this.totalBnO);
        totalBn.notify();
    };
    JobRow.prototype.toJSON = function() {
        var o = {
            description: text(this.descEl),
            count: text(this.countEl),
            count_unit: text(this.countUnitEl),
            aprice: text(this.apriceEl),
            alvp: text(this.alvpEl),
            avle: text(this.alveEl),
            sum: text(this.sumEl)
        };
        return o;
    };
    JobRow.prototype.fromJSON = function(json) {
        text(this.descEl, json.description);
        text(this.countEl, json.count);
        text(this.countUnitEl, json.count_unit);
        text(this.apriceEl, json.aprice);
        text(this.alvpEl, json.alvp);
        
        this.count();
    };
    
    var addJobRow = function() {
        var jobRow = new JobRow();
        jobRow.el.children[0].focus();
        jobRows.push(jobRow);
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
        novatTotalEl.textContent = des2str(total - vatTotal);
        vatTotalEl.textContent = des2str(vatTotal);
        totalEl.textContent = des2str(total);
        console.log(total);
        totalElBn.setValue(total);
    };
    
    var fillDataTodays = function() {
        var dateTodays = doc.querySelectorAll(".date-today");
        var dateToday = dateToString(date);
        for (var i=0, l=dateTodays.length; i<l; ++i) {
            dateTodays[i].textContent = dateToday;
        }
    };
    
    var getDatePay = function(datesToPay) {
        datesToPay = val(datesToPay);
        var datesToPayMillis = datesToPay * 24 * 60 * 60 * 1000;
        var d = new Date(+date + datesToPayMillis);
        return dateToString(d);
    };
    
    fillDataTodays();
    
    newJobRowEl.addEventListener("click", addJobRow, false);
    
    var billInfoDatePayBnO = new bn.O();
    billInfoDatePayBnO.onChange = function(value) {
        this.value = getDatePay(value);
        datePayEl.textContent = this.value;
    };
    
    var refNumBnO = new bn.O();
    refNumBnO.onChange = function(value) {
        this.value = calcRefNum(value);
        refnumEl.textContent = this.value;
    };
    
    
    new bn(billInfoDatePayBnO, datesToPayEl);
    new bn(refNumBnO, billIdEl);
    
    var accountNumberBn = new bn("#account-number").setValue(text(accountNumberEl));
    new bn(".account-shortcode").setValue(text(accountShortCodeEl));
    new bn(".client-info").setValue(text(clientEl));
    
    var barcodeBnListener = new bn(billInfoDatePayBnO, refNumBnO, accountNumberBn, totalElBn);
    barcodeBnListener.onChange = function() {
        if ((function(bnArr) {
            for (var i=0, l=bnArr.length; i<l; ++i) {
//                console.log(bnArr[i].getValue());
                if (bnArr[i].getValue() == undefined) return false;
            }
            return true;
        })([billInfoDatePayBnO, refNumBnO, accountNumberBn, totalElBn])) {
            var sum = (""+totalElBn.getValue()).split(".");
            var d = billInfoDatePayBnO.getValue().split(".");
            Pankkiviivakoodi.luo(barcodeEl, accountNumberBn.getValue(), 
                                 sum[0], sum[1], refNumBnO.getValue(), 
                                 d[0], d[1], d[2]);
        }   
    };
    
    /* Public functions */
    
    BillMachine.addJobRow = addJobRow;
    
    BillMachine.getJobRows = function() {
        return jobRows;
    };
    
    BillMachine.getJobRowsJSON = function() {
        var arr = [];
        for (var i=0, l=jobRows.length; i<l; ++i) {
            arr.push(jobRows[i].toJSON());
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
            bill_id: text(billIdEl),
            ref_num: text(refnumEl),
            
            date: text(dateEl),
            date_pay: text(datePayEl),
            days_to_pay: text(datesToPayEl),
            pay_interest: text(payInterestEl),
            
            client: text(clientEl),
            
            no_vat_total: text(novatTotalEl),
            vat_total: text(vatTotalEl),
            total: text(totalEl),
            
            job_rows: BillMachine.getJobRowsJSON(),
            
            footer1: html(footer1El),
            footer2: html(footer2El),
            footer3: html(footer3El)
        };
    };
    
    BillMachine.loadFromJSON = function(json) {
        text(billIdEl, json.bill_id);
        date = stringToDate(json.date);
        text(datesToPayEl, json.days_to_pay);
        text(payInterestEl, json.pay_interest);
        text(clientEl, json.client);
        BillMachine.setJobRowsFromJSON(json.job_rows);
        html(footer1El, json.footer1);
        html(footer2El, json.footer2);
        html(footer3El, json.footer3);
    };
    
};
    
(function(win, doc) {
    
    var pageEl = doc.querySelector("#page");
    var saveNameInputEl = doc.querySelector("#save-name");
    var saveButtonEl = doc.querySelector("#save");
    var loadButtonEl = doc.querySelector("#load");
    var newButtonEl = doc.querySelector("#new");
    var savedBillsEl = doc.querySelector("#saved-bills");
    
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
        };
    };
    
    var openSaved = function(name) {
        if (hasChangesCheck()) {
            BillMachine.loadFromJSON(JSON.parse(localStorage[name]));
            saveNameInputEl.value = name;
            setHasChangesFalse();
            return true;
        }
        return false;
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
            setHasChangesFalse();
            localStorage[name] = JSON.stringify(BillMachine.getJSON());
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