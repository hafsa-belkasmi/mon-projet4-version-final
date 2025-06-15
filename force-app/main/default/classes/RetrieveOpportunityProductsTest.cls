@isTest
public class RetrieveOpportunityProductsTest {

    @isTest
    public static void testGetProducts() {
        // Création d’un produit
        Product2 p = new Product2(Name = 'Produit Test', IsActive = true);
        insert p;

        // Création d’un prix standard
        Pricebook2 pb = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = p.Id,
            Pricebook2Id = pb.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert pbe;

        // Création d’une opportunité
        Opportunity opp = new Opportunity(
            Name = 'Opportunité Test',
            CloseDate = Date.today().addDays(10),
            StageName = 'Prospecting'
        );
        insert opp;

        // Création d’un produit lié à l’opportunité
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 2,
            UnitPrice = 100,
            PricebookEntryId = pbe.Id,
            Quantit_en_stock__c = 50
        );
        insert oli;

        // Appel de la méthode à tester
        Test.startTest();
        List<OpportunityLineItem> result = RetrieveOpportunityProducts.getProducts(opp.Id);
        Test.stopTest();

        System.assertEquals(1, result.size());
        System.assertEquals(oli.Id, result[0].Id);
    }
}
