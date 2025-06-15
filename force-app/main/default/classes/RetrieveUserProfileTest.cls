@isTest
private class RetrieveUserProfileTest {

    @isTest
    static void testGetCurrentUserProfileName() {
        // Juste pour couvrir le code. Ne retournera rien de significatif en test.
        Test.startTest();
        String profileName = RetrieveUserProfile.getCurrentUserProfileName();
        Test.stopTest();
        System.assertNotEquals(null, profileName);
    }
}
