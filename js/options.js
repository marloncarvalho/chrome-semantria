$("#save").on("click", function save_options() {
	localStorage["semantria_key"] = $("#key").val();
	localStorage["semantria_secret"] =  $("#secret").val();
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