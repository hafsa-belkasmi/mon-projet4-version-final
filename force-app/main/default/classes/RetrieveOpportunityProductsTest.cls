@isTest
public class RetrieveOpportunityProductsTest {

    @isTest
    public static void testGetProducts() {
        // Création d’un produit
        Product2 p = new Product2(Name = 'Produit Test', IsActive = true);
        insert p;

        // Récupération de l’ID du Pricebook standard (correcte et autorisée en test)
        Id pricebookId = Test.getStandardPricebookId();

        // Création d’un PricebookEntry
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = p.Id,
            UnitPrice = 100,
            Pricebook2Id = pricebookId,
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

        // Création d’un OpportunityLineItem
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 2,
            UnitPrice = 100,
            PricebookEntryId = pbe.Id,
            Quantit_en_stock__c = 50 
        );
        insert oli;

        // Exécution du test
        Test.startTest();
        List<OpportunityLineItem> result = RetrieveOpportunityProducts.getProducts(opp.Id);
        Test.stopTest();

        // Vérifications
        System.assertEquals(1, result.size(), 'Il devrait y avoir un seul produit.');
        System.assertEquals(oli.Id, result[0].Id, 'L’ID de la ligne retournée devrait correspondre.');
    }
}
