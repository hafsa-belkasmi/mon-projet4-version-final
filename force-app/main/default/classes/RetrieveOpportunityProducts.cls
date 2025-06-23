// Classe Apex qui respecte les règles de partage des données
public with sharing class RetrieveOpportunityProducts {

    // Méthode accessible en LWC
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getProducts(Id opportunityId) {
        // Retourne les produits liés à l'opportunité passée en paramètre
        return [
            SELECT Id, Product2.Name, UnitPrice, TotalPrice, Quantity, Quantit_en_stock__c
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];
    }
}
