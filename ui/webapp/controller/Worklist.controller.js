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
							randomObject[Object.keys(element)[0]] = oData.desciption;
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
		}

	});
});