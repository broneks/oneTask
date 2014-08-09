'use strict';

var $elems = {
        // DOM elements
        startscreen: $('#startscreen'),
        countdown: $('#countdown'),
        progress:  $('#progress-bar'),
        completed: $('#completed'),
        trigger:   $('#trigger'),
        timer:     $('#timer'),
        goalwrap:  $('#goal-outer'),
        goal:      $('#goal'),
        task:      $('#task'),
        details:   $('#details')
    },
    $timepicker = {
        // timepicker elements
        arrowdown: $('.arrow.down'),
        arrowup:   $('.arrow.up'),
        hour1: $('#hour1'),
        hour2: $('#hour2'),
        min1:  $('#min1'),
        min2:  $('#min2')
    },
    results = {
        congrats: [121, 777],
        fail:     [387, 442]
    },
    helper = {},
    timer  = {},
    cookie = {};


////////////
//
// Helper Functions
//
////////////

helper.timeToSeconds = function() {
    var hours = parseInt($timepicker.hour1.html() + $timepicker.hour2.html());
    var mins  = parseInt($timepicker.min1.html() + $timepicker.min2.html());

    return hours * 3600 + mins * 60;
};

helper.clearTimepicker = function() {
    $timepicker.hour1.html(0);
    $timepicker.hour2.html(0);
    $timepicker.min1.html(0);
    $timepicker.min2.html(0);
};

helper.clearTextNodes = function($el) {
    $el.contents().filter(function() {
        return this.nodeType === 3;
    }).remove();
};

helper.escapeInput = function(str) {
    return str.replace(/[|]/g, '');
};

helper.showStartscreen = function() {
    // clear text in #goal wrapper 
    helper.clearTextNodes($elems.goalwrap);

    // show the startscreen so a new task can be submitted
    $elems.countdown.hide();
    $elems.startscreen.fadeIn();
};

helper.showCountdown = function(setting) {
    // close info details (if opened) and hide startscreen
    if ($elems.details.is(':visible')) $elems.details.hide();
    $elems.startscreen.hide();
    
    // show the countdown
    if (setting && setting.noFade) {
        $elems.countdown.show();
    } else { 
        $elems.countdown.fadeIn();
    }
};


////////////
//  
// Timer  
//        
////////////


timer.interval = null;
timer.endtime  = null;
timer.barWidth = null;

timer.init = function(settings) {
    // unix timestamp (in seconds) at which the timer will reach zero
    timer.endtime  = settings.endtime || Math.floor((new Date().getTime() + settings.timeLimit * 1000) / 1000);

    // width of the progress bar (based on the task's time limit in seconds)
    timer.barWidth = settings.barWidth || settings.timeLimit;

    // display the goal to be completed
    $elems.goalwrap.prepend('... time left to: ');
    $elems.goal.html(settings.task.toLowerCase());

    // show the checkbox
    $elems.trigger.show();

    // start the timer
    timer.interval = setInterval(timer.tick, 1000);
    timer.tick();
};

timer.tick = function() {
    // calculate the current time based on how much time is left until the end time
    var timeLeft = timer.endtime - Math.floor(new Date().getTime() / 1000),
        sec      = timeLeft % 60,
        min      = Math.floor((timeLeft / 60) % 60),
        hour     = Math.floor(timeLeft / 3600),
        timeHasRunOut = timeLeft < 1;

    // display the current time
    $elems.timer.html(timer.addZero(hour) + ' : ' + timer.addZero(min) + ' : ' +  timer.addZero(sec));

    // fill the progress bar
    timer.progressBar(timer.barWidth - timeLeft);

    // if the task has been completed, call the success callback
    if ($elems.completed.is(':checked')) {
        timer.finish();
        timer.callback(1);
        cookie.destroy();

    } else if (timeHasRunOut) {
        timer.finish();
        timer.callback(0);
        cookie.destroy();
    }
};

// add a leading zero to hour/min/sec if the number is less than 10
timer.addZero = function(num) {
    return (num < 10 ? '0' : '') + num;
};

timer.progressBar = function(progress) {
    var barFilled = 100 - (progress / timer.barWidth * 100);

    // if there is time left and the progress bar is still filled
    if (barFilled) {
        $elems.progress.css('width', barFilled + '%');

        // set the bar colour based on percentage filled
        if      (barFilled > 50)                    $elems.progress.css('background-color', '#2ecc71');
        else if (barFilled <= 50 && barFilled > 30) $elems.progress.css('background-color', '#f1c40f');
        else if (barFilled <= 30 && barFilled > 10) $elems.progress.css('background-color', '#f39c12');
        else if (barFilled <= 10)                   $elems.progress.css('background-color', '#e74c3c');
    } else {
       $elems.progress.css('width', '0');
    }
};

// stop and reset the timer
timer.finish = function() {
    // stop the timer
    clearInterval(timer.interval);

    // hide and uncheck the checkbox
    $elems.trigger.hide();
    $elems.completed.removeAttr('checked');

    // clear timer and goal display
    $elems.timer.empty();
    $elems.goal.empty();
    helper.clearTextNodes($elems.goalwrap);
};

// random congrats & fail callbacks
timer.callback = function(status) {
    var randCongrats = results.congrats[Math.floor(Math.random() * results.congrats.length)],
        randFail     = results.fail[Math.floor(Math.random() * results.fail.length)],
        nextPage;

    if (status) {
        nextPage = 'congrats/' + randCongrats + '.html';
        $elems.goalwrap.prepend('Congratulations!');

    } else {
        nextPage = 'fail/' + randFail + '.html';
        $elems.goalwrap.prepend('Oh No! Time\'s up for the task...');
    }

    $('body').fadeOut(1000, function() {
        window.location = nextPage;
    });
};


////////////
//
// Cookies
//
////////////


// Currently, only ONE cookie exists on the client at any one time

cookie.create = function(value) {
    var d = new Date();

    if (value) {
        // destroy all previous cookies
        cookie.destroy();

        // max-age & expires = a week
        d.setTime(d.getTime() + 10080 * 60 * 1000);
        document.cookie = 'YHOJ=' + value + '; max-age=604800; expires=' + d.toUTCString() + '; path=/';
    }
};

cookie.get = function() {
    // return an array containing all cookie data
    if (document.cookie) return document.cookie.split('=');

    return null;
};

cookie.destroy = function() {
    var c = document.cookie.split("; ");
    
    // destroy all cookies
    for (var i = 0; i < c.length; i++) {
        document.cookie = c[i].split('=')[0] + '=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }
};


////////////
//
// Page Start
//
////////////


$(document).ready(function() {
    // if a cookie is already set, go straight to the timer & task currently in progress
    if (cookie.get()) {
        var c = cookie.get()[1].split('|'); 

        helper.showCountdown({
            noFade: true
        });

        // start the timer using the previous end time and task
        timer.init({
            endtime: c[0],
            task: c[1],
            barWidth: c[2]
        });
    }
});

// timepicker increase number
$timepicker.arrowup.on('click', function() {
    var $digit = $(this).siblings('.digit');
    var increment = parseInt($digit.html()) + 1;

    if      ($digit[0].id === 'min1' && increment > 5) $digit.html(0);
    else if (increment > 9) $digit.html(0);
    else if (increment < 0) $digit.html(9);
    else    $digit.html(increment);
});

// timepicker decrease number
$timepicker.arrowdown.on('click', function() {
    var $digit = $(this).siblings('.digit');
    var decrement = parseInt($digit.html()) - 1;

    if      ($digit[0].id === 'min1' && decrement < 0) $digit.html(5);
    else if (decrement > 9) $digit.html(0);
    else if (decrement < 0) $digit.html(9);
    else    $digit.html(decrement);
});

// "Go" button clicked and new task is submitted
$('#go').on('click', function() {

    // get inputted time in seconds
    var time = helper.timeToSeconds();

    // validation check for empty fields
    if (!$elems.task.val() || !time) {

        alert('Both a task and a time limit are needed!');

    } else {
    
        helper.showCountdown();

        // start the timer with the new task and time limit
        timer.init({
            task: helper.escapeInput($elems.task.val()),
            timeLimit: time
        });

        // create a cookie
        cookie.create(timer.endtime + '|' + helper.escapeInput($elems.task.val()) + '|' + timer.barWidth);

        // clear inputs
        $elems.task.val('');
        helper.clearTimepicker();
    }
});

// "Cancel" button clicked during or after countdown
$('#cancel').on('click', function() {
    // stop the timer and destroy any cookies
    if (cookie.get()) {
        timer.finish();
        cookie.destroy();
    }

    helper.showStartscreen();
});

// "Need help getting started" button that reveals details about the app
$('#info').on('click', function(e) {
    e.preventDefault();
    $elems.details.stop().slideToggle();
});