'use strict';

var 

$elems = {
    // DOM elements
    startscreen: $('#startscreen'),
    countdown: $('#countdown'),
    progress:  $('#progress-bar'),
    completed: $('#completed'),
    trigger:   $('#trigger'),
    errors:    $('#flash-error'),
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
    congrats: [
        'dblrnbw', 'smile', 'average-at-life', 'couple-months',
        'diamond', 'golden-jazz', 'good-on-you', 'heart-in-it',
        'islt-pop', 'nicely-done', 'phil-good', 'proud-of-you',
        'shreddied', 'smile', 'spunky', 'thatll-do', 'wee-green-jig',
        '50-shades', 'affection', 'bagels', 'bathroom', 'blue-car',
        'cached', 'chicken-weasel', 'dancing-shoes', 'did-thing', 
        'done-did', 'doughnuts', 'enjoyed', 'felicity', 'finnish', 'flip',
        'guts', 'happy-computer', 'john-donne', 'like', 'moby', 'more-fun',
        'moss', 'over-9000', 'stuff', 'tears-of-happy', 'wizened', 'you-go'
    ],
    fail: [
        'bad-try', 'booo', 'firework', 'get-cereals',
        'golf-carts', 'my-plants', 'noodle', 'scamburger',
        'whoopsie', 'dishonour', 'doperoni', 'flop', 'intersection',
        'lacrosse', 'life-savings', 'mad-scientists', 'nogo', 'pea-brain', 
        'sasberry', 'squirt-bottle', 'sunday', 'time-dream', 'utter', 'why'
    ]
},
helper = {},
cookie = {},
timer;


////////////
//
// Helper Functions
//
////////////

helper.timeToSeconds = function() {
    var hours = parseInt($timepicker.hour1.html() + $timepicker.hour2.html()),
        mins  = parseInt($timepicker.min1.html() + $timepicker.min2.html());

    return hours * 3600 + mins * 60;
};

helper.clearInputs = function() {
    $elems.errors.empty().removeAttr('style');

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
    return str.replace(/[|]|[;]/g, '').trim();
};

helper.updateTimepicker = function(settings) {
    if (typeof settings === 'undefined' || $.isEmptyObject(settings)) return;

    var $digit   = $(this).siblings('.digit'),
        min1     = $digit[0].id === 'min1',
        modifier = settings.increase ? 1 : -1,
        update   = parseInt($digit.html()) + modifier;
    
    if      (update > 9 || 
             min1 && update > 5) $digit.html(0);
    else if (min1 && update < 0) $digit.html(5);
    else if (update < 0)         $digit.html(9);
    else                         $digit.html(update);
};

helper.showStartscreen = function() {
    $elems.progress.removeAttr('style');

    // show the startscreen so a new task can be submitted
    $elems.countdown.hide();
    $elems.startscreen.fadeIn();
};

helper.showCountdown = function(setting) {
    // close info details (if opened) and hide startscreen
    if ($elems.details.is(':visible')) $elems.details.hide();
    $elems.startscreen.hide();

    $elems.goal.show();
    
    // show the countdown
    if (setting && setting.noFade) {
        $elems.countdown.show();
    } else { 
        $elems.countdown.fadeIn();
    }
};

jQuery.fn.shake = function() {
    var $this = $(this);

    if (!$this.hasClass('shake')) {
        
        $this
        .addClass('shake')
        .animate({ left: -5 }, 20).animate({ left: 0 }, 100).animate({ left: 5 }, 20).animate({ left: 0 }, 100)
        .animate({ left: -5 }, 20).animate({ left: 0 }, 100).animate({ left: 5 }, 20).animate({ left: 0 }, 100)
        .animate({ left: -5 }, 20).animate({ left: 0 }, 100).animate({ left: 5 }, 20).animate({ left: 0 }, 100, 
            function() { $this.removeClass('shake'); }
        );
    }

    return $this;
};


////////////
//  
// Timer  
//        
////////////

timer = (function() {

    var 

    interval = null,
    endtime  = null,
    barWidth = null,

    getEndtime  = function() { return endtime; },
    getBarWidth = function() { return barWidth; },

    init = function(settings) {
        if (typeof settings === 'undefined' || $.isEmptyObject(settings)) return;

        // unix timestamp (in seconds) at which the timer will reach zero
        endtime  = settings.endtime || Math.floor((new Date().getTime() + settings.timeLimit * 1000) / 1000);

        // width of the progress bar (based on the task's time limit in seconds)
        barWidth = settings.barWidth || settings.timeLimit;

        // display the goal to be completed
        $elems.goalwrap.prepend('... time left to: ');
        $elems.goal.html(settings.task.toLowerCase());

        // show the checkbox
        $elems.trigger.show();

        // start the timer
        interval = setInterval(tick, 1000);
        tick();
    },

    tick = function() {
        // calculate the current time based on how much time is left until the end time
        var timeLeft = endtime - Math.floor(new Date().getTime() / 1000),
            sec      = timeLeft % 60,
            min      = Math.floor((timeLeft / 60) % 60),
            hour     = Math.floor(timeLeft / 3600),
            timeHasRunOut = timeLeft < 1;

        // display the current time
        $elems.timer.html(addZero(hour) + ' : ' + addZero(min) + ' : ' +  addZero(sec));

        // fill the progress bar
        progressBar(barWidth - timeLeft);

        // if the task has been completed, call the success callback
        if ($elems.completed.is(':checked')) {
            finish();
            callback(true);
            cookie.destroy();

        } else if (timeHasRunOut) {
            finish();
            callback(false);
            cookie.destroy();
        }
    },

    // add a leading zero to hour/min/sec if the number is less than 10
    addZero = function(num) {
        return (num < 10 ? '0' : '') + num;
    },

    progressBar = function(progress) {
        var barFilled = 100 - (progress / barWidth * 100);

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
    },

    // stop and reset the timer
    finish = function() {
        // stop the timer
        clearInterval(interval);

        // hide and uncheck the checkbox
        $elems.trigger.hide();
        $elems.completed.removeAttr('checked');

        // clear timer and goal display
        $elems.timer.empty();
        $elems.goal.empty().hide();
        helper.clearTextNodes($elems.goalwrap);
    },

    // random congrats & fail callbacks
    callback = function(congrats) {
        var randCongrats = results.congrats[Math.floor(Math.random() * results.congrats.length)],
            randFail     = results.fail[Math.floor(Math.random() * results.fail.length)],
            nextPage;

        if (congrats) {
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

    return {
        init: init,
        finish: finish,
        getEndtime: getEndtime,
        getBarWidth: getBarWidth
    };

})();


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


(function() {
    // if a cookie is already set, go straight to the timer & task currently in progress
    if (cookie.get()) {
        var c = cookie.get()[1].split('|'); 

        helper.showCountdown({
            noFade: true
        });

        // start the timer using the previous end time and task
        timer.init({
            endtime:  c[0],
            task:     c[1],
            barWidth: c[2]
        });
    }
})();

// timepicker increase number
$timepicker.arrowup.on('click', function() {
    helper.updateTimepicker.call(this, {
        increase: true
    });
});

// timepicker decrease number
$timepicker.arrowdown.on('click', function() {
    helper.updateTimepicker.call(this, {
        increase: false
    });
});

// "Go" button clicked and new task is submitted
$('#go').on('click', function() {

    // get inputted time in seconds
    var time           = helper.timeToSeconds(),
        escapedInput   = helper.escapeInput($elems.task.val()), 
        previousErrors = $elems.errors.children().length;

    // validation check for empty fields
    if (!escapedInput || !time) {

        $elems.errors.css({
            'margin': '0 0 40px 0',
            'padding': '10px 30px',
            'border': '2px solid #e91830'
        });

        $('html, body').animate({ scrollTop: 0 }, 'easeOutQuart');

        $elems.errors.empty();

        if (!escapedInput) {
            // clear improper input
            $elems.task.val('');
            $elems.errors.prepend('<li>Please input a task (e.g. Make Lunch)</li>');
        }
        if (!time)          $elems.errors.append('<li>Please set a time limit</li>');
        if (previousErrors) $elems.errors.shake();

    } else {
    
        helper.showCountdown();

        // start the timer with the new task and time limit
        timer.init({
            task: escapedInput,
            timeLimit: time
        });

        // create a cookie
        cookie.create(timer.getEndtime() + '|' + escapedInput + '|' + timer.getBarWidth());

        // clear inputs
        $elems.task.val('');
        helper.clearInputs();
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