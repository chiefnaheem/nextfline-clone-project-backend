import express, { Request, Response, NextFunction } from "express";
import CatchAsync from "../middleware/CatchAsync";
import List from "../model/listModel";
import ResponseStatus from "../middleware/response";
const responseStatus = new ResponseStatus();

export const createList = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.user.isAdmin) {
    const newList = new List(req.body);
    const data = await newList.save();
    responseStatus.setSuccess(201, "Successfully added to the list", { data });
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can add to the list");
  return responseStatus.send(res);
});

export const deleteList = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.user.isAdmin) {
    await List.findByIdAndRemove({ _id: req.params.id });
    responseStatus.setSuccess(201, "Successfully deleted this list", {});
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can delete a list");
  return responseStatus.send(res);
});

export const getByQuery = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list: any = [];
  
  if (typeQuery) {
    if (genreQuery) {
      list = await List.aggregate([
        {$sample: { size: 10 }},
        {$match: { type: typeQuery, genre: genreQuery }},
      ]);
    } else {
      list = await List.aggregate([
        {$sample: { size: 10 }},
        {$match: { type: typeQuery }},
      ]);
    }
    responseStatus.setSuccess(201, "Successfully got this list", {list});
    return responseStatus.send(res);
  } else {
    list = await List.aggregate([{ $sample: { size: 10 } }]);
    responseStatus.setSuccess(201, "Successfully got this list", {list});
    return responseStatus.send(res);
  }
});
