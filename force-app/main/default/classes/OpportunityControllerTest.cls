@isTest
public class OpportunityControllerTest {

    //Test pour getOpportunityData
    @isTest
    static void testGetOpportunityData() {
        // Créer un produit
        Product2 p = new Product2(Name = 'Produit Test', IsActive = true);
        insert p;

        // Obtenir l’ID du Pricebook standard
        Id standardPricebookId = Test.getStandardPricebookId();

        // Créer une entrée de Pricebook
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = p.Id,
            UnitPrice = 100,
            Pricebook2Id = standardPricebookId,
            IsActive = true
        );
        insert pbe;

        // Créer une opportunité
        Opportunity opp = new Opportunity(
            Name = 'Test Opp',
            StageName = 'Prospecting',
            CloseDate = Date.today()
        );
        insert opp;

        // Créer une ligne de produit
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 2,
            UnitPrice = 100,
            PricebookEntryId = pbe.Id
        );
        insert oli;

        // Appeler la méthode à tester
        Test.startTest();
        List<OpportunityLineItem> results = OpportunityController.getOpportunityData(opp.Id);
        Test.stopTest();

        // Vérifier le résultat
        System.assertEquals(1, results.size(), 'Une ligne de produit aurait dû être récupérée.');
        System.assertEquals(oli.Id, results[0].Id, 'La ligne récupérée devrait correspondre.');
    }

    // Test pour deleteOpportunityLineItem
    @isTest
    static void testDeleteOpportunityLineItem() {
        // Créer un produit
        Product2 p = new Product2(Name = 'Produit Test', IsActive = true);
        insert p;

        // Obtenir l’ID du Pricebook standard
        Id standardPricebookId = Test.getStandardPricebookId();

        // Créer une entrée de Pricebook
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = p.Id,
            UnitPrice = 100,
            Pricebook2Id = standardPricebookId,
            IsActive = true
        );
        insert pbe;

        // Créer une opportunité
        Opportunity opp = new Opportunity(
            Name = 'Test Opp',
            StageName = 'Prospecting',
            CloseDate = Date.today()
        );
        insert opp;

        // Créer une ligne de produit
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 1,
            UnitPrice = 100,
            PricebookEntryId = pbe.Id
        );
        insert oli;

        // Supprimer la ligne via la méthode à tester
        Test.startTest();
        OpportunityController.deleteOpportunityLineItem(oli.Id);
        Test.stopTest();

        // Vérifier que la ligne a été supprimée
        List<OpportunityLineItem> results = [
            SELECT Id FROM OpportunityLineItem WHERE Id = :oli.Id
        ];
        System.assertEquals(0, results.size(), 'La ligne de produit aurait dû être supprimée.');
    }
}
