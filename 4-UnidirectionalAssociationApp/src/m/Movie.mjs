/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 * @author Gerd Wagner
 */
import Person from "./Person.mjs";
import {cloneObject, isIntegerOrIntegerString, isNonEmptyString} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation,
  IntervalConstraintViolation, ReferentialIntegrityConstraintViolation}
  from "../../lib/errorTypes.mjs";

/**
 * The class Movie
 * @class
 */
class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, actors,directorId,actorsIdRefs}) {
                 //publisher, publisher_id}) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    this.directorId = directorId;
    // assign object references or ID references (to be converted in setter)
    if (actors || actorsIdRefs){
      this.actors = actors || actorsIdRefs;
    }
  //  if (publisher || publisher_id) {
  //    this.publisher = publisher || publisher_id;
  //  }
  }
  get movieId() {
    return this._movieId;
  }
  static checkMovieId( movieId) {
    if(!isIntegerOrIntegerString(movieId)){
      return new RangeConstraintViolation("The MovieID must be an unsigned integer!");
    } else{
      return new NoConstraintViolation();
    }
    //if (!movieId) return new NoConstraintViolation();
    //else if (typeof movieId !== "string" || movieId.trim() === "") {
    //  return new RangeConstraintViolation(
    //      "The MovieID must be a non-empty string!");
    //} else if (!/\b\d{9}(\d|X)\b/.test( movieId)) {
    //  return new PatternConstraintViolation("The MovieID must be "+
    //      "a 10-digit string or a 9-digit string followed by 'X'!");
    //} else {
    //  return new NoConstraintViolation();
    //}
  }
  static checkMovieIdAsId( movieId) {
    let validationResult = Movie.checkMovieId( movieId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieId) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the MovieID must be provided!");
      } else if (Movie.instances[movieId]) {
        validationResult = new UniquenessConstraintViolation(
            `There is already a movie record with MovieID ${movieId}`);
      } else if(movieId < 1){
        validationResult = new RangeConstraintViolation("The MovieID must be a positive integer!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieId( n) {
    const validationResult = Movie.checkMovieIdAsId( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  set title( t) {
    const validationResult = Movie.checkTitle(t);
    if(validationResult instanceof NoConstraintViolation){
      this._title = t;
    } else{
      throw validationResult;
    }
    //SIMPLIFIED CODE: no validation with Movie.checkTitle
    //this._title = t;
  }
  static checkTitle(t){
    if(!t){
      return new MandatoryValueConstraintViolation("A title must be provided!");
    } else if(!isNonEmptyString(t)){
      return new RangeConstraintViolation("The title must be a non-empty String!");
    } else{
      return new NoConstraintViolation();
    }
  }
  get releaseDate() {
    return this._releaseDate;
  }
  set releaseDate( y) {
    const validationResult = Movie.checkReleaseDate(y);
    if(validationResult instanceof NoConstraintViolation){
      this._releaseDate = y;
    } else{
      throw validationResult;
    }
    //SIMPLIFIED CODE: no validation with Movie.checkReleaseDate
    //this._releaseDate = parseInt( y);
  }
  static checkReleaseDate(date){
    let strDate = null;
    if(date instanceof Date){
      //console.log("is Date");
      strDate = date.getFullYear() + "-" +
        (date.getMonth() + 1) + "-" +
        date.getDate();
    } else if(typeof(date) == "string"){
      strDate = date;
    } else{
      return new RangeConstraintViolation("Wrong type given as Date");
    }

    if(!isNonEmptyString(strDate)){
      return new MandatoryValueConstraintViolation();
    }

    let tmp = strDate.split('-');
    let ymd = [];

    if(tmp.length === 3){
      ymd = [parseInt(tmp[0]), parseInt(tmp[1]), parseInt(tmp[2])];

      // Filter out dates < 1895-12-28
      if(ymd[0] < 1895){
        return new IntervalConstraintViolation("The release date must be greater then 1895-12-28");
      } else if(ymd[0] == 1895 && ymd[1] < 12){
        return new IntervalConstraintViolation("The release date must be greater then 1895-12-28");
      } else if(ymd[0] == 1895 && ymd[1] == 12 && ymd[2] < 28){
        return new IntervalConstraintViolation("The release date must be greater then 1895-12-28");
      }
    }

    return new NoConstraintViolation();
  }
  get directorId(){
    return this._directorId;
  }
  set directorId(d){
    const validationResult = Movie.checkDirector(d);
    console.log(validationResult);
    if(validationResult instanceof NoConstraintViolation){
      if(typeof(d) === "number"){
        this._directorId = Person.instances[String(d)];
      } else {
        this._directorId = Person.instances[String(d.personId)];
      }
    } else{
      throw validationResult;
    }
  }
  static checkDirector(d){
    if(!d){
      return new MandatoryValueConstraintViolation("A Director must be provided!");
    } else if(typeof(d) === "object"){
      if(!Person.instances[String(d.personId)]){
        return new ReferentialIntegrityConstraintViolation("There is no Person with ID " + id);
      } else{
        return new NoConstraintViolation();
      }
    } else if(typeof(d) === "number"){
      if(!Person.instances[String(d)]){
        return new ReferentialIntegrityConstraintViolation("There is no Person with ID " + id);
      } else{
        return new NoConstraintViolation();
      }
    }
  }
  get actors() {
    return this._actors;
  }
  static checkActor( actor_id) {
    let validationResult = null;
    if (!actor_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( actor_id);
    }
    return validationResult;
  }
  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    const validationResult = Movie.checkActor( actor_id);
    if (actor_id && validationResult instanceof NoConstraintViolation) {
      // add the new actor reference
      const key = String( actor_id);
      this._actors[key] = Person.instances[key];
    } else {
      throw validationResult;
    }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    const validationResult = Movie.checkActor( actor_id);
    if (validationResult instanceof NoConstraintViolation) {
      // delete the actor reference
      delete this._actors[String( actor_id)];
    } else {
      throw validationResult;
    }
  }
  set actors( a) {
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }
  // Serialize movie object
  toString() {
    let movieStr = `Movie{ MovieID: ${this._movieId}, title: ${this._title}, releaseDate: ${this._releaseDate}`;
    //if (this.publisher) movieStr += `, publisher: ${this.publisher.name}`;
    if (this._actors) movieStr += `, actors: ${Object.keys( this._actors).join(",")} }`;
    return `${movieStr}`;
  }
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify
    var rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
      /*  case "_publisher":
          // convert object reference to ID reference
          if (this._publisher) rec.publisher_id = this._publisher.name;
          break; */
        case "_actors":
          // convert the map of object references to a list of ID reference
          if (this._actors) {
            rec.actorsIdRefs = [];

            for (const actorIdStr of Object.keys(this._actors)) {
              rec.actorsIdRefs.push(parseInt(actorIdStr));
            }
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/********************************************************
*** Class-level ("static") storage management methods ***
*********************************************************/
/**
 *  Create a new movie record/object
 */
Movie.add = function (slots) {
  var movie = null;
  try {
    movie = new Movie( slots);
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    Movie.instances[movie.movieId] = movie;
    console.log( `${movie.toString()} created!`);
  }
};
/**
 *  Update an existing Movie record/object
 *  properties are updated with implicit setters for making sure
 *  that the new values are validated
 */
Movie.update = function ({movieId, title, releaseDate,
    actorIdRefsToAdd, actorIdRefsToRemove, directorId}){
  // publisher_id}) {
  const movie = Movie.instances[movieId],
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
      updatedProperties.push("actors(removed)");
      for (let actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
    if(movie.directorId && movie.directorId.name !== directorId) {
      let dir = -1;
      for(const id in Person.instances){
        if(Person.instances[id].name === directorId){
          dir = parseInt(id);
        }
      }

      movie.directorId = dir;
      updatedProperties.push("directorId");
    }
    // publisher_id may be the empty string for unsetting the optional property
   /* if (publisher_id && (!movie.publisher && publisher_id ||
        movie.publisher && movie.publisher.name !== publisher_id)) {
      movie.publisher = publisher_id;
      updatedProperties.push("publisher");
    }*/
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieId] = objectBeforeUpdate;
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
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log( `${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log( `There is no movie with MovieID ${movieId} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects
 *  Precondition: publishers and people must be loaded first
 */


Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) localStorage["movies"] = "{}";
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log( `${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (let movieId of Object.keys( movies)) {

    try {
      console.log("movie instance")
      console.log(movies[movieId]);
      Movie.instances[movieId] = new Movie( movies[movieId]);
      console.log(Movie.instances[movieId]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
  console.log("Loaded movies:");
  console.log(Movie.instances);
};

/**
 *  Save all movie objects
 */


Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log( `${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
