/** @namespace Akihabara */
var Akihabara = {
	// Akihabara framework version
	VERSION: "2.0.0",

	/**
	* Extends form a module using custom data. This function merges data to the model, and if data and model share parameters, data's values remain intact.
	* @param {Object} model An object containing a set of parameters, a.k.a the source.
	* @param {Object} data An object containing a set of parameters, to merge with the source module.
	* @returns A merged model where the values of 'data' remain untouched: only new parameters and values from 'model' make it in.
	*
	* @example
	* AkihabaraTopview = {a: 1, b: 2, c: "three"};
	* withNewFunctions = {c: 3, d: "four"};
	*
	* newTopview = Akihabara.extendsFrom(AkihabaraTopview, withNewFunctions);
	* newTopview; // => {a: 1, b: 2, c: 3, d: "four"};
	*/
	extendsFrom: function (model, data) {
		if (data == null) { data = {}; }
		if (model != null) {
			for (var i in model) {
				if (data[i] == null) { data[i] = model[i]; }
			}
		}
		return data;
	}
};
