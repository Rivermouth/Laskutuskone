(function(win, doc) {
    
    var bn = {};
    
    /* bn object */
    bn.O = function() {
        this.link;
        this.value;
    };
    bn.O.prototype.value = undefined;
    bn.O.prototype.linkTo = function(link) {
        this.link = link;
    };
    bn.O.prototype.onChange = undefined;
    bn.O.prototype.commitChange = function(value) {
        this.value = value;
        if (this.link) this.link.onChange(value);
    };
    bn.O.prototype.notify = function() {
        this.commitChange(this.value);
    };
    bn.O.prototype.getValue = function() {
        return this.value;
    };
    bn.O.prototype.remove = function() {
        this.link.remove(this);
    };
    
    /* bn link */
    bn.Link = function() {
        this.value = undefined;
        
        this.nextId = 0;
        this.items = [];
        
        this.addAll = function(arr) {
            for (var i=0, l=arr.length; i<l; ++i) {
                this.add(arr[i]);
            }
        };
        this.addAll(arguments);
    };
    bn.Link.prototype = Object.create(bn.O.prototype);
    bn.Link.prototype.add = function(a) {
        if (!(a instanceof bn.O)) {
            if (typeof a == "string") {
                var els = doc.querySelectorAll(a);
                for (var i=0, l=els.length; i<l; ++i) {
                    this.add(new bn.E(els[i]));
                }
            }
            else {
                this.add(new bn.E(a));
            }
            return;
        }
        a._id = this.nextId;
        a.linkTo(this);
        this.items.push(a);
        
        this.nextId++;
    };
    bn.Link.prototype.remove = function(bno) {
        this.items[bno._id] = undefined;
        this.notify();
    };
    bn.Link.prototype.setValue = function(value) {
        this.onChange(value);
        return this;
    };
    bn.Link.prototype.onChange = function(value) {
        if (this.value === value) return;    
        
        this.value = value;
        this.notify();
    };
    bn.Link.prototype.notify = function() {   
        for (var i=0, l=this.items.length; i<l; ++i) {
            if (this.items[i] == undefined) continue;
            if (this.items[i].onChange) this.items[i].onChange(this.value);
        }
        
        this.commitChange(this.value);
    };
    
    /* bn oneway */
    bn.oneway = function() {
        bn.Link.apply(this, arguments);
    };
    bn.oneway.prototype = Object.create(bn.Link.prototype);
    bn.oneway.prototype.onChange = function(value) {
        this.value = value;
    };
    
    /* bn element */
    bn.E = function(htmlElement) {
        if (htmlElement == undefined || htmlElement.tagName == undefined) return;
        
        if (htmlElement.tagName.toLowerCase() == "input") {
            if (htmlElement.type == "checkbox") {
                return new bn.ECheckbox(htmlElement);
            }
            else {
                return new bn.EInput(htmlElement);
            }
        }
        
        this.el = htmlElement;
        
        var _this = this;
        this.el.addEventListener("keyup", function() {
            _this.notify();
        }, false);
    };
    bn.E.prototype = Object.create(bn.O.prototype);
    bn.E.prototype.notify = function() {
        this.commitChange(this.el.textContent);
    };
    bn.E.prototype.onChange = function(value) {
        this.el.textContent = value;
    };
    
    /* bn element input */
    bn.EInput = function(htmlElement) {
        if (htmlElement == undefined) return;
        this.el = htmlElement;
        
        var _this = this;
        this.el.addEventListener("keyup", function() {
            _this.notify();
        }, false);
    };
    bn.EInput.prototype = Object.create(bn.O.prototype);
    bn.EInput.prototype.notify = function() {
        this.commitChange(this.el.value);
    };
    bn.EInput.prototype.onChange = function(value) {
        this.el.value = value;
    };
    
    bn.ECheckbox = function(htmlElement) {
        if (htmlElement == undefined) return;
        this.el = htmlElement;
        
        var _this = this;
        this.el.addEventListener("change", function() {
            _this.notify();
        }, false);
    };
    bn.ECheckbox.prototype = Object.create(bn.O.prototype);
    bn.ECheckbox.prototype.notify = function() {
        this.commitChange(this.el.checked);
    };
    bn.ECheckbox.prototype.onChange = function(value) {
        this.el.checked = (value && value != false && value != "false");
    };
    
    win["bn"] = bn.Link;
    win["bn"].O = bn.O;
    win["bn"].E = bn.E;
    win["bn"].oneway = bn.oneway;

})(window, document);
