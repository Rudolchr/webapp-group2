/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 * @author Gerd Wagner
 */
import Person from "./Person.mjs";
import Actor from "./Actor.mjs";
import Director from "./Director.mjs";
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
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    this.directorId = directorId;
    // assign object references or ID references (to be converted in setter)
    if (actors || actorsIdRefs){
      this.actors = actors || actorsIdRefs;
    } else {
      this.actors = [];
    }
  }
  get movieId() {
    return this._movieId;
  }
  static checkMovieId( movieId) {
    // Check if Number
    if(!isIntegerOrIntegerString(movieId)){
      return new RangeConstraintViolation("The MovieID must be an unsigned integer!");
    } else{
      return new NoConstraintViolation();
    }
  }
  static checkMovieIdAsId( movieId) {
    let validationResult = Movie.checkMovieId( movieId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieId) {
        // Is there input
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the MovieID must be provided!");
      } else if (Movie.instances[movieId]) {
        // id already taken
        validationResult = new UniquenessConstraintViolation(
            `There is already a movie record with MovieID ${movieId}`);
      } else if(movieId < 1){
        // Non positive integer
        validationResult = new RangeConstraintViolation("The MovieID must be a positive integer!");
      } else {
        // fine
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
  }
  static checkTitle(t){
    if(!t){
      // Is there a title?
      return new MandatoryValueConstraintViolation("A title must be provided!");
    } else if(!isNonEmptyString(t)){
      // Title empty
      return new RangeConstraintViolation("The title must be a non-empty String!");
    } else{
      // Fine
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
  }
  static checkReleaseDate(date){
    if(!date){
      // Date given?
      return new MandatoryValueConstraintViolation("A Release Date must be provided");
    }
    let strDate = null;
    if(date instanceof Date){
      // convert to string form for ease of computation
      strDate = date.getFullYear() + "-" +
        (date.getMonth() + 1) + "-" +
        date.getDate();
    } else if(typeof(date) == "string"){
      if(!isNonEmptyString(date)){
        // Given as string and empty
        return new MandatoryValueConstraintViolation("A Release Date must be provided");
      }
      strDate = date;
    } else{
      // Wrong type given
      return new RangeConstraintViolation("Wrong type given as Date");
    }

    // check if in correct format for further validation?
    if((strDate.match(/-/g) || []).length != 2){
      return new RangeConstraintViolation("Expected format as YYY-MM-DD");
    }

    const tmpDate = new Date(strDate);
    strDate = tmpDate.getFullYear() + "-" + (tmpDate.getMonth() + 1) + "-" + tmpDate.getDate();

    let tmp = strDate.split('-');
    let ymd = [];
    let mon31day = [1, 3, 5, 7, 8, 10, 12]; // Months with 31 days

    if(tmp.length === 3){
      if(!(isIntegerOrIntegerString(tmp[0]) &&
        isIntegerOrIntegerString(tmp[1]) &&
        isIntegerOrIntegerString(tmp[2])))
      {
        // Could not extract date numbers
        return new RangeConstraintViolation("Expected format as YYYY-MM-DD");
      }
      ymd = [parseInt(tmp[0]), parseInt(tmp[1]), parseInt(tmp[2])];
      // Filter out dates < 1895-12-28
      if(ymd[0] < 1895){
        return new IntervalConstraintViolation("The release date must be greater then 1895-12-28");
      } else if(ymd[0] == 1895 && ymd[1] < 12){
        return new IntervalConstraintViolation("The release date must be greater then 1895-12-28");
      } else if(ymd[0] == 1895 && ymd[1] == 12 && ymd[2] < 28){
        return new IntervalConstraintViolation("The release date must be greater then 1895-12-28");
      }

      // Day range check
      if(typeof(mon31day.find(m => m === ymd[1])) !== 'undefined'){
        if(ymd[2] > 31 || ymd[2] < 1){
          return new IntervalConstraintViolation("This Date does not exist");
        }
      } else{
        if(ymd[2] > 30 || ymd[2] < 1){
          return new IntervalConstraintViolation("This Date does not exist");
        }
      }

      // Month range check
      if(ymd[1] < 1 || ymd[1] > 12){
        return new IntervalConstraintViolation("This Date does not exist");
      }

      /*
       * intercalary year
       * Each 4 years is an intercalary year.
       * If year % 100 is 0 then it is no intercalary year
       * except year % 100 && year % 400 is true
       *
       * https://klexikon.zum.de/wiki/Schaltjahr
       */
      let schalt = !(ymd[0] % 4) && ((ymd[0] % 100) || !(ymd[0] % 400));

      // Range test for days
      if(ymd[2] < 1 || ymd[2] > 31){
        return new IntervalConstraintViolation("A day must be given in the range 1 - 31");

      // Range test for months
      } else if(ymd[1] < 0 || ymd[1] > 12){
        return new IntervalConstraintViolation("Months range from 1 to 12");

      // intercalary year specials for february
      } else if(schalt){
        if(ymd[1] == 2 && ymd[2] > 29){
          return new IntervalConstraintViolation("February cannot have more then 29 days");
        }
      } else if(!schalt){
        if(ymd[1] == 2 && ymd[2] > 28){
          return new IntervalConstraintViolation("Seems this is not an intercalary year");
        }
      }
    } else{
      return new RangeConstraintViolation("Expected format as YYYY-MM-DD");
    }

    return new NoConstraintViolation();
  }
  get directorId(){
    return this._directorId;
  }
  set directorId(d){
    const validationResult = Movie.checkDirector(d);
    if(validationResult instanceof NoConstraintViolation){
      if(typeof(d) === "number"){
        this._directorId = Director.instances[String(d)];
      } else {
        this._directorId = Director.instances[String(d.personId)];
      }
      //delete this._directorId._directedMovies[this.movieId];
      //this._directorId._directedMovies[this.movieId] = this;
    } else{
      throw validationResult;
    }
  }
  static checkDirector(d){
    if(!d){
      // is given
      return new MandatoryValueConstraintViolation("A Director must be provided!");
    } else if(typeof(d) === "object"){
    //} else if(d instanceof Person){
      if(!Director.instances[String(d.personId)]){
        // Person does not exist
        return new ReferentialIntegrityConstraintViolation("There is no Person with ID " + d);
      } else{
        return new NoConstraintViolation();
      }
    } else if(typeof(d) === "number"){
      if(!Director.instances[String(d)]){
        // Person does not exist
        return new ReferentialIntegrityConstraintViolation("Could not find this Person");
      } else{
        return new NoConstraintViolation();
      }
    } else {
      return new RangeConstraintViolation("Expected number or Directorobject");
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
      validationResult = Actor.checkActorIdAsIdRef( actor_id);
    }
    return validationResult;
  }
  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    const validationResult = Movie.checkActor( actor_id);

    if (actor_id && validationResult instanceof NoConstraintViolation) {
      // add the new actor reference
      const key = String( actor_id);
      this._actors[key] = Actor.instances[key];
      // automatically add the derived inverse reference
      //this._actors[key]._playedMovies[this._movieId] = this;
    } else {
      throw validationResult;
    }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId; // was .actorId
    const validationResult = Movie.checkActor( actor_id);
    if (validationResult instanceof NoConstraintViolation) {
      const key = String( actor_id);
      //delete this._actors[key]._playedMovies[this._movieId];
      // delete the actor reference
      delete this._actors[key];
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
    let movieStr = `Movie{ MovieID: ${this._movieId}, title: ${this._title}, releaseDate: ${this._releaseDate},
    director: ${this._directorId}`;
    if (this._actors) movieStr += `, actors: ${Object.keys( this._actors).join(",")} }`;
    return `${movieStr}`;
  }
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify
    let rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
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

Movie.heap = {};
Movie.subtypes = [];

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
    Movie.heap[movie.movieId] = movie;
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
  const movie = Movie.heap[movieId],
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
      movie.directorId = directorId;
      updatedProperties.push("directorId");
    }

    let found = 0;
    for(const i in Movie.instances){
      if(i === movieId){
        found = 1;
      }
    }
    if(found !== 1){
      const slots = {
        movieId: movie.movieId,
        title: movie.title,
        releaseDate: movie.releaseDate,
        directorId: movie.directorId,
        actors: movie.actors
      }
      Movie.instances[movieId] = new Movie(slots);
      delete Movie.heap[movieId];
      Movie.heap[movieId] = Movie.instances[movieId];

      for(const i in Movie.subtypes){
        for(const j in Movie.subtypes[i].instances){
          if(Movie.subtypes[i].instances[j].movieId === movie.movieId){
            delete Movie.subtypes[i].instances[j];
          }
        }
      }
    }

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
 *  Precondition: people must be loaded first
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
      Movie.instances[movieId] = new Movie( movies[movieId]);
      Movie.heap[movieId] = Movie.instances[movieId];
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
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
