sap.ui.define([
    'sap/ui/core/mvc/Controller',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/m/Label',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/comp/smartvariants/PersonalizableInfo',
  

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ODataModel, Label, Filter, FilterOperator, PersonalizableInfo) {
        "use strict";

        return Controller.extend("abu.assignment5new.controller.dashboard", {
            onInit: function () {
                var oModel = new ODataModel("/northwind/northwind.svc/");
                this.getView().setModel(oModel); 

                this.applyData = this.applyData.bind(this);
			this.fetchData = this.fetchData.bind(this);
			this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

			this.oSmartVariantManagement = this.getView().byId("svm");
			this.oExpandedLabel = this.getView().byId("expandedLabel");
			this.oSnappedLabel = this.getView().byId("snappedLabel");
			this.oFilterBar = this.getView().byId("filterbar");
			this.oTable = this.getView().byId("table");

			this.oFilterBar.registerFetchData(this.fetchData);
			this.oFilterBar.registerApplyData(this.applyData);
			this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

			var oPersInfo = new PersonalizableInfo({
				type: "filterBar",
				keyName: "persistencyKey",
				dataSource: "",
				control: this.oFilterBar
			});
			this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
			this.oSmartVariantManagement.initialise(function () {}, this.oFilterBar);

            // this.getView().setModel(new JSONModel(), "selectedEmployeeModel");
            
               
            },
            formatterdate: function(date) {
                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "EEE, d MMM, yyyy"
                   
                });
                return oDateFormat.format(new Date(date));
            },
            onExit: function() {
                this.oModel = null;
                this.oSmartVariantManagement = null;
                this.oExpandedLabel = null;
                this.oSnappedLabel = null;
                this.oFilterBar = null;
                this.oTable = null;
            },
    
            fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getSelectedKeys()
                    });
    
                    return aResult;
                }, []);
    
                return aData;
            },
    
            applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setSelectedKeys(oDataObject.fieldData);
                }, this);
            },
    
            getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();
    
                    if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }
    
                    return aResult;
                }, []);
    
                return aFiltersWithValue;
            },
    
            onSelectionChange: function (oEvent) {
                this.oSmartVariantManagement.currentVariantSetModified(true);
                this.oFilterBar.fireFilterChange(oEvent);
                this.onSearch();
            },
    
            // onSearch: function () {
            //     var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
            //         var oControl = oFilterGroupItem.getControl(),
            //             aSelectedKeys = oControl.getSelectedKeys(),
            //             aFilters = aSelectedKeys.map(function (sSelectedKey) {
            //                 return new Filter({
            //                     path: oFilterGroupItem.getName(),
            //                     operator: FilterOperator.Contains,
            //                     value1: sSelectedKey
            //                 });
            //             });
    
            //         if (aSelectedKeys.length > 0) {
            //             aResult.push(new Filter({
            //                 filters: aFilters,
            //                 and: false
            //             }));
            //         }
    
            //         return aResult;
            //     }, []);
    
            //     this.oTable.getBinding("items").filter(aTableFilters);
            //     this.oTable.setShowOverlay(false);
            // },
            onSearch: function() {
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function(aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKeys(),
                        aFilters = aSelectedKeys.map(function(sSelectedKey) {
                            var sFilterOperator = isNaN(sSelectedKey) ? FilterOperator.Contains : FilterOperator.EQ;
                            return new Filter({
                                path: oFilterGroupItem.getName(),
                                operator: sFilterOperator,
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
            },
            onTableRowPress: function(oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
                var sEmployeeId = oSelectedItem.EmployeeID;
                
                oRouter.navTo("Routedetails", {
                    id: sEmployeeId
                });
            }
            
        });
    });
