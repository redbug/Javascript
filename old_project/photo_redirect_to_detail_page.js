/*
 * @author: redbug <http://redbug0314.blogspot.com/p/info.html>
 * This file is obsolete since 2011.9.1 
 */
var gulu = gulu||{};
gulu.photo = gulu.photo||{};
gulu.photo.detail_page = gulu.photo.detail_page||{};


/*
 * Class - constructor
 */
  
gulu.photo.detail_page.PhotoRedirect = (function(){
    
    //constructor
    return function( content_type, object_id ){
        this.content_type = content_type;
        this.object_id = object_id;
        this.redirect_url = null;
        this.photo_id = null;
    };
    
 })();

 PhotoRedirect = gulu.photo.detail_page.PhotoRedirect;
 
 PhotoRedirect.prototype = {
     "parse_hash": function(){
        var url = window.location.href;
        var protocol = '__photo__';
        var index = url.indexOf( protocol );
        var url_hash;
        
        if( index == -1){
            return false;
        }
        url_hash = url.substring(index);
        url_hash = url_hash.replace('__photo__', "");
        
        var ids = url_hash.split('/');
        var hash_photo_id = ids[0];
        var hash_event_id = ids[1];
        
        if( hash_photo_id ){
            var redirect_url = "/" + this.content_type + "/" + this.object_id + "/";

            /*
             * review detail
             */            
            if( url.match('review') ){
                redirect_url += "reviews/detail/" + hash_photo_id + "/";   
            }
            /*
             * photo detail
             */
            else{
                redirect_url += "photos/detail/" + hash_photo_id + "/";
                
                /*
                 * event photo
                 */
                if( hash_event_id){
                   redirect_url += hash_event_id + "/";
                }
            }

            this.redirect_url = redirect_url;
            this.photo_id = hash_photo_id;
        }                
        
        return this.redirect_url;            
     }
 }
