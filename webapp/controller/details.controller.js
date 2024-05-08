sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/odata/v2/ODataModel',
    'sap/m/Text',
    'sap/ui/core/format/DateFormat'
], function (Controller, ODataModel, Text,  DateFormat) {
    "use strict";

    return Controller.extend("abu.assignment5new.controller.details", {
        onInit: function() {
            var oModel = new sap.ui.model.odata.v2.ODataModel("/northwind/northwind.svc/");
            this.getView().setModel(oModel);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Routedetails").attachPatternMatched(this._onRouteMatched, this);

            this._setFormViewMode(true);


            this.oSmartVariantManagement = this.getView().byId("svm");
			this.oExpandedLabel = this.getView().byId("expandedLabel");
			this.oSnappedLabel = this.getView().byId("snappedLabel");

            


        },
        _onRouteMatched: function(oEvent){
            var oArgs = oEvent.getParameter("arguments");
            var sId = oArgs.id;
            this._fetchEmployeeData(sId);
            this._fetchOrderData(sId);
        },
        _fetchEmployeeData: function(employeeId){
            var oModel = this.getView().getModel();
            var sPath = "/Employees("+employeeId+")";
            oModel.read(sPath, {
                success: function(oData){
                    var oDateFormat = DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
                    var formattedBirthDate = oDateFormat.format(new Date(oData.BirthDate));
                    var formattedHireDate = oDateFormat.format(new Date(oData.HireDate));
                    
                    this.getView().byId("name").setText(oData.FirstName+" " + oData.LastName);
                    this.getView().byId("title").setText(oData.Title);
                    this.getView().byId("phone").setText(oData.HomePhone);
                    this.getView().byId("courtesy").setValue(oData.TitleOfCourtesy);
                    this.getView().byId("title1").setValue(oData.Title);
                    this.getView().byId("bdate").setValue(formattedBirthDate);
                    this.getView().byId("hdate").setValue(formattedHireDate);

                    this.getView().byId("addres").setValue(oData.Address);
                    this.getView().byId("city").setValue(oData.City);
                    this.getView().byId("postal").setValue(oData.PostalCode);
                    this.getView().byId("country").setValue(oData.Country);

                    this.getView().byId("phone1").setValue(oData.HomePhone);


                }.bind(this),
                error:function(oError){

                }
            });
        },
        _fetchOrderData: function(employeeId){
            var oModel = this.getView().getModel();
            var sPath = "/Employees("+employeeId+")";
            oModel.read(sPath + "/Orders", {
                success: function(oData){
                    var oTable = this.getView().byId("table");
                    oTable.setModel(new sap.ui.model.json.JSONModel({
                        Orders: oData.results
                    }));
                }.bind(this),
                error: function(oError){
                    // Handle error
                }
            });
               

                    var sPath2 = "/Orders("+employeeId+")";
                    oModel.read(sPath2 + "/Orders", {
                        success: function(orderData){
                    var ofilterbar = this.getView().byId("filterbar");
                    ofilterbar.setModel(new sap.ui.model.json.JSONModel({
                        Orders1: orderData.results
                    }));
                }.bind(this),
                error: function(oError){
                    // Handle error
                }
            });
        },

        
        

        onEdit: function() {
            // Switch the form controls to editable mode
            this._setFormViewMode(false);
        },
        onSave: function() {
            // Save the edited data
            // Here you can implement the logic to save the data
            // After saving, switch back to view mode
            this._setFormViewMode(true);
        },
        _setFormViewMode: function(isViewMode) {
            // Set the editable property of each input control based on the view mode
            var oView = this.getView();
            var aControls = [
                "title1", "courtesy", "hdate", "bdate",
                "addres", "city", "postal", "country", "phone1"
            ];
            
            aControls.forEach(function(sControlId) {
                var oControl = oView.byId(sControlId);
                if (oControl) {
                    oControl.setEditable(!isViewMode);
                }
            });
        },
        onSelectionChange: function (oEvent) {
			this.oSmartVariantManagement.currentVariantSetModified(true);
			this.oFilterBar.fireFilterChange(oEvent);
		},

		onSearch: function () {
			var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
				var oControl = oFilterGroupItem.getControl(),
					aSelectedKeys = oControl.getSelectedKeys(),
					aFilters = aSelectedKeys.map(function (sSelectedKey) {
						return new Filter({
							path: oFilterGroupItem.getName(),
							operator: FilterOperator.Contains,
							value1: sSelectedKey
						});
					});

				if (aSelectedKeys.length > 0) {
					aResult.push(new Filter({
						filters: aFilters,
						and: false
					}));
				}

				return aResult;
			}, []);

			this.oTable.getBinding("items").filter(aTableFilters);
			this.oTable.setShowOverlay(false);
		},

		onFilterChange: function () {
			this._updateLabelsAndTable();
		},

		onAfterVariantLoad: function () {
			this._updateLabelsAndTable();
		},

		getFormattedSummaryText: function() {
			var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

			if (aFiltersWithValues.length === 0) {
				return "No filters active";
			}

			if (aFiltersWithValues.length === 1) {
				return aFiltersWithValues.length + " filter active: " + aFiltersWithValues.join(", ");
			}

			return aFiltersWithValues.length + " filters active: " + aFiltersWithValues.join(", ");
		},

		getFormattedSummaryTextExpanded: function() {
			var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

			if (aFiltersWithValues.length === 0) {
				return "No filters active";
			}

			var sText = aFiltersWithValues.length + " filters active",
				aNonVisibleFiltersWithValues = this.oFilterBar.retrieveNonVisibleFiltersWithValues();

			if (aFiltersWithValues.length === 1) {
				sText = aFiltersWithValues.length + " filter active";
			}

			if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
				sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
			}

			return sText;
		},

		_updateLabelsAndTable: function () {
			this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
			this.oSnappedLabel.setText(this.getFormattedSummaryText());
			this.oTable.setShowOverlay(true);
		}
        
    });
});
