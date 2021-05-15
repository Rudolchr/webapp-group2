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
 /*   Author.instances["2"] = new Author({
      authorId: 2,
      name: "Douglas Hofstadter"
    });
    Author.instances["3"] = new Author({
      authorId: 3,
      name: "Immanuel Kant"
    });
    Author.saveAll();
    Publisher.instances["Bantam Movies"] = new Publisher({
      name: "Bantam Movies",
      address: "New York, USA"
    });
    Publisher.instances["Basic Movies"] = new Publisher({
      name: "Basic Movies",
      address: "New York, USA"
    });
    Publisher.saveAll();

  */

    Person.saveAll();

    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Kill Bill",
      releaseDate: new Date("2000-1-2"),
      actorsIdRefs: [1,2],
      directorId : 1
    // publisher_id: "Bantam Movies"
    });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Pulp Fiction",
      releaseDate: new Date("2000-1-2"),
      directorId : 2
      // publisher_id: "Bantam Movies"
    });
    //Movie.instances["0553345842"] = new Movie({
    //  movieId: "0553345842",
    //  title: "The Mind's I",
    //  year: 1982,
    //  authorIdRefs: [1,2],
    //  publisher_id: "Bantam Movies"
    //});
    //Movie.instances["1463794762"] = new Movie({
    //  movieId: "1463794762",
    //  title: "The Critique of Pure Reason",
    //  year: 2011,
    //  authorIdRefs: [3]
    //});
    //Movie.instances["1928565379"] = new Movie({
    //  movieId: "1928565379",
    //  title: "The Critique of Practical Reason",
    //  year: 2009,
    //  authorIdRefs: [3]
    //});
    //Movie.instances["0465030793"] = new Movie({
    //  movieId: "0465030793",
    //  title: "I Am A Strange Loop",
    //  year: 2000,
    //  authorIdRefs: [2],
    //  publisher_id: "Basic Movies"
    //});
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
