var nextTick = function (nextTick, buffer, length, tick) {
	buffer = new Array(10000)
	length = 0
	function enqueue(fn) {
		if (length === buffer.length) {
			length = buffer.push(fn)
		} else {
			buffer[length++] = fn
		}
		if (!tick) {
			return tick = true
		}
	}
	function execute() {
		var i = 0
		while (i < length) {
			buffer[i]()
			buffer[i++] = undefined
		}
		length = 0
		tick = false
	}
	if (typeof setImmediate === 'function') { // IE10+, Node > 0.10
		nextTick = function (fn) {
			enqueue(fn) && setImmediate(execute)
		}
	} else if (typeof process === 'object' && process.nextTick) { // Node < 0.10
		nextTick = function (fn) {
			enqueue(fn) && process.nextTick(execute)
		}
	} else if (root.postMessage) { // Modern browsers
		var message = '__subsequent',
		    onMessage = function (e) {
		    	if (e.data === message) {
		    		e.stopPropagation && e.stopPropagation()
		    		execute()
		    	}
		    }

		if (root.addEventListener) {
			root.addEventListener('message', onMessage, true)
		} else {
			root.attachEvent('onmessage', onMessage)
		}
		nextTick = function (fn) {
			enqueue(fn) && root.postMessage(message, '*')
		}
	} else { // Old browsers
		nextTick = function (fn) {
			enqueue(fn) && setTimeout(execute, 0)
		}
	}
	return nextTick
}()
