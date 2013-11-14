/*
 * @author: redbug <http://redbug0314.blogspot.com/p/info.html>
 */
var gulu = gulu||{};
gulu.event = gulu.event||{};
gulu.event.detail_page = gulu.event.detail_page||{};

/*
 * Class - constructor
 */

gulu.event.detail_page.EventPhotoDetailPage = (function(){

    //constructor
    return function( config ){

        var photo_list_container, 
            photo_detail_container, 
            event_detail_container,
            pdp,
            photo_detail_type,
            tab_name;

        
        /*
         * Access function 
         */
        this.get_photo_list_container = function(){
            return photo_list_container;
        };
        
        this.set_photo_list_container = function( value ){
            photo_list_container = value
        };

        this.get_photo_detail_container = function(){
            return photo_detail_container;
        };
        
        this.set_photo_detail_container = function( value ){
            photo_detail_container = value
        };
        
        this.get_event_detail_container = function(){
            return event_detail_container;
        };
        
        this.set_event_detail_container = function( value ){
            event_detail_container = value
        };        

        this.get_photo_detail_type = function(){
            return photo_detail_type;
        };
        
        this.set_photo_detail_type = function( value ){
            photo_detail_type = value;  
        };

        this.get_pdp = function(){
            return pdp;
        };
        
        this.set_pdp = function( value ){
            pdp = value
        };
        
        this.get_tab_name = function(){
            return tab_name;
        }
        
        this.set_tab_name = function( value ){
            tab_name = value;
        }        

        /*
         * Initialization
         */
        this.set_photo_detail_container( config.photo_detail_container );
        this.set_photo_list_container( config.photo_list_container );
        this.set_event_detail_container( config.event_detail_container );
        this.set_photo_detail_type( config.photo_detail_type );
        this.set_pdp( config.pdp );
 
        //unbind first
        $(".event_photo").die();
        $('.event_photo_detail').die();
        $('#back_to_photo_list').die();
 
        $(".event_photo").live( 'click', {"pdp": config.pdp }, this.switch_to_event_photo_container );
        $('.event_photo_detail').live( 'click', {"pdp": config.pdp }, this.switch_to_photo_detail_container );        
        $('#back_to_photo_list').live('click', {"pdp":config.pdp, "photo_detail_type": config.photo_detail_type}, this.back_to_photo_list );               
    };        
})();


EventPhotoDetailPage = gulu.event.detail_page.EventPhotoDetailPage;

EventPhotoDetailPage.prototype = {
    "switch_to_event_photo_container": function( event ){
        var object_id = $(this).attr('object_id');
        var url = '/events/ajax/get_event_detail/';
        var pdp = event.data.pdp;
        
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                object_id: object_id
            },
            success:function( response ){
                pdp.set_referer( pdp.get_photo_list_container() );
                pdp.hide_referer();
                pdp.hide_quick_invite();
                
                var event_detail_container = pdp.get_event_detail_container(); 
                
                $( event_detail_container ).empty();
                $( event_detail_container ).show();
                
                $( response ).appendTo( event_detail_container );
            },
            error: function( xhr ){
                //alertTxt( xhr.responseText );
                console.log(xhr.responseText);
            }
        });
        return false;        
    },
    
    "switch_to_photo_detail_container": function( event ){
        event.preventDefault();
        
        var url = "/photos/ajax/get_photo_detail/"
        var photo_id = $(this).attr("photo_id");
        var object_id = $(this).attr("object_id");
        var pdp = event.data.pdp;

        var modify_url = function(hash_key1, hash_key2, url_4_html5 ){
            
            var pathname = window.location.pathname;
            var settings = {
                'protocol': '__photo_detail__',
                'hash_key': url_4_html5,
                'url_4_html5': url_4_html5     
            };
            
            Gulu.modifyURL( settings );
        }

        
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                photo_id: photo_id,
                object_id: object_id,
                photo_detail_type: "event_photo"
            },
            success:function( response ){
                var event_detail_container = pdp.get_event_detail_container();                
                var photo_detail_container = pdp.get_photo_detail_container();
                var photo_list_container = pdp.get_photo_list_container();
                
                pdp.set_referer( event_detail_container );
                $( event_detail_container ).hide();
                $( photo_list_container ).hide();
                
                pdp.set_photo_detail_type("event_photo");
                
                photo_detail_container.empty()
                $( response ).appendTo( photo_detail_container );
                $( photo_detail_container ).show();

                modify_url(photo_id, object_id, $('#photo_big').attr('href'));
                
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
                alertTxt( xhr.responseText );
            }
        });
        return false;        
    },
    
    "back_to_photo_list": function( event ){
        var pdp = event.data.pdp;
        var photo_detail_type = event.data.photo_detail_type;
        var photo_list_container = pdp.get_photo_list_container();
        var event_detail_container = pdp.get_event_detail_container();
                
        pdp.set_referer( photo_list_container );
        pdp.show_quick_invite();
        pdp.set_photo_detail_type("event_photo");
        $( event_detail_container ).hide();
        
        pdp.set_photo_detail_type( photo_detail_type );
        $( photo_list_container ).show();
        
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
        
        return false;
    }
};    


