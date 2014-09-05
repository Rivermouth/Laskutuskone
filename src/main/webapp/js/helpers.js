(function(bn) {
    /*
     * Helper functions
     */
    bn.text = function(el, txt) {
        if (txt != undefined) el.textContent = txt;
        else return el.textContent;
    };

    bn.html = function(el, h) {
        if (h) el.innerHTML = h;
        else return el.innerHTML;
    };

    bn.val = function(str) {
        var o = parseFloat(str);
        if (!o) o = 0;
        return o;
    };

    bn.elVal = function(el) {
        return bn.val(el.textContent);
    };

    bn.des2str = function(num) {
        return num.toFixed(2);
    };

    bn.dateToString = function(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return d + "." + m + "." + y;
    };

    bn.stringToDate = function(str) {
        var d = new Date();
        var p = str.split(".");
        d.setDate(p[0]);
        d.setMonth(p[1]-1);
        d.setFullYear(p[2]);

        return d;
    };

    bn.hasClass = function(element, className) {
        return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
    };

    bn.addClass = function(element, className) {
        if(!bn.hasClass(element, className)) {
            element.className += " " + className;
            return true;
        }
        return false;
    };

    bn.removeClass = function(element, className) {
        if(bn.hasClass(element, className)) {
            element.className = element.className.replace(className, "");
            return true;
        }
        return false;
    };

    bn.toggleClass = function(element, className) {
        if(!bn.addClass(element, className)) {
            bn.removeClass(element, className);
            return false;
        }
        return true;
    };

    bn.parseQueryString = function(queryString) {
        var params = {}, queries, temp, i, l;

        // Split into key/value pairs
        queries = queryString.split("&");

        // Convert the array of strings into an object
        for ( i = 0, l = queries.length; i < l; i++ ) {
            temp = queries[i].split('=');
            params[temp[0]] = temp[1];
        }

        return params;
    };

    bn.urlParams = bn.parseQueryString(location.search.substring(1));
})(bn);

Blob = (function() {
  var nativeBlob = Blob;

  // Add unprefixed slice() method.
  if (Blob.prototype.webkitSlice) {
    Blob.prototype.slice = Blob.prototype.webkitSlice;
  }
  else if (Blob.prototype.mozSlice) {
    Blob.prototype.slice = Blob.prototype.mozSlice;
  }

  // Temporarily replace Blob() constructor with one that checks support.
  return function(parts, properties) {
    try {
      // Restore native Blob() constructor, so this check is only evaluated once.
      Blob = nativeBlob;
      return new Blob(parts || [], properties || {});
    }
    catch (e) {
      // If construction fails provide one that uses BlobBuilder.
      Blob = function (parts, properties) {
        var bb = new (WebKitBlobBuilder || MozBlobBuilder), i;
        for (i in parts) {
          bb.append(parts[i]);
        }
        return bb.getBlob(properties && properties.type ? properties.type : undefined);
      };
    }
  };
}());
