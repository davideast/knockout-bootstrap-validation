/*
 * ko.boostrap-validation.js
 * @version: 0.9
 * @description: A simple knockout extender that will provide validation messages for user input.
 * 				 This extender is specifically tailored for Twitter Bootstrap (v3) validation states, but
 *				 it can be modified work with your own framework/implementation quite easily.
 * @author: David East - http://davidea.st/
 * @license: MIT
 */

// @Extender: bootstrapValidation
// @params:
//   - target (observable): The observable being extended
// 	 - options (obj): The user defined settings for validating the observable
// 		- successMessage (string): The message to display if the input is valid
// 		- errorMessage (string): The message to display if the input is invalid
// 		- successClass (string): The css class to apply in the event of a valid input
// 		- errorClass (string): The css class to apply in the event of an invalid input
// 		- regex (regex): The regular expression to validate against
// 		- required (bool): If false an invalid message will display in the case
// 						   of invalid input, but when no text is entered no success
// 						   message will be displayed. This will not affect the isValid
// 						   method on the ko.bootstrapValidatedViewModel.
ko.observable.fn.bootstrapValidation = function(options) {
	// the observable we are extending
	var target = this,
		// set the defaults
		defaults = {
			successMessage: 'Good!',
			errorMessage: 'Invalid!',
			successClass: 'has-success',
			errorClass: 'has-error',
			regex: /^\s*\S.*$/,
			required: true
		},
		// overwrite the defaults with the user defined settings
		settings = ko.utils.extend(defaults, options);

	// create the sub-observables that are responsible for the UI
	target.validationMessage = ko.observable('');
	target.validationClass = ko.observable('');
	// the hasError sub-observable is initally set to the required option because if it's
	// required we want an error off the bat, if not we don't want to count it as an error
	target.hasError = ko.observable(settings.required);

	// create a subscription on the observable to evaluate the value of the observable
	target.subscribe(function() {

		// the observable's value
		var value = target(),
			// does the value of the observable  match the regex?
			matchesPattern = settings.regex.test(value),
			// convenience variable, there is an error if the value does not match the pattern
			hasError = (!matchesPattern),
			// ternary, if there is an error use the errorMessage
			message = hasError ? settings.errorMessage : settings.successMessage,
			// ternary, if there is an error use the errorClass
			cssClass = hasError ? settings.errorClass : settings.successClass;


		// set sub-observable values depending on the required setting
		if (!settings.required && value.length === 0) {
			// if the observable is not required then don't display anything when there is no input
			target.validationMessage('');
			target.validationClass('');
		}
		else{
			// if the required setting is true the simply just set the sub-observables
			target.validationMessage(message);
			target.validationClass(cssClass);
		}

		// the observable will not have an error if the required setting is false
		target.hasError(settings.required ? hasError : false);
	});

	return target;
};

// @ViewModel: bootstrapValidatedViewModel
// @description: This view model takes in another view model as a parameter and 
//				 attaches an isValid computed on to the paramter view model, which
//				 will return true if any observables with the hasError sub-observable
//				 return false.
// @params: 
//	- viewModel: The view model to attach the isValid computed on to
ko.bootstrapValidatedViewModel = function(viewModel) {

	// Loop through the view model and find any properties that have the hasError
	// sub-observable. 
	viewModel.isValid = ko.computed(function() {
		var errorCount = 0;

		for (var key in viewModel) {
			// Incremement a counter if any hasError sub-observables return true. 
		   if (viewModel[key].hasOwnProperty('hasError')) {
		   		errorCount = viewModel[key].hasError() ? errorCount +=1 : errorCount;
		   };
		}

		// if the errorCount is zero then the view model is valid
		return errorCount === 0;
	}, viewModel);

	return viewModel;
};


// @BindingHandler: enableIfValid
// @description: This binding handler checks against the currenta context (the view model). It
//				 checks to see if all of the observables that are being extended by bootstrapValidation
//				 have any errors. If so, the element this binding is being applied to (usually a button) 
//				 will be disabled. If not, the element will be enabled.
ko.bindingHandlers.enableIfValid = {
    init: function(element, valueAccessor, allBindings, data) {
        var isValid = ko.computed({
            read: function() {

            	// Loop through the view model and find any properties that have the hasError
				// sub-observable. 
            	var errorCount = 0;

				for (var key in data) {
					// Incremement a counter if any hasError sub-observables return true. 
				   if (data[key].hasOwnProperty('hasError')) {
				   		errorCount = data[key].hasError() ? errorCount +=1 : errorCount;
				   };
				}

				return errorCount === 0;
            },
            disposeWhenNodeIsRemoved: element  //clean up     
        });
        
        //apply the actual enable binding against the element using this new computed
        ko.applyBindingsToNode(element, { enable: isValid });
    }
};
