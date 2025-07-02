// Importation des modules LWC
import { LightningElement, api, wire, track } from 'lwc';
// Importation des méthodes Apex pour récupérer et supprimer des données
import getOpportunityData from '@salesforce/apex/OpportunityController.getOpportunityData';
import getUserProfile from '@salesforce/apex/OpportunityController.getUserProfile';
import deleteOpportunityLineItemApex from '@salesforce/apex/OpportunityController.deleteOpportunityLineItem';
// Permet de naviguer vers une autre page (ex : produit)
import { NavigationMixin } from 'lightning/navigation';

// Importation des labels personnalisés 
import Product_Name from '@salesforce/label/c.Product_Name';
import Quantity from '@salesforce/label/c.Quantity';
import QuantityInStock from '@salesforce/label/c.QuantityInStock';
import UnitPrice from '@salesforce/label/c.UnitPrice';
import TotalPrice from '@salesforce/label/c.TotalPrice';
import DeleteLabel from '@salesforce/label/c.Delete';
import Delete_Title from '@salesforce/label/c.Delete_Title';
import SeeProduct from '@salesforce/label/c.SeeProduct';

// Définition des colonnes pour le profil "Administrateur"
const COLUMNSAdmin = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            class: { fieldName: 'quantityClass' } // Applique une couleur en fonction de la quantité
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
            iconName: 'utility:preview',
            label: SeeProduct,
            name: 'view_product',
            title: SeeProduct,
            variant: 'brand'
        }
    },
    {
        label: DeleteLabel,
        type: 'button-icon',
        fieldName: 'Id',
        typeAttributes: {
            iconName: 'utility:delete',
            alternativeText: DeleteLabel,
            name: 'delete_product',
            variant: 'destructive'
        }
    }
];

// Définition des colonnes pour les utilisateurs "commerciaux"
const COLUMNSCommercial = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            class: { fieldName: 'quantityClass' } // met une classe CSS en fonction du stock
        }
    },
    { label: QuantityInStock, fieldName: 'Quantit_en_stock__c' },
    { label: UnitPrice, fieldName: 'UnitPrice', type: 'currency' },
    { label: TotalPrice, fieldName: 'TotalPrice', type: 'currency' },
    {
        label: DeleteLabel,
        type: 'button-icon',
        fieldName: 'Id',
        typeAttributes: {
            iconName: 'utility:delete',
            alternativeText: DeleteLabel,
            name: 'delete_product',
            variant: 'destructive'
        }
    }
];

// Composant principal LWC
export default class MyLWCAdmin extends NavigationMixin(LightningElement) {
    @api recordId; // Id de l'opportunité en cours
    @track opportunityRows = []; // Liste des lignes de produits à afficher
    @track columns = []; // Colonnes affichées dans le datatable
    @track isAdmin = true; // Définit si l'utilisateur est admin ou non
    @track noData = false; // Indique s'il n'y a pas de données à afficher
    @track showQuantityWarning = false; // Affiche un message d'avertissement si stock dépassé

    // Appelé au chargement du composant
    connectedCallback() {
        this.getProfil(); // Vérifie le profil de l'utilisateur
    }

    // Récupère le profil utilisateur via Apex
    getProfil() {
        getUserProfile()
            .then(profile => {
                this.isAdmin = profile === 'System Administrator'; // Vérifie si l'utilisateur est admin
                this.columns = this.isAdmin ? COLUMNSAdmin : COLUMNSCommercial; // Charge les bonnes colonnes
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du profil : ', error);
            });
    }

    // Appelle Apex pour récupérer les lignes de produits de l’opportunité
    @wire(getOpportunityData, { opportunityId: '$recordId' })
    opportunityData({ error, data }) {
        if (data && data.length > 0) {
            this.showQuantityWarning = false; // Réinitialise le message d'avertissement

            // Transforme les données pour affichage
            this.opportunityRows = data.map(item => {
                const hasStockError = item.Quantity > item.Quantit_en_stock__c;
                if (hasStockError) this.showQuantityWarning = true; // Affiche le message si stock dépassé

                return {
                    Id: item.Id,
                    Product2Name: item.Product2?.Name,
                    UnitPrice: item.UnitPrice,
                    TotalPrice: item.TotalPrice,
                    Quantity: item.Quantity,
                    Quantit_en_stock__c: item.Quantit_en_stock__c,
                    Product2Id: item.Product2Id,
                    quantityClass: hasStockError ? 'slds-text-color_error' : 'slds-text-color_success' // Style conditionnel
                };
            });

            this.noData = false; // Il y a des données
        } else {
            // Aucune ligne à afficher
            this.opportunityRows = [];
            this.noData = true;
        }

        if (error) {
            console.error('Erreur lors de la récupération des données : ', error);
            this.opportunityRows = [];
            this.noData = true;
        }
    }

    // Gère les actions des boutons dans le tableau
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view_product':
                // Redirige vers la fiche produit
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
                // Supprime la ligne de produit
                this.deleteOpportunityLineItem(row.Id);
                break;
        }
    }

    // Appelle Apex pour supprimer une ligne produit
    deleteOpportunityLineItem(recordId) {
        deleteOpportunityLineItemApex({ recordId: recordId })
            .then(() => {
                // Mise à jour de la liste après suppression
                this.opportunityRows = this.opportunityRows.filter(item => item.Id !== recordId);
            })
            .catch(error => {
                console.error('Erreur lors de la suppression Apex :', error);
            });
    }
}
