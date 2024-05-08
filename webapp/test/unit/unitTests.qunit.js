/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"abu/assignment5new/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
