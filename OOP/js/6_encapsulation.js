var Book = (function(){
    
    /*
     * Private Static Attributes
     * usage: only can be accessed by privileged methods.
     */
    var numOfBooks = 0;
    
    /*
     * Private Static Methods
     * usage: only can be accessed by privileged methods.
     */
    function _checkIsbn( isbn ){
        return true;
    }

    
    //Return the constructor
    return function( newIsbn, newTitle, newAuthor ){ //implements Publication
        
        /*
         * Private Attributes
         * only can be accessed by privileged methods.
         */
        var isbn, title, author;
        
        
        /*
         * Priviledged Methods.
         * usage: bookObj.getIsbn(); bookObj.setIsbn( "183893894"); ....
         * following "this" reference is point to the Book instance object.
         * So, every Book instance object has a copy of priviledged methods.
         */
         
        //accessors 
        this.getIsbn = function(){
          return isbn;  
        };
        
        //mutators
        this.setIsbn = function( newIsbn ){
          
          if( !_checkIsbn( newIsbn ) ){
              throw new Error("Book: Invalid ISBN.");
          }
          
          isbn = newIsbn;  
        };
        
        this.getTitle = function(){
            return title;
        };
        
        this.setTitle = function( newTitle ){
            title = newTitle || "No title specified";
        };
        
        this.getAuthor = function(){
            return author;
        };
        
        this.setAuthor = function( newAuthor ){
            author = newAuthor || "No author specified";
        };
        
        //Constructor code.
        numOfBooks++; //Keep track of how many books have been instantiated with the private static attribute.
        
        if( numOfBooks > 50 ){
            throw new Error("Book: Only 50 instances of Book can be created.");
        }
        
        /*
         * Private Attribute Initialization
         */
        this.setIsbn( newIsbn );
        this.setTitle( newTitle );
        this.setAuthor( newAuthor );
    }
})();


/*
 * Public Static Methods.
 * usage: Book.convertToTitleCase( "GG" );
 */
Book.convertToTitleCase = function( inputString ){
    
};


/*
 * Public Non-Privileged Methods
 */
Book.prototype = {
    display: function(){
        
    }
};
