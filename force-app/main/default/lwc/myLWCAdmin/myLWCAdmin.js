// Importation des modules nécessaires depuis LWC
import { LightningElement, api, wire, track } from 'lwc';

// Importation des méthodes Apex pour interagir avec Salesforce
import getOpportunityData from '@salesforce/apex/OpportunityController.getOpportunityData';
import getUserProfile from '@salesforce/apex/OpportunityController.getUserProfile';
import deleteOpportunityLineItemApex from '@salesforce/apex/OpportunityController.deleteOpportunityLineItem';

// Importation du mixin pour permettre la navigation entre les pages
import { NavigationMixin } from 'lightning/navigation';

// Importation des labels personnalisés définis dans Salesforce
import Product_Name from '@salesforce/label/c.Product_Name';
import Quantity from '@salesforce/label/c.Quantity';
import QuantityInStock from '@salesforce/label/c.QuantityInStock';
import UnitPrice from '@salesforce/label/c.UnitPrice';
import TotalPrice from '@salesforce/label/c.TotalPrice';
import DeleteLabel from '@salesforce/label/c.Delete';
import Delete_Title from '@salesforce/label/c.Delete_Title';
import SeeProduct from '@salesforce/label/c.SeeProduct';

// Définition des colonnes spécifiques pour un profil administrateur
const COLUMNSAdmin = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            style: { fieldName: 'quantityStyle' } // Application d'un style conditionnel
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

// Définition des colonnes spécifiques pour les commerciaux (profil non administrateur)
const COLUMNSCommercial = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            style: { fieldName: 'quantityStyle' } // Même logique de style
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

// Déclaration de la classe principale du composant LWC
export default class MyLWCAdmin extends NavigationMixin(LightningElement) {
    @api recordId; // ID de l'opportunité passé depuis le contexte
    @track opportunityRows = []; // Liste des lignes d'articles d’opportunité
    @track columns = []; // Colonnes affichées dans le tableau (selon profil)
    @track isAdmin = true; // Détermine si l'utilisateur est admin
    @track noData = false; // Affiche un message si aucune donnée n'est disponible
    @track showQuantityWarning = false; // Alerte si quantité > stock

    // Méthode appelée automatiquement lorsque le composant est inséré dans la page
    connectedCallback() {
        this.getProfil(); // Récupération du profil utilisateur
    }

    // Récupère le profil de l'utilisateur via Apex
    getProfil() {
        getUserProfile()
            .then(profile => {
                this.isAdmin = profile === 'System Administrator'; // Vérifie si profil est admin
                this.columns = this.isAdmin ? COLUMNSAdmin : COLUMNSCommercial; // Définit les colonnes à afficher
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du profil : ', error);
            });
    }

    // Récupération des données d'opportunité via wire Apex
    @wire(getOpportunityData, { opportunityId: '$recordId' })
    opportunityData({ error, data }) {
        if (data && data.length > 0) {
            this.showQuantityWarning = false;

            // Transformation des données pour le tableau, avec style conditionnel
            this.opportunityRows = data.map(item => {
                const hasStockError = item.Quantity > item.Quantit_en_stock__c;
                if (hasStockError) this.showQuantityWarning = true;

                // Style appliqué selon disponibilité en stock
                const quantityStyle = hasStockError
                    ? 'color: red; background-color: #f2f2f2; font-weight: bold; padding: 4px; border-radius: 4px;'
                    : 'color: green; font-weight: bold;';

                // Retourne une ligne formatée
                return {
                    Id: item.Id,
                    Product2Name: item.Product2?.Name,
                    UnitPrice: item.UnitPrice,
                    TotalPrice: item.TotalPrice,
                    Quantity: item.Quantity,
                    Quantit_en_stock__c: item.Quantit_en_stock__c,
                    Product2Id: item.Product2Id,
                    quantityStyle
                };
            });

            this.noData = false; // Données disponibles
        } else {
            // Aucune donnée trouvée
            this.opportunityRows = [];
            this.noData = true;
        }

        // Gestion des erreurs
        if (error) {
            console.error('Erreur lors de la récupération des données : ', error);
            this.opportunityRows = [];
            this.noData = true;
        }
    }

    // Gère les actions de bouton dans les lignes du tableau
    handleRowAction(event) {
        const actionName = event.detail.action.name; // Nom de l'action
        const row = event.detail.row; // Ligne concernée

        // Exécution en fonction de l'action choisie
        switch (actionName) {
            case 'view_product':
                // Redirection vers la fiche produit
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
                // Suppression de l'article d’opportunité
                this.deleteOpportunityLineItem(row.Id);
                break;
        }
    }

    // Appel Apex pour supprimer une ligne de produit d’opportunité
    deleteOpportunityLineItem(recordId) {
        deleteOpportunityLineItemApex({ recordId })
            .then(() => {
                // Mise à jour de la liste locale après suppression
                this.opportunityRows = this.opportunityRows.filter(item => item.Id !== recordId);
            })
            .catch(error => {
                console.error('Erreur lors de la suppression Apex :', error);
            });
    }
}
