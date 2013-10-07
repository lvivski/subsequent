if (typeof define === 'function' && define.amd) {
	define(nextTick)
} else if (typeof module === 'object' && module.exports) {
	module.exports = nextTick
} else {
	global.subsequent = global.nextTick = nextTick
}
