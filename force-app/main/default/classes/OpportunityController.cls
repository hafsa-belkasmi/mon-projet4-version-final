public with sharing class OpportunityController {

    // Méthode accessible depuis le composant LWC
    // Elle retourne la liste des produits liés à une opportunité spécifique
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getOpportunityData(Id opportunityId) {
        return [
            SELECT Id, Product2.Name, UnitPrice, TotalPrice, Quantity, Quantit_en_stock__c, Product2Id
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];
    }

    // Méthode accessible depuis Le omposant LWC 
    // Elle retourne le nom du profil de l'utilisateur actuellement connecté
    @AuraEnabled(cacheable=true)
    public static String getUserProfile() {
        // Récupère l'identifiant de l'utilisateur courant
        Id userId = UserInfo.getUserId();

        // Requête pour récupérer l'utilisateur avec son profil
        User currentUser = [SELECT Id, Profile.Name FROM User WHERE Id = :userId LIMIT 1];

        // Affiche le nom du profil dans les logs 
        System.debug('currentUser' + currentUser.Profile.Name);

        // Retourne le nom du profil
        return currentUser.Profile.Name;
    }
}
