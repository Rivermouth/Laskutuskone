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