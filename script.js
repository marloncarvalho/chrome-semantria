var globalResult = null;

function processReply(session) {
	console.log('Processing Semantria Reply');

	var processedDocuments = session.getProcessedDocuments();
	if (processedDocuments && processedDocuments.constructor == Array) {
		if (processedDocuments.length < 1) {
			setTimeout(function() {
				processReply(session);
			}, 1000);
		}
		
		for (var i in processedDocuments) {
			var data = processedDocuments[i];
			var sentiment = data["sentiment_score"];
			globalResult = data;
			chrome.tabs.create({
				url: chrome.extension.getURL('result.html'),
				active: false
				}, function(tab) {
					chrome.windows.create({
						tabId: tab.id,
						type: 'popup',
						focused: true
            			});
        		});
		}
	} else {
		alert("No results! Did provide your Semantria Secret and Key at our Options Page?");
	}
};

function sendServiceRequest(selectedText) {
	var serializer = new JsonSerializer();
	var session = new Session(localStorage["semantria_key"], localStorage["semantria_secret"], serializer, 'Chrome Extension', true);
	var docs = [];

	var doc = {"id": 1, "text" : selectedText};
	docs.push(doc);	
	session.queueBatchOfDocuments(docs);

	setTimeout(function() {
		processReply(session);
	}, 1000);
}

function genericOnClick (info, tab) {
	chrome.tabs.sendRequest(tab.id, {method: "getSelection"}, function(response){
		if(localStorage["semantria_key"] == null || localStorage["semantria_secret"] == null || localStorage["semantria_key"] == "" || localStorage["semantria_secret"] == "") {
			alert("You must provide your Semantria Key and Secret. Click OK to be redirected to the Options Page.");
			chrome.tabs.create({url: "options.html"});
		} else if(response == null || response.data == null || response.data == "") {
			alert("No Selection");
		} else {
			sendServiceRequest(response.data);
		}
	});
}

function install_notice() {
	if (localStorage.getItem('install_time')) {
		if(localStorage["semantria_key"] == null || localStorage["semantria_secret"] == null || localStorage["semantria_key"] == "" || localStorage["semantria_secret"] == "") {
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

install_notice();
chrome.contextMenus.create({"title": "Sentiment Analysis by Semantria", "contexts":["selection"], "onclick": genericOnClick});

