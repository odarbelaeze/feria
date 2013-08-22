require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: 'vendor/bootstrap'
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

require(['app', 'jquery', 'underscore', 'bootstrap'], function (app, $) {
    'use strict';

    var colors = ['#005c78', '#f39200', '#e84e0e', '#c51a1b', '#73361c'];

    if ($('.frame-guest').size()) {

        $('.frame-guest').each(function () {
            $(this).click(function () { $(this).toggleClass('active'); });
        });

        $.get('/templates/guest.html', function (template) {
            var guestTemplate = _.template(template);
            $.get('/data/guests.json', function (data) {
                var available = _.map(data, function (guest) {
                    var inner = guestTemplate({ guest: guest });
                    var bg = '';
                    if (guest.bg) { bg = guest.bg; }
                    else          { bg = colors[_.random(colors.length)]; }
                    var align = '';
                    if (guest.bg && guest.bg.search('left') > 0) { align = 'right'; }
                    else                                         { align = 'left';  }
                    return {
                        inner: inner,
                        bg: bg,
                        align: align
                    };
                });

                var renderGuest = function (guest, frame) {
                    frame.fadeOut(function () {
                        frame.attr('style',
                            'background:' + guest.bg + ';' +
                            'text-align:' + guest.align + ';' +
                            'background-size:' + 'cover' + ';'
                        );
                        frame.html(guest.inner);
                        frame.fadeIn();
                    });
                };

                var onGoing = false;

                var frames = _.map($('.frame-guest'), function (frame) {
                    return {
                        guest: null,
                        frame: frame
                    };
                });

                _.each(frames, function (frame) {
                    frame.guest = available.splice(
                        _.random(available.length - 1), 1
                    )[0];
                    renderGuest(frame.guest, $(frame.frame));

                    window.setInterval(function () {
                        if ($(frame.frame).hasClass('active') || onGoing) { return; }

                        onGoing = true;
                        var oldGuest = _.clone(frame.guest);
                        frame.guest = available.splice(
                            _.random(available.length - 1), 1
                        )[0];
                        renderGuest(frame.guest, $(frame.frame));
                        available.push(oldGuest);
                        onGoing = false;
                    }, 1000 * _.random(10, 15));
                });
            });
        });
    };

    // Get the sponsors

    if ($('#sponsors').size()) {
        $.get('/templates/sponsor.html', function (template) {
            var sponsorTemplate = _.template(template);
            $.get('data/sponsors.json', function (data) {
                _.each(_.shuffle(data), function (sponsor) {
                    $('#sponsors').append(sponsorTemplate({sponsor : sponsor}));
                });
            });    
        });
    };

    // Get the organizers

    if ($('#organizers').size()) {
        $.get('/templates/organizer.html', function (template) {
            var organizerTemplate = _.template(template);
            $.get('data/organizers.json', function (data) {
                _.each(_.shuffle(data), function (organizer) {
                    $('#organizers').append(organizerTemplate({organizer : organizer}));
                });
            });    
        });
    };

    // Anything else

});
