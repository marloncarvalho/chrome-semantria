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

var globalStorage = null;

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
    var TWITTER_TWEET_CONTAINER_CLASS = "tweet";

    /**
     * Given an element and a CSS class, verifies whether the element contains this class or not.
     *
     * @param element Element.
     * @param cls CSS Class.
     * @returns {boolean}
     */
    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    /**
     * Find HTML tweet element.
     *
     * @param tweet Tweet.
     * @returns {*}
     */
    function getTweetContainer(tweet) {
        var container = tweet;
        while (!hasClass(container, TWITTER_TWEET_CONTAINER_CLASS) && container.parentNode) {
            container = container.parentNode;
        }
        return container;
    }

    /**
     * Given a number representing a sentiment score, returns a color representing this sentiment.
     *
     * @param sentiment Sentiment.
     * @returns {string} Color.
     */
    function getSentimentColor(sentiment) {
        var color = '';

        if (sentiment < -.5) {
            color = '#FF0000';
        } else if (sentiment < -0.01) {
            color = '#FF0000';
        } else if (sentiment < .01)
            color = '#AAAAAA';
        else if (sentiment < .5) {
            color = '#AAAAAA';
        } else {
            color = '#668161';
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

            var n = 0
            for (var i in processedDocuments) {
                var data = processedDocuments[i];
                var tweetId = data["id"];
                var sentiment = data["sentiment_score"];
                var tweet = document.getElementById(tweetId);
                var total_entities = data["entities"] != null ? data["entities"].length : 0;
                var total_themes = data["themes"] != null ? data["themes"].length : 0;

                var img = "<img style='vertical-align:middle' src='" + chrome.extension.getURL("img/logo-16.png") + "'/>";
                var sentiment_text = "sentiment: <span style='color: " + getSentimentColor(sentiment) + "'>" + data["sentiment_polarity"] + " (" + sentiment + ")</span>";
                var entities = " - entities: <span style='color: #419641'>" + total_entities + "</span>";
                var themes = " - themes: <span style='color: #419641'>" + total_themes + "</span>";
                var viewresults = " - <a id='a" + n + "' href='javascript:'>view results</a>";

                $(tweet).after("<div style='padding-top: 0.5em'>" + img + " <span class='with-icn retweet js-tooltip'>" + sentiment_text + entities + themes + viewresults + "</span></div>");
                $("#a" + n).attr("doc", tweet.innerText);
                $("#a" + n).on("click", function () {
                    chrome.runtime.sendMessage({method: "openResult", text: $("#"+this.id).attr("doc")}, function (response) {
                    });
                });
                n++;
            }
        }
    }

    /**
     * Start finding all tweets and processing them.
     */
    this.start = function () {
        var tweets = document.getElementsByClassName(TWITTER_TWEET_TEXT_CLASS);
        var newEntries = false;
        for (var i in tweets) {
            var tweet = tweets[i];
            if (!tweet.getAttribute || tweet.getAttribute("e")) {
                continue;
            }
            newEntries = true;
        }

        if (!newEntries)
            return;

        var serializer = new JsonSerializer();
        var session = new Session(globalStorage["semantria_key"], globalStorage["semantria_secret"], serializer, 'Chrome Extension', true);
        var docs = [];

        for (var i in tweets) {
            var tweet = tweets[i];
            if (!tweet.getAttribute || tweet.getAttribute("e")) {
                continue;
            }

            tweet.setAttribute("e", "1");
            var tweetId = Math.random() * 9999999;
            tweet.id = tweetId;

            var text = tweet.innerText;
            var doc = {"id": tweetId, "text": text};
            docs.push(doc);
        }
        session.queueBatchOfDocuments(docs);
        setTimeout(function () {
            process(session, tweets.length);
        }, 1000);
    };

};

var twitter = new Twitter();

/**
 * Send a message requesting the extension localStorage instance.
 */
chrome.runtime.sendMessage({method: "getLocalStorage", key: "status"}, function (response) {
    globalStorage = response.data;
    //twitter.start();
});

//listen for when DOM is changed by AJAX calls
document.addEventListener("DOMNodeInserted", function (evt) {
    setTimeout(function () {
        twitter.start();
    }, 1000);
});
