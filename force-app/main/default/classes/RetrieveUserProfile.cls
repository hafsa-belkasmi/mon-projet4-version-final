public with sharing class RetrieveUserProfile {

    @AuraEnabled(cacheable=true)
    public static String getCurrentUserProfileName() {
        // Récupère l'utilisateur courant et son profil
        Id userId = UserInfo.getUserId();
        User currentUser = [SELECT Id, Profile.Name FROM User WHERE Id = :userId LIMIT 1];
        System.debug('currentUser'+currentUser.Profile.Name);
        return currentUser.Profile.Name;
    }
}

