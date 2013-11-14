/*
 * namespace
 */
var idv = {};
idv.redbug = {};
idv.redbug.js= {};


/*
 * Class - constructor
 */
  
idv.redbug.js.MyClass = function(){
    this.name = "redbug";
    this.sex = "M";
};

var MyClass = idv.redbug.js.MyClass;

/*
 * Static class method
 */
MyClass.showAuthor = function(){
    console.log( "this is static class method showAuthor()" );
};

/*
 * Class - method definition
 */
MyClass.prototype ={
    "getName": function(){
        return this.name;  
    },
    "getSex": function(){
        return this.sex; 
    }
};


/*
 * Object instantiation
 */
var myObj = new MyClass();

/*
 * dynamic function
 */
myObj.sayHi = function(){
  return "hi, I'm " + this.name;            
};




/*
 * iterate all properties and functions of myObj
 */
for( var p in myObj ){
    console.log( p + ": " + myObj[p] );
}

/*
 * testing instance method
 */
console.log( myObj.getName() );
console.log( myObj.getSex() );
console.log( myObj.sayHi() );

/*
 * testing static class method
 */
MyClass.showAuthor();