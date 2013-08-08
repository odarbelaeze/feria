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
    // use app here


    // Guests random system

    var guests = $('.frame-guest');

    // Guest click to describe system

    // guests.each(function () {
    //     $(this).click(function () { $(this).toggleClass('active'); });
    // });

    $.get('data/data.json', function (data) {
        var colors = data.colors;
        var template = _.template('<div class="info"><div class="name"><strong><%= guest.name %></strong></div><div class="pitch"><%= guest.pitch %></div><div class="country"><%= guest.country %></div><div class="social"><%= socialInner %></div></div>');
        var social = _.template('<a class="social-link" href="<%= url %>" target="_blank"><img class="social-icon" src="images/social/<%= network %>.png" /></a>')
        var available = _.map(data.guests, function (guest) {
            var socialInner = "";
            for (var network in guest.social)
            {
                socialInner += social({ 
                    network: network, 
                    url: guest.social[network] 
                });
            }
            var inner = template({ guest: guest, socialInner: socialInner });
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

    // Get the sponsors

    $.get('data/data.json', function (data) {
        var sponsorInner = _.template('<a href="<%= sponsor.url %>" class="sponsor sponsor-<%= sponsor.type %>" title="<%= sponsor.name %>" rel="nofollow" target="_blank"><img src="<%= sponsor.img %>" alt="<%= sponsor.name %>"></a>');
        _.each(_.shuffle(data.sponsors), function (sponsor) {
            $('#sponsors').append(sponsorInner({sponsor : sponsor}));
        });
    });

    // Get the organizers

    $.get('data/data.json', function (data) {
        var organizerInner = _.template('<a href="<%= organizer.url %>" class="organizer organizer-<%= organizer.type %>" title="<%= organizer.name %>" rel="nofollow" target="_blank"><img src="<%= organizer.img %>" alt="<%= organizer.name %>"></a>');
        _.each(data.organizers, function (organizer) {
            $('#organizers').append(organizerInner({ organizer: organizer }));
        });
    });

    // Anything else

});
