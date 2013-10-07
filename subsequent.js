(function(global) {
  "use strict";
  var nextTick = function(next) {
    if (typeof setImmediate === "function") {
      next = function(fn) {
        setImmediate(fn);
      };
    } else if (typeof process === "object" && process.nextTick) {
      next = function(fn) {
        process.nextTick(fn);
      };
    } else if (global.postMessage) {
      var PRE = "__subsequent", RE = new RegExp(PRE, "i"), calls = [], onMessage = function(e) {
        if (RE.test(e.data)) {
          e.stopPropagation && e.stopPropagation();
          calls[e.data]();
          delete calls[e.data];
        }
      };
      if (global.addEventListener) {
        global.addEventListener("message", onMessage, true);
      } else {
        global.attachEvent("onmessage", onMessage);
      }
      next = function(fn) {
        var handle = PRE + Math.random();
        calls[handle] = fn;
        global.postMessage(handle, "*");
      };
    } else {
      next = function(fn) {
        setTimeout(fn, 0);
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