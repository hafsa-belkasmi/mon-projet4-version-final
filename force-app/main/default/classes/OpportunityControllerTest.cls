@isTest
private class OpportunityControllerTest {
    @isTest
    static void testGetOpportunityData() {
        // Créer un produit
        Product2 p = new Product2(Name = 'Produit Test', IsActive = true);
        insert p;

        // Créer un prix standard
        Pricebook2 pb = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = p.Id,
            UnitPrice = 100,
            Pricebook2Id = pb.Id,
            IsActive = true
        );
        insert pbe;

        // Créer une opportunité
        Opportunity opp = new Opportunity(Name='Test Opp', StageName='Prospecting', CloseDate=Date.today());
        insert opp;

        // Créer une ligne d’opportunité
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

        // Vérification
        System.assertEquals(1, results.size());
        System.assertEquals(oli.Id, results[0].Id);
    }
}