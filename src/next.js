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

	// IE10+, Node > 0.10
	if (typeof setImmediate === 'function') {
		return function (fn) {
			enqueue(fn) && setImmediate(execute)
		}
	}

	// Node < 0.10
	if (typeof process === 'object' && process.nextTick) {
		return function (fn) {
			enqueue(fn) && process.nextTick(execute)
		}
	}

	// Modern browsers
	var MutationObserver = root.MutationObserver || root.WebKitMutationObserver
	if (typeof MutationObserver !== 'undefined') {
		var val = 1,
		    node = document.createTextNode('')

		new MutationObserver(execute).observe(node, { characterData : true })

		return function(fn) {
			enqueue(fn) && (node.data = (val *= -1))
		}
	}

	if (root.postMessage) {
		var isPostMessageAsync = true;
		if (root.attachEvent) {
			var checkAsync = function() {
				isPostMessageAsync = false
			}
			root.attachEvent('onmessage', checkAsync)
			root.postMessage('__check', '*')
			root.detachEvent('onmessage', checkAsync)
		}

		if (isPostMessageAsync) {
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
			return function (fn) {
				enqueue(fn) && root.postMessage(message, '*')
			}
		}
	}

	// IE6-8
	var document = root.document
	if ('onreadystatechange' in document.createElement('script')) {
		var createScript = function () {
			var script = document.createElement('script')
			script.onreadystatechange = function () {
				script.parentNode.removeChild(script)
				script = script.onreadystatechange = null
				execute()
			}
			(document.documentElement || document.body).appendChild(script)
		}

		return function (fn) {
			enqueue(fn) && createScript()
		}
	}

	// Fallback
	return function (fn) {
		enqueue(fn) && setTimeout(execute, 0)
	}
}()
