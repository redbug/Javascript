/*
 * Usage:
 * 
 * var Interface = idv.redbug.js.Interface;
 *  
 * var ICommand = new Interface( 'ICommand', ['execute', 'complete'] );
 * var IAgent = new Interface( 'IProxy', ['connect', 'init'] );
 * 
 * 
 * // GoogleAgent class implements ICommand and IAgent interfaces.
 * var GoogleAgent = function( api_key, security ){ //implements ICommand, IAgent
 *     ....
 * }
 * 
 * // implement the required methods of interfaces.
 * GoogleAgent.prototype ={
 *   "execute": function(){ ... },
 *   "complete": function(){ ... },
 *   "connect": function(){ ... },
 *   "init": function(){ ... },
 *   ...  
 * };
 * 
 * ...
 * 
 * 
 * var photo_agent = new GoogleAgent();
 * 
 * function search( photo_agent ){
 *     
 *     Interface.ensureImplements( photo_agent, ICommand, IAgent );
 *     
 *     // This function will throw an error if required method is not implemented,
 *     // halting execution of the function.
 *     // All code beneath this line will be executed only if the checks pass.
 *     
 *     ...
 *  
 * }
 * 
 */



//namespace
var idv = {};
idv.redbug = {};
idv.redbug.js= {};

//Constructor
idv.redbug.js.Interface = function( name, methods ){
    if( arguments.length != 2 ){
        throw new Error("Interface constructor called with" + arguments.length + "arguments, but expected exactly 2.");
    }
    
    this.name = name;
    this.methods = [];
    
    for( var i=0, len=methods.length; i < len; ++i ){
        if( typeof methods[i] != 'string' ){
            throw new Error("Interface constructor expects method names to be passed in as a string.");
        }
        this.methods.push( methods[i] );
    }
};



var Interface = idv.redbug.js.Interface;

/*
 * Static class method: ensureImplements()
 * Object: provides a strict check.
 * Usage: Interface.ensureImplements( checking_object, implemented_interface1, implemented_interface2, ...)
 */ 
Interface.ensureImplements = function( target ){
    if( arguments.length < 2 ){
        throw new Error(" Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
    }
    
    var _interface;
    var method; 
    for( var i=1, len= arguments.length; i < len; ++i ){
        
        _interface = arguments[ i ];
        
        if( _interface.constructor != Interface ){
            throw new Error("Function Interface.ensureImplements expect arguments two and above to be instances of Interface.");
        }
        
        for( var j=0, methodsLen= _interface.methods.length; j < methodsLen; ++j ){
            
            method = _interface.methods[ j ];
            
            if( !target[ method ] || typeof target[method] !== 'function' ){
                throw new Error("Function Interface.ensureImplements: target does not implemnt the " + _interface.name + " interface. Method " + method + " was not found.");
            }    
        } 
    }
};
