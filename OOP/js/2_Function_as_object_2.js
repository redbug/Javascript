function Person( name, age ){
    this.name = name;
    this.age = age;
}

Person.prototype = {
    getName: function(){
        return this.name;
    },
    getAge: function(){
        return this.age;
    }
}

var alice = new Person( "Alice", 93);
var bill = new Person( "Bill", 20);


/*
 * In this example, the getGreeting method is added to the class after the two instances are created,
 * but these two instances still get the method, due to the way the prototype object works.
 */


/* Modify the class */
Person.prototype.getGreeting = function(){
    return "Hi " + this.getName() + "!"; 
};



/* Modify a specific instance */
alice.displayGreeting = function(){
    console.log(this.getGreeting());
}


/*
 * alice also gets the displayGreeting method, but no other instance does.
 */
 
