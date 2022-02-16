//jshint esversion:6

//exporting the function, do not use the paranthesis as we want
//our app.js to determine when the function is called
exports.getDate = ()=> {

  const now = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month:'long'};

  return now.toLocaleDateString('en-US', options);

}

exports.getDay = ()=> {

  const now = new Date();
  const options = {weekday: 'long'};

  return now.toLocaleDateString('en-US', options);
}


// We are exporting functions using annonymous functions and binding them to variables
