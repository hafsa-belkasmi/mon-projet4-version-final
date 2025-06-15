public with sharing class RetrieveOpportunityProducts {

    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getProducts(Id opportunityId) {
        return [
            SELECT Id, Product2.Name, UnitPrice, TotalPrice, Quantity, Quantit_en_stock__c
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];
    }
}
