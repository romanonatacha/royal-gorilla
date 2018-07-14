import * as core from "express-serve-static-core";
import express = require('express');

import RoyalRouter from "../../common/RoyalRouter";
import { HTTP_METHODS } from "../../common/Enumerators";

export default class MotorcyclesRoute extends RoyalRouter {
    constructor(_Router: core.Router, _BasePath : string){
        super(_Router, _BasePath);
        super.RegisterRoute( HTTP_METHODS.GET, '/', this.getBasicInfo);
    }
    
    getBasicInfo(req: express.Request, res: express.Response) {
        res.send("Products Motoycles ROUTE");
    }
}