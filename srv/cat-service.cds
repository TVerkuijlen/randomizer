using randomizer from '../db/data-model';

service CatalogService {

	// [ADDING EXTERNAL SERVICE] - STEP 3 - Add a new entity to the exposed service model:
	// @cds.persistence.skip
	entity Sectors as projection on  randomizer.Sectors;
	entity EmergingTechnologies as projection on  randomizer.EmergingTechnologies;
	entity Processes as projection on  randomizer.Processes;
	entity SAPProducts as projection on  randomizer.SAPProducts;

}
