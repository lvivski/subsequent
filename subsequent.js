(function(global) {
  "use strict";
  var nextTick = function(next, callbacks) {
    callbacks = [];
    function enqueue(fn) {
      return callbacks.push(fn) === 1;
    }
    function execute() {
      var i = 0;
      while (i < callbacks.length) {
        callbacks[i++]();
      }
      callbacks.length = 0;
    }
    if (typeof setImmediate === "function") {
      next = function(fn) {
        enqueue(fn) && setImmediate(execute);
      };
    } else if (typeof process === "object" && process.nextTick) {
      next = function(fn) {
        enqueue(fn) && process.nextTick(execute);
      };
    } else if (global.postMessage) {
      var message = "__subsequent", onMessage = function(e) {
        if (e.data === message) {
          e.stopPropagation && e.stopPropagation();
          execute();
        }
      };
      if (global.addEventListener) {
        global.addEventListener("message", onMessage, true);
      } else {
        global.attachEvent("onmessage", onMessage);
      }
      next = function(fn) {
        enqueue(fn) && global.postMessage(message, "*");
      };
    } else {
      next = function(fn) {
        enqueue(fn) && setTimeout(execute, 0);
      };
    }
    return next;
  }();
  if (typeof define === "function" && define.amd) {
    define(nextTick);
  } else if (typeof module === "object" && module.exports) {
    module.exports = nextTick;
  } else {
    global.subsequent = global.nextTick = nextTick;
  }
})(this);