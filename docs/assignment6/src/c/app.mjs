/**
 * @fileOverview  Auxiliary data management procedures
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import Movie from "../m/Movie.mjs";
import TvSeriesEpisode from "../m/TvSeriesEpisode.mjs";
import Biography from "../m/Biography.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Person.instances["16"] = new Person({
      personId: 16,
      name: "John Forbes Nash"
    });
    Person.instances["17"] = new Person({
      personId: 17,
      name: "John Doe"
    });
    Person.instances["18"] = new Person({
      personId: 18,
      name: "Jane Doe"
    });
    Person.saveAll();
    Director.instances["1"] = new Director({
      personId: 1,
      name: "Stephen Frears"
    });
    Director.instances["2"] = new Director({
      personId: 2,
      name: "George Lucas"
    });
    Director.instances["3"] = new Director({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Actor.instances["3"] = new Actor({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Actor.instances["5"] = new Actor({
      personId: 5,
      name: "Uma Thurman",
      agent: 17
    });
    Actor.instances["6"] = new Actor({
      personId: 6,
      name: "John Travolta"
    });
    Actor.instances["7"] = new Actor({
      personId: 7,
      name: "Ewan McGregor"
    });
    Actor.instances["8"] = new Actor({
      personId: 8,
      name: "Natalie Portman"
    });
    Actor.instances["9"] = new Actor({
      personId: 9,
      name: "Keanu Reeves",
      agent: 18
    });
    Actor.instances["10"] = new Actor({
      personId: 10,
      name: "Russell Crowe",
      agent: 18
    });
    Director.instances["10"] = new Director({
      personId: 10,
      name: "Russell Crowe"
    });
    Actor.instances["11"] = new Actor({
      personId: 11,
      name: "Seth MacFarlane"
    });
    Actor.instances["12"] = new Actor({
      personId: 12,
      name: "Naomi Watts"
    });
    Director.instances["13"] = new Director({
      personId: 13,
      name: "Daniel Minahan"
    });
    Actor.instances["14"] = new Actor({
      personId: 14,
      name: "Ed Harris",
      agent: 17
    });
    Director.instances["15"] = new Director({
      personId: 15,
      name: "Marc Forster"
    });

    Actor.saveAll();
    Director.saveAll();

    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Pulp Fiction",
      releaseDate: new Date("1994-05-12"),
      directorId : 3,
      actorsIdRefs: [3,5,6]
    });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Star Wars",
      releaseDate: new Date("1977-05-25"),
      directorId : 2,
      actorsIdRefs: [7,8]
    });
    Movie.instances["3"] = new Movie({
      movieId: 3,
      title: "Dangerous Liaisons",
      releaseDate: new Date("1988-12-16"),
      directorId : 1,
      actorsIdRefs: [9,5]
    });
    Movie.instances["6"] = new Movie({
      movieId: 6,
      title: "Stay",
      releaseDate: new Date("2005-9-24"),
      directorId : 15,
      actorsIdRefs: [7,12]
    });
    Movie.saveAll();
    TvSeriesEpisode.instances["4"] = new TvSeriesEpisode({
      movieId: 4,
      title: "2015",
      releaseDate: new Date("2019-6-30"),
      directorId : 1,
      actorsIdRefs: [10,11,12],
      tvSeriesName: "The Loudest Voice",
      episodeNo: 8
    }
    );

    TvSeriesEpisode.saveAll();

    Biography.instances["5"] = new Biography({
      movieId: 5,
      title: "A Beautiful Mind",
      releaseDate: new Date("2001-12-21"),
      directorId : 10,
      actorsIdRefs: [10,14],
      about: 16
    });
    Biography.saveAll();
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
