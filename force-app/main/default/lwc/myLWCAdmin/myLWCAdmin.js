import { LightningElement, api, wire, track } from 'lwc';
import getOpportunityData from '@salesforce/apex/OpportunityController.getOpportunityData';
import getUserProfile from '@salesforce/apex/OpportunityController.getUserProfile';
import deleteRecord from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

// Import des labels personnalisés
import Product_Name from '@salesforce/label/c.Product_Name';
import Quantity from '@salesforce/label/c.Quantity';
import QuantityInStock from '@salesforce/label/c.QuantityInStock';
import UnitPrice from '@salesforce/label/c.UnitPrice';
import TotalPrice from '@salesforce/label/c.TotalPrice';
import DeleteLabel from '@salesforce/label/c.Delete';
import Delete_Title from '@salesforce/label/c.Delete_Title';
import SeeProduct from '@salesforce/label/c.SeeProduct'; 
const COLUMNSAdmin = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            class: { fieldName: 'quantityClass' }
        }
    },
    { label: QuantityInStock, fieldName: 'Quantit_en_stock__c' },
    { label: UnitPrice, fieldName: 'UnitPrice', type: 'currency' },
    { label: TotalPrice, fieldName: 'TotalPrice', type: 'currency' },
    {
        label: SeeProduct,
        type: 'button',
        fieldName: 'Product2Id',
        typeAttributes: {
            label: SeeProduct,
            name: 'view_product',
            title: SeeProduct,
            variant: 'brand'
        }
    },
    {
        label: DeleteLabel,
        type: 'button',
        fieldName: 'Id',
        typeAttributes: {
            label: DeleteLabel,
            name: 'delete_product',
            title: Delete_Title,
            variant: 'destructive'
        }
    }
];

const COLUMNSCommercial = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            class: { fieldName: 'quantityClass' }
        }
    },
    { label: QuantityInStock, fieldName: 'Quantit_en_stock__c' },
    { label: UnitPrice, fieldName: 'UnitPrice', type: 'currency' },
    { label: TotalPrice, fieldName: 'TotalPrice', type: 'currency' },
    {
        label: DeleteLabel,
        type: 'button',
        fieldName: 'Id',
        typeAttributes: {
            label: DeleteLabel,
            name: 'delete_product',
            title: Delete_Title,
            variant: 'destructive'
        }
    }
];

export default class MyLWCAdmin extends NavigationMixin(LightningElement) {
    @api recordId;
    @track opportunityRows = [];
    @track columns = [];
    @track isAdmin = true;
    @track noData = false;

    connectedCallback() {
        this.getProfil();
    }

    getProfil() {
        getUserProfile()
            .then(profile => {
                console.log('profil',profile);
                this.isAdmin =
                  profile.includes('System Administrator')?true:false;
                this.columns = this.isAdmin ? COLUMNSAdmin : COLUMNSCommercial;
            })
            .catch(error => {
                console.error('Erreur profil : ', error);
            });
    }

    @wire(getOpportunityData, { opportunityId: '$recordId' })
    opportunityData({ error, data }) {
        if (data && data.length > 0) {
            this.opportunityRows = data.map(item => ({
                Id: item.Id,
                Product2Name: item.Product2?.Name,
                UnitPrice: item.UnitPrice,
                TotalPrice: item.TotalPrice,
                Quantity: item.Quantity,
                Quantit_en_stock__c: item.Quantit_en_stock__c,
                Product2Id: item.Product2Id,
                quantityClass:
                    item.Quantity > item.Quantit_en_stock__c
                        ? 'slds-text-color_error'
                        : 'slds-text-color_success'
            }));
            this.noData = false;
        } else {
            this.opportunityRows = [];
            this.noData = true;
        }

        if (error) {
            console.error('Erreur récupération données : ', error);
            this.opportunityRows = [];
            this.noData = true;
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view_product':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Product2Id,
                        objectApiName: 'Product2',
                        actionName: 'view'
                    }
                });
                break;
            case 'delete_product':
                this.deleteOpportunityLineItem(row.Id);
                break;
        }
    }

    deleteOpportunityLineItem(recordId) {
        deleteRecord(recordId)
            .then(() => {
                this.opportunityRows = this.opportunityRows.filter(item => item.Id !== recordId);
            })
            .catch(error => {
                console.error('Erreur suppression :', error);
            });
    }
}
