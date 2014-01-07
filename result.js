var result = chrome.extension.getBackgroundPage().globalResult;

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
