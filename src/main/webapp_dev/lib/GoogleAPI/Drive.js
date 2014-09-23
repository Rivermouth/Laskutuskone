var Drive = {};

Drive.iconLink = null;

Drive.byte64toWebSafe = function(byte64str) {
    return byte64str.replace(/\+/g,'-').replace(/\//g,'_'); //.replace(/\=/g,'*');
};

/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
Drive.insertFile = function(fileData, parentFolderId, fileId, thumbnailBase64, callback) {
  var boundary = '-------314159265358979323846';
  var delimiter = "\r\n--" + boundary + "\r\n";
  var close_delim = "\r\n--" + boundary + "--";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    var metadata = {
      'title': fileData.fileName,
      'mimeType': contentType
    };
    if (parentFolderId) {
        metadata["parents"] = [{
            "kind": "drive#fileLink",
            "id": parentFolderId
        }];
    }
    if (thumbnailBase64) {
        metadata["thumbnail"] = {
            image: Drive.byte64toWebSafe(thumbnailBase64.substring(thumbnailBase64.indexOf("base64,") + 7)),
            mimeType: thumbnailBase64.substring(5, thumbnailBase64.indexOf(";"))
        };
    }
    if (Drive.iconLink) {
        metadata["iconLink"] = Drive.iconLink;
    }

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files/' + (fileId ? fileId : ''),
        'method': (fileId ? 'PUT' : 'POST'),
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);
  }
};

/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
Drive.downloadFile = function(file, callback) {
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      callback(xhr.responseText);
    };
    xhr.onerror = function() {
      callback(null);
    };
    xhr.send();
  } else {
    callback(null);
  }
};

Drive.openFolderPicker = function(callback) {
    var params = {
        ViewId: "FOLDERS"
    };
    Drive.openPicker(null, callback, params);
};

Drive.openPicker = function(mimeTypes, callback, params) {
    // Use the Google API Loader script to load the google.picker script.
    function loadPicker() {
      gapi.load('picker', {'callback': createPicker});
    }

    // Use your own API developer key.
    var developerKey = 'AIzaSyBV6MeANy_ZaLB2f2c-XKCMA7hIu2Fy744';

    // Create and render a Picker object for searching images.
    function createPicker() {
      var viewId = params.ViewId || "DOCS";
      var view;
      if (viewId == "FOLDERS") {
          view = new google.picker.DocsView();
          view.setIncludeFolders(true);
          view.setMimeTypes('application/vnd.google-apps.folder');
          view.setSelectFolderEnabled(true);
      }
      else {
          view = new google.picker.View(google.picker.ViewId[viewId]);
          if (mimeTypes) view.setMimeTypes(mimeTypes);
      }
      var picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          //.setAppId(YOUR_APP_ID)
          .setOAuthToken(gapi.auth.getToken().access_token)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          //.setDeveloperKey(developerKey)
          .setCallback(pickerCallback)
          .build();
       picker.setVisible(true);
    }

    // A simple callback implementation.
    function pickerCallback(data) {
      if (data.action == google.picker.Action.CANCEL) {
          if (callback) callback(false);
      }
      else if (data.action == google.picker.Action.PICKED) {
        console.log(data);
        var fileId = data.docs[0].id;
        if (callback) callback(data.docs[0]);
      }
    }

    loadPicker();
};
