PrimeFaces.widget.MenuButton = PrimeFaces.widget.BaseWidget.extend({

    init: function(cfg) {
        this._super(cfg);

        this.menuId = this.jqId + '_menu';
        this.button = this.jq.children('button');
        this.menu = this.jq.children('.ui-menu');
        this.menuitems = this.jq.find('.ui-menuitem');
        this.cfg.disabled = this.button.is(':disabled');

        if(!this.cfg.disabled) {
            this.bindEvents();
            this.appendPanel();
        }
    },

    bindEvents: function() {
        var $this = this;

        //button visuals
        this.button.mouseover(function(){
            if(!$this.button.hasClass('ui-state-focus')) {
                $this.button.addClass('ui-state-hover');
            }
        }).mouseout(function() {
            if(!$this.button.hasClass('ui-state-focus')) {
                $this.button.removeClass('ui-state-hover ui-state-active');
            }
        }).mousedown(function() {
            $(this).removeClass('ui-state-focus ui-state-hover').addClass('ui-state-active');
        }).mouseup(function() {
            var el = $(this);
            el.removeClass('ui-state-active')

            if($this.menu.is(':visible')) {
                el.addClass('ui-state-hover');
                $this.hide();
            }
            else {
                el.addClass('ui-state-focus');
                $this.show();
            }
        }).focus(function() {
            $(this).addClass('ui-state-focus');
        }).blur(function() {
            $(this).removeClass('ui-state-focus');
        });

        //mark button and descandants of button as a trigger for a primefaces overlay
        this.button.data('primefaces-overlay-target', true).find('*').data('primefaces-overlay-target', true);

        //menuitem visuals
        this.menuitems.mouseover(function(e) {
            var element = $(this);
            if(!element.hasClass('ui-state-disabled')) {
                element.addClass('ui-state-hover');
            }
        }).mouseout(function(e) {
            $(this).removeClass('ui-state-hover');
        }).click(function() {
            $this.button.removeClass('ui-state-focus');
            $this.hide();
        });

        //keyboard support
        this.button.keydown(function(e) {
            var keyCode = $.ui.keyCode;

            switch(e.which) {
                case keyCode.UP:
                    if($this.menu.is(':visible')) {
                        var highlightedItem = $this.menuitems.filter('.ui-state-hover'),
                        prevItems = highlightedItem.length ? highlightedItem.prevAll(':not(.ui-separator)') : null;

                        if(prevItems && prevItems.length) {
                            highlightedItem.removeClass('ui-state-hover');
                            prevItems.eq(0).addClass('ui-state-hover');
                        }
                    }
                    e.preventDefault();
                break;

                case keyCode.DOWN:
                    if($this.menu.is(':visible')) {
                        var highlightedItem = $this.menuitems.filter('.ui-state-hover'),
                        nextItems = highlightedItem.length ? highlightedItem.nextAll(':not(.ui-separator)') : $this.menuitems.eq(0);

                        if(nextItems.length) {
                            highlightedItem.removeClass('ui-state-hover');
                            nextItems.eq(0).addClass('ui-state-hover');
                        }
                    }
                    e.preventDefault();
                break;

                case keyCode.ENTER:
                case keyCode.NUMPAD_ENTER:
                case keyCode.SPACE:
                    if($this.menu.is(':visible'))
                        $this.menuitems.filter('.ui-state-hover').children('a').trigger('click');
                    else
                        $this.show();

                    e.preventDefault();
                break;


                case keyCode.ESCAPE:
                case keyCode.TAB:
                    $this.hide();
                break;
            }
        });

        /**
        * handler for document mousedown to hide the overlay
        **/
        var hideNS = 'mousedown.' + this.id;
        $(document.body).off(hideNS).on(hideNS, function (e) {
            //do nothing if hidden already
            if($this.menu.is(":hidden") || $this.cfg.disabled) {
                return;
            }

            //do nothing if mouse is on button
            var target = $(e.target);
            if(target.is($this.button)||$this.button.has(target).length > 0) {
                return;
            }

            //hide overlay if mouse is outside of overlay except button
            var offset = $this.menu.offset();
            if(e.pageX < offset.left ||
                e.pageX > offset.left + $this.menu.width() ||
                e.pageY < offset.top ||
                e.pageY > offset.top + $this.menu.height()) {

                $this.button.removeClass('ui-state-focus ui-state-hover');
                $this.hide();
            }
        });

        //Realign overlay on window resize
        var resizeNS = 'resize.' + this.id;
        $(window).unbind(resizeNS).bind(resizeNS, function() {
            if($this.menu.is(':visible')) {
                $this.alignPanel();
            }
        });

        //aria
        this.button.attr('role', 'button').attr('aria-disabled', this.button.is(':disabled'));
    },

    appendPanel: function() {
        var container = this.cfg.appendTo ? PrimeFaces.expressions.SearchExpressionFacade.resolveComponentsAsSelector(this.cfg.appendTo): $(document.body);

        if(!container.is(this.jq)) {
            container.children(this.menuId).remove();
            this.menu.appendTo(container);
        }
    },

    show: function() {
        this.alignPanel();

        this.menu.show();
    },

    hide: function() {
        this.menuitems.filter('.ui-state-hover').removeClass('ui-state-hover');

        this.menu.fadeOut('fast');
    },

    alignPanel: function() {
        this.menu.css({left:'', top:'','z-index': ++PrimeFaces.zindex});

        if(this.menu.parent().is(this.jq)) {
            this.menu.css({
                left: 0,
                top: this.jq.innerHeight()
            });
        }
        else {
            this.menu.position({
                my: 'left top'
                ,at: 'left bottom'
                ,of: this.button
            });
        }
    }

});
