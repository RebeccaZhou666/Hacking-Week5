// Alert the user of a new series
var alertVersion = "2.0"; // if the user has this version installed, then alert the user there's a new series
var alertHref = "#series3"; // element to animate

//---------------------------------------------------------------------------------------------------------------------------------
// SETUP

// get extension version from manifest.json
var version = chrome.runtime.getManifest().version;

// write version and other useful information to the console
var d = new Date();
var e = d.getFullYear();
// don't display "2018 - 2018"
var thisYear = "2018 - " + e;
if (thisYear == "2018 - 2018") {
  thisYear = "2018";
}
console.log("Animated New Tabs\n" + "© " + thisYear + " Drake Panzer (dpanzer.net)\n" + "Version: " + version + "\n------------------------------------------------------");

// save version number to Chrome storage
// chrome.storage.sync.set({
//   "version": version
// });

// reset the alert version variable
chrome.storage.local.set({
  newSeriesAlert: false
});

$.ajaxSetup({
  async: false
});

var userEmail;
var userID;

//---------------------------------------------------------------------------------------------------------------------------------

// runs on install. sends the user's info to the server so to set up their account
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    updateServer();
  } else if (details.reason == "update") {
    console.log("Extension Updated.");
    if (alertVersion == version) {
      console.log("New series available!");
      chrome.browserAction.setBadgeText({ // set an icon notification
        text: "NEW!"
      });
      chrome.storage.local.set({
        newSeriesAlert: true,
        newSeriesHref: alertHref
      });
    }
  }
  updateServer();
});

getInfo();

// get user's email and Google ID
function getInfo() {
  // If the user isn't signed in, give them a string instead of an email.
  chrome.identity.getProfileUserInfo(function userinfo(userinfo) {
    userEmail = userinfo.email;
    userID = userinfo.id;
    second();
  });

  function second() {
    if (userEmail === "" || userEmail === null) { // if the user isn't signed in dont sync
      userEmail = "notsignedin";
      console.log("User not signed in. Syncing disabled.");
    }
    getTab();
  }
}

// send the user's information
function updateServer() {
  $.getJSON("http://api.ipstack.com/check?access_key=a6bbc27a6363921bf037bf9891a7b17c", function(data) {
    userIP = data.ip;
    userCty = data.city;
    userRgn = data.region_name;
    userCtry = data.country_name;
  });

  function sendInfo() {
    chrome.storage.sync.get("privacyEnabled", function(item) {
      privacyEnabled = item.privacyEnabled;
      var firstData = {};
      if (privacyEnabled == "true") { // if user has Privacy Mode enabled just send email and uid
        firstData = {
          userID: userID,
          userEmail: userEmail,
          version: version
        };
        console.log("Privacy Mode enabled, only UID sent.");
      } else {
        firstData = {
          userID: userID,
          userEmail: userEmail,
          userIP: userIP,
          userCty: userCty,
          userRgn: userRgn,
          userCtry: userCtry,
          version: version
        };
        chrome.storage.sync.set({
          "privacyEnabled": "false"
        });
      }

      $.ajax({
        type: "POST",
        url: "https://files.dpanzer.net/files/script/animated-new-tabs/firstrun.php",
        data: firstData,
        dataType: "text"
      });
    });

  }
  sendInfo();
  console.log("User set up with server.");

  chrome.runtime.onInstalled.addListener(function(details) { // prevent asking the user to pick a tab if the extension was updated
    if (details.reason == "install") {
      chrome.storage.sync.get("setPage", function(items) {
        if (items.setPage == null) {
          console.log("No tab set in extension.");
          var exURL = chrome.extension.getURL('dist/options.html');
          var optionsUrl = exURL + "?notab=true";
          chrome.tabs.create({
            url: optionsUrl
          });
        }
      });
    }
  });
}

// get the user's tab from their server profile
function getTab() {
  var userTabData = {
    userEmail: userEmail,
    uid: userID
  };

  $.ajax({
    type: "POST",
    url: "https://files.dpanzer.net/files/script/animated-new-tabs/data.php",
    data: userTabData,
    dataType: "JSON",
    success: function(response) {
      console.log("Synced Tab: " + response.tabID);
      if (response.tabID == null) {
        console.log("No tab saved on server.");
        chrome.storage.sync.get("setPage", function(item) {
          if (item.setPage == null) {
            console.log("No tab set in extension.");
            //var exURL = chrome.extension.getURL('dist/options.html');
            //var optionsUrl = exURL + "?notab=true"
            //chrome.tabs.create({
            //url: optionsUrl
            //});
            chrome.runtime.openOptionsPage()
          } else {
            syncTab();
          }
        });
        return;
      } else {
        chrome.storage.sync.set({
          "setPage": response.tabID
        });
      }
    }
  });
  refreshDB();
}

// update the user's server profile
function refreshDB() {
  var refreshData = {
    userID: userID,
    userEmail: userEmail,
    version: version
  };
  $.ajax({
    type: "POST",
    url: "https://files.dpanzer.net/files/script/animated-new-tabs/refreshdb.php",
    data: refreshData,
    dataType: "text"
  });
  console.log("Server DB refreshed.");
}

// send new tab when saved
function syncTab() {
  chrome.storage.sync.get("privacyEnabled", function(item) {
    var privacyEnabled = item.privacyEnabled;
    if (privacyEnabled == "true") {
      console.log("Sync blocked, disabled by user.");
    } else {
      chrome.storage.sync.get("setPage", function(item) {
        if (item.setPage === null) {
          console.log("null");
        }

        var updateData = {
          userEmail: userEmail,
          tabID: item.setPage
        };
        $.ajax({
          type: "POST",
          url: "https://files.dpanzer.net/files/script/animated-new-tabs/save.php",
          data: updateData,
          dataType: "text"
        });
      });
    }
  });
  console.log("Tab synced with server.");
}

// set uninstall url. Have to wait 3 seconds for the main program to set "userEmail" before it is assigned here
setTimeout(function() {
  chrome.runtime.setUninstallURL("http://files.dpanzer.net/files/script/animated-new-tabs/delete.php?user=" + userEmail, function() {});
}, 3000);

// If the user has turned on the quickbar and/or privacy mode
chrome.storage.sync.get("quickBar", function(item) {
  if (item.quickBar == null) {
    chrome.storage.sync.set({
      "quickBar": false
    });
  }
});
chrome.storage.sync.get("privacyEnabled", function(item) {
  if (item.privacyEnabled == null) {
    chrome.storage.sync.set({
      "privacyEnabled": false
    });
  }
});

// open the joke tab menu
function joke() {
  chrome.windows.create({
    url: "dist/html/joke.html",
    type: "popup",
    height: 10000,
    width: 10000,
  });
}
