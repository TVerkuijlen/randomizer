/*global location history */
sap.ui.define([
	"randomizer/ui/ui/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"randomizer/ui/ui/model/formatter"
], function (BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("randomizer.ui.ui.controller.Worklist", {

		formatter: formatter,
		aEntities: [],

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel;

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href])
			});
			this.setModel(oViewModel, "worklistView");

			var oModel = this.getOwnerComponent().getModel();
			this.aEntities = ["Sectors", "EmergingTechnologies", "Processes", "SAPProducts"];
			oModel.metadataLoaded().then(this.readNumberOfElements());
		},

		readNumberOfElements: function () {
			var aRandomMax = [],
				self = this,
				processed = 0;

			this.aEntities.forEach(function (element) {
				self.getOwnerComponent().getModel().read("/" + element + "/$count", {
					success: function (oData, response) {
						var obj = {};
						obj[element] = oData;
						if (oData > 0) {
							aRandomMax.push(obj);
						}
						processed++;
						if (processed === self.aEntities.length) {
							self.createRandomModel(aRandomMax);
						}
					},
					error: function (oError) {
						sap.m.MessageToast.show(JSON.stringify(oError));
					}
				});
			});
		},

		createRandomModel: function (randomMaxModel) {
			var self = this,
				processed = 0,
				randomObject = {};
			randomMaxModel.forEach(function (element) {
				if (Object.values(element)[0] > 0) {
					var rn = Math.floor((Math.random() * Object.values(element)[0]) + 1);
					self.getOwnerComponent().getModel().read("/" + Object.keys(element)[0] + "(" + rn + ")", {
						success: function (oData, response) {
							processed++;
							randomObject[Object.keys(element)[0]] = oData.description;
							if (processed === randomMaxModel.length) {
								var randomModel = new JSONModel(randomObject);
								self.getOwnerComponent().setModel(randomModel, "random");
							}
						},
						error: function (oError) {
							sap.m.MessageToast.show(JSON.stringify(oError));
						}
					});
				}
			});
		},

		onExit: function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		handlePopoverPress: function (oEvent) {
			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("randomizer.ui.ui.view.frag.InfoPopover", this);
				this.getView().addDependent(this._oPopover);
			}
			this._oPopover.openBy(oEvent.getSource());
		},

		onMicPress: function (oEvent) {
			var self = this,
				oMicButton = oEvent.getSource();
			oMicButton.setEnabled(false)
			if ('webkitSpeechRecognition' in window) {
				var speechRecognizer = new webkitSpeechRecognition();
				speechRecognizer.continuous = true;
				speechRecognizer.interimResults = false;
				speechRecognizer.lang = 'en-US';
				speechRecognizer.start();

				jQuery.sap.delayedCall(4000, this, function () { // this has to be implemented so as the control comes back after 5 seconds
					speechRecognizer.stop();
					oMicButton.setEnabled(true);
				});

				speechRecognizer.onresult = function (event) {
					var last = event.results.length - 1;
					var text = event.results[last][0].transcript;

					sap.m.MessageToast.show(text + ". Confidence: " + event.results[0][0].confidence);
					self._chechInput(text);
				};
				speechRecognizer.onerror = function (event) {
					oMicButton.setEnabled(true);
				};
			}
		},

		_chechInput: function (text) {
			if (text.includes("randomise")) {
				this.readNumberOfElements();
			}
		}

	});
});