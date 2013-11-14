var EventVote = {
    TYPE_PLACE: "type_place",
    TYPE_TIME: "type_time",
    OPERATION_UPDATE: "ot_update",
    OPERATION_ADD: "ot_add",
    OPERATION_DELETE: "ot_delete",
    VOTE_TIME_URL: "/events/ajax/vote_time/",
    VOTE_PLACE_URL: "/events/ajax/vote_place/"
}

var EventInfo = Backbone.Model.extend({
    initialize: function(){
        _.bindAll(this, 'url');
    },
    
    url: function(){
        return '/events/ajax/set_default/?eid='+this.get('event_id')+'&read_info=read';
    }
});

var EventInfoView = Backbone.View.extend({
    el: '.event_title.public_info.event_box',
    
    initialize: function(options){
        _.bindAll(this, 'render');
        this.event_id = options.event_id;
        this.model = new EventInfo({event_id:this.event_id});
        this.model.bind('change', this.render);
    },
    
    render: function(){
        var compiled = _.template($("#template_event_title_info").html());
        var context = {info: this.model};
        $('.title_container', this.el).html(compiled(context));
        return this;
    }
});


/**
 * Vote Time
 */
var VoteTime = Backbone.Model;

var VoteTimeCandidates = Backbone.Collection.extend({
    /*
     * data {''}
     */
    model: VoteTime,
    
    initialize: function(models, options){
        _.bindAll(this, 'url');
        
        this.event_id = options.event_id;
    },

    url: function(){
        return "/events/ajax/get_vote_time/?eid="+this.event_id;
    }
});

var VoteTimeView = Backbone.View.extend({
    tagName: 'li',
    
    initialize: function(){
        _.bindAll(this, 'render', 'update', 'del');
        this.object_id = this.model.get('event_time_id');
        this.utc_time = this.model.get('utc_time');
        this.event_id = this.model.get('event_id');
        this.deleting = false;
    },
    
    events: {
        'click .vote_time_ck': 'update',
        'click': 'del'
        //'click': 'set_default'
    },
    
    update: function(){
        var $this = this;
        $.ajax({
            url: EventVote.VOTE_TIME_URL,
            data: {
                'operation_type': EventVote.OPERATION_UPDATE,
                'object_id': this.object_id,
                'event_id': this.event_id,
                'utc_timestamp': this.utc_time
            },
            type: 'POST',
            dataType: 'json',
            success: function(response){
                $($this.el).find('b').html(response.count);
            },
            error: function(){}
        });
    },
    
    del: function(e){
        this.deleting = true;
        var $this = this;
        if($(this.el).parents('.content.edit').size()){
            if(e){
                e.preventDefault();
                e.stopPropagation();
            }
            $.ajax({
                url: EventVote.VOTE_TIME_URL,
                data: {
                    'operation_type': EventVote.OPERATION_DELETE,
                    'event_id': $this.event_id,
                    'object_id': $this.object_id
                },
                type: 'POST',
                dataType: 'json',
                success: function(response){
                    if(response.success){
                        if($($this.el).hasClass('on')){
                            window.eventInfoView.model.fetch();
                        }
                        window.voteTimeCandidatesView.collection.remove($this.model)
                        $($this.el).fadeOut('slow', function(){
                            $(this).remove();
                        });
                    }else{
                        console.log('delete error!');
                    }
                    this.deleting = false;
                },
                error: function(){this.deleting = false;}
            });
        }
        return true;
    },
    
    set_default: function(e){
        var $this = this;
        if($(this.el).parents('.content.edit').size()){
            if(this.deleting)
                return false;
            if($(this.el).hasClass('on')){
                $(this.el).parent().find('li').removeClass('on');
            }else{
                $(this.el).parent().find('li').removeClass('on');
                $(this.el).addClass('on');
            }
            $.ajax({
                type: "POST",
                url: '/events/ajax/set_default/',
                data: {
                    'event_id': $this.event_id,
                    'target_id': $this.object_id,
                    'target_type': EventVote.TYPE_TIME
                },
                dataType:'json',
                success: function(response){
                    window.eventInfoView.model.set(response);
                },               
                error: function(xhr){
                    console.log(xhr.responseText);
                }
            });
        }
    },
    
    render: function(){
        var compiled = _.template($("#template_vote_time_li").html());
        var context = {voteTime: this.model};
        $(this.el).html(compiled(context));
        $(this.el).attr('data-object-id', this.object_id);
        $(this.el).attr('data-utc-timestamp', this.utc_time);
        if(this.model.get('is_selected')){
            $(this.el).addClass('on');
        }
        $('.vote_time_ck', this.el).autoConvertUI({
            type: "checkbox",
            hook_event_1: this.update
        });
        return this;
    }
});

var VoteTimeCandidatesView = Backbone.View.extend({
    el: 'ul.time_list',
    
    initialize: function(){
        _.bindAll(this, 'render', 'appendItem');
        
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.appendItem);
        this.collection.fetch();
    },

    render: function(){
        var $this = this;
        var $target = $(this.el);
        $target.html("");
        
        _(this.collection.models).each(function(item){
            $this.appendItem(item);
        });
        return this;
    },
    
    appendItem: function(item){
        var $target = $(this.el);
        var voteTime = new VoteTimeView({model:item});
        $(voteTime.render().el).hide().appendTo($target).fadeIn();
    }
    
});

var AddTimeCandidateView = Backbone.View.extend({
    initialize: function(options){
        _.bindAll(this, 'addTime', 'showBox', 'hideBox');
        
        this.event_id = options.event_id;
        this.voteTimeCollection = options.voteTimeCollection;
        this.voteTimeCandidatesView = options.voteTimeCandidatesView;
        
        var $this = this;
        $('#vote_event_date_picker', this.el).datepicker({
            showOn: 'both',
            buttonText: '',
            onSelect: function(dateText, inst){
                $('#vote_selected_date').attr('year', inst['selectedYear']);
                $('#vote_selected_date').attr('month', inst['selectedMonth']);
                $('#vote_selected_date').attr('day', inst['selectedDay']);
                $this.year = inst['selectedYear'];
                $this.month = inst['selectedMonth'];
                $this.day = inst['selectedDay'];
            },
            dateFormat: 'mm/dd/yy'
        });
    },

    events: {
        'click #vote_add_time_btn': 'addTime'
    },
    
    addTime: function(){
        var time = $('#vote_event_time_picker').val().split(":");
        
        var year = this.year;
        var month = this.month;
        var day = this.day;
        
        if( !year || !month || !day ){
            return;
        }

        var hour = time[0];
        var min = time[1];

        var utc_timestamp = Date.UTC(year, month, day, hour, min) * 0.001;
        var $this = this;
        
        $.ajax({
            url: EventVote.VOTE_TIME_URL,
            data: {
                'operation_type': EventVote.OPERATION_ADD,
                'event_id': $this.event_id,
                'utc_timestamp': utc_timestamp
            },
            type: 'POST',
            dataType: 'json',
            success: function(response){
                if(response.error){
                    $('.error_msg', $this.el).text(response.msg);
                }else{
                    voteTimeModel = new VoteTime(response);
                    $this.voteTimeCollection.add(voteTimeModel);
                    $this.hideBox();
                }
            },
            error: function(){}
        });
    },
    
    showBox: function(){
        var $box = $(this.el);
        $box.css({
            "display": "block",
            "zIndex": 50
        });
        $box.bind("click", function(event){
            if(event) event.stopPropagation();
        });
        $('#ui-datepicker-div').bind("click", function(event){
            if(event) event.stopPropagation();
        });
        $('body').bind("click", {$box:$box}, this.hideBox);
    },
    
    hideBox: function(){
        var $box = $(this.el);
        
        // clean
        $('.event_date_picker', $box).val('');
        $('.vote_event_time_picker', $box).children().each(function(){
            if($(this).text() == '12:00'){
                $(this).attr('selected', 'selected');
            }else{
                $(this).removeAttr('selected');
            }
        });
        $('.error_msg', $box).text("");
        $box.css("display", "none");
        $box.unbind("clcik");
        $('#ui-datepicker-div').unbind("click");
        $('body').unbind("click");
    }
    
});

var SuggestTimeBtn = Backbone.View.extend({
    el: '.suggest_time .suggest_btn',
    
    initialize: function(options){
        _.bindAll(this, 'render');
        this.voteTimeCandidatesView = options.voteTimeCandidatesView;
        this.addTimeBox = new AddTimeCandidateView({
            el: '.time_selector_box',
            event_id: options.event_id,
            voteTimeCollection: options.voteTimeCollection,
            voteTimeCandidatesView: this.voteTimeCandidatesView
        });
    },
    
    events: {
        'click button': 'show_selector'
    },
    
    show_selector: function(e, showHide){
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
        
        if($('.place_selector_box').css('display') != 'none'){
            $('.suggest_place .suggest_btn > button').click();
        }
        
        var $box = $(this.addTimeBox.el);
        
        if($('li', this.voteTimeCandidatesView.el).size() >= 5){
            $box.find('.main_button').hide();
            $box.find('.up_to_limit').show();
        }else{
            $box.find('.main_button').show();
            $box.find('.up_to_limit').hide();
        }
        
        if($box.css("display") == "none"){
            this.addTimeBox.showBox();
        }else if($box.css("display") == "block"){
            this.addTimeBox.hideBox();
        }
    }
});

/**
 * Vote Place
 */
var VotePlace = Backbone.Model;

var VotePlaceCandidates = Backbone.Collection.extend({
    /*
     * data {''}
     */
    model: VoteTime,
    
    initialize: function(models, options){
        _.bindAll(this, 'url');
        
        this.event_id = options.event_id;
    },

    url: function(){
        return "/events/ajax/get_vote_place/?eid="+this.event_id;
    }
});

var VotePlaceView = Backbone.View.extend({
    tagName: 'li',
    
    initialize: function(){
        _.bindAll(this, 'render', 'update', 'del', 'set_default');
        this.object_id = this.model.get('place_id');
        this.event_id = this.model.get('event_id');
    },
    
    events: {
        'click .vote_place_ck': 'update',
        //'click .delete': 'del',
        'click': 'del',
        //'click': 'set_default'
    },
    
    update: function(){
        var $this = this;
        $.ajax({
            url: EventVote.VOTE_PLACE_URL,
            data: {
                'operation_type': EventVote.OPERATION_UPDATE,
                'object_id': this.object_id,
                'event_id': this.event_id
            },
            type: 'POST',
            dataType: 'json',
            success: function(response){
                $($this.el).find('b').html(response.count);
            },
            error: function(){}
        });
    },
    
    del: function(e){
        this.deleting = true;
        var $this = this;
        if($(this.el).parents('.content.edit').size()){
            if(e){
                e.preventDefault();
                e.stopPropagation();
            }
            $.ajax({
                url: EventVote.VOTE_PLACE_URL,
                data: {
                    'operation_type': EventVote.OPERATION_DELETE,
                    'event_id': $this.event_id,
                    'object_id': $this.object_id
                },
                type: 'POST',
                dataType: 'json',
                success: function(response){
                    if(response.success){
                        if($($this.el).hasClass('on')){
                            window.eventInfoView.model.fetch();
                        }
                        window.votePlaceCandidatesView.collection.remove($this.model)
                        $($this.el).fadeOut('slow', function(){
                            $(this).remove();
                        });
                    }else{
                        console.log('delete error!');
                    }
                    this.deleting = false;
                },
                error: function(){this.deleting = false;}
            });
        }
        return true;
    },
    
    set_default: function(e){
        var $this = this;
        if($(this.el).parents('.content.edit').size()){
            if(e){
                e.preventDefault();
                e.stopPropagation();
            }
            if(this.deleting){
                return false;
            }
            if($(this.el).hasClass('on')){
                $(this.el).parent().find('li').removeClass('on');
            }else{
                $(this.el).parent().find('li').removeClass('on');
                $(this.el).addClass('on');
            }
            $.ajax({
                type: "POST",
                url: '/events/ajax/set_default/',
                data: {
                    'event_id': $this.event_id,
                    'target_id': $this.object_id,
                    'target_type': EventVote.TYPE_PLACE
                },
                dataType:'json',
                success: function(response){
                    window.eventInfoView.model.set(response);
                },               
                error: function(xhr){
                    console.log(xhr.responseText);
                }
            });
        }
    },
    
    render: function(){
        var compiled = _.template($("#template_vote_place_li").html());
        var context = {votePlace: this.model};
        $(this.el).html(compiled(context));
        $(this.el).attr('data-object-id', this.object_id);
        if(this.model.get('is_selected')){
            $(this.el).addClass('on');
        }
        $('.vote_place_ck', this.el).autoConvertUI({
            type: "checkbox",
            hook_event_1: this.update
        });
        return this;
    }
});

var VotePlaceCandidatesView = Backbone.View.extend({
    el: 'ul.place_list',
    
    initialize: function(){
        _.bindAll(this, 'render', 'appendItem');
        
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.appendItem);
        this.collection.fetch();
    },

    render: function(){
        var $this = this;
        var $target = $(this.el);
        $target.html("");
        
        _(this.collection.models).each(function(item){
            $this.appendItem(item);
        });
        return this;
    },
    
    appendItem: function(item){
        var $target = $(this.el);
        var votePlace = new VotePlaceView({model:item});
        $(votePlace.render().el).hide().appendTo($target).fadeIn();
    }
});

var AddPlaceCandidateView = Backbone.View.extend({
    initialize: function(options){
        _.bindAll(this, 'addPlace', 'showBox', 'hideBox');
        
        this.event_id = options.event_id;
        this.votePlaceCollection = options.votePlaceCollection;
        this.votePlaceCandidatesView = options.votePlaceCandidatesView;
        
        var $this = this;
        
        var ac_container = $('.add_list', $this.el);
        
        $('.gulu_ac_input', this.el).guluAutoComplete({
            max: 10,
            width:200,
            stop_submit: true,
            cacheLength: 20
        },{
            list_contain: ac_container,
            url : "/search/ajax/auto_complete_place/",
            remove_item: function(){
                var ac_input = ac_container.find('.input_wrapper input');
                ac_input.removeClass('ac_only_one_input');
            },
            result: function(info, data, value){
                var target = ac_container;
                var ac_input = target.find('.input_wrapper input');
                target.append($('<input type="hidden" class="place_select_results" name="place" id="'+ data[0] +'" value="'+ data[0] +'"/>'));
                target.find('ul').append($('<li style="max-width:125px;" class="'+data[0]+'"><span class="name">' +data[1]+ '</span><span class="cancel">x</span></li>'));
                ac_input.val('');
                ac_input.attr('size','1');
                ac_input.addClass('ac_only_one_input');
                img_obj = $('<img src="'+data[6]+'" width="105" height="105" alt="'+data[0]+'">') 
                target.parents('.quick_invite').find('.target .pic_frame').html(img_obj);
            },
            prefill: gettext("Find or add place here")
        });
    },

    events: {
        'click #vote_add_place_btn': 'addPlace'
    },
    
    addPlace: function(){
        var $this = this;
        var ac_container = $('.add_list', this.el);
        if(ac_container.find('input[type=hidden]').size() != 1)
            return false;
        var object_id = ac_container.find('input[type=hidden]').val();
        $.ajax({
            url: EventVote.VOTE_PLACE_URL,
            data: {
                'operation_type': EventVote.OPERATION_ADD,
                'event_id': $this.event_id,
                'object_id': object_id
            },
            type: 'POST',
            dataType: 'json',
            success: function(response){
                if(response.error){
                    $('.error_msg', $this.el).text(response.msg);
                }else{
                    votePlaceModel = new VotePlace(response);
                    $this.votePlaceCollection.add(votePlaceModel);
                    $this.hideBox();
                }
            },
            error: function(){}
        });
    },
    
    showBox: function(){
        var $box = $(this.el);
        $box.css({
            "display": "block",
            "zIndex": 50
        });
        $box.bind("click", function(event){
            if(event) event.stopPropagation();
        });
        $('.ac_results, .ac_even').bind("click", function(event){
            if(event) event.stopPropagation();
        });
        $('body').bind("click", {$box:$box}, this.hideBox);
    },
    
    hideBox: function(){
        var $box = $(this.el);
        
        // clean
        $box.find('.selected_place li .cancel').click();
        $('.error_msg', $box).text("");
        $box.css("display", "none");
        $box.unbind("clcik");
        $('.ac_results, .ac_even').unbind("click");
        $('body').unbind("click");
    }
    
});

var SuggestPlaceBtn = Backbone.View.extend({
    el: '.suggest_place .suggest_btn',
    
    initialize: function(options){
        _.bindAll(this, 'render');
        this.votePlaceCandidatesView = options.votePlaceCandidatesView;
        this.addPlaceBox = new AddPlaceCandidateView({
            el: '.place_selector_box',
            event_id: options.event_id,
            votePlaceCollection: options.votePlaceCollection,
            votePlaceCandidatesView: this.votePlaceCandidatesView
        });
    },
    
    events: {
        'click button': 'show_selector'
    },
    
    show_selector: function(e){
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
        
        if($('.time_selector_box').css('display') != 'none'){
            $('.suggest_time .suggest_btn > button').click();
        }
        
        var $box = $(this.addPlaceBox.el);
        
        if($('li', this.votePlaceCandidatesView.el).size() >= 5){
            $box.find('.main_button').hide();
            $box.find('.up_to_limit').show();
        }else{
            $box.find('.main_button').show();
            $box.find('.up_to_limit').hide();
        }
        
        if($box.css("display") == "none"){
            this.addPlaceBox.showBox();
        }else if($box.css("display") == "block"){
            this.addPlaceBox.hideBox();
        }
    }
});

var SuggestEditBtn = Backbone.View.extend({
    el: '.event_box.middle .edit_btn',
    
    initialize: function(options){
        _.bindAll(this, 'editMode');
        this.voteTimeCandidatesView = options.voteTimeCandidatesView;
        this.votePlaceCandidatesView = options.votePlaceCandidatesView;
    },
    
    events: {
        'click .btn_1_s': 'editMode'
    },
    
    editMode: function(){
        if($('.event_box.vote .content').hasClass('edit')){
            $('input', this.el).val(gettext('EDIT'));
            $('.event_box.vote .content').removeClass('edit')
        }else{
            $('input', this.el).val(gettext('SAVE'));
            $('.event_box.vote .content').addClass('edit');
        }
    }
    
});

var TimeSelectView = Backbone.View.extend({
    el: '.event_box.event_title .event_time_content select',
    
    initialize: function(options){
        _.bindAll(this, 'render', 'change_default');
        this.collection = options.voteTimeCandidates;
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
        this.render();
        this.select_id = $(this.el).val() || '0';
    },
    
    events: {
        'change': 'change_default'
    },
    
    render: function(){
        var $this = this;
        $(this.el).html('');
        $($this.el).append('<option value="0">'+gettext('Undecided')+'</option>');
        _(this.collection.models).each(function(item){
            var compiled = _.template($("#template_event_time_options").html());
            var context = {voteTime: item};
            var html = compiled(context);
            $($this.el).append(html);
        });
        return this;
    },
    
    change_default: function(){
        this.select_id = $(this.el).val();
    }
});

var PlaceSelectView = Backbone.View.extend({
    el: '.event_box.event_title .event_place_content select',
    
    initialize: function(options){
        _.bindAll(this, 'render', 'change_default');
        this.collection = options.votePlaceCandidates;
        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
        this.render();
        this.select_id = $(this.el).val() || '0';
    },
    
    events: {
        'change': 'change_default'
    },
    
    render: function(){
        var $this = this;
        $(this.el).html('');
        $($this.el).append('<option value="0">'+gettext('Undecided')+'</option>');
        _(this.collection.models).each(function(item){
            var compiled = _.template($("#template_event_place_options").html());
            var context = {votePlace: item};
            var html = compiled(context);
            $($this.el).append(html);
        });
        return this;
    },
    
    change_default: function(){
        this.select_id = $(this.el).val();
    }
});

var EditNotesView = Backbone.View.extend({
    el: '.event_box.event_title .title_container textarea',
    
    initialize: function(options){
        _.bindAll(this, 'send');
        this.eventInfoEditBtn = options.eventInfoEditBtn;
    },
    
    events: {
        'keypress': 'send'
    },
    
    send: function(e){
        console.log(e.keyCode);
        if(e.keyCode == 13){
            e.preventDefault();
            e.stopPropagation();
            this.eventInfoEditBtn.editMode();
        }
    }
    
});

var EventInfoEditBtn = Backbone.View.extend({
    el: '.event_box.event_title .edit_btn',
    
    initialize: function(options){
        _.bindAll(this, 'editMode', 'set_default');
        this.voteTimeCandidates = options.voteTimeCandidates;
        this.votePlaceCandidates = options.votePlaceCandidates;
        this.event_id = options.event_id;
    },
    
    events: {
        'click .btn_1_s': 'editMode'
    },
    
    editMode: function(){
        if($('.event_box.event_title .content').hasClass('edit')){
            $('input', this.el).val(gettext('EDIT'));
            this.set_default();
        }else{
            this.timeSelectView = new TimeSelectView({voteTimeCandidates: this.voteTimeCandidates});
            this.placeSelectView = new PlaceSelectView({votePlaceCandidates: this.votePlaceCandidates});
            this.editNotesView = new EditNotesView({eventInfoEditBtn:this});
            $('input', this.el).val(gettext('SAVE'));
            $('.event_box.event_title .content').addClass('edit');
        }
    },
    
    set_default: function(){
        var $this = this;
        $.ajax({
            type: "POST",
            url: '/events/ajax/set_default/?both=both',
            data: {
                'event_id': $this.event_id,
                'time_id': $this.timeSelectView.select_id,
                'place_id': $this.placeSelectView.select_id,
                'notes': $(window.eventInfoView.el).find('.title_container textarea').val()
            },
            dataType:'json',
            success: function(response){
                $('.event_box.event_title .content').removeClass('edit');
                window.eventInfoView.model.set(response);
                _($this.timeSelectView.collection.models).each(function(item){
                    if(item.get('event_time_id') == $this.timeSelectView.select_id)
                        item.set({is_selected:true});
                    else
                        item.set({is_selected:false});
                });
                _($this.placeSelectView.collection.models).each(function(item){
                    if(item.get('place_id') == $this.placeSelectView.select_id)
                        item.set({is_selected:true});
                    else
                        item.set({is_selected:false});
                });
            },               
            error: function(xhr){
                console.log(xhr.responseText);
            }
        });
    }
    
});

(function($) {
    var methods = {
        init : function(options) {
          return this;
        },
        
        initGallery : function(list_num, eventId, social_dict) {
            var facebook = social_dict.facebook;
            var weibo = social_dict.weibo;
            var facebook_btn = '';
            var weibo_btn = '';
            if (facebook == 1){
                facebook_btn = '<span class="icon f_icon"></span><label><input type="checkbox" name="post_to_facebook" />'+gettext('Share to Facebook')+'</label>';
            }
            if (weibo == 1){
                weibo_btn = '<span class="icon weibo_icon"></span><label><input type="checkbox" name="post_to_weibo" />'+gettext('Share to Weibo')+'</label>';
            }
            var social_group = '<div class="wall_post"><div class="share_post">' + facebook_btn + weibo_btn + '</div></div>';
            var share_button = '<div class="btn_group"><button type="button" class="btn_2_m bind_close">Share</button></div>';
            $('.photos.event_box.bottom .thumbnails').scrollTop(0);
            $('.scroll_btn_bottom').click(function(){
                $('.photos.event_box.bottom .thumbnails').scrollTop($('.photos.event_box.bottom .thumbnails').scrollTop()+107);
                return false;
            });
            $('.scroll_btn_top').click(function(){
                $('.photos.event_box.bottom .thumbnails').scrollTop($('.photos.event_box.bottom .thumbnails').scrollTop()-107);
                return false;
            });
            $('.dare_gallery').hover(function(){
                if($('.photos.event_box.bottom .thumbnails')[0].scrollHeight - $('.photos.event_box.bottom .thumbnails').height() != 23){
                    $('.scroll_btn_top').css('display','block');
                    $('.scroll_btn_bottom').css('display','block');
                }
            }, function(){
                $('.scroll_btn_top').hide();
                $('.scroll_btn_bottom').hide();
            });
            
            $('.post_target_img.video').each(function(){
                var thisObj = $(this);
                var settings = null;
                if (facebook==1 || weibo==1){
                    settings = {'title':'Video', 'hasbtn':false, 'callback_close':share_social, 'callback':convertUI}; 
                }
                thisObj.bind_player({
                    video_id: thisObj.attr('class').split(' ')[3],
                    url: "/videostream/ajax/show_video_player/",
                    append_html: social_group+share_button,
                    settings: settings
                });
                
                function share_social(){
                    var share_to_fb = $('input[name="post_to_facebook"]').is(':checked');
                    var share_to_wb = $('input[name="post_to_weibo"]').is(':checked');
                    if (share_to_wb || share_to_fb){
                        /*
                         * TODO: share event photo to SNS
                         */
//                        $.ajax({
//                            url: "/dare/ajax/share_media/" ,
//                            type: 'POST',
//                            data: {'dare_id':dareId, 'media_id':thisObj.data('mediaId'), 'media_type':'video', 
//                                   'share_to_fb':share_to_fb, 'share_to_wb':share_to_wb},
//                            dataType:'json',                    
//                            success: function(response){
//                                systemTxt(gettext('Successfully Shared!'));
//                            },
//                            error: function( xhr ){
//                                console.log(xhr.responseText);
//                            }
//                        });
                    }
                };
                
            })
            
            $('.post_target_img.photo').each(function(){
                var thisObj = $(this);
                var url = thisObj.attr('href')
                var html = '<img src="'+url+'" alt="" width="600" height="400">';
                
                thisObj.click(function(){
                    if (facebook==1 || weibo==1){
                        systemTxt(html+social_group+share_button,{'title':'Photo', 'hasbtn':false, 'callback_close':share_social, 'callback':convertUI});
                    }
                    else {
                        systemTxt(html, {'title':'Photo'});
                    }
                    return false;
                })
                
                function share_social(){
                    var share_to_fb = $('input[name="post_to_facebook"]').is(':checked');
                    var share_to_wb = $('input[name="post_to_weibo"]').is(':checked');
                    if (share_to_wb || share_to_fb){
                        /**
                         * TODO: share event photo to SNS
                         */
//                        $.ajax({
//                            url: "/dare/ajax/share_media/" ,
//                            type: 'POST',
//                            data: {'dare_id':dareId, 'media_id':thisObj.data('mediaId'), 'media_type':'photo', 
//                                   'share_to_fb':share_to_fb, 'share_to_wb':share_to_wb},
//                            dataType:'json',                    
//                            success: function(response){
//                                systemTxt(gettext('Successfully Shared!'));
//                            },
//                            error: function( xhr ){
//                                console.log(xhr.responseText);
//                            }
//                        });
                    }
                };
                
            })
            
            function convertUI(){
                $(".ui_popup").find("input:checkbox").autoConvertUI({
                    type: "checkbox",
                    hook_event_1: function() {
                        // callback function write here
                    }
                });
            }
          
            return this;
        },
        
        updateGallery : function(eventId, viewerId, social_dict) {
          $.ajax({
                url: "/events/ajax/render_public_gallery/" ,
                type: 'POST',
                data: {'event_id':eventId},
                dataType:'json',                    
                success: function(response){
                    if (response.status == 1){
                        $('#media_gallery').html('');
                        $('#media_gallery').html(response.html);
                        $('.no_content').hide();
                        $('.dare_gallery').show();
                        $('.people_list').show();
                        $('.event_box.bottom .box_title .upload_btn').show();
                        methods.initGallery(response.list_count, eventId, social_dict);
                        $('.upload_media').PhotoVideoUploader({
                            object_id: eventId,
                            user_id: $('.upload_media').data('userId'),
                            url: '/events/ajax/file_uploader/?event_id='+eventId,
                            add_media_url: '/events/ajax/add_media/',
                            success_call_back: function(data){
                                $('.upload_media').EventPublic('updateGallery',eventId,$('.upload_media').data('userId'), social_dict);
                            }
                        });
                    }
                    else{
                        console.log(response.msg);
                    }
                },
                error: function( xhr ){
                    console.log(xhr.responseText);
                }
          });      
          return this.each(function(){});
        },
        
        
        destroy : function() {
          return this.each(function(){});
        }
      }

      $.fn.EventPublic = function(method){
        if (methods[method]){
          return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method){
          return methods.init.apply( this, arguments );
        } else {
          $.error('Method ' +  method + ' does not exist on jQuery.EventPublic');
        }
        return this;
      };

})(jQuery);
