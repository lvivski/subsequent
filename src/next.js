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
		return function (fn) {
			enqueue(fn) && setImmediate(execute)
		}
	}
	if (typeof process === 'object' && process.nextTick) { // Node < 0.10
		return function (fn) {
			enqueue(fn) && process.nextTick(execute)
		}
	}
	var MutationObserver = root.MutationObserver || root.WebKitMutationObserver; // modern browsers
	if (MutationObserver) {
		var val = 1,
			node = document.createTextNode('');

		new MutationObserver(execute).observe(node, { characterData : true });

		return function(fn) {
			enqueue(fn) && (node.data = (val *= -1));
		};
	}
	if (root.postMessage) { // Modern browsers
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

	return function (fn) {
		enqueue(fn) && setTimeout(execute, 0)
	}
}()
