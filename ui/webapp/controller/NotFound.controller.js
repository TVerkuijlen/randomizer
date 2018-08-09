sap.ui.define([
		"randomizer/ui/ui/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("randomizer.ui.ui.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);