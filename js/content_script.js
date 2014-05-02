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
var options = {};

// Getting user global options.
chrome.storage.sync.get("options", function (value) {
    options = value.options;
    if (!options) {
        options = {twitter_analysis_confirm: true};
    }
});

// Getting user credentials.
chrome.storage.sync.get("credentials", function (value) {
    credentials = value.credentials;
});

/**
 * Twitter helper class.
 *
 * Almost everything here is based (or totally copied) from dstein Twitter Sentiment Chrome Plugin.
 * Source code: https://github.com/dstein64/twittersentiment
 *
 * @author Marlon S. Carvalho
 */
var Twitter = function () {
    var TWITTER_TWEET_TEXT_CLASS = "tweet-text";
    var serializer = new JsonSerializer();
    var session = null;
    var onFinishedListener = function () {
    };

    /**
     * Given a number representing a sentiment score, returns a color representing this sentiment.
     *
     * @param sentiment Sentiment.
     * @returns {string} Color.
     */
    function getSentimentColor(sentiment_polarity) {
        var color = '';
        if (sentiment_polarity == "negative") {
            color = '#BA8A86';
        } else if (sentiment_polarity == "neutral") {
            color = '#AAAAAA';
        } else if (sentiment_polarity == "positive") {
            color = '#5C9B51';
        }

        return color;
    }

    /**
     * Process Semantria Reply.
     *
     * @param session Semantria Session.
     * @param tweetCount Tweet count.
     */
    function process(session, tweetCount) {
        var processedDocuments = session.getProcessedDocuments();

        if (processedDocuments && processedDocuments.constructor == Array) {
            var tweetsRemaining = tweetCount - processedDocuments.length;
            if (tweetsRemaining > 0) {
                setTimeout(function () {
                    process(session, tweetsRemaining);
                }, 1000);
            }

            for (var i in processedDocuments) {
                var data = processedDocuments[i];
                var tweetId = data["id"];
                var tweet = document.getElementById(tweetId);

                if (tweet == null) {
                    continue;
                }

                var total_entities = data["entities"] != null ? data["entities"].length : 0;
                var total_themes = data["themes"] != null ? data["themes"].length : 0;
                var img = "<img style='vertical-align:middle' src='" + chrome.extension.getURL("img/logo-16.png") + "'/>";
                var sentimentText = "sentiment: <span style='color: " + getSentimentColor(data["sentiment_polarity"]) + "'>" + data["sentiment_polarity"] + " (" + data["sentiment_score"] + ")</span>";
                var entities = " - entities: <span style='color: #419641'>" + total_entities + "</span>";
                var themes = " - themes: <span style='color: #419641'>" + total_themes + "</span>";
                var viewResults = " - <a id='a" + tweetId + "' href='javascript:'>view results</a>";

                $(tweet).after("<div style='padding-top: 0.5em'>" + img + " <span class='with-icn retweet js-tooltip'>" + sentimentText + entities + themes + viewResults + "</span></div>");
                $(document.getElementById("a" + tweetId)).attr("doc", tweet.innerText);
                $(document.getElementById("a" + tweetId)).on("click", function () {
                    chrome.runtime.sendMessage({method: "openResult", text: $(document.getElementById(this.id)).attr("doc")}, function (response) {
                    });
                });
            }
        }

        onFinishedListener();
    }

    this.setOnFinishedListener = function (on) {
        onFinishedListener = on;
    };

    /**
     * Start finding all tweets and processing them.
     */
    this.start = function () {
        if (session == null) {
            session = new Session(credentials.key, credentials.secret, serializer, 'Chrome Extension', true);
        }

        var tweets = document.getElementsByClassName(TWITTER_TWEET_TEXT_CLASS);
        var docs = [];

        for (var i in tweets) {
            var tweet = tweets[i];
            if (!tweet.getAttribute || tweet.getAttribute("e")) {
                continue;
            }

            var tweetId = Math.random() * 9999999;
            tweet.id = tweetId;
            tweet.setAttribute("e", "1");
            docs.push({"id": tweetId, "text": tweet.innerText});
        }

        if (docs.length > 0) {
            session.queueBatchOfDocuments(docs);
            setTimeout(function () {
                process(session, tweets.length);
            }, 2000);
        } else {
            onFinishedListener();
        }
    };

};

var twitter = new Twitter();

// Global action button image.
var img = "<img style='vertical-align:middle' src='" + chrome.extension.getURL("img/logo-23.png") + "'/>";

// Adding a global action. When the clicked, it runs the semantria analysis.
$("#global-actions").append('<li id="semantria-global-action" class="profile"> ' +
    '<a class="js-nav" href="javascript:;" data-component-term="profile_nav"  title="Semantria"> <span class="Icon  Icon--large">' + img + '</span> ' +
    '<span class="text">Semantria</span> </a> </li>');

$(document.getElementById("semantria-global-action")).on("click", function () {
    options.twitter_analysis_confirm=true;
    if (options.twitter_analysis_confirm) {
        $.get(chrome.extension.getURL('/twitter-modal-confirm.html'), function (data) {
            $('body').append(data);
            $("#semantria-warning-cancel").on("click", function () {
                $("#semantria-warning").remove();
            });
            $("#semantria-warning-confirm").on("click", function () {
                options.twitter_analysis_confirm = !$('#semantria-dontask').prop('checked');
                chrome.storage.sync.set({"options": options});
                $("#semantria-warning").remove();
                //twitter.start();
            });
        });
    }

});

