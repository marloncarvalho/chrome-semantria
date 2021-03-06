/**
 * This file is part of Semantria Chrome Extension.
 *
 *  Semantria Chrome Extension is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Semantria Chrome Extension is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *   along with Semantria Chrome Extension.  If not, see <http://www.gnu.org/licenses/>.
 **/

var credentials = {};
var selectedText = "";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "openResult") {
        selectedText = request.text;
        chrome.tabs.create({
            url: chrome.extension.getURL('result.html'),
            active: false
        }, function (tab) {
            chrome.windows.create({
                tabId: tab.id,
                type: 'popup',
                focused: true
            });
        });
    } else {
        sendResponse({});
    }
});


/**
 * Handle user click on our context menu item.
 *
 * @param info Context menu info.
 * @param tab Tab.
 */
function optionItemOnClick(info, tab) {
    chrome.storage.sync.get("credentials", function (value) {
        credentials = value.credentials;
        if (credentials.key == null || credentials.secret == null || credentials.key == "" || credentials.secret == "") {
            alert("You must provide your Semantria Key and Secret. Click OK to be redirected to the Options Page.");
            chrome.tabs.create({url: "options.html"});
        } else if (info.selectionText == null || info.selectionText == "") {
            alert("No selection!");
        } else {
            selectedText = info.selectionText;
            chrome.tabs.create({
                url: chrome.extension.getURL('result.html'),
                active: false
            }, function (tab) {
                chrome.windows.create({
                    tabId: tab.id,
                    type: 'popup',
                    focused: true
                });
            });
        }
    });
}

/**
 * Checks if this is the first time run.
 * If yes, show options pages.
 */
function install_notice() {
    if (localStorage.getItem('install_time')) {
        if (credentials.key == null || credentials.secret == null || credentials.key == "" || credentials.secret == "") {
            alert("You must provide your Semantria Key and Secret. Click OK to be redirected to the Options Page.");
            chrome.tabs.create({url: "options.html"});
        }
        return;
    } else {
        var now = new Date().getTime();
        localStorage.setItem('install_time', now);
        chrome.tabs.create({url: "options.html"});
    }
}

chrome.storage.sync.get("credentials", function (value) {
    credentials = value.credentials;
    install_notice();
});



// Adding a Context Menu Option.
chrome.contextMenus.create({"title": "Sentiment Analysis by Semantria", "contexts": ["selection"], "onclick": optionItemOnClick});

