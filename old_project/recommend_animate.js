/**
 * Gulu recommend js
 * 
 * 
 * @author Redbug <dennis.chao@geniecapital.com>
 */
//-- Namespace --//
RECOMMEND = {};

//-- static variable --//
RECOMMEND.isDragging = false;
RECOMMEND.currentTarget;
RECOMMEND.currentTarget_id = 0;
RECOMMEND.currentTarget_category= "";

$(function(){
    
    RECOMMEND.Init();
    
    //-- restaurant tab --//
    $('.restaurant_tab').click(function(){
        $(this).addClass('top');
        $('.dish_tab').removeClass('top');
        
        $('#dish_list').addClass('display_none');
        $('#restaurant_list').removeClass('display_none');
    });
    
    //-- dish tab --//
    $('.dish_tab').click(function(){
        $(this).addClass('top');
        $('.restaurant_tab').removeClass('top');
        
        $('#restaurant_list').addClass('display_none');
        $('#dish_list').removeClass('display_none');
    });    

    //-- cross --//
    $('.cross').click(function(){
        
        $.ajax({
            url: "/recommend/ajax/delete/",
            type: 'POST',
            data: ({
                id: RECOMMEND.currentTarget_id,
                type: RECOMMEND.currentTarget_category
            }),
            success: function(response){
                var removeTarget;
                var list;
                
                removeTarget = $('#'+ RECOMMEND.currentTarget_id );
                list = removeTarget.parent()
                removeTarget.remove();
                
                list = list.children('li');
                
                var len = list.length;
                for(var i=0; i<len; i++){
                    list[i].getElementsByTagName('span')[0].textContent = (i + 1);
                }
                console.log("<p>Correct:<br/>" + response + "</p>");
//              $('div.#debug_panel').append("<p>Correct:<br/>" + response + "</p>");
            },
            error: function(jqxhr){
                console.log("<p>Error:<br/>" + jqxhr.responseText + "</p>");
//              $('div.#debug_panel').append("<p>Error:<br/>" + jqxhr.responseText + "</p>");
            }
        });
        
    })
    
    
    var timer;
    
    //-- mouse over effect --/
    $('.list li').hover(function(){
        
        var target = $(this);
        timer = setTimeout(function(){ RECOMMEND.mouseOver( target ); }, 300);
        
    },function(){

        clearTimeout(timer);

        if(!RECOMMEND.isDragging){
            var target = $(this);        
            RECOMMEND.mouseOut( target );    
        }

    });
});


RECOMMEND.Init = function() {
	//-- hide restaurant tab --//	
	$('.user_recommend .list li .pic img.hover').addClass('display_none');
	
	var score_top_dish = $('#dish_score_1').text();
	var score_top_restaurant = $('#restaurant_score_1').text();

    var draggingHandler = {
        cursor: 'move',    
        
        activate: function(){
            RECOMMEND.isDragging = true;  
        },
        
        deactivate: function(){
            RECOMMEND.isDragging = false;  
        },
        
        update: function(event, ui){
            var allList = ui.item.parent();
            var categoryName = allList.attr("id").split('_')[0];
            var idArray = allList.sortable('toArray');
            var idList = "";
            var scoreList = "";
            var str="";
            var len = idArray.length;            
            
            var score;
            if( categoryName == "dish"){
                score = score_top_dish;
            }
            else{
                score = score_top_restaurant;
            }
            
            for (var i=0; i<len; i++){
                str = idArray[i];
                $('#'+ str + ' span.rank').text( i+1 );
                
                idList += idArray[i];
                scoreList += score--;
                
                if( i < len-1 ){
                    idList += ',';
                    scoreList += ',';
                }
            }
            
            //-- "saving" text fadeIn effect --//
            ui.item.find('.saving').fadeIn('slow');     //fadeIn effect

            //            
            $.ajax({
                url: "/recommend/ajax/update/",
                
                type: 'POST',
                
                data: ({
                    type: categoryName,
                    id: idList,
                    score: scoreList
                }),
                
                success: function(response){
                    
                    //-- "saving" text fadeOut effect --//
                    ui.item.find('.saving').fadeOut('slow');
                    
                    console.log("<p>Correct:<br/>" + response + "</p>");
//                    $('div.#debug_panel').append("<p>Correct:<br/>" + response + "</p>");
                },
                
                error: function(xhr){
                    console.log("<p>Error:<br/>" + xhr.responseText + "</p>");
//                    $('div.#debug_panel').append("<p>Error:<br/>" + jqxhr.responseText + "</p>");
                }
            });
                
        }
    };
    
    //-- resort the ranking of dishes --//    
    $('#dish_ranking').sortable(draggingHandler);
    $('#restaurant_ranking').sortable(draggingHandler);
}

RECOMMEND.mouseOver = function( target ){
        var delaySecs = 0;
        var animatePeriod = 100;
        RECOMMEND.currentTarget = target;
        RECOMMEND.currentTarget_id = target.attr("id");
        RECOMMEND.currentTarget_category = target.find('.rank').attr("id").split('_')[0];
        
        // $(this).addClass('hover');
        target.delay(delaySecs).animate({
            height: '60px',
            paddingTop: '5px',
            border: '2px #4ECEFB solid',
            boxShadow: '0 2px 3px 0px #aaa'
        }, animatePeriod);
        
        target.find('.rank').delay(delaySecs).animate({
            backgroundColor: '#fff',
            color: '#4ECEFB',
            fontSize: '26px'
        }, animatePeriod);
        
        var timeout = setTimeout(function(){
            target.find('img.origin').addClass('display_none');
            target.find('img.hover').removeClass('display_none');
            
            //info
            target.find('.info').animate({
                paddingLeft: '20px'
            }, 0);
            
            //cross
            target.addClass('hover');
            
        }, animatePeriod - 10)        

}

RECOMMEND.mouseOut = function( target ){
        var delaySecs = 0;
        var animatePeriod = 300;
            
        target.animate({
            height: '50px',
            paddingTop:'0px',
            border: '1px #A1A1A1 solid',
            boxShadow: 'none'
        }, animatePeriod);

        target.find('.rank').animate({
            backgroundColor: '#e6e6e6',
            color: '#000000',
            fontSize: '20px'
        }, animatePeriod);

        target.find('.info').animate({
            paddingLeft: '5px'
        }, animatePeriod);
        
        target.find('img.origin').removeClass('display_none');
        target.find('img.hover').addClass('display_none');
        
        //cross
        target.removeClass('hover');
}

