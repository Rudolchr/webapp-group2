import Movie from "./Movie.mjs";
//import {isNonEmptyString, isIntegerOrIntegerString} from "../../lib/util.mjs";

class TvSeriesEpisode extends Movie{
  constructor ({movieId, title, releaseDate, actors,directorId, actorsIdRefs}, tvSeriesName, episodeNo){
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
