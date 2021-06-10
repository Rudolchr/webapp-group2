/**
 * @fileOverview  View code of UI for managing Movie data
 * @author Gerd Wagner
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person from "../m/Person.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import Movie from "../m/Movie.mjs";
import TvSeriesEpisode from "../m/TvSeriesEpisode.mjs";
import Biography from "../m/Biography.mjs";
import { fillSelectWithOptions, createListFromMap, createMultipleChoiceWidget }
    from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();
TvSeriesEpisode.retrieveAll();
Biography.retrieveAll();

/***************************************************************
Helper Functions
***************************************************************/

/**
 * Collect all movies from all subtypes
 * @param {objects} types Classes to collect
 * @return {Movies}
 */
function collectMovies(types){
  let ret = {};
  for(const t in types){
    for(const key in types[t].instances){
      ret[key] = types[t].instances[key];
    }
  }

  return ret;
}

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", Movie.saveAll);

/**********************************************
 Use case Retrieve/List All Movies
 **********************************************/
document.getElementById("retrieveAndListAll")
  .addEventListener("click", function () {

    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-R").style.display = "block";
    const tableBodyEl = document.querySelector("section#Movie-R>table>tbody");
    tableBodyEl.innerHTML = "";  // drop old content
    let movieTypes = [Movie, Biography, TvSeriesEpisode];

    let allMovies = collectMovies(movieTypes);

    for (const key of Object.keys( allMovies/*Movie.instances*/)) {
      const movie = allMovies[key];/*Movie.instances[key];*/
      const date = new Date(movie.releaseDate);
      let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = movie.movieId;
      row.insertCell().textContent = movie.title;
      row.insertCell().textContent = dateStr;
      const director = movie.directorId.name;
      row.insertCell().textContent = director;
      if (movie.actors) {
        // create list of actors for this movie if there are some
        const authListEl = createListFromMap(movie.actors, "name");
        row.insertCell().appendChild( authListEl);
      }
      // Category
      if(allMovies[key] instanceof TvSeriesEpisode){
        row.insertCell().textContent = "TV Series";
      } else if(allMovies[key] instanceof Biography){
        row.insertCell().textContent = "Biography";
      } else{
        row.insertCell().textContent = "";
      }

      // Series Name
      if(allMovies[key] instanceof TvSeriesEpisode){
        row.insertCell().textContent = allMovies[key].tvSeriesName;
      } else{
        row.insertCell().textContent = "";
      }

      // Series Number
      if(allMovies[key] instanceof TvSeriesEpisode){
        row.insertCell().textContent = allMovies[key].episodeNo;
      } else{
        row.insertCell().textContent = "";
      }

      // About
      if(allMovies[key] instanceof Biography){
        row.insertCell().textContent = allMovies[key].about.name;
      } else{
        row.insertCell().textContent = "";
      }
    }
  });

/**********************************************
  Use case Create Movie
 **********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
      selectActorsEl = createFormEl.selectActors,
      selectDirectorEl = createFormEl.selectDirector,
      category = createFormEl.category;
  document.getElementById("create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  // set up a single selection list for selecting a director
  fillSelectWithOptions( selectDirectorEl, Director.instances /*Person.instances*/, "name");
  // set up a multiple selection list for selecting actors
  fillSelectWithOptions( selectActorsEl, Actor.instances/*Person.instances*/,
    "personId", {displayProp: "name"});
  fillSelectWithOptions(category, [{name:"TV Series"}, {name:"Biography"}], "name");
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieId.addEventListener("input", function () {
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( createFormEl.movieId.value).message);
});
createFormEl.releaseDate.addEventListener("input", function () {
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( createFormEl.releaseDate.value).message);
});
createFormEl.title.addEventListener("input", function () {
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( createFormEl.title.value).message);
});

createFormEl.seriesName.addEventListener("input", function () {
  createFormEl.seriesName.setCustomValidity(
      TvSeriesEpisode.checkTvSeriesName( createFormEl.seriesName.value).message);
});
createFormEl.episodeNo.addEventListener("input", function () {
  createFormEl.episodeNo.setCustomValidity(
      TvSeriesEpisode.checkEpisodeNo( createFormEl.episodeNo.value).message);
});
createFormEl.about.addEventListener("input", function () {
  createFormEl.about.setCustomValidity(
      Biography.checkAbout( createFormEl.about.value).message);
});

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  let dir = -1;
  for(const id in Person.instances){
    if(Person.instances[id].name === selectDirectorEl.value){
      dir = parseInt(id);
    }
  }

  const slots = {
    movieId: createFormEl.movieId.value,
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    directorId: dir,
    actorsIdRefs: []
  };

  if(createFormEl.category.value === "TV Series"){
    slots.tvSeriesName = createFormEl.seriesName.value;
    slots.episodeNo = createFormEl.episodeNo.value;

    createFormEl.seriesName.setCustomValidity(
      TvSeriesEpisode.checkTvSeriesName( slots.tvSeriesName).message);
    createFormEl.episodeNo.setCustomValidity(
      TvSeriesEpisode.checkEpisodeNo(slots.episodeNo).message
    );
  } else if(createFormEl.category.value === "Biography"){
    slots.about = createFormEl.about.value;

    createFormEl.about.setCustomValidity(
      Biography.checkAbout( slots.about).message);
  }

  // check all input fields and show error messages
  createFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId( slots.movieId).message);
  createFormEl.title.setCustomValidity(
    Movie.checkTitle(slots.title).message
  );
  createFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(slots.releaseDate).message
  );
  selectDirectorEl.setCustomValidity(
    Movie.checkDirector(slots.directorId).message
  );

  // get the list of selected actors
  const selActOptions = createFormEl.selectActors.selectedOptions;
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of actor ID references
    for (const opt of selActOptions) {
      slots.actorsIdRefs.push( opt.value);
    }
    if(createFormEl.category.value === "TV Series"){
      TvSeriesEpisode.add(slots);
    } else if(createFormEl.category.value === "Biography"){
      Biography.add(slots);
    } else {
      Movie.add( slots);
    }
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
      selectUpdateMovieEl = updateFormEl.selectMovie;
    document.getElementById("update").addEventListener("click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-U").style.display = "block";
    // set up the movie selection list
    fillSelectWithOptions( selectUpdateMovieEl, collectMovies({Movie, Biography, TvSeriesEpisode})/*Movie.instances*/,
      "movieId", {displayProp: "title"});
    updateFormEl.reset();
});

updateFormEl.movieId.addEventListener("input", function () {
  updateFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( updateFormEl.movieId.value).message);
});
updateFormEl.releaseDate.addEventListener("input", function () {
  updateFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( updateFormEl.releaseDate.value).message);
});
updateFormEl.title.addEventListener("input", function () {
  updateFormEl.title.setCustomValidity(
      Movie.checkTitle( updateFormEl.title.value).message);
});

updateFormEl.seriesName.addEventListener("input", function () {
  updateFormEl.seriesName.setCustomValidity(
      TvSeriesEpisode.checkTvSeriesName( updateFormEl.seriesName.value).message);
});
updateFormEl.episodeNo.addEventListener("input", function () {
  updateFormEl.episodeNo.setCustomValidity(
      TvSeriesEpisode.checkEpisodeNo( updateFormEl.episodeNo.value).message);
});
updateFormEl.about.addEventListener("input", function () {
  updateFormEl.about.setCustomValidity(
      Biography.checkAbout( updateFormEl.about.value).message);
});

/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
selectUpdateMovieEl.addEventListener("change", function () {
  const formEl = document.querySelector("section#Movie-U > form"),
    saveButton = formEl.commit,
    selectActorsWidget = formEl.querySelector(".MultiChoiceWidget"),
    selectDirectorEl = formEl.selectDirector,
    movieId = formEl.selectMovie.value,
    category = formEl.category;
  if (movieId) {
    const movie = collectMovies({Movie, Biography, TvSeriesEpisode})[movieId];//Movie.instances[movieId];
    const tmpDat = new Date(movie.releaseDate);
    const relDat = tmpDat.getFullYear() + "-" +
      (tmpDat.getMonth() + 1) + "-" +
      tmpDat.getDate();

    formEl.movieId.value = movie.movieId;
    formEl.title.value = movie.title;
    formEl.releaseDate.value = relDat;

    // set up the associated director selection list
    fillSelectWithOptions( selectDirectorEl, Director.instances/*Person.instances*/, "name");

    // set up Category
    fillSelectWithOptions(category, [{name:"TV Series"}, {name:"Biography"}], "name");

    // set up the associated actors selection widget
    if(typeof(movie.actors) !== 'undefined'){
      createMultipleChoiceWidget( selectActorsWidget, movie.actors,
          Actor.instances/*Person.instances*/, "personId", "name", 1);  // minCard=1
    } else{
      createMultipleChoiceWidget( selectActorsWidget, [],
          Actor.instances/*Person.instances*/, "personId", "name", 1);
    }
    formEl.selectDirector.value = movie.directorId.name;

    if(movie instanceof TvSeriesEpisode){
      formEl.category.value = "TV Series";
      formEl.seriesName.value = movie.tvSeriesName;
      formEl.episodeNo.value = movie.episodeNo;
    } else if(movie instanceof Biography){
      formEl.category.value = "Biography";
      formEl.about.value = movie.about.personId;
    }

    saveButton.disabled = false;
  } else {
    formEl.reset();
    selectActorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
});
// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = selectUpdateMovieEl.value,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    multiChoiceListEl = selectActorsWidget.firstElementChild;
  if (!movieIdRef) return;

  let dir = -1;
  for(const id in Person.instances){
    if(Person.instances[id].name === updateFormEl.selectDirector.value){
      dir = parseInt(id);
    }
  }

  const slots = {
    movieId: updateFormEl.movieId.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    directorId: dir
  }

  // add event listeners for responsive validation
  updateFormEl.title.setCustomValidity(
    Movie.checkTitle(slots.title).message
  );
  updateFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(slots.releaseDate).message
  );
  updateFormEl.selectDirector.setCustomValidity(
    Movie.checkDirector(slots.directorId).message
  );

  if(updateFormEl.category.value === "TV Series"){
    slots.tvSeriesName = updateFormEl.seriesName.value;
    slots.episodeNo = updateFormEl.episodeNo.value;

    updateFormEl.seriesName.setCustomValidity(
      TvSeriesEpisode.checkTvSeriesName(slots.tvSeriesName).message
    );
    updateFormEl.episodeNo.setCustomValidity(
      TvSeriesEpisode.checkEpisodeNo(slots.episodeNo).message
    );
  } else if(updateFormEl.category.value === "Biography"){
    slots.about = updateFormEl.about.value;

    updateFormEl.about.setCustomValidity(
      Biography.checkAbout(slots.about).message
    );
  }


  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct actorIdRefs-ToAdd/ToRemove lists from the association list
    const actorIdRefsToAdd = [], actorIdRefsToRemove = [];
    for (const mcListItemEl of multiChoiceListEl.children) {
      if (mcListItemEl.classList.contains("removed")) {
        actorIdRefsToRemove.push( mcListItemEl.getAttribute("data-value"));
      }
      if (mcListItemEl.classList.contains("added")) {
        actorIdRefsToAdd.push( mcListItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty create a corresponding slot
    if (actorIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = actorIdRefsToRemove;
    }
    if (actorIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = actorIdRefsToAdd;
    }

    if(updateFormEl.category.value === "TV Series"){
      TvSeriesEpisode.update(slots);
    } else if (updateFormEl.category.value === "Biography"){
      Biography.update(slots);
    } else{
      Movie.update( slots);
    }
    // update the movie selection list's option element
    selectUpdateMovieEl.options[selectUpdateMovieEl.selectedIndex].text = slots.title;
    selectActorsWidget.innerHTML = "";
  }
});

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const selectDeleteMovieEl = deleteFormEl.selectMovie;
document.getElementById("destroy")
  .addEventListener("click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-D").style.display = "block";
    // set up the actor selection list
    fillSelectWithOptions( selectDeleteMovieEl, Movie.instances,
      "movieId", {displayProp: "title"});
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = selectDeleteMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy(movieIdRef);
    // remove deleted movie from select options
    deleteFormEl.selectMovie.remove(deleteFormEl.selectMovie.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Movie UI
refreshManageDataUI();
