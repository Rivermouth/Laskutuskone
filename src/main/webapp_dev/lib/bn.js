/**
 * bn
 *
 * Usage, basic bind:
 * var myBn = new bn(".my-class");
 *
 * That links every element with "my-class" class name to
 * bn object. Changes made in any element is automatically updated to
 * other elements.
 */
(function(win, doc) {

    var bn = {};

    /**
     * bn object
     *
     * Basic class for every bn object.
     * Has basic functions and variables.
     */
    bn.O = function() {
        this.link = undefined;
        this.value = undefined;
    };
    /**
     * Link this bn object to bn link
     */
    bn.O.prototype.linkTo = function(link) {
        this.link = link;
    };
    /**
     * On change listener.
     * undefined by default
     */
    bn.O.prototype.onChange = undefined;
    /**
     * Commits change. Changes bn object's own value
     * and calls bn link's on change listener
     */
    bn.O.prototype.commitChange = function(value) {
        this.value = value;
        if (this.link) this.link.onChange(value);
    };
    /**
     * Notify bn object about value change.
     * Calls: this.commitChange(this.value);
     */
    bn.O.prototype.notify = function() {
        this.commitChange(this.value);
    };
    /**
     * Get value of this bn object
     */
    bn.O.prototype.getValue = function() {
        return this.value;
    };
    /**
     * Remove this bn object from bn link
     */
    bn.O.prototype.remove = function() {
        if (this.link) this.link.remove(this);
    };


    /**
     * bn link
     *
     * Links other bn objects together.
     * setValue(newValue) changes value of this link and delivers change
     * to linked bn objects.
     */
    bn.Link = function() {
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
    /**
     * Naive add function.
     * Accepts any type of argument.
     * Strings(css selector) > Try to create bn element object out of css
     *     selector and link it to this
     * bn object             > Link to this
     */
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
    /**
     * Remove bn object from link
     */
    bn.Link.prototype.remove = function(bno) {
        this.items[bno._id] = undefined;
        this.notify();
    };
    /**
     * Change value of link.
     * Causes change of value to every linked bn objects
     */
    bn.Link.prototype.setValue = function(value) {
        this.onChange(value);
        return this;
    };
    /**
     * on change listener
     */
    bn.Link.prototype.onChange = function(value) {
        if (this.value === value) return;

        this.value = value;
        this.notify();
    };
    /**
     * Notify link about value change
     */
    bn.Link.prototype.notify = function() {
        for (var i=0, l=this.items.length; i<l; ++i) {
            if (this.items[i] === undefined) continue;
            if (this.items[i].onChange) this.items[i].onChange(this.value);
        }

        this.commitChange(this.value);
    };

    /**
     * bn oneway
     *
     * One way bn link.
     * Only takes value in, never updates linked bn objects' value
     */
    bn.oneway = function() {
        bn.Link.apply(this, arguments);
    };
    bn.oneway.prototype = Object.create(bn.Link.prototype);
    bn.oneway.prototype.onChange = function(value) {
        this.value = value;
    };

    /**
     * bn element
     *
     * bn object for HTML elements.
     * On change event fired on key up
     *
     * @param htmlElement: JavaScript HTML element
     */
    bn.E = function(htmlElement) {
        if (htmlElement === undefined || htmlElement.tagName === undefined) return;

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

    /**
     * bn element input
     *
     * bn object for Input HTML elements
     * On change event fired on key up
     *
     * @param htmlElement: JavaScript HTML element
     */
    bn.EInput = function(htmlElement) {
        if (htmlElement === undefined) return;
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

    /**
     * bn element checkbox
     *
     * bn object for Checkbox HTML element
     * On change event fired on change
     *
     * @param htmlElement: JavaScript HTML element
     */
    bn.ECheckbox = function(htmlElement) {
        if (htmlElement === undefined) return;
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
        this.el.checked = (value && value !== false && value !== "false");
    };

    /* Public */
    win["bn"] = bn.Link;
    win["bn"].O = bn.O;
    win["bn"].E = bn.E;
    win["bn"].oneway = bn.oneway;

})(window, document);
