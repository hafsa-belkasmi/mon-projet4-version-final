public with sharing class OpportunityController {
    
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getOpportunityData(Id opportunityId) {
        return [
            SELECT Id, Product2.Name, UnitPrice, TotalPrice, Quantity, Quantit_en_stock__c, Product2Id
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];
    }

     @AuraEnabled(cacheable=true)
    public static String getUserProfile() {
        // Récupère l'utilisateur courant et son profil
        Id userId = UserInfo.getUserId();
        User currentUser = [SELECT Id, Profile.Name FROM User WHERE Id = :userId LIMIT 1];
        System.debug('currentUser'+currentUser.Profile.Name);
        return currentUser.Profile.Name;
    }
}
