/***
 * BillMachine
 */

(function(win, doc, JobRow, bn) {

    /* Elements */
	var logoEl = doc.querySelector("#logo");
	var logoWrapperEl = doc.querySelector("#logo-wrapper");
	var logoInputEl = doc.querySelector("#logo-input");
	var logoRemoveEl = doc.querySelector("#logo-remove");
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
	
	var CONFIRM_IMAGE_REMOVE = "Haluatko varmasti poistaa kuvan?";


    var jobRows = [];

    var isUpdating = false;

    var date;
	
	
	/* BNs */
	
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
	
	var logoBnO = new bn.O();
	var logoBn = new bn(logoBnO);
	logoBnO.onChange = function(value) {
		value = value || "";
		logoEl.src = value;
		if (value.length <= 0) {
			logoWrapperEl.className += " no-image ";
		}
		else {
			logoWrapperEl.className = logoWrapperEl.className.replace(" no-image ", "");
		}
	};
	logoInputEl.onchange = function(evt) {
		var file = evt.target.files[0];
		if (!file) return;
		
		var reader = new FileReader();
		reader.onload = function(ev) {
			logoBn.setValue(ev.target.result);
		};
		reader.readAsDataURL(file);
	};
	logoRemoveEl.onclick = function() {
		if (!confirm(CONFIRM_IMAGE_REMOVE)) return;
		logoBn.setValue(null);
	};
	
	/* END BNs */
	
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
        BillMachine.loadFromJSON(BillMachine.getDefaultJSON());
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

    BillMachine.getDefaultJSON = function() {
        return {
			"logo_base64":"",
            "biller_name":"Laskuttaja Oy",
            "payment_receiver":"Saaja Sallinen",
            "bill_name":"Laskun nimi",
            "bill_id":"",
            "ref_num":"",
            "date":bn.dateToString(date),
            "date_pay":"",
            "days_to_pay":"14",
            "pay_interest":"8.0%",
            "client":"Ostaja Oy\nMikko Maksaja\nHankintatie 12\n00100 Helsinki",
            "additional_info":"Lasku 1.2. - 29.2.2014 väliseltä ajalta",
            "no_vat_total":"0.00",
            "vat_total":"0.00",
            "total":"0.00",
            "account_number":"",
            "account_shortcode":"",
            "job_rows":[],
            "footer1":"Laskuttaja Oy\nLaskutuskatu 9\n00100 Helsinki",
            "footer2":"+358 50 123 1234\nemail@email.fi\nwww.laskuttajaoy.fi",
            "footer3":"Y-tunnus: 1234567-8\nKotipaikka Helsinki",
            "notes":"Huomioita"
        };
   };

    BillMachine.getJSON = function() {
        return {
			logo_base64: logoBn.getValue(),
			
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
		
		logoBn.setValue(json.logo_base64);
		
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

    BillMachine.notification = (function() {
		var dismiss = function(notifEl) {
			notifEl.className = notifEl.className.replace(" active", "");
			setTimeout(function() {
				notifEl.remove();
			}, 300);
		};
		
		var notification = function(msg, type, force) {
			// Remove ongoing forced notification
			if (notification.ongoing !== null) {
				dismiss(notification.ongoing);
			}

			if (!type) type = notification.TYPE_OK;

			var el = doc.createElement("div");
			el.className = "notification-wrapper";
			var elInner = doc.createElement("div");
			elInner.className = "notification " + type;
			elInner.textContent = msg;

			el.appendChild(elInner);
			doc.body.appendChild(el);

			setTimeout(function() {
				el.className += " active ";
			}, 100);

			if (!force) {
				setTimeout(function() {
					dismiss(el);
				}, 1000);
			}
			else {
				el.className += " ongoing";
				notification.ongoing = el;
			}
		};
		
		notification.ongoing = null;
		notification.TYPE_OK = "ok";
		notification.TYPE_WARN = "warn";
		
		return notification;
	})();
	
    BillMachine.MIME_TYPE = "application/vnd.google.drive.ext-type.rlk";
    BillMachine.folderId = undefined;
    BillMachine.fileId = undefined;

    bn.BillMachine = BillMachine;

})(window, document, bn.JobRow, bn);
