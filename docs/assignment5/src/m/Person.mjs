/**
 * @fileOverview  The model class Person with property definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 * @author Gerd Wagner
 */
import Movie from "./Movie.mjs";
import {cloneObject, isNonEmptyString} from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation,
  ReferentialIntegrityConstraintViolation }
  from "../../lib/errorTypes.mjs";

/**
 * The class Person
 * @class
 * @param {object} slots - Object creation slots.
 */
class Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name}) {
    // assign properties by invoking implicit setters
    this.personId = personId;  // number (integer)
    this.name = name;  // string

    // derived inverse reference property (inverse of Movie::director)
    this._directedMovies = {};  // initialize as an empty map of Movie objects
    // derived inverse reference property (inverse of Movie::actors)
    this._playedMovies = {};  // initialize as an empty map of Movie objects


  }
  get personId() {
    return this._personId;
  }
  static checkPersonId( id) {
    if (!id) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      id = parseInt( id);  // convert to integer
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkPersonIdAsId( id) {
    let constraintViolation = Person.checkPersonId();
    if ((constraintViolation instanceof NoConstraintViolation)) {
      // convert to integer
      id = parseInt(id);
      if (isNaN(id)) {
        return new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else if (Person.instances[String(id)]) {  // convert to string if number
        constraintViolation = new UniquenessConstraintViolation(
            "There is already a person record with this person ID!");
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkPersonIdAsIdRef( id) {
    let constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      if (!Person.instances[String(id)]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            "There is no person record with this person ID!");
      }
    }
    return constraintViolation;
  }
  set personId( id) {
    const constraintViolation = Person.checkPersonIdAsId( id);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._personId = parseInt( id);
    } else {
      throw constraintViolation;
    }
  }
  get name() {
    return this._name;
  }
  static checkName( name){
    if(!name){
      return new MandatoryValueConstraintViolation("A name must be provided!");
    } else if(!isNonEmptyString(name)){
      return new RangeConstraintViolation("The name must be a non-empty String!");
    } else{
      return new NoConstraintViolation();
    }
  }
  set name( name) {
    const constraintViolation = Person.checkName( name);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._name = name;
    } else {
      throw constraintViolation;
    }
  }
  get directedMovies(){
    return this._directedMovies;
  }
  get playedMovies(){
    return this._playedMovies
  }
  toJSON() {  // is invoked by JSON.stringify
    let rec = {};
    for (const p of Object.keys( this)) {
      // keep underscore-prefixed properties except "_playedMovies" & "_directedMovies"
      if (p.charAt(0) === "_" && p !== "_playedMovies" && p !== "_directedMovies") {
        // remove underscore prefix
        rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
  toString() {
    let movieStr = `Person{ PersonID: ${this._personId}, name: ${this._name}, directed movies:
    ${Object.keys( this._directedMovies).join(",")}, played movies: ${Object.keys( this._playedMovies).join(",")}`;
    return `${movieStr}`;
  }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/
// initially an empty collection (in the form of a map)
Person.instances = {};

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new person record/object
 */
Person.add = function (slots) {
  let person = null;
  try {
    person = new Person( slots);
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    person = null;
  }
  if (person) {
    Person.instances[person.personId] = person;
    console.log(`Saved: ${person.name}`);
  }
};
/**
 *  Update an existing person record/object
 */
Person.update = function ({personId, name}) {
  const person = Person.instances[String( personId)],
        objectBeforeUpdate = cloneObject( person);
  let noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && person.name !== name) {
      person.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Person.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
    } else {
      console.log( `No property value changed for person ${name}!`);
    }
  }
};

/**
 *  Delete an person object/record
 *  Since the movie-person association is bidirectional, a linear search on all
 *  movies is no longer required for being able to delete the person from the
 *  movies' actors/director.
 */
Person.destroy = function (personId){
  console.log("type personid: " + typeof(personId));
  const person = Person.instances[personId];

  for(const movieIdx in person.playedMovies){
    // Delete actor in all movies he played in
    delete person.playedMovies[movieIdx].actors[parseInt(personId)];
  }

  for(const movieIdx in person.directedMovies){
    // If mandatory director is deleted, delete all associated movies
    // first update actors in movie
    const movie = person.directedMovies[movieIdx];
    for(const actIdx in movie.actors){
      console.log(actIdx);
      delete person.directedMovies[movieIdx].actors[actIdx].playedMovies[movieIdx];
    }
    Movie.destroy(person.directedMovies[movieIdx].movieId);
  }

  // Delete Person object
  delete Person.instances[personId];
  console.log(`Person ${person.name} deleted.`);
}

/**
 *  Load all person records and convert them to objects
 */
Person.retrieveAll = function () {
  let people = {};
  if (!localStorage["people"]) localStorage["people"] = "{}";
  try {
    people = JSON.parse( localStorage["people"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    people = {};
  }
  for (const key of Object.keys( people)) {
    try {
      // convert record to (typed) object
      Person.instances[key] = new Person( people[key]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing person ${key}: ${e.message}`);
    }
  }
  console.log( `${Object.keys( people).length} person records loaded.`);
};
/**
 *  Save all person objects as records
 */
Person.saveAll = function () {
  const nmrOfPersons = Object.keys( Person.instances).length;
  try {
    localStorage["people"] = JSON.stringify( Person.instances);
    console.log( `${nmrOfPersons} person records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Person;
