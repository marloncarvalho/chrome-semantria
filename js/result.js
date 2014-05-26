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
        alert("Something went wrong. We couldn't contact Semantria API. Please, click OK and refresh this page.");
    }
    $("#pleaseWaitDialog").modal('hide');
};

/**
 * Send a request to the Semantria API.
 *
 * @param selectedText Text to be processed.
 */
function sendServiceRequest(selectedText) {
    chrome.storage.sync.get("credentials", function (value) {
        var credentials = value.credentials;
        var serializer = new JsonSerializer();
        var session = new Session(credentials.key, credentials.secret, serializer, 'Chrome Extension', true);
        var docs = [];

        var doc = {"id": 1, "text" : selectedText};
        docs.push(doc);
        session.queueBatchOfDocuments(docs);

        setTimeout(function() {
            processReply(session);
        }, 1000);
    });
}

/**
 * Fill tables.
 *
 * @param table Table to be filled.
 * @param list Data.
 */
function fill_table_sentiment(table, list) {
	for(var i=0; i < list.length; i++) {
		var data = list[i];
		var tr = $("<tr></tr>");

		var tdName = $("<td></td>");
		tdName.html(data.title);
		tr.append(tdName);

		var tdSentiment = $("<td></td>");
		if(data.sentiment_score != null) {
			var span = $("<span></span>");

			if(data.sentiment_score > 0) {
				span.addClass("label label-success");
			} else if(data.sentiment_score < 0) {
				span.addClass("label label-danger");
			} else {
				span.addClass("label label-default");
			}

			span.html(data.sentiment_score);
			tdSentiment.append(span);
		}
		tr.append(tdSentiment);

		var tdPolarity = $("<td></td>");
		if(data.sentiment_polarity != null) {
			tdPolarity.html(data.sentiment_polarity);
		}
		tr.append(tdPolarity);
		table.append(tr);
	}
}

/**
 * Show Results.
 *
 * @param result Semantria response.
 */
function showResult(result) {
	if(result != null) {
		$("#overall_sentiment").html(result.sentiment_score);

		var entities = result.entities;
		if(entities != null) {
			$("#entities_total").html(entities.length);
			fill_table_sentiment($("#entities"), entities);
		}

		var topics = result.topics;
		if(topics != null) {
			$("#topics_total").html(topics.length);
			fill_table_sentiment($("#topics"), topics);
		}

		var phrases = result.phrases;
		if(phrases != null) {
			$("#phrases_total").html(phrases.length);
			fill_table_sentiment($("#phrases"), phrases);
		}

		var themes = result.themes;
		if(themes != null) {
			$("#themes_total").html(themes.length);
			fill_table_sentiment($("#themes"), themes);
		}

	}
}

$("#pleaseWaitDialog").modal('show');
sendServiceRequest(chrome.extension.getBackgroundPage().selectedText);

