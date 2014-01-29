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

$("#save").on("click", function save_options() {
	$("#pleaseWaitDialog").modal("show");
	$("#success-panel").hide();
	$("#error-panel").hide();

	localStorage["semantria_key"] = $("#key").val();
	localStorage["semantria_secret"] =  $("#secret").val();

	var serializer = new JsonSerializer();
	var session = new Session(localStorage["semantria_key"], localStorage["semantria_secret"], serializer, 'Chrome Extension', true);

	setTimeout(function() {
		var status = session.getStatus();
		if(status.status == 401) {
			$("#error-panel").show();
			$("#error-panel").html("Unauthorized. Please check your credentials and try again.");
		} else {
			$("#success-panel").show();
		}
		$("#pleaseWaitDialog").modal("hide");
	}, 1000);

});

$("#close").on("click", function save_options() {
	chrome.tabs.getCurrent(function(tab) {
	    chrome.tabs.remove(tab.id, function() { });
	});
});

document.addEventListener('DOMContentLoaded', function restore_options() {
	var key = localStorage["semantria_key"];
	var secret = localStorage["semantria_secret"];
	if (!key && !secret) {
		return;
	}

	$("#key").val(key);
	$("#secret").val(secret);
});
