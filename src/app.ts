import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";

import { corsOrigins } from "./config/env";
const app=express();

app.use(helmet());

app.use(cors({
    origin:corsOrigins,
    credentials:true
}));

app.use(cookieParser());

app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true}));


app.get("/health",async (_req, res, next)=>{
    try{
      res.json({
        success:true,
        data:{status:"healthy"}
      });

    }
    catch(error){
        next(error);
    }

});



// All API routes
app.use("/api/v1", apiRoutes);


// Handle unknown routes
app.use(notFound);

// Central error handler (must be last)
app.use(errorHandler);

export default app;
