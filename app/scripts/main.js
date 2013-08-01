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

    var guests = $('.media.guest');

    // Guest click to describe system

    var img = new Image('../images/elements/rotulo.png');
    console.log(img);

    guests.each(function () {
        $(this).click(function () {
            var guest = $(this);
            var info  = $('#guest-description');

            if(guest.hasClass('active'))
            {
                guest.removeClass('active');

                if (!info.is(':hidden')) {
                    info .slideUp(200);
                }
            }
            else
            {
                if (guests.filter('.active').size() > 0) {
                    guests.filter('.active').removeClass('active');
                }

                guest.addClass('active');

                if (!info.is(':hidden')) {
                    info .slideUp(200);
                    info .html(guest.children('.info').html());
                    info .slideDown(200);
                }
                else
                {
                    info .html(guest.children('.info').html());
                    info .slideDown(200);
                }
            }
        });
    });

    // Gest template system and intervals to change
    // It is sure that no one is left behind

    var guestsAvailable = [];

    $.getJSON('/data/guests.json', function (data) {

        var guestInner = _.template('<div class="pull-left"><img src="<%= guest.img %>" alt="<%= guest.name %>"></div><div class="media-body"><h5 class="media-heading"><%= guest.name %></h5><span><%= guest.role %> -- <%= guest.country %></span></div><div class="info hidden"><%= guest.description %></div>');
        guestsAvailable = _.map(data, function(guest) { return guestInner({guest: guest}); });
        _.shuffle(guestsAvailable);

    }).done(function () {
        guests.each(function () {
            $(this).html(guestsAvailable.pop());
        });

        var ongoing = false;
        var doNothing = function() { return; };
        var refreshGuest = function(thisGuest) {
            while(ongoing) {
                window.setTimeout(doNothing, 10);
            }
            if (!thisGuest.hasClass('active'))
            {
                ongoing = true;
                var html = thisGuest.html();
                var newHtml = guestsAvailable.splice(
                    _.random(guestsAvailable.length - 1), 1
                )[0];
                thisGuest.fadeOut('slow', function () {
                    thisGuest.html(newHtml);
                    thisGuest.fadeIn('slow');
                });
                guestsAvailable.push(html);
                ongoing = false;
            }
        };

        guests.each(function () {
            var thisGuest = $(this);
            var refreshThisGuest = function() {
                refreshGuest(thisGuest);
            };
            window.setInterval(refreshThisGuest, _.random(10000, 15000));
        });

    });

    // Get the sponsors

    $.get('data/sponsors.json', function (sponsors) {
        var sponsorInner = _.template('<a href="<%= sponsor.url %>" class="sponsor <%= sponsor.type %>" title="<%= sponsor.name %>" rel="nofollow" target="_blank"><img src="<%= sponsor.img %>" alt="<%= sponsor.name %>"></a>');
        _.each(_.shuffle(sponsors), function (sponsor) {
            $('#sponsors').append(sponsorInner({sponsor : sponsor}));
        });
    });

    // Get the organizers

    $.get('data/organizers.json', function (organizers) {
        var organizerInner = _.template('<a href="<%= organizer.url %>" class="organizer <%= organizer.type %>" title="<%= organizer.name %>" rel="nofollow" target="_blank"><img src="<%= organizer.img %>" alt="<%= organizer.name %>"></a>');
        _.each(organizers, function (organizer) {
            $('#organizers').append(organizerInner({ organizer: organizer }));
        });
    });

    // Anything else

});
