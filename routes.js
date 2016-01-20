/*
 * app.js
 * 
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global */

  //---------------- BEGIN MODULE SCOPE VARIABLES --------------

  'use strict';
  var 
    loadSchema, configRoutes,
    mongoClient   = require( 'mongodb' ).MongoClient,
    assert        = require( 'assert' ),
    fsHandle      = require( 'fs' ),
    db            = require( './db/db.js' ),
    makeMongoId   = require( 'mongodb' ).ObjectID,
    objTypeMap    = { 'user' : {} };
  
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //----------------- BEGIN UTILITY METHODS --------------------
  loadSchema = function( schema_name, schema_path ) {
    fsHandle.readFile( schema_path, 'utf8',  function ( err, data ){
      objTypeMap[ schema_name ] = JSON.parse( data );
    });
  };
  //----------------- END UTILITY METHODS ----------------------

  //---------------- BEGIN PUBLIC METHODS ----------------------
  configRoutes = function ( app, server ) {
  
  app.get( '/', function ( request, response ) {
   response.redirect( '/spa.html' );
  });

  app.all( '/api/:obj_type/*?', function ( request, response, next ) {
    response.contentType( 'json' );
    if ( objTypeMap[ request.params.obj_type ] ) {
      next();
    }
    else {
      response.send({ error_msg : request.params.obj_type
        + ' is not a valid object type'
      });
    }
  });

  app.get( '/api/:obj_type/list', function ( request, response ) {
    db.get().collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        collection.find().toArray(
          function ( inner_error, map_list ) {
            response.send( map_list );
          }
        );
      }
    );
  });

  app.post( '/api/:obj_type/create', function (request,response ) {
    db.get.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        var
          obj_map     = request.body;

          collection.insert(
            obj_map,
            function ( inner_error, result_map ) {
              response.send( result_map );
            }
          );
      });
  });

  app.get( '/api/:obj_type/read/:id', function (request,response ) {
    var find_map = { _id : makeMongoId( request.params.id ) };
    db.get.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        collection.findOne(
          find_map,
          function ( inner_error, result_map ) {
            response.send( result_map );
          }
        );
      }
    );
  });

  app.put( '/api/:obj_type/update/:id', function ( request,response ) {
    var
      find_map  = { _id : makeMongoId( request.params.id ) },
      obj_map   = request.body;

    db.get.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        var
          sort_order  = [],
          options_map = {
            new : true, upsert : false
          };
        collection.findAndModify(
          find_map,
          sort_order,
          obj_map,
          options_map,
          function ( inner_error, updated_map ) {
            response.send( updated_map );
          }
        );
      }
    );
  });

  app.delete( '/api/:obj_type/delete/:id', function ( request,response ) {
    var find_map = { _id : makeMongoId( request.params.id ) };
    db.get.collection(
      request.params.obj_type,
      function ( outer_error, collection ) {
        var options_map = { single : true };

        collection.remove(
          find_map,
          options_map,
          function ( inner_error, delete_count ) {
            response.send({ delete_count : delete_count });
          }
        );
      }
    );
  });

  };
  module.exports = { configRoutes : configRoutes };
  //---------------- END PUBLIC METHODS ------------------------
  //---------------- BEGIN MODULE INITILIZATION ----------------
  db.connect( 'mongodb://localhost/spa' , function( err ) {
      assert.equal( null, err );
        console.log( 'Connected correctly to server' );
  });

  // load schemas into memory (objTypeMap)
  (function () {
    var schema_name, schema_path;
    for ( schema_name in objTypeMap ) {
      if ( objTypeMap.hasOwnProperty( schema_name ) ) {
        schema_path = __dirname + '/' + schema_name + '.json';
        loadSchema( schema_name, schema_path );
      }
    }
  }());
  //---------------- END MODULE INITILIZATION ------------------
