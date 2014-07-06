'use strict';

var $elems = {
        // DOM elements
        startscreen: $('#startscreen'),
        countdown: $('#countdown'),
        progress:  $('#progress-bar'),
        completed: $('#completed'),
        trigger:   $('#trigger'),
        timer:     $('#timer'),
        goal:      $('#goal'),
        task:      $('#task'),
        limit:     $('#time-limit'),
        cancel:    $('#cancel'),
        go:        $('#go')
    },
    helper = {},
    timer  = {},
    cookie = {};


////////////
//
// Helper Functions
//
////////////


helper.showStartscreen = function() {
    // show the startscreen so a new task can be submitted
    $elems.countdown.hide();
    $elems.startscreen.fadeIn();
};

helper.showCountdown = function(setting) {
    // hide the startscreen and show the countdown
    $elems.startscreen.hide();
    
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
timer.callback = null;

timer.init = function(settings) {
    // unix timestamp (in seconds) at which the timer will reach zero
    timer.endtime  = settings.endtime || Math.floor((new Date().getTime() + (settings.timeLimit * 60000)) / 1000);

    // width of the progress bar (based on the task's time limit in seconds)
    timer.barWidth = settings.barWidth || settings.timeLimit * 60;

    // success callback for when the task is completed
    timer.callback = (typeof settings.output === 'function' ?
                      settings.output : 
                      function() { console.log('Congratulations!'); });

    // display the goal to be completed
    $elems.goal.html('... time left to: ' + settings.task.toLowerCase());

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
        timer.callback();
        cookie.destroy();

    } else if (timeHasRunOut) {
        timer.finish();
        timer.timeOut();
    }
};

// add a leading zero to hour/min/sec if the number is less than 10
timer.addZero = function(num) {
    return (num < 10 ? '0' : '') + num;
};

timer.progressBar = function(progress) {
    var barFilled = progress / timer.barWidth * 100;

    if (barFilled < 100) {
        $elems.progress.css('width', barFilled + '%');

        // set the bar colour based on percentage filled
        if      (barFilled < 50)                    $elems.progress.css('background-color', '#2ecc71');
        else if (barFilled >= 50 && barFilled < 70) $elems.progress.css('background-color', '#f1c40f');
        else if (barFilled >= 70 && barFilled < 90) $elems.progress.css('background-color', '#f39c12');
        else if (barFilled >= 90)                   $elems.progress.css('background-color', '#e74c3c');
    } else {
       $elems.progress.css('width', '100%');
       $elems.progress.css('background-color', '#e74c3c');
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
};

// display fail message when the timer has run out
timer.timeOut = function() {
    // get the current task from the cookie
    var task = cookie.get()[1].split('_')[1].toLowerCase();

    $elems.goal.html("Oh No! Time is up for the task: " + task);
};


////////////
//
// Cookies
//
////////////


// Currently, only ONE cookie exists on the client at any one time

cookie.create = function(value) {
    if (value) {
        // destroy all previous cookies
        cookie.destroy();

        // calculate a random name and then create a cookie (max-age = a week)
        var name = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        document.cookie = name + '=' + value + '; max-age=604800; path=/';
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
        document.cookie = c[i].split('=')[0] +"=; max-age=0; path=/";
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
        var c = cookie.get()[1].split('_'); 

        helper.showCountdown({
            noFade: true
        });

        // start the timer using the previous end time and task
        timer.init({
            endtime: c[0],
            task: c[1],
            barWidth: c[2],
            output: function() {
                $elems.goal.html("Congratulations!!!");
            }
        });
    }
});

// "Go" button clicked and new task is submitted
$elems.go.on('click', function() {
    // validation check for empty fields
    if (!$elems.limit.val() || !$elems.task.val()) {

        alert('Please fill in all the fields.');

    // validation check for a time limit that is less than zero, not a number or infinite
    } else if ($elems.limit.val() <= 0 ||
               isNaN(parseFloat( $elems.limit.val())) && 
               !isFinite($elems.limit.val())) {

        alert('Time limit must be a positive number.');

    } else {
    
        helper.showCountdown();

        // start the timer with the new task and time limit
        timer.init({
            task: $elems.task.val(),
            timeLimit: $elems.limit.val(),
            output: function() {
                $elems.goal.html("Congratulations!!!");
            }
        });

        // create a cookie
        cookie.create(timer.endtime + '_' + $elems.task.val() + '_' + timer.barWidth);

        // clear inputs
        $elems.task.val('');
        $elems.limit.val('');
    }
});

// "Cancel" button clicked during or after countdown
$elems.cancel.on('click', function() {
    // stop the timer and destroy any cookies
    if (cookie.get()) {
        timer.finish();
        cookie.destroy();
    }

    helper.showStartscreen();
});