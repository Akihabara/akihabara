/**
 * AkihabaraHelpersers module provides some Javascript-specific functions, such
 * randomizing functions, string/array handlers and so on.
 * @namespace AkihabaraHelpersers
 */
var AkihabaraHelpers = {
	/**
	* Searches an object in an array filtering for one of their properties.
	* @param {Array} a The array.
	* @param {String} field The searched field.
	* @param {String} value The searched value.
	* @returns The found object, otherwise null.
	*/
	searchObject: function (a, field, value) {
		if (!a) {
			return null;
		} else {
			for (var i = 0; i < a.length; a++) {
				if (a[i][field] === value) { return a[i]; }
			}
		}
		return null;
	},

	/**
	* Generates numbers from st to ed, along with a skip value.
	* @param {Integer} st Starting number.
	* @param {Integer} ed Ending number.
	* @param {Integer} skip Number to increment by.
	* @returns An array containing the set of numbers from st to ed, incrementing by skip.
	*/
	seq: function (st, ed, skip) {
		var ret = [];
		for (var i = st; i < ed; i += (skip == null ? 1 : skip)) { ret.push(i); }
		return ret;
	},

	/**
	* Multiplies two numbers together, returning the result, unless the first parameter is less than 2, in which case it returns 1.
	* @param {Float} v First value.
	* @param {Float} mul Second value.
	* @returns An integer, v*mul, unless v < 2 in which case it returns 1.
	*/
	multiplier: function (v, mul) { // Handle a multiplier like counter. that means, 0=1 / 1=1 / 2=2*mul etc...
		return (!v || (v < 2) ? 1 : v * (!mul ? 1 : mul));
	},

	/**
	* Prepends a string with repeated instances of another string until it the result is greater than or equal to a desired length.
	* @param {String} str The string you wish to modify.
	* @param {Integer} len The desired length of your resultant string.
	* @param {String} pad The string you wish to prepend to str.
	* @returns A string whose length is no greater than len + pad.length, with pad prepending str repeatedly.
	*/
	prepad: function (str, len, pad) {
		str += "";
		while (str.length < len) {
			str = pad + str;
		}
		return str;
	},

	/**
	* Postpends a string with repeated instances of another string until it the result is greater than or equal to a desired length.
	* @param {String} str The string you wish to modify.
	* @param {Integer} len The desired length of your resultant string.
	* @param {String} pad The string you wish to postpend to str.
	* @returns A string whose length is no greater than len + pad.length, with pad postpending str repeatedly.
	*/
	postpad: function (str, len, pad) {
		str += "";
		while (str.length < len) {
			str += pad;
		}
		return str;
	},

	/**
	* Generates uniformly distributed random integers between min and min + range, non-inclusive. So AkihabaraHelpersers.random(0, 2) will only return 0 and 1, etc.
	* @param {Integer} min The minimum random value to be returned by the function.
	* @param {Integer} range The number of different values returned by the function.
	* @returns An integer between min (includive) and min + range (noninclusive).
	*/
	random: function (min, range) {
		return min + Math.floor(Math.random() * range);
	},

	/**
	* Given an incrementing value each step, this will return a value increasing from 0 until max/2,
	* at which point it will decrement to 0, then go back up to max/2, in an endless cycle.
	* @param {Integer} counter A counter.
	* @param {Integer} max This determines the period of the function -- assuming counter is incrementing by one, a complete back-and-forth will take 'max' steps.
	* @returns An integer.
	*/
	upAndDown: function (counter, max) {
		if ((counter % max) > (max / 2)) {
			return max - (counter % max);
		} else {
			return (counter % max);
		}
	},

	/**
	* Limits a number to a certain range. If the number is below the minimum, the minimum is returned. If the number is above the maximum, the maximum is returned.
	* @param {Float} v A value.
	* @param {Float} min The minimum limit.
	* @param {Float} max The maximum limit.
	* @returns A value equal to v if min < v < max. Returns min if v < min, max if v > max.
	*/
	limit: function (v, min, max) {
		if (v < min) {
			return min;
		} else {
			if (v > max) {
				return max;
			} else {
				return v;
			}
		}
	},

	/**
	* Subtracts or adds 1 to a value, always converging to zero. For example, passing -3 yields -2, 5 yields 4, etc. Works best with integers.
	* @param {Integer} v A value.
	* @returns A value that is one closer to 0 on the number line than v.
	*/
	goToZero: function (v) { return (v ? v - (v / Math.abs(v)) : 0); },

	/**
	* Returns the Nth element in an array. If the array is shorter than N, it returns the last element of the array.
	* @param {Array} a An array.
	* @param {Integer} id An index to the array.
	* @returns If id > a.length, it returns a[a.length-1]. Otherwise returns a[id].
	*/
	getArrayCapped: function (a, id) {
		if (id >= a.length) {
			return a[a.length - 1];
		} else {
			return a[id];
		}
	},

	/**
	* Returns the element of a sorted array that have the highest value of one of the properties.
	* @param {Array} a An array.
	* @param {Integer} value The target value.
	* @param {String} field The property used to filter the array.
	* @returns The object with the highest target value, otherwise the first element of the array.
	*/
	getArrayIndexed: function (a, value, field) {
		if (a[0][field] == null) { return a[0]; }
		var i = 0;
		while ((value > a[i][field]) && (i !== a.length - 1)) { i++; }
		return a[i];
	}
};
