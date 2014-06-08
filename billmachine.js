/***
 * BillMachine
 */

(function(win, doc) {
    
    /* 
     * Helper functions 
     */
    var text = function(el, txt) {
        if (txt != undefined) el.textContent = txt;
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
    
    /* Strings */
    var CONFIRM_DELETE      = "Haluatko varmasti poistaa kyseisen kohteen?"
    ;
    
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
    
    
    var JobRow = function(rowEl) { 
        this.totalBnO = new bn.O();
        this.totalBnO.isJobBn = true;

        this.el = JobRow.newJobRowEl.cloneNode(true);
        this.el.id = "";
        this.el.className = "job-row";

        JobRow.newJobRowEl.parentElement.insertBefore(this.el, JobRow.newJobRowEl);
        this.addDelEvent();

        var _this = this;
        this.el.addEventListener("contextmenu", function() {
            _this.totalBnO.remove();
            this.remove();
        }, false);

        this.descEl = this.el.querySelector(".desc");
        this.countEl = this.el.querySelector(".count");
        this.countUnitEl = this.el.querySelector(".count-unit");
        this.apriceEl = this.el.querySelector(".aprice");
        this.alvpEl = this.el.querySelector(".alvp");
        this.alveEl = this.el.querySelector(".alve");
        this.sumEl = this.el.querySelector(".sum");

        this.apriceEl.onblur = function() {
            this.textContent = des2str(elVal(this));
        }

        this.addBind();
    };
    JobRow.newJobRowEl = doc.querySelector("#new-job-row");
    JobRow.prototype.remove = function() {
        this.el.remove();
    };
    JobRow.prototype.delEvent = function(evt) {
        evt.preventDefault();
        if (confirm(CONFIRM_DELETE)) {
            this.remove();
        }
    };
    JobRow.prototype.addDelEvent = function() {
        this.el.addEventListener("contextmenu", this.delEvent, false);
    };
    JobRow.prototype.count = function() {
        var alve = elVal(this.countEl) * elVal(this.apriceEl) * (elVal(this.alvpEl)/100);
        var sum = elVal(this.countEl) * elVal(this.apriceEl) + alve;

        this.alveEl.textContent = des2str(alve);
        this.sumEl.textContent = des2str(sum);

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
    
    var isUpdating = false;
    
    var date;
    var jobRows = [];
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
        novatTotalEl.textContent = des2str(total - vatTotal);
        vatTotalEl.textContent = des2str(vatTotal);
        totalEl.textContent = des2str(total);

        totalElBn.setValue(des2str(total));
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

    var BillMachine = {};
    
    BillMachine.initPage = function() {
        date = new Date();

        totalBn = new bn(totalBnListener);

        deleteAllJobRows();
    };
    BillMachine.update = function() {
        
        accountNumberBn.setValue(text(accountNumberEl));
        accountShortCodeBn.setValue(text(accountShortCodeEl));
        clientInfoBn.setValue(text(clientEl));

        refnumBn.setValue(text(billIdEl));
    
        fillDataTodays();

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
            biller_name: text(billerNameEl),
            payment_receiver: text(paymentReceiverEl),
            
            bill_name: text(billNameEl),
            bill_id: text(billIdEl),
            ref_num: text(refnumEl),

            date: text(dateEl),
            date_pay: text(datePayEl),
            days_to_pay: text(datesToPayEl),
            pay_interest: text(payInterestEl),

            client: text(clientEl),
            additional_info: text(additionalInfoEl),

            no_vat_total: text(novatTotalEl),
            vat_total: text(vatTotalEl),
            total: text(totalEl),
            
            account_number: text(accountNumberEl),
            account_shortcode: text(accountShortCodeEl),

            job_rows: BillMachine.getJobRowsJSON(),

            footer1: text(footer1El),
            footer2: text(footer2El),
            footer3: text(footer3El),
            
            notes: text(notesEl)
        };
    };

    BillMachine.loadFromJSON = function(json) {
        isUpdating = true;
        BillMachine.initPage();
        
        text(billerNameEl, json.biller_name);
        text(paymentReceiverEl, json.payment_receiver);
        
        text(billNameEl, json.bill_name);
        text(billIdEl, json.bill_id);
        
        date = stringToDate(json.date);
        text(datesToPayEl, json.days_to_pay);
        text(payInterestEl, json.pay_interest);
        
        text(clientEl, json.client);
        text(additionalInfoEl, json.additional_info);
        
        text(accountNumberEl, json.account_number);
        text(accountShortCodeEl, json.account_shortcode);
        
        BillMachine.setJobRowsFromJSON(json.job_rows);
        
        text(footer1El, json.footer1);
        text(footer2El, json.footer2);
        text(footer3El, json.footer3);
        
        text(notesEl, json.notes);
        
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
    
    win["BillMachine"] = BillMachine;
    
})(window, document);
