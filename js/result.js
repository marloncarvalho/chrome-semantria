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


/**
 * Process Semantria Reply.
 *
 * @param session Semantria Session.
 */
function processReply(session) {
	console.log('Processing Semantria Reply');
	$("#pleaseWaitDialog").modal('hide');

	var processedDocuments = session.getProcessedDocuments();
	if (processedDocuments && processedDocuments.constructor == Array) {
		if (processedDocuments.length < 1) {
			setTimeout(function() {
				processReply(session);
			}, 1000);
		}
		
		for (var i in processedDocuments) {
			showResult(processedDocuments[i]);
		}
	} else {
		alert("No results!");
	}
};

/**
 * Send a request to the Semantria API.
 *
 * @param selectedText Text to be processed.
 */
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

/**
 * Fill tables.
 *
 * @param table Table to be filled.
 * @param list Data.
 */
function fill(table, list) {
	for(var i=0; i < list.length; i++) {
		var data = list[i];
		var tr = document.createElement("TR");

		var tdName = document.createElement("TD");
		tdName.innerHTML = data.title;
		tr.appendChild(tdName);

		var tdSentiment = document.createElement("TD");
		if(data.sentiment_score != null) {
			var span = document.createElement("SPAN");

			if(data.sentiment_score > 0) {
				span.className = "label label-success";
			} else if(data.sentiment_score < 0) {
				span.className = "label label-danger";
			} else {
				span.className = "label label-default";
			}

			span.innerHTML = data.sentiment_score;
			tdSentiment.appendChild(span);
		}
		tr.appendChild(tdSentiment);

		var tdPolarity = document.createElement("TD");
		if(data.sentiment_polarity != null) {
			tdPolarity.innerHTML = data.sentiment_polarity;
		}
		tr.appendChild(tdPolarity);

		table.appendChild(tr);
	}
}

/**
 * Show Result.
 *
 * @param result Semantria response.
 */
function showResult(result) {
	if(result != null) {
		document.getElementById("overall_sentiment").innerHTML = result.sentiment_score;

		var entities = result.entities;
		if(entities != null) {
			fill(document.getElementById("entities"), entities);
		}

		var topics = result.topics;
		if(topics != null) {
			fill(document.getElementById("topics"), topics);
		}

		var phrases = result.phrases;
		if(phrases != null) {
			fill(document.getElementById("phrases"), phrases);
		}

		var themes = result.themes;
		if(entities != null) {
			fill(document.getElementById("themes"), themes);
		}

	}
}

$("#pleaseWaitDialog").modal('show');
sendServiceRequest(chrome.extension.getBackgroundPage().selectedText);

