/**
 * @fileOverview  View code of UI for managing Actor data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Actor from "../m/Actor.mjs";
import Person from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Actor.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
    btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
    frm.addEventListener("submit", function (e) {
        e.preventDefault();
        frm.reset();
    });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
    Actor.saveAll();
});

/**********************************************
 * Use case Retrieve/List Actors
 **********************************************/
document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
    const tableBodyEl = document.querySelector("section#Actor-R > table > tbody");
    // reset view table (drop its previous contents)
    tableBodyEl.innerHTML = "";
    // populate view table
    for (const key of Object.keys( Actor.instances)) {
        const actor = Actor.instances[key];
        const row = tableBodyEl.insertRow();
        row.insertCell().textContent = actor.personId;
        row.insertCell().textContent = actor.name;
        row.insertCell().textContent = actor.agent;
    }
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-R").style.display = "block";
});

/**********************************************
 * Use case Create Actor
 **********************************************/
const createFormEl = document.querySelector("section#Author-C > form");
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-C").style.display = "block";
    createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
    createFormEl.personId.setCustomValidity(
        Person.checkPersonIdAsId( createFormEl.personId.value, Actor).message);
});
/* SIMPLIFIED CODE: no responsive validation of name and agent */

/**
 * handle save events
 */
createFormEl["commit"].addEventListener("click", function () {
    const slots = {
        personId: createFormEl.personId.value,
        name: createFormEl.name.value,
        agent: createFormEl.agent.value
    };
    // check all input fields and show error messages
    createFormEl.personId.setCustomValidity(
        Person.checkPersonIdAsId( slots.personId).message, Actor);
    /* SIMPLIFIED CODE: no before-submit validation of name */
    // save the input data only if all form fields are valid
    if (createFormEl.checkValidity()) Actor.add( slots);
});

/**********************************************
 * Use case Update Actor
 **********************************************/
const updateFormEl = document.querySelector("section#Actor-U > form");
const updSelActorEl = updateFormEl.selectActor;
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
    // reset selection list (drop its previous contents)
    updSelActorEl.innerHTML = "";
    // populate the selection list
    fillSelectWithOptions( updSelActorEl, Actor.instances,
        "personId", {displayProp:"name"});
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-U").style.display = "block";
    updateFormEl.reset();
});
// handle change events on employee select element
updSelActorEl.addEventListener("change", handleActorSelectChangeEvent);

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
    const actorIdRef = updSelActorEl.value;
    if (!actorIdRef) return;
    const slots = {
        personId: updateFormEl.personId.value,
        name: updateFormEl.name.value,
        agent: updateFormEl.agent.value
    }
    // check all property constraints
    /* SIMPLIFIED CODE: no before-save validation of name */
    // save the input data only if all of the form fields are valid
    if (updSelActorEl.checkValidity()) {
        Actor.update( slots);
        // update the actor selection list's option element
        updSelActorEl.options[updSelActorEl.selectedIndex].text = slots.name;
    }
});
/**
 * handle actor selection events
 * when a actor is selected, populate the form with the data of the selected actor
 */
function handleActorSelectChangeEvent() {
    const key = updSelActorEl.value;
    if (key) {
        const auth = Actor.instances[key];
        updateFormEl.personId.value = auth.personId;
        updateFormEl.name.value = auth.name;
        updateFormEl.agent.value = auth.agent;
    } else {
        updateFormEl.reset();
    }
}

/**********************************************
 * Use case Delete Actor
 **********************************************/
const deleteFormEl = document.querySelector("section#Actor-D > form");
const delSelActorEl = deleteFormEl.selectActor;
//----- set up event handler for Update button -------------------------
document.getElementById("Delete").addEventListener("click", function () {
    // reset selection list (drop its previous contents)
    delSelActorEl.innerHTML = "";
    // populate the selection list
    fillSelectWithOptions( delSelActorEl, Actor.instances,
        "personId", {displayProp:"name"});
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-D").style.display = "block";
    deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
    const personIdRef = delSelActorEl.value;
    if (!personIdRef) return;
    if (confirm("Do you really want to delete this actor?")) {
        Actor.destroy( personIdRef);
        delSelActorEl.remove( delSelActorEl.selectedIndex);
    }
});

/**********************************************
 * Refresh the Manage Actors Data UI
 **********************************************/
function refreshManageDataUI() {
    // show the manage actor UI and hide the other UIs
    document.getElementById("Actor-M").style.display = "block";
    document.getElementById("Actor-R").style.display = "none";
    document.getElementById("Actor-C").style.display = "none";
    document.getElementById("Actor-U").style.display = "none";
    document.getElementById("Actor-D").style.display = "none";
}

// Set up Manage Actors UI
refreshManageDataUI();
