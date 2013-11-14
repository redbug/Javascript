
//Function object has its own properties
function displayError( message ){
    displayError.numTimesExecuted++;
    console.log(message);
}

displayError.numTimesExecuted = 0;
displayError( displayError.numTimesExecuted );
displayError( displayError.numTimesExecuted );
displayError( displayError.numTimesExecuted );
displayError( displayError.numTimesExecuted );