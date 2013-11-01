if (typeof define === 'function' && define.amd) {
	define(function() {
		return next
	})
} else if (typeof module === 'object' && module.exports) {
	module.exports = next
} else {
	global.subsequent = next
}
