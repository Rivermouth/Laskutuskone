(function(win, doc, bn) {
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
            this.textContent = bn.des2str(bn.elVal(this));
        }

        this.addBind();
    };
    JobRow.newJobRowEl = doc.querySelector("#new-job-row");
    JobRow.prototype.remove = function() {
        this.el.remove();
        this.deleted = true;
    };
    JobRow.prototype.delEvent = function(evt) {
        evt.preventDefault();
        if (confirm(CONFIRM_DELETE)) {
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
