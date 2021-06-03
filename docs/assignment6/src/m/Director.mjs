/**
 * @fileOverview  The model class Director with attribute definitions,
 *     (class-level) check methods, setter methods, and the special
 *     methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright � 2013-2014 Gerd Wagner, Chair of Internet Technology,
 *     Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL),
 *     implying that the code is provided "as-is", can be modified to create
 *     derivative works, can be redistributed, and can be used in commercial
 *     applications.
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * Constructor function for the class Director
 * @constructor
 * @param {{personId: string, name: string}} [slots] -
 *     A record of parameters.
 */
class Director extends Person {
    // using a single record parameter with ES6 function parameter destructuring
    constructor ({personId, name}) {
        super({personId, name});  // invoke Person constructor
    }
    toString() {
        let empStr = `Director { persID: ${this.personId}, name: ${this.name}`;
        return `${empStr} }`;
    }
}
/***********************************************
 *** Class-level ("static") properties **********
 ************************************************/
// initially an empty collection (in the form of a map)
Director.instances = {};
// add Director to the list of Person subtypes
Person.subtypes.push( Director);

/*********************************************************
 *** Class-level ("static") storage management methods ****
 **********************************************************/
/**
 * Create a new Director row
 * @method
 * @static
 * @param {{personId: string, name: string}} slots - A record of parameters.
 */
Director.add = function (slots) {
    let emp = null;
    try {
        emp = new Director( slots);
    } catch (e) {
        console.log(`${e.constructor.name}: ${e.message}`)
    }
    if (emp) {
        Director.instances[emp.personId] = emp;
        console.log(`${emp.toString()} created!`);
    }
};
/**
 * Update an existing Director row
 * @method
 * @static
 * @param {{personId: string, name: stringr}} slots - A record of parameters.
 */
Director.update = function ({personId, name}) {
    const emp = Director.instances[personId],
        objectBeforeUpdate = cloneObject( emp);
    let noConstraintViolated = true, updatedProperties = [];
    try {
        if (name && emp.name !== name) {
            emp.name = name;
            updatedProperties.push("name");
        }
    } catch (e) {
        console.log( e.constructor.name + ": " + e.message);
        noConstraintViolated = false;
        // restore object to its state before updating
        Director.instances[personId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
        if (updatedProperties.length > 0) {
            const ending = updatedProperties.length > 1 ? "ies" : "y";
            console.log(`Propert${ending} ${updatedProperties.toString()} modified for director ${name}`);
        } else {
            console.log(`No property value changed for Director ${emp.name}!`);
        }
    }
};
/**
 * Delete an existing Director row
 * @method
 * @static
 * @param {string} personId - The ID of a person.
 */
Director.destroy = function (personId) {
    const name = Director.instances[personId].name;
    delete Director.instances[personId];
    console.log(`Director ${name} deleted.`);
};
/**
 *  Retrieve all director objects as records
 */
Director.retrieveAll = function () {
    let directors={};
    if (!localStorage["directors"]) localStorage["directors"] = "{}";
    try {
        directors = JSON.parse( localStorage["directors"]);
    } catch (e) {
        console.log("Error when reading from Local Storage\n" + e);
    }
    for (const key of Object.keys( directors)) {
        try {  // convert record to (typed) object
            Director.instances[key] = new Director( directors[key]);
            // create superclass extension
            Person.instances[key] = Director.instances[key];
        } catch (e) {
            console.log(`${e.constructor.name} while deserializing director ${key}: ${e.message}`);
        }
    }
    console.log(`${Object.keys( Director.instances).length} Director records loaded.`);
}
/**
 * Save all Director objects as rows
 * @method
 * @static
 */
Director.saveAll = function () {
    try {
        localStorage["directors"] = JSON.stringify( Director.instances);
        console.log( Object.keys( Director.instances).length +" directors saved.");
    } catch (e) {
        alert("Error when writing to Local Storage\n" + e);
    }
};

export default Director;
