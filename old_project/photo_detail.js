/*
 * @author: redbug <http://redbug0314.blogspot.com/p/info.html>
 */
var gulu = gulu||{};
gulu.photo = gulu.photo||{};
gulu.photo.detail_page = gulu.photo.detail_page||{};


/*
 * Class - constructor
 */
  
gulu.photo.detail_page.PhotoDetailPage = (function(){
    
    //constructor
    return function( config ){ 
        var _default_config = {
            'allow_modify_url':true
        };
        
        var _config = $.extend(_default_config, config);
        
        var photo_list_container, 
            photo_detail_container, 
            event_detail_container,
            photo_detail_type, 
            referer,
            doc,
            tab_name,
            allow_modify_url;

        this.quick_invite = $("#quick_invite");
        this.edit_btn = $("#edit_btn");
        this.new_invite_btn = $("#new_invite_btn");
        this.dash_line = $("#dash_line");
        this.back_to_place = $("#back_to_place");
        
        doc = $(document);
        
        /*
         * Access function 
         */
        this.get_photo_list_container = function(){
            return photo_list_container;
        };
        
        this.set_photo_list_container = function( value ){
            if(value)
                photo_list_container = value
        };

        this.get_photo_detail_container = function(){
            return photo_detail_container;
        };
        
        this.set_photo_detail_container = function( value ){
            if(value)
                photo_detail_container = value
        };
        
        this.get_event_detail_container = function(){
            return event_detail_container;
        };
        
        this.set_event_detail_container = function( value ){
            if(value)
                event_detail_container = value
        };        
        
        this.get_photo_detail_type = function(){
            return photo_detail_type;
        };
        
        this.set_photo_detail_type = function( value ){
            if(value)
                photo_detail_type = value;  
        };
        
        this.get_referer = function(){
            return referer;
        };
        
        this.set_referer = function( value ){
            if(value)
                referer = value;
        };
        
        this.set_doc = function( value ){
            if(value)
                doc = value;
        }
        
        this.get_doc = function(){
            return doc;
        }
        
        this.get_tab_name = function(){
            return tab_name;
        }
        
        this.set_tab_name = function( value ){
            if(value)
                tab_name = value;
        }
        
        this.get_allow_modify_url = function(){
            return allow_modify_url;
        }
        
        this.set_allow_modify_url = function( value ){
            if(value)
                allow_modify_url = value;
        }
        
        /*
         * Initialization
         */
        this.set_photo_detail_container( _config.photo_detail_container );
        this.set_photo_list_container( _config.photo_list_container );
        this.set_event_detail_container( _config.event_detail_container );
        this.set_photo_detail_type( _config.photo_detail_type );
        this.set_tab_name( _config.tab_name );
        this.set_allow_modify_url( _config.allow_modify_url );

        /*
         * HTML5: simulate the behavior of 'go back' button
         */        
        window.onpopstate = function( event ){
            if( event.state ){
                //console.debug(event.state);
                window.location.href = window.location.href;
            }
        }
        
        //unbind event first
        $('.content_object_photo').die();
        $('.arrow_l').die();
        $('.arrow_r').die();
        $('.pic_frame_shadow').die();
        $('#back_to_referer').die();
        doc.die();
        $("#id_comment").die();
        $("#main_search_input").die();
        $(".contact_filter").die();        
        
        
        //each photo in the photo list        
        $('.content_object_photo').live( 'click', { "obj": this }, this.get_photo_details );
        //arrow left
        
        $('.arrow_l').live( 'click', { "obj": this }, this.get_photo_details );
        //arrow right
        $('.arrow_r').live( 'click', { "obj": this }, this.get_photo_details );
        //target photo
        $('.pic_frame_shadow').live( 'click', { "obj": this }, this.get_photo_details );
        //back to photo page
        $('#back_to_referer').live( 'click', $.proxy( this.back_to_referer, this ) );
        
        doc.bind('keydown', this.photo_navigate );
        
        /*
         * Comment: input field
         */
        $("#id_comment").live( 'focus', $.proxy( this.unbind_keydown, this ) ); 
        $("#id_comment").live( 'blur', $.proxy( this.bind_keydown, this ) );
        
        /*
         * Search: input field
         */
        $("#main_search_input").live( 'focus', $.proxy( this.unbind_keydown, this ) );
        $("#main_search_input").live( 'blur', $.proxy( this.bind_keydown, this ) );
        
        /*
         * Contact Filter: input field
         */
        $(".contact_filter").live( 'focus', $.proxy( this.unbind_keydown, this ) );
        $(".contact_filter").live( 'blur', $.proxy( this.bind_keydown, this ) );
        
    };    
    
})();


PhotoDetailPage = gulu.photo.detail_page.PhotoDetailPage;


PhotoDetailPage.prototype = {
    
    "hide_referer": function(){
        this.get_referer().hide();
    },
    
    "show_referer": function(){
        this.get_referer().show();
    },
    
    "hide_quick_invite": function(){
        this.quick_invite.hide();
        this.edit_btn.hide();
        this.new_invite_btn.hide();
        this.dash_line.hide();
        this.back_to_place.hide();        
    },
    
    "show_quick_invite": function(){
        this.quick_invite.show();
        this.edit_btn.show();
        this.new_invite_btn.show();
        this.dash_line.show();
        this.back_to_place.show();        
    },
    
    "show_photo_detail_page": function( page ){
        this.remove_photo_detail_page();
        page.appendTo( this.get_photo_detail_container() );
    },
    
    "remove_photo_detail_page": function(){
        this.get_photo_detail_container().empty();
    },
    
    "get_photo_details": function( event ){
        event.preventDefault();
        
        var obj = event.data.obj;
        var photo_detail_type = obj.get_photo_detail_type();
        
        var btn = $(this);
        
        //btn must be a jquery object.
        var url = "/photos/ajax/get_photo_detail/";
        var photo_id = btn.attr("photo_id");
        var object_id = btn.attr("object_id");
        var bnt_photo_detail_type = btn.attr("photo_detail_type"); 
        
        var modify_url = function(hash_key, url_4_html5 ){
            //alertTxt(url_4_html5);
            var pathname = window.location.pathname;
            var settings = {
                'protocol': '__photo_detail__',
                'hash_key': url_4_html5,
                'url_4_html5': url_4_html5     
            };
            
            Gulu.modifyURL( settings );
        }        
        
        if( bnt_photo_detail_type ){
            photo_detail_type = bnt_photo_detail_type;
            obj.set_photo_detail_type( photo_detail_type ); 
        }
                          
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                photo_id: photo_id,
                object_id: object_id,
                photo_detail_type: photo_detail_type
            },
            success:function( response ){
                obj.hide_referer();
                obj.hide_quick_invite();
                obj.show_photo_detail_page( $(response) );

                /*
                 * check if need a permalink 
                 */
                if( !obj.get_allow_modify_url()){
                    return false;
                }
                
                modify_url( photo_id, $('#photo_big').attr('href') );
                
                /*
                 * Scroll to top
                 */
                var view_top = 155;
                var animation_delay = 500;
                 
                var body_current_top = $(window).scrollTop(); 
                
                if( body_current_top > view_top){
                    $(window).scrollTop(view_top);
                    //$(window).animate({scrollTop:view_top}, animation_delay);    
                }
            },
            error: function( xhr ){
                //alertTxt( xhr.responseText );
                console.log(xhr.responseText);
            }
        });
        
        return false;
    },
    
    "back_to_referer": function( event ){
        this.remove_photo_detail_page();
        this.show_referer();

        //if last level is photo list page            
        if( this.get_referer() == this.get_photo_list_container() )
        {
            //show quick invite UI
            this.show_quick_invite();
            
            //modify url
            if( history.pushState ){
                var url = location.href;
                var sub_urls = url.split('/');
                var page_of_last_level = "/"; 
                
                for(var i=3; i<=5; ++i){
                    page_of_last_level += sub_urls[i] + "/";                   
                }
                
                history.pushState( {foo:"bar"}, "", page_of_last_level );
            }            
        }
        
        return false;        
    },
    
    "photo_navigate": function( event ){    
        //left arrow
        if( event.keyCode == '37'){
            $('.arrow_l').trigger('click');            
        }
        //right arrow
        else if(event.keyCode == '39'){
            $('.arrow_r').trigger('click');
        }
    },
        
    "unbind_keydown": function(){
        this.get_doc().unbind('keydown', this.photo_navigate);
    },
    
    "bind_keydown": function(){
        this.get_doc().bind('keydown', this.photo_navigate);
    }
};
