import { app } from "./app.js";
import  dotenv  from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
    path:"./.env"

})
const PORT= process.env.PORT || 4000



connectDb()
.then(
    app.listen(PORT,()=>{
        console.log(`Server is running at ${PORT}`)
    })
)
.catch((err)=>{
    console.log('mongodb connection error',err)
})