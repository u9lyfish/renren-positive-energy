
// time (in milliseconds) between two rounds of check
var interval = 1990;

var voteButtonUp = $('<a class="vote-button vote-button-up" title="正能量" href="javascript:;"></a>');
var voteButtonDown = $('<a class="vote-button vote-button-down" title="负能量" href="javascript:;"></a>');

var voteWrapper = $('<div class="vote-wrapper"></div>').append(voteButtonDown, voteButtonUp);

var voteCountUp = $('<span class="vote-count vote-count-up"></span>');
var voteCountDown = $('<span class="vote-count vote-count-down"></span>');

function silentlyFail(wrapper) {
    wrapper.removeClass("voted voted-" + vote);
}

function handleServerReply(msg, upButton, downButton, wrapper) {
    var msgObject;
    try {
        msgObject = JSON.parse(msg);
    } catch(e) {
        silentlyFail(wrapper);
        return;
    }

    if (msgObject["code"] == "fail") {
        silentlyFail(wrapper);
        return;
    };

    var downCount = msgObject["data"]["downCount"];
    var upCount = msgObject["data"]["upCount"];

    downButton.unbind()
    .before(voteCountDown.text(downCount).clone());

    upButton.unbind()
    .before(voteCountUp.text(upCount).clone());
}

function voteButtonClickHandler(upButton, downButton, vote) {
    var wrapper = downButton.parent();
    wrapper.addClass("voted voted-" + vote);

    var likeButton = wrapper.prev();

    var stats = likeButton.attr("stats").split("_");
    var like_id = likeButton.attr("id").substr(5);
    var voter_id = $("#showProfileMenu").attr("href").substr(36);
    var content = wrapper.parents("article").html();

    $.ajax({
        type: "POST",
        url: "http://positiveenergy.sinaapp.com/renren_vote/vote/",
        data: {
            vote: vote,
            stat_id: stats[1],
            owner_id: stats[3],
            like_id: like_id,
            voter_id: voter_id,
            content: content
        }
    })
        .done(function(msg){
            // reset buttons on failure
            if (msg) {
                handleServerReply(msg, upButton, downButton, wrapper);
            };
            silentlyFail(wrapper);
        })
        .fail(function(){
            silentlyFail(wrapper);
        });
}

function addVoteButtons() {
    // use attribute as a flag to avoid duplicate modification
    $(".ilike_icon").not("[vote-button-added]")
        .after(voteWrapper)
        .attr("vote-button-added", "");

    // use attribute as a flag to avoid duplicate event binding
    $(".vote-button-down").not("[bound]")
        .click(function(){
            var downButton = $(this);
            var upButton = $(this).next();
            voteButtonClickHandler(upButton, downButton, "down");
        })
        .attr("bound", "");

    $(".vote-button-up").not("[bound]")
        .click(function(){
            var upButton = $(this);
            var downButton = $(this).prev();
            voteButtonClickHandler(upButton, downButton, "up");
        })
        .attr("bound", "");

    setTimeout(addVoteButtons, interval);
}

$("#newsfeed-module-box").ready(function(){
    addVoteButtons();
    setTimeout(addVoteButtons, interval);
});