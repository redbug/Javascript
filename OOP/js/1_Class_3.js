Function.prototype.method = function( name, fn ){
    this.prototype[name] = fn;
    return this; // allows the calls to be chained
};

var Anim = function(){
    
};

Anim.method('start', function(){
    
});

Anim.method('end', function(){
    
});



/* chaining */
Anim.method('start', function(){}).method('stop', function(){});
