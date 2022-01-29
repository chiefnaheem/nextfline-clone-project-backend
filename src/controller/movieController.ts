import express, { Request, Response, NextFunction } from "express";
import CatchAsync from "../middleware/CatchAsync";
import Movie from "../model/movieModel";
import ResponseStatus from "../middleware/response";
const responseStatus = new ResponseStatus();
//CREATE NEW MOVIE
export const postMovie = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.user.isAdmin) {
    const newMovie = new Movie(req.body);
    const movie = await newMovie.save();
    responseStatus.setSuccess(201, "Successfully added a movie", { movie });
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can post movie");
  return responseStatus.send(res);
});

export const updateMovie = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.user.isAdmin) {
    const updateMovie = await Movie.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    responseStatus.setSuccess(200, "This movie has been updated", { updateMovie });
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can update movie");
  return responseStatus.send(res);
});

export const deleteMovie = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.user.isAdmin) {
    await Movie.findByIdAndRemove({ _id: req.params.id });
    responseStatus.setSuccess(200, "This movie has been deleted", {});
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can delete movie");
  return responseStatus.send(res);
});

//GET MOVIE
export const getMovie = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  const movie = await Movie.findById({ _id: req.params.id });
  responseStatus.setSuccess(200, "This is the movie", { movie });
  return responseStatus.send(res);
});

//GET RANDOM MOVIE

export const getRandomMovie = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
    const type = req.query.type
    let movie;
    if(type === "series"){
        movie = await Movie.aggregate([
            {
                $match : {isSeries: true},

            },
            {
                $sample: {size:1}
            }
        ])
    } else {

        movie = await Movie.aggregate([
            {
                $match : {isSeries: false},
    
            },
            {
                $sample: {size:1}
            }
        ])
    }
    responseStatus.setSuccess(200, "This is random movie", { movie });
    return responseStatus.send(res);
});

//GET ALL  MOVIES BY ADMIN

export const getAllMovies = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
    const query = req.params.page;
    if (req.user.isAdmin) {
        const data = query ? await Movie.find({}).sort({ _id: -1 }).limit(10) : await Movie.find({});
      responseStatus.setSuccess(200, "All movies", { data });
      return responseStatus.send(res);
    }
    responseStatus.setError(400, "Only Admin can see all movies at once");
    return responseStatus.send(res);
  });
