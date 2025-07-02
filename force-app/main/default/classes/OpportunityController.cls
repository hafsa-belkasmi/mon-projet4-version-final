public with sharing class OpportunityController {

    //  Méthode pour récupérer les lignes de produits liées à une opportunité
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getOpportunityData(Id opportunityId) {
        // Vérification de permission de lecture sur OpportunityLineItem
        if (!Schema.sObjectType.OpportunityLineItem.isAccessible()) {
            throw new AuraHandledException('L’utilisateur n’a pas accès aux lignes de produits.');
        }

        return [
            SELECT Id, Product2.Name, UnitPrice, TotalPrice, Quantity, Quantit_en_stock__c, Product2Id
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];
    }

    // Méthode pour récupérer le profil de l'utilisateur courant
    @AuraEnabled(cacheable=true)
    public static String getUserProfile() {
        Id userId = UserInfo.getUserId();
        
        //  Vérifie l’accès à User et Profile
        if (!Schema.sObjectType.User.isAccessible() || !Schema.sObjectType.Profile.isAccessible()) {
            throw new AuraHandledException('L’utilisateur n’a pas accès aux données de profil.');
        }

        User currentUser = [SELECT Id, Profile.Name FROM User WHERE Id = :userId LIMIT 1];
        return currentUser.Profile.Name;
    }

    // Méthode pour supprimer une ligne de produit liée à l’opportunité
    @AuraEnabled
    public static void deleteOpportunityLineItem(Id recordId) {
        // Vérification de permission de suppression
        if (!Schema.sObjectType.OpportunityLineItem.isDeletable()) {
            throw new AuraHandledException('L’utilisateur n’a pas le droit de supprimer cette ligne.');
        }

        try {
            OpportunityLineItem oli = [SELECT Id FROM OpportunityLineItem WHERE Id = :recordId LIMIT 1];
            delete oli;
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de la suppression : ' + e.getMessage());
        }
    }
}
