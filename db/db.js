var 
  MongoClient = require('mongodb').MongoClient,
  connect, state, get, close;

state = {
  db: null,
};

connect = function( url, done ) {
  if ( state.db ) { return done(); }

  MongoClient.connect( url, function( err, db ) {
    if ( err ) { return done( err ); }
    state.db = db;
    done();
  });
};

get = function() {
  return state.db;
};

close = function( done ) {
  if ( state.db ) {
    state.db.close( function( err, result ) {
      state.db = null;
      state.mode = null;
      done( err );
    });
  }
};

module.exports = {
  connect : connect,
  get     : get,
  close   : close
};
