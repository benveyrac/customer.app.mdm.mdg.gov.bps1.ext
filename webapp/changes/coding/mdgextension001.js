sap.ui.define(
    [
        'sap/ui/core/mvc/ControllerExtension',
        'sap/ui/core/mvc/OverrideExecution',
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/m/MessagePopover",
        "sap/m/MessageItem",
        "sap/ui/model/BindingMode"

    ],
    function (
        ControllerExtension, OverrideExecution,
        JSONModel, Fragment, MessagePopover, MessageItem, BindingMode
    ) {
        'use strict';
        return ControllerExtension.extend("customer.app.mdm.mdg.gov.bps1.ext.mdgextension001", {
            metadata: {
                // 	// extension can declare the public methods
                // 	// in general methods that start with "_" are private
                methods: {
                    publicMethod: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    finalPublicMethod: {
                        final: true
                    },
                    onMyHook: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.After
                    },
                    couldBePrivate: {
                        public: false
                    },
                    getUploadSetId: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    onSelectTypeExt: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    onFilesReceivedExt: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    onBeforeUploadStartsExt: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    onUploadCompletedExt: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    onAfterRemoveFileExt: {
                        public: true /*default*/ ,
                        final: false /*default*/ ,
                        overrideExecution: OverrideExecution.Instead /*default*/
                    },
                    onSaveAndSubmitExt: {
                        public: false /*default*/ ,
                        final: true /*default*/ ,
                    },
                    onBkTyCAdd: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onBTSave: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onRSVAdd: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onRSSave: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onOutMAdd: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onOMSave: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onItemDel: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },
                    onDialogClose: {
                        public: true /*default*/ ,
                        final: false /*default*/
                    },

                }
            },
            // // adding a private method, only accessible from this controller extension
            _privateMethod: function () {},
            // // adding a public method, might be called from or overridden by other controller extensions as well
            publicMethod: function () {},
            // // adding final public method, might be called from, but not overridden by other controller extensions as well
            finalPublicMethod: function () {},
            // // adding a hook method, might be called by or overridden from other controller extensions
            // // override these method does not replace the implementation, but executes after the original method
            onMyHook: function () {},
            // // method public per default, but made private via metadata
            couldBePrivate: function () {},


            // Sélection d'un type de document
            onSelectTypeExt: function (oEvent) {
                this.ComboType = this.getView().byId(oEvent.getSource().getId());
                let sKey = oEvent.getSource().getSelectedKey();
                if (sKey) {
                    // this.Uploadset.setUploadEnabled(true);
                    this.getView().getModel('uiExt').setProperty('/upload', true);
                } else {
                    // this.Uploadset.setUploadEnabled(false);
                    this.getView().getModel('uiExt').setProperty('/upload', false);
                }
            },

            getUploadSetId: function (oEvent) {
                this.Uploadset = this.getView().byId(oEvent.getSource().getId());
            },

            // Changement des données partenaires et des fichiers
            _initDataExt: function (oContext, sDraft) {
                var that = this;
                if (sDraft) {
                    this.getExtModel().callFunction("/convertUUID", {
                        urlParameters: {
                            Businesspartneruuid: oContext.getProperty("BusinessPartnerUUID")
                        },
                        success: function (oData) {
                            let oKeyDrf = that.getExtModel().createKey("/ZC_PARTNER_MDG_DFT", {
                                MDChgProcessSrceObject: oData.convertUUID.Mdchgprocesssrceobject
                            });
                            that._bindingView(oKeyDrf);
                        },
                        error: function (oError) {}
                    });
                } else {
                    let oKey = this.getExtModel().createKey("/ZC_PARTNER_MDG", {
                        MDChgProcessSrceObject: oContext.getProperty("MDChgProcessSrceObject") || ""
                    });
                    this._bindingView(oKey);
                }
            },

            _bindingView: function (oKey) {
                this.getExtModel().invalidateEntry(oKey);
                this.getView().setBusy(true);

                this.getView().bindObject({
                    path: oKey,
                    model: 'ZC_PARTNER_MDG',
                    events: {
                        change: (oData) => {
                            this.getView().setBusy(false);
                        },
                        dataReceived: (oDataReceived) => {
                            this.getView().setBusy(false);
                            this._setuiExt();
                        },

                    }
                })
            },

            // Modification des Url pour le chargement des fichiers
            onFilesReceivedExt: function (oEvent) {
                const aUploadItem = this.Uploadset.getItems();
                const oServiceUrl = this.getExtModel().sServiceUrl;

                aUploadItem.forEach(oItem => {
                    const oItemContext = oItem.getBindingContext('ZC_PARTNER_MDG');
                    const oData = oItemContext.getObject();

                    const oKey = this.getExtModel().createKey('/FileSet', {
                        SourceId: oData.MDChgProcessSrceObject,
                        Type: oData.Type,
                        Filename: oData.Filename
                    });
                    const sPath = oServiceUrl + oKey + "/$value";

                    oItem.setProperty('url', sPath);
                });
            },

            // Before Upload Starts define Slug and Tocken
            onBeforeUploadStartsExt: function (oEvent) {
                let oHeaderItem = oEvent.getParameter("item");
                oHeaderItem.removeAllStatuses();
                let oContext = this.getView().getBindingContext();

                let oTypeKey = this.ComboType.getSelectedKey();
                let oData = {
                    MasterDataChangeProcess: oContext.getProperty("MasterDataChangeProcess") || "",
                    MDChgProcessSrceObject: oContext.getProperty("MDChgProcessSrceObject") || "",
                }
                let oGuid = oContext.getProperty("BusinessPartnerUUID");

                oHeaderItem.addHeaderField(new sap.ui.core.Item({
                    key: "slug",
                    text: oGuid + "@" + oData.MasterDataChangeProcess + "@" + oData.MDChgProcessSrceObject + "@" + oTypeKey + "@" + oHeaderItem.getFileName()
                }));
                oHeaderItem.addHeaderField(new sap.ui.core.Item({
                    key: "x-csrf-token",
                    text: this.getExtModel().getSecurityToken()
                }));

            },

            // At the complete upload
            onUploadCompletedExt: function (oEvent) {
                let oStatus = oEvent.getParameter("status");
                let oItem = oEvent.getParameter("item");
                oItem.setVisibleEdit(false);
                // this.Uploadset.setUploadEnabled(false);
                this.getView().getModel('uiExt').setProperty('/upload', false);

                if (oStatus && oStatus !== 201) {
                    oItem.setUploadState("Error");
                    oItem.removeAllStatuses();
                } else {
                    this.Uploadset.getModel("customer.mdgextend").refresh();
                    this.ComboType.setSelectedKey();
                }
            },

            // Suppression d'un fichier #Attachment en attente d'ajout ou déjà ajouté.
            onAfterRemoveFileExt: function (oEvent) {
                // const sPath = oEvent.getParameter('item').getBindingContext('ZC_PARTNER_MDG').getPath() + "/$value";
                const sPath = oEvent.getParameter('item').getBindingContext('ZC_PARTNER_MDG').getPath();

                this.getExtModel().remove(sPath, {
                    success: function (oData) {},
                    error: function (oError) {}
                });
            },

            /*************************************************************************
             * >>>> Bank Type Managment
             *************************************************************************/
            onBkTyCAdd: function (oEvent) {
                this._loadBankTypeDialog(oEvent, "/ZC_BVTYPC_PRC");
            },

            onBkTyVAdd: function (oEvent) {
                this._loadBankTypeDialog(oEvent, "/ZC_BVTYPV_PRC");
            },

            _loadBankTypeDialog: function (oEvent, oEntity) {
                this.oMessageManager.removeAllMessages();
                this.getView().getModel("ZC_PARTNER_MDG").resetChanges(null, true, true);
                let oCmdObj = this.getView().getBindingContext('ZC_PARTNER_MDG').getObject();

                this._loadDialogPopup({
                    name: "customer.app.mdm.mdg.gov.bps1.ext.changes.fragments.BankTypeDialog",
                    dialog: this._pBankTypeDialog
                }).then(oBankTypeDialog => {
                    this._pBankTypeDialog = oBankTypeDialog;
                    this._pBankTypeDialog.setModel(this.getExtModel());

                    const oBankTypContext = this.getExtModel().createEntry(oEntity, {
                        properties: {
                            MDChgProcessSrceObject: oCmdObj.MDChgProcessSrceObject,
                            MasterDataChangeProcess: oCmdObj.MasterDataChangeProcess || "",
                        }
                    });
                    this._pBankTypeDialog.setBindingContext(oBankTypContext);
                    this._pBankTypeDialog.IdTab = this.getView().byId(oEvent.getSource().getId());
                    this._pBankTypeDialog.open();
                });
            },

            onBTSave: function (oEvent) {
                this.oMessageManager.removeAllMessages();
                this._pBankTypeDialog.setBusy(true);

                this.submitChanges({
                        model: this.getExtModel(),
                        // idGroup: "ac_grp",
                        busyControl: this.getView()
                    })
                    .then((oResult) => { //Sucess                                                      
                        this._pBankTypeDialog.unbindObject();
                        this._pBankTypeDialog.IdTab.getModel("customer.mdgextend").refresh();
                        this._pBankTypeDialog.setBusy(false);
                        this._pBankTypeDialog.close();
                    })
                    .catch((oError) => {
                        // this.deleteDuplicateMsg(sModel);
                        this._pBankTypeDialog.setBusy(false);
                    });
            },
            /*************************************************************************
             * <<<< Bank Type Managment
             *************************************************************************/

            /*************************************************************************
             * >>>> ReadSoft Managment
             *************************************************************************/
            onRSVAdd: function (oEvent) {
                this._loadReadSoftDialog(oEvent);
            },

            _loadReadSoftDialog: function (oEvent, oEntity) {
                this.oMessageManager.removeAllMessages();
                this.getView().getModel("ZC_PARTNER_MDG").resetChanges(null, true, true);
                let oCmdObj = this.getView().getBindingContext('ZC_PARTNER_MDG').getObject();

                this._loadDialogPopup({
                    name: "customer.app.mdm.mdg.gov.bps1.ext.changes.fragments.ReadSoftDialog",
                    dialog: this._pReadSoftDialog
                }).then(oDialog => {
                    this._pReadSoftDialog = oDialog;
                    this._pReadSoftDialog.setModel(this.getExtModel());

                    const oReadSoftContext = this.getExtModel().createEntry("/ZC_READSOFT_ACCT_PRC", {
                        properties: {
                            MDChgProcessSrceObject: oCmdObj.MDChgProcessSrceObject,
                            MasterDataChangeProcess: oCmdObj.MasterDataChangeProcess || "",
                        }
                    });
                    this._pReadSoftDialog.setBindingContext(oReadSoftContext);
                    this._pReadSoftDialog.IdTab = this.getView().byId(oEvent.getSource().getId());
                    this._pReadSoftDialog.open();
                });
            },

            onRSSave: function (oEvent) {
                this.oMessageManager.removeAllMessages();
                this._pReadSoftDialog.setBusy(true);

                this.submitChanges({
                        model: this.getExtModel(),
                        busyControl: this.getView()
                    })
                    .then((oResult) => {
                        this._pReadSoftDialog.unbindObject();
                        this._pReadSoftDialog.IdTab.getModel("customer.mdgextend").refresh();
                        this._pReadSoftDialog.setBusy(false);
                        this._pReadSoftDialog.close();
                    })
                    .catch((oError) => {
                        this._pReadSoftDialog.setBusy(false);
                    });
            },
            /*************************************************************************
             * <<<< ReadSoft Managment
             *************************************************************************/

            /*************************************************************************
             * >>>> Output Document Managment
             *************************************************************************/
            onOutMAdd: function (oEvent) {
                this._loadOutputDialog(oEvent);
            },

            _loadOutputDialog: function (oEvent, oEntity) {
                this.oMessageManager.removeAllMessages();
                this.getView().getModel("ZC_PARTNER_MDG").resetChanges(null, true, true);
                let oCmdObj = this.getView().getBindingContext('ZC_PARTNER_MDG').getObject();

                this._loadDialogPopup({
                    name: "customer.app.mdm.mdg.gov.bps1.ext.changes.fragments.OutPutMailDialog",
                    dialog: this._pOutputDialog
                }).then(oDialog => {
                    this._pOutputDialog = oDialog;
                    this._pOutputDialog.setModel(this.getExtModel());

                    const oOutputContext = this.getExtModel().createEntry("/ZC_MDG_OUT_MAIL_PRC", {
                        properties: {
                            MDChgProcessSrceObject: oCmdObj.MDChgProcessSrceObject,
                            MasterDataChangeProcess: oCmdObj.MasterDataChangeProcess || "",
                        }
                    });
                    this._pOutputDialog.setBindingContext(oOutputContext);
                    this._pOutputDialog.IdTab = this.getView().byId(oEvent.getSource().getId());
                    this._pOutputDialog.open();
                });
            },

            onOMSave: function (oEvent) {
                this.oMessageManager.removeAllMessages();
                this._pOutputDialog.setBusy(true);

                this.submitChanges({
                        model: this.getExtModel(),
                        busyControl: this.getView()
                    })
                    .then((oResult) => {
                        this._pOutputDialog.unbindObject();
                        this._pOutputDialog.IdTab.getModel("customer.mdgextend").refresh();
                        this._pOutputDialog.setBusy(false);
                        this._pOutputDialog.close();
                    })
                    .catch((oError) => {
                        this._pOutputDialog.setBusy(false);
                    });
            },
            /*************************************************************************
             * <<<< Output Document Managment
             *************************************************************************/

            _setuiExt: function () {
                let ouiData = this.getView().getModel('ui').getData();
                this.getView().getModel('uiExt').setProperty('/editable', ouiData.editable);
            },

            onSaveAndSubmitExt: function (oEvent) {
                let Object = this.getView().getBindingContext().getObject();
                this.getView().getBindingContext().getProperty("BusinessPartnerUUID");
            },

            _initializeViewModel: function (sName, oData) {
                this.getView().setModel(new JSONModel(oData), sName);
                this.getView().bindElement(sName + '>/');
            },

            getExtModel: function (sModel) {
                return this.getView().getController().getOwnerComponent().getModel("customer.mdgextend");
            },

            //Charge une popup et renvoie une Promise
            _loadDialogPopup: function ({
                name,
                dialog
            }) {
                return new Promise((resolve, reject) => {
                    if (!dialog) {
                        Fragment.load({
                            id: this.getView().getId(),
                            name: name,
                            controller: this
                        }).then(dialog => {
                            this.getView().addDependent(dialog);
                            resolve(dialog);
                        });
                    } else { //Déjà chargée 
                        resolve(dialog);
                    }
                });
            },

            /*************************************************************************
             *  Submit Changes on OData Model for a given group and return a promise
             *************************************************************************/
            submitChanges: function ({
                model,
                idGroup,
                busyControl
            }) {
                return new Promise((resolve, reject) => {
                    model.metadataLoaded().then(function () {
                        if (typeof model !== "object") {
                            reject();
                        }
                        // if (model.hasPendingChanges() === false) { //No pending modification -> do nothing
                        //     resolve({});
                        // }
                        if (busyControl != null && busyControl instanceof Object) {
                            busyControl.setBusy(true);
                        }
                        model.submitChanges({
                            groupId: idGroup,
                            success: function (oData) {
                                if (busyControl != null && busyControl instanceof Object) {
                                    busyControl.setBusy(false);
                                }
                                //Check the response                    
                                if (typeof oData.__batchResponses !== "undefined") {
                                    let oResponse = oData.__batchResponses[0].response;
                                    if (typeof oResponse !== "undefined" && oResponse.statusCode !== "200") { //An error has occured during submit
                                        reject(oResponse);
                                    }
                                }
                                resolve(oData);
                            },
                            error: function (oError) { //Error during submit
                                if (busyControl != null && busyControl instanceof Object) {
                                    busyControl.setBusy(false);
                                }
                                reject(oError);
                            }
                        });
                    });
                });
            },


            onDialogClose: function (oEvent) {
                this.oMessageManager.removeAllMessages();
                this.getView().getModel("ZC_PARTNER_MDG").resetChanges(null, true, true);
                oEvent.getSource().getParent().getParent().close();
            },

            onItemDel: function (oEvent) {
                this.oMessageManager.removeAllMessages();
                this.getView().getModel("ZC_PARTNER_MDG").resetChanges(null, true, true);
                let oItem = oEvent.getSource().getParent().getParent().getSelectedItem();
                let oPath = oItem.getBindingContextPath();

                this.getExtModel().remove(oPath, {
                    success: oData => {
                        this.getView().byId(oEvent.getSource().getId()).getModel("customer.mdgextend").refresh();
                    },
                    error: oError => {}
                });
            },

            handleMessagePopoverPress: function (oEvent) {
                if (!this.oMessagePopover) {
                    this.createMessagePopover(oEvent.getSource());
                }
                this.oMessagePopover.toggle(oEvent.getSource());
            },

            //Create the Message Popover
            createMessagePopover: function (oEvent) {
                this.oMessagePopover = new MessagePopover({
                    activeTitlePress: function (oEvent) { //triggered at click on the message active title link
                        const oItem = oEvent.getParameter("item");
                        const oMessage = oItem.getBindingContext("message").getObject(); //Get the message instance
                        const oControl = sap.ui.getCore().byId(oMessage.getControlId()); //Get the control associated to the message
                        if (oControl) {
                            setTimeout(function () {
                                oControl.focus();
                            }, 300);
                        }
                    },
                    items: {
                        path: "message>/",
                        template: new MessageItem({
                            title: "{message>message}",
                            subtitle: "{message>additionalText}",
                            activeTitle: {
                                parts: [{
                                    path: 'message>controlIds'
                                }],
                                formatter: this.isPositionable
                            },
                            type: "{message>type}",
                            description: "{message>message}"
                        })
                    }
                });

                if (this.getView().byId(oEvent.getId())) {
                    this.getView().byId(oEvent.getId()).addDependent(this.oMessagePopover);
                }
            },

            isPositionable: function (sControlIds) {
                // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.	
                if (sControlIds && sControlIds.length > 0) {
                    return true;
                }
                return false;
            },

            onContextChange: function () {
                var that = this;
                var oContext = this.getView().getBindingContext();
                if (oContext && oContext.sPath !== this.sPath && !oContext.bCreated && oContext.getObject() || oContext && oContext.bForceRefresh) {
                    this.sPath = oContext.sPath;
                    var _Refresh = function (sDraft) {
                        that.getView().unbindObject("ZC_PARTNER_MDG");
                        that._initDataExt(oContext, sDraft);
                    };
                    try {
                        let p = /(?:MasterDataChangeProcess=)'([^&=]+)',/.exec(oContext.sPath)[1];
                        if (p != 0) {
                            _Refresh();
                        } else if (p == 0) {
                            _Refresh(true);
                        } else {
                            that.getView().unbindObject("ZC_PARTNER_MDG");
                            that._setuiExt();
                        }
                    } catch (Error) {
                        _Refresh();
                    }
                }
            },

            // // this section allows to extend lifecycle hooks or override public methods of the base controller
            override: {
                /**
                 * Called when a controller is instantiated and its View controls (if available) are already created.
                 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
                 * @memberOf {{controllerExtPath}}
                 */
                onInit: function (oEvent) {
                    // Initialisation du modèle des messages                    
                    this.oMessageManager = sap.ui.getCore().getMessageManager();
                    this.oMessageManager.registerObject(this.getView(), true);
                    this.getView().setModel(this.oMessageManager.getMessageModel(), "message");

                    // Initialisation du modèle JSON 'UI'
                    let oUI = {
                        editable: false,
                        upload: false
                    }
                    this._initializeViewModel('uiExt', oUI);

                    oEvent.getSource().attachModelContextChange(this.onContextChange.bind(this));

                    this.getExtModel().metadataLoaded().then(() => {
                        const oDataModel = this.getExtModel();
                        this.getView().setModel(oDataModel, 'ZC_PARTNER_MDG');
                        oDataModel.setDefaultBindingMode(BindingMode.TwoWay);
                    });

                    // let oSubmit = this.getView().byId("mdm.mdg.gov.bps1::sap.suite.ui.generic.template.ObjectPage.view.Details::BusinessPartner--saveSubmit");
                    // oSubmit.attachPress(oEvent => {
                    //     this.onSaveAndSubmitExt(oEvent);
                    // });
                },
                // 	/**
                // 	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
                // 	 * (NOT before the first rendering! onInit() is used for that one!).
                // 	 * @memberOf {{controllerExtPath}}
                // 	 */
                // 	onBeforeRendering: function() {
                // 	},
                // 	/**
                // 	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
                // 	 * This hook is the same one that SAPUI5 controls get after being rendered.
                // 	 * @memberOf {{controllerExtPath}}
                // 	 */
                // 	onAfterRendering: function() {
                // 	},
                // 	/**
                // 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
                // 	 * @memberOf {{controllerExtPath}}
                // 	 */
                // 	onExit: function() {
                // 	},
                // 	// override public method of the base controller
                // 	basePublicMethod: function() {
                // 	}
            }
        });
    }
);