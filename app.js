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
   http     = require( 'http'),
   express  = require( 'express' ),
   logger   = require( 'morgan'),
   bodyParser = require( 'body-parser' ),
   methodOverride = require( 'method-override' ),
   errorHandler   = require( 'errorhandler' ),
   routes   = require( './routes' ),

   app      = express(),

   server   = http.createServer( app );

  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN SERVER CONFIGURATION ------------------
  app.use( bodyParser.urlencoded( { extended : false } ) );
  app.use( bodyParser.json() );
  app.use( methodOverride() );
  app.use( express.static( __dirname + '/public' ) );
  
  if ( 'development' === app.settings.env ) {
    app.use( logger( 'combined' ) );
    app.use( errorHandler({
      dumpExceptions  : true,
      showStack       : true
    }) );
  }

  if ( 'production' === app.settings.env ) {
    app.use( errorHandler() );
  }
  
  routes.configRoutes( app, server );
  //-------------------- END SERVER CONFIGURATION -------------------

  //--------------------- BEGIN START SERVER --------------------
  server.listen( 3000 );
  console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
   );
  //---------------------- END START SERVER ---------------------

