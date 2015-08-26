if (typeof define === 'function' && define.amd) {
	define(function() {
		return nextTick
	})
} else if (typeof module === 'object' && module.exports) {
	module.exports = nextTick
} else {
	root.subsequent = nextTick
}
