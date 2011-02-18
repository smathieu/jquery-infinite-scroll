// Infinite Scroll
(function($) {
    $.fn.infinitescroll = function(options) {
        return $(this).each(function() {
            var el = $(this);
            var settings = $.extend({
                    url: null,
                    triggerAt: 300,
                    page: 1,
                    appendTo: '.list tbody',
                    force: true,
                    container: '.list_container',
                    search_field: "",
                }, options);
            var req = null;
            var maxReached = false;
            var was_searching = false;
            var last_search = null;
            var more_stuff = false;

            var infinityRunner = function() {
                if (settings.url !== null) {
                    if  (settings.force || (settings.triggerAt >= ($(settings.container).height() - el.height() - el.scrollTop()))) {
                        settings.force = false;
                        // if the request is in progress, exit and wait for it to finish
                        if (req && req.readyState < 4 && req.readyState > 0) {
                            more_stuff = true;
                            return;
                        }
                        $(settings.appendTo).trigger('infinitescroll.beforesend');

                        var params = {};

                        var search_field = $(settings.search_field);
                        if (search_field.length == 1 && search_field.val().length > 0) {
                          var search_s = search_field.val();

                          if (search_s != last_search) {
                            settings.page = 1;
                            $(settings.container).html("");
                          }
                          last_search = search_s;
                          params['search_string'] = search_s;
                          was_searching = true;
                        } else if (was_searching) {
                          // If we were searching and the search field has now been clear, reload from the beginning
                          was_searching = false;
                          last_search = null;
                          settings.page = 1;
                          $(settings.container).html("");
                        }

                        params.page = settings.page

                        req = $.get(settings.url, params, function(data) {
                            if (data.append) {
                                $(settings.appendTo).append(data.append);
                                settings.page++;
                                $(settings.appendTo).trigger('infinitescroll.finish', data.append);
                            } else if (data.replace) {
                                $(settings.container).html(data.replace);
                                settings.page = 2;
                                $(settings.appendTo).trigger('infinitescroll.finish', data.replace);
                            } else if (data.finish) {
                                maxReached = true;
                                $(settings.appendTo).trigger('infinitescroll.maxreached');
                            }
                            if (more_stuff) {
                                more_stuff = false;
                                infinityRunner();
                            }
                        }, 'json');
                    }
                }
            };
            
            el.bind('infinitescroll.scrollpage', function(e, page) {
                settings.page = page;
                settings.force = true;
                infinityRunner();
            });

            el.scroll(function(e) {
                if (!maxReached) {
                    infinityRunner();
                }
            });
                        

            function search() {
              settings.force = true;
              infinityRunner();
            }

            $(settings.search_field).keyup(search);
            $(settings.search_field).click(search);

            // Test initial page layout for trigger
            infinityRunner();
        });
    };
})(jQuery);
