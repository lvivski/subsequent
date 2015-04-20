(function(global) {
  "use strict";
  var nextTick = function(nextTick, buffer, length, tick) {
    buffer = new Array(1e4);
    length = 0;
    function enqueue(fn) {
      if (length === buffer.length) {
        length = buffer.push(fn);
      } else {
        buffer[length++] = fn;
      }
      if (!tick) {
        return tick = true;
      }
    }
    function execute() {
      var i = 0;
      while (i < length) {
        buffer[i]();
        buffer[i++] = undefined;
      }
      length = 0;
      tick = false;
    }
    if (typeof setImmediate === "function") {
      nextTick = function(fn) {
        enqueue(fn) && setImmediate(execute);
      };
    } else if (typeof process === "object" && process.nextTick) {
      nextTick = function(fn) {
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
      nextTick = function(fn) {
        enqueue(fn) && global.postMessage(message, "*");
      };
    } else {
      nextTick = function(fn) {
        enqueue(fn) && setTimeout(execute, 0);
      };
    }
    return nextTick;
  }();
  if (typeof define === "function" && define.amd) {
    define(function() {
      return nextTick;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = nextTick;
  } else {
    global.subsequent = nextTick;
  }
})(this);