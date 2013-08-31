require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        underscore: '../bower_components/underscore/underscore',
        marked: '../bower_components/marked/lib/marked',
        bootstrap: 'vendor/bootstrap'
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

require(['app', 'jquery', 'marked', 'underscore', 'bootstrap'], function (app, $) {
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
    }

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
    }

    // Get the organizers

    if ($('#organizers').size()) {
        $.get('/templates/organizer.html', function (template) {
            var organizerTemplate = _.template(template);
            $.get('/data/organizers.json', function (data) {
                _.each(data, function (organizer) {
                    $('#organizers').append(organizerTemplate({organizer : organizer}));
                });
            });
        });
    }

    // Set up the schedule

    if ($('#schedule').size()) {
        $.get('/templates/schedule.html', function (template) {
            var scheduleTemplate = _.template(template);
            $.getJSON('/data/schedule.json', function (data) {
                data.schedule = _.groupBy(data.activities, function(activitie) { return activitie.day; } );
                $('#schedule').append(scheduleTemplate({ schedule: data }));

                $('.filter-checkbox').click(function () {
                    if ($('.filter-checkbox:checked').size() === 1) {
                        $('.activitie').hide();
                    }
                    if (this.checked) {
                        $('.' + $(this).attr('data-toggle')).show();
                    }
                    else {
                        $('.' + $(this).attr('data-toggle')).hide();
                    }
                    if ($('.filter-checkbox:checked').size() === 0) {
                        $('.activitie').show();
                    }
                });

            });
        });
    }

    // Set up the exhibitors

    if ($('#exhibitor-list').size()) {
        $.get('/templates/exhibitor-list.html', function (template) {
            var exhibitorsTemplate = _.template(template);
            $.getJSON('/data/exhibitors.json', function (data) {
                var sortedData = _.sortBy(data, function (exhibitor) { return (exhibitor.logo === null); } );
                var i = 0;
                while (i < data.length) {
                    $('#exhibitor-list').append(exhibitorsTemplate({ exhibitors: sortedData.slice(i, i + 2) }));
                    i = i + 2;
                }
            });
        });
    }

});
