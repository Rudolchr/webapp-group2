/**
 * @fileOverview  Auxiliary data management procedures
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Person.instances["1"] = new Person({
      personId: 1,
      name: "Quentin Tarantino"
    });
    Person.instances["2"] = new Person({
      personId: 2,
      name: "Uma Thurman"
    });

    Person.saveAll();

    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Kill Bill",
      releaseDate: new Date("2000-1-2"),
      directorId : 1,
      actorsIdRefs: [1,2]
    });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Pulp Fiction",
      releaseDate: new Date("2000-1-2"),
      directorId : 2
    });
    console.log(Movie.instances);
    Movie.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      Person.instances = {};
      localStorage["people"] = "{}";
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
