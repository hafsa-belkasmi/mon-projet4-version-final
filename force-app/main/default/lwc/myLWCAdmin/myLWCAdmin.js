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
// Colonnes pour l'administrateur (avec bouton 'See Product')
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
// Colonnes pour les utilisateurs non admin (sans 'See Product')
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
// Déclaration du composant LWC
export default class MyLWCAdmin extends NavigationMixin(LightningElement) {
    @api recordId; // ID de l'opportunité
    @track opportunityRows = []; // Données à afficher dans le tableau
    @track columns = []; // Colonnes à afficher
    @track isAdmin = true; // Détermine si l'utilisateur est admin
    @track noData = false; // Indique si l'opportunité contient des produits

    connectedCallback() {
        this.getProfil();
    }
// Récupère le profil utilisateur et définit les colonnes à afficher
    getProfil() {
        getUserProfile()
            .then(profile => {
                console.log('Profil reçu : ', profile); // 👈 ajoute ceci
                this.isAdmin =
                  this.isAdmin = profile === 'System Administrator';
                this.columns = this.isAdmin ? COLUMNSAdmin : COLUMNSCommercial;
            })
            .catch(error => {
                console.error('Erreur profil : ', error);
            });
    }
// Récupère les produits liés à l'opportunité via Apex
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
             // Aucun produit trouvé
            this.opportunityRows = [];
            this.noData = true;
        }
// En cas d'erreur lors de la récupération
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
                // Suppression de la ligne de produit
                this.deleteOpportunityLineItem(row.Id);
                break;
        }
    }
 // Supprime un produit lié à l'opportunité
    deleteOpportunityLineItem(recordId) {
        deleteRecord(recordId)
            .then(() => {
                 // Met à jour le tableau sans le produit supprimé
                this.opportunityRows = this.opportunityRows.filter(item => item.Id !== recordId);
            })
            .catch(error => {
                console.error('Erreur suppression :', error);
            });
    }
}
