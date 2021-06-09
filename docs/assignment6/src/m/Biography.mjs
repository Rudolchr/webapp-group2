import Movie from "./Movie.mjs";

class Biography extends Movie{
  constructor ({movieId, title, releaseDate, actors,directorId, actorsIdRefs}, about){
    super({movieId, title, releaseDate, actors, directorId,actorsIdRefs})
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
    } else if(typeof(d) === "object"){
      if(!Person.instances[String(d.personId)]){
        // Person does not exist
        return new ReferentialIntegrityConstraintViolation("There is no Person with ID " + d);
      } else{
        return new NoConstraintViolation();
      }
    } else if(typeof(d) === "number"){
      if(!Person.instances[String(d)]){
        // Person does not exist
        return new ReferentialIntegrityConstraintViolation("Could not find this Person");
      } else{
        return new NoConstraintViolation();
      }
    }
  }
}

export default Biography;
