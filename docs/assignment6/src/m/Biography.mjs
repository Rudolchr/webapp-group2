import Movie from "./Movie.mjs";
import TvSeriesEpisode from "./TvSeriesEpisode.mjs"
import Person from "./Person.mjs";
import Actor from "./Actor.mjs";
import Director from "./Director.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation,
  IntervalConstraintViolation, ReferentialIntegrityConstraintViolation}
  from "../../lib/errorTypes.mjs";
import {isIntegerOrIntegerString, cloneObject} from "../../lib/util.mjs";

class Biography extends Movie{
  constructor ({movieId, title, releaseDate, actors,directorId, actorsIdRefs, about}){
    super({movieId, title, releaseDate, actors, directorId,actorsIdRefs});
    this.about = about;
  }

  get about(){
    return this._about;
  }

  set about(a){
    const validationResult = Biography.checkAbout(a);
    if(validationResult instanceof NoConstraintViolation){
      if(typeof(a) === "number"){
        this._about = Person.instances[String(a)];
      } else if(typeof(a) === "string"){
        this._about = Person.instances[a];
      } else{
        this._about = Person.instances[String(a.personId)];
      }
    } else {
      throw validationResult;
    }
  }

  static checkAbout(a){
    if(!a){
      // is given
      return new MandatoryValueConstraintViolation("A Person this Biography is about must be provided!");
    } else if(typeof(a) === "object"){
      if(!Person.instances[String(a.personId)]){
        // Person does not exist
        return new ReferentialIntegrityConstraintViolation("There is no Person with ID " + a);
      } else{
        return new NoConstraintViolation();
      }
    } else if(typeof(a) === "number"){
      if(!Person.instances[String(a)]){
        // Person does not exist
        return new ReferentialIntegrityConstraintViolation("Could not find this Person");
      } else{
        return new NoConstraintViolation();
      }
    } else if(typeof(a) === "string"){
      if(!isIntegerOrIntegerString(a)){
        return new RangeConstraintViolation("Could not parse input to a number");
      } else{
        if(!Person.instances[a]){
          // Person does not exist
          return new ReferentialIntegrityConstraintViolation("Could not find this Person");
        } else{
          return new NoConstraintViolation();
        }
      }
    } else {
      return new RangeConstraintViolation("This should not happen");
    }
  }
}

Biography.instances = {};
Movie.subtypes.push(Biography);

function mergeMovies(list){
  let ret = {};
  for(const i in list){
    for(const j in list[i].instances){
      ret[j] = list[i].instances[j];
    }
  }

  return ret;
}

/**
 *  Create a new movie record/object
 */
Biography.add = function (slots) {
  var movie = null;
  try {
    movie = new Biography( slots);
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    Biography.instances[movie.movieId] = movie;
    Movie.heap[movie.movieId] = movie;
    console.log( `${movie.toString()} created!`);
  }
};
/**
 *  Update an existing Movie record/object
 *  properties are updated with implicit setters for making sure
 *  that the new values are validated
 */
Biography.update = function ({movieId, title, releaseDate,
    actorIdRefsToAdd, actorIdRefsToRemove, directorId, about}){
  const movie = Movie.heap[movieId],//mergeMovies({Biography, Movie, TvSeriesEpisode})[movieId],//Biography.instances[movieId],
      objectBeforeUpdate = cloneObject( movie);  // save the current state of movie
  var noConstraintViolated = true, updatedProperties = [];
  try {
    let aboutId = about;
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== parseInt( releaseDate)) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (let actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (let actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
    if(movie.directorId && movie.directorId.name !== directorId) {
      movie.directorId = directorId;
      updatedProperties.push("directorId");
    }

    if(!(movie instanceof Biography)){
      const slots = {
        movieId: movie.movieId,
        title: movie.title,
        releaseDate: movie.releaseDate,
        directorId: movie.directorId,
        actors: movie.actors,
        about: aboutId
      }

      if(Movie.instances[movieId]){
        delete Movie.instances[movieId];
      } else if(TvSeriesEpisode.instances[movieId]){
        delete TvSeriesEpisode.instances[movieId];
      }

      Biography.instances[movieId] = new Biography(slots);
      delete Movie.heap[movieId];
      Movie.heap[movieId] = Biography.instances[movieId];
    } else {
        if(aboutId && movie.about !== aboutId){
          movie.about = aboutId;
        }
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Biography.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log( `No property value changed for movie ${movie.movieId}!`);
    }
  }
};
/**
 *  Delete an existing Movie record/object
 */
Biography.destroy = function (movieId) {
  if (Biography.instances[movieId]) {
    console.log( `${Biography.instances[movieId].toString()} deleted!`);
    delete Biography.instances[movieId];
    delete Movie.heap[movieId];
    //delete Movie.instances[movieId];
  } else {
    console.log( `There is no movie with MovieID ${movieId} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects
 *  Precondition: people must be loaded first
 */
Biography.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["biography"]) localStorage["biography"] = "{}";
    else {
      movies = JSON.parse( localStorage["biography"]);
      console.log( `${Object.keys( movies).length} biography records loaded.`);
    }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (let movieId of Object.keys( movies)) {

    try {
      Biography.instances[movieId] = new Biography( movies[movieId]);
      Movie.heap[movieId] = Biography.instances[movieId];
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};

/**
 *  Save all movie objects
 */


Biography.saveAll = function () {
  const nmrOfMovies = Object.keys( Biography.instances).length;
  try {
    localStorage["biography"] = JSON.stringify( Biography.instances);
    console.log( `${nmrOfMovies} Biography records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Biography;
