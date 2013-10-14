var nextTick = function (next, buffer) {
	buffer = []
	function enqueue(fn) {
		return buffer.push(fn) === 1
	}
	function execute() {
		var i = 0, b = buffer, l = b.length
		buffer = []
		while (i < l) {
			b[i++]()
		}
	}
	if (typeof setImmediate === 'function') { // IE10+, Node > 0.10
		next = function (fn) {
			enqueue(fn) && setImmediate(execute)
		}
	} else if (typeof process === 'object' && process.nextTick) { // Node < 0.10
		next = function (fn) {
			enqueue(fn) && process.nextTick(execute)
		}
	} else if (global.postMessage) { // Modern browsers
		var message = '__subsequent',
		    onMessage = function (e) {
		    	if (e.data === message) {
		    		e.stopPropagation && e.stopPropagation()
		    		execute()
		    	}
		    }

		if (global.addEventListener) {
			global.addEventListener('message', onMessage, true)
		} else {
			global.attachEvent('onmessage', onMessage)
		}
		next = function (fn) {
			enqueue(fn) && global.postMessage(message, '*')
		}
	} else { // Old browsers
		next = function (fn) {
			enqueue(fn) && setTimeout(execute, 0)
		}
	}
	return next
}()
