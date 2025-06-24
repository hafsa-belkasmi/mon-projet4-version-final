import { LightningElement, api, wire, track } from 'lwc';
import getOpportunityData from '@salesforce/apex/OpportunityController.getOpportunityData';
import getUserProfile from '@salesforce/apex/OpportunityController.getUserProfile';
import deleteRecord from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

// Import des labels personnalisés pour les colonnes
import Product_Name from '@salesforce/label/c.Product_Name';
import Quantity from '@salesforce/label/c.Quantity';
import QuantityInStock from '@salesforce/label/c.QuantityInStock';
import UnitPrice from '@salesforce/label/c.UnitPrice';
import TotalPrice from '@salesforce/label/c.TotalPrice';
import DeleteLabel from '@salesforce/label/c.Delete';
import Delete_Title from '@salesforce/label/c.Delete_Title';
import SeeProduct from '@salesforce/label/c.SeeProduct';

// Définition des colonnes pour les administrateurs (avec bouton "Voir Produit")
const COLUMNSAdmin = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            class: { fieldName: 'quantityClass' } // Applique une classe CSS conditionnelle
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

// Définition des colonnes pour les commerciaux (sans bouton "Voir Produit")
const COLUMNSCommercial = [
    { label: Product_Name, fieldName: 'Product2Name' },
    {
        label: Quantity,
        fieldName: 'Quantity',
        cellAttributes: {
            class: { fieldName: 'quantityClass' } // Couleur conditionnelle du texte
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
    @api recordId; // ID de l'opportunité en cours
    @track opportunityRows = []; // Liste des lignes de produits liées à l'opportunité
    @track columns = []; // Colonnes dynamiques selon le profil utilisateur
    @track isAdmin = true; // Détermine si l'utilisateur est un administrateur
    @track noData = false; // Indique s’il n’y a aucun produit à afficher
    @track showQuantityWarning = false; // Affiche un message d’avertissement si des quantités dépassent le stock

    // Méthode exécutée dès que le composant est inséré dans la page
    connectedCallback() {
        this.getProfil(); // On commence par récupérer le profil utilisateur
    }

    // Appelle Apex pour connaître le profil utilisateur, puis définit les colonnes selon le rôle
    getProfil() {
        getUserProfile()
            .then(profile => {
                this.isAdmin = profile === 'System Administrator';
                this.columns = this.isAdmin ? COLUMNSAdmin : COLUMNSCommercial;
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du profil : ', error);
            });
    }

    // Récupère les lignes de produit via une méthode Apex
    @wire(getOpportunityData, { opportunityId: '$recordId' })
    opportunityData({ error, data }) {
        if (data && data.length > 0) {
            this.showQuantityWarning = false; // Réinitialise l'avertissement

            // Mappe chaque ligne pour préparer les données du tableau
            this.opportunityRows = data.map(item => {
                const hasStockError = item.Quantity > item.Quantit_en_stock__c;

                // Si une erreur de stock est détectée, on déclenche le message d'alerte
                if (hasStockError) {
                    this.showQuantityWarning = true;
                }

                return {
                    Id: item.Id,
                    Product2Name: item.Product2?.Name,
                    UnitPrice: item.UnitPrice,
                    TotalPrice: item.TotalPrice,
                    Quantity: item.Quantity,
                    Quantit_en_stock__c: item.Quantit_en_stock__c,
                    Product2Id: item.Product2Id,
                    quantityClass: hasStockError
                        ? 'slds-text-color_error' // Affiche la cellule en rouge
                        : 'slds-text-color_success' // Affiche la cellule en vert
                };
            });

            this.noData = false; // Il y a des données à afficher
        } else {
            this.opportunityRows = [];
            this.noData = true; // Aucune donnée trouvée
        }

        // En cas d’erreur de récupération
        if (error) {
            console.error('Erreur lors de la récupération des données : ', error);
            this.opportunityRows = [];
            this.noData = true;
        }
    }

    // Gère les actions de ligne comme "Voir le produit" ou "Supprimer"
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'view_product':
                // Navigue vers l’enregistrement du produit
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
                // Supprime la ligne sélectionnée
                this.deleteOpportunityLineItem(row.Id);
                break;
        }
    }

    // Supprime un produit lié à l’opportunité
    deleteOpportunityLineItem(recordId) {
        deleteRecord(recordId)
            .then(() => {
                // Mise à jour de la liste après suppression
                this.opportunityRows = this.opportunityRows.filter(item => item.Id !== recordId);
            })
            .catch(error => {
                console.error('Erreur lors de la suppression :', error);
            });
    }
}
