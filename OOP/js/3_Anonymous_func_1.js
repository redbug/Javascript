/* anonymous function, executed immediately */
(function(){
  var foo = 10;
  var bar = 2;
  console.log(foo * bar);  
})();


/* anonymous function with arguments */
(function(foo, bar){
    console.log(foo * bar );
})(10, 2);


/* anonymous function that returns a value */
var bar = (function(foo, bar){
    return foo * bar;
})(10, 2);


/* An anonymous function used as a closure */
var baz;

(function(){
    var foo = 10;
    var bar = 2;
    baz = function(){
      return foo * bar;  
    };
})();

console.log(baz());
