import { Request, Response } from "express";
async function getFirstAid (req: Request, res: Response) {
    try{
        const alertId = req.validated?.params;
        const user = req.user;
        
    }catch(error){

    }
};

export {getFirstAid};