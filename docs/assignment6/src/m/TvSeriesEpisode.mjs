import Movie from "./Movie.mjs";
import {isNonEmptyString, isIntegerOrIntegerString, cloneObject} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation,
  IntervalConstraintViolation, ReferentialIntegrityConstraintViolation}
  from "../../lib/errorTypes.mjs";

class TvSeriesEpisode extends Movie{
  constructor ({movieId, title, releaseDate, actors,directorId, actorsIdRefs, tvSeriesName, episodeNo}){
    super({movieId, title, releaseDate, actors, directorId,actorsIdRefs})
    this.tvSeriesName = tvSeriesName;
    this.episodeNo = episodeNo;
  }

  get tvSeriesName(){
    return this._tvSeriesName;
  }

  set tvSeriesName(tvsn){
    const validationResult = TvSeriesEpisode.checkTvSeriesName(tvsn);

    if(validationResult instanceof NoConstraintViolation){
      this._tvSeriesName = tvsn;
    } else {
      throw validationResult;
    }
  }

  static checkTvSeriesName(tvsn){
    console.log(tvsn);
    console.log(isNonEmptyString(tvsn));
    if(!tvsn || !isNonEmptyString(tvsn)){
      return new MandatoryValueConstraintViolation("A Series name must be provided!");
    }

    return new NoConstraintViolation();
  }

  get episodeNo(){
    return this._episodeNo;
  }

  set episodeNo(en){
    const validationResult = TvSeriesEpisode.checkEpisodeNo(en);

    if(validationResult instanceof NoConstraintViolation){
      this._episodeNo = parseInt(en);
    } else {
      throw validationResult;
    }
  }

  static checkEpisodeNo(en){
    if(!en || !isIntegerOrIntegerString(en)){
      return new MandatoryValueConstraintViolation("An episode number must be provided!");
    }

    return new NoConstraintViolation();
  }
}

TvSeriesEpisode.instances = {};

/**
 *  Create a new movie record/object
 */
TvSeriesEpisode.add = function (slots) {
  var movie = null;
  try {
    movie = new TvSeriesEpisode( slots);
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    TvSeriesEpisode.instances[movie.movieId] = movie;
    console.log( `${movie.toString()} created!`);
  }
};
/**
 *  Update an existing Movie record/object
 *  properties are updated with implicit setters for making sure
 *  that the new values are validated
 */
TvSeriesEpisode.update = function ({movieId, title, releaseDate,
    actorIdRefsToAdd, actorIdRefsToRemove, directorId}){
  const movie = TvSeriesEpisode.instances[movieId],
      objectBeforeUpdate = cloneObject( movie);  // save the current state of movie
  var noConstraintViolated = true, updatedProperties = [];
  try {
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
      console.log("remove");
      console.log(actorIdRefsToRemove);
      updatedProperties.push("actors(removed)");
      for (let actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
    if(movie.directorId && movie.directorId.name !== directorId) {
      movie.directorId = directorId;
      updatedProperties.push("directorId");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    TvSeriesEpisode.instances[movieId] = objectBeforeUpdate;
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
TvSeriesEpisode.destroy = function (movieId) {
  if (TvSeriesEpisode.instances[movieId]) {
    console.log( `${TvSeriesEpisode.instances[movieId].toString()} deleted!`);
    delete TvSeriesEpisode.instances[movieId];
  } else {
    console.log( `There is no movie with MovieID ${movieId} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects
 *  Precondition: people must be loaded first
 */
TvSeriesEpisode.retrieveAll = function () {
  console.log("Retrieve Series");
  var movies = {};
  try {
    if (!localStorage["tvSeriesEpisode"]) localStorage["tvSeriesEpisode"] = "{}";
    else {
      movies = JSON.parse( localStorage["tvSeriesEpisode"]);
      console.log( `${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (let movieId of Object.keys( movies)) {

    try {
      console.log("retrieve");
      console.log(movies[movieId]);
      TvSeriesEpisode.instances[movieId] = new TvSeriesEpisode( movies[movieId]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};

/**
 *  Save all movie objects
 */
TvSeriesEpisode.saveAll = function () {
  console.log("series save");
  const nmrOfMovies = Object.keys( TvSeriesEpisode.instances).length;
  try {
    localStorage["tvSeriesEpisode"] = JSON.stringify( TvSeriesEpisode.instances);
    console.log( `${nmrOfMovies} tvSeries records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default TvSeriesEpisode;
