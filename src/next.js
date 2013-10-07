var nextTick = function (next) {
	if (typeof setImmediate === 'function') { // IE10+, Node > 0.10
		next = function (fn) {
			setImmediate(fn)
		}
	} else if (typeof process === 'object' && process.nextTick) { // Node < 0.10
		next = function (fn) {
			process.nextTick(fn)
		}
	} else if (global.postMessage) { // Modern browsers
		var PRE = '__subsequent',
		    RE = new RegExp(PRE, 'i'),
		    calls = [],
		    onMessage = function (e) {
		    	if (RE.test(e.data)) {
		    		e.stopPropagation && e.stopPropagation()
		    		calls[e.data]()
		    		delete calls[e.data]
		    	}
		    }

		if (global.addEventListener) {
			global.addEventListener('message', onMessage, true)
		} else {
			global.attachEvent('onmessage', onMessage)
		}

		next = function (fn) {
			var handle = PRE + Math.random()
			calls[handle] = fn
			global.postMessage(handle, '*')
		}
	} else { // Old browsers
		next = function (fn) {
			setTimeout(fn, 0)
		}
	}
	return next
}()
