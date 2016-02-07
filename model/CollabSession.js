'use strict';

var DocumentSession = require('./DocumentSession');
var WebSocket = require('../util/WebSocket');
var forEach = require('lodash/forEach');

/**
  Session that supports collaboration.

  Keeps track of local changes
*/
function CollabSession(doc, options) {
  CollabSession.super.call(this, doc, options);

  // TODO: The CollabSession or the doc needs to be aware of a doc id
  // that corresponds to the doc on the server. For now we just
  // store it on the document instance.
  this.doc.id = 'doc-15';
  // TODO: Also we need to somehow store a version number (local version)
  this.doc.version = 1;

  this.messageQueue = options.messageQueue;
  this.pendingChanges = [];
  this.ws = new WebSocket(this.messageQueue);

  this.ws.onopen = this._onConnected.bind(this);
  this.ws.onmessage = this._onMessage.bind(this);

  this.doc.connect(this, {
    'document:changed': this._onDocumentChange
  });
}

CollabSession.Prototype = function() {

  this._onDocumentChange = function(change, info) {
    console.log('doc changed', change, info);
    // this.pendingChanges.push(change);
  };

  /*
    As soon as we are connected we attempt to open a document
  */
  this._onConnected = function() {
    console.log(this.ws.clientId, ': Opened connection. Attempting to open a doc session on the hub.');
    this.ws.send(['open', this.doc.id, this.doc.version]);
  };

  /*
    Handling of remote messages. 

    Message comes in in the following format:

    ['open', 'doc13']

    We turn this into a method call internally:

    this.open(ws, 'doc13')

    The first argument is always the websocket so we can respond to messages
    after some operations have been performed.
  */
  this._onMessage = function(data) {
    var method = data[0];
    var args = data.splice(1);

    // Call handler
    this[method].apply(this, args);
  };

  /*
    Apply a set of changes to the document
  */
  this._applyChanges = function(changes) {
    forEach(changes, function(change) {
      this.doc._apply(change);
    }.bind(this));
  };

  /*
    Server has opened the document. The collab session is live from
    now on.
  */
  this.openCompleted = function(serverVersion, changes) {
    if (this.doc.version !== serverVersion) {
      // There have been changes on the server since the doc was opened
      // the last time
      this._applyChanges(changes);
      this.doc.version = serverVersion;
    }
    console.log(this.ws.clientId, ': Open complete. Listening for remote changes ...');
  };
};

DocumentSession.extend(CollabSession);

module.exports = CollabSession;