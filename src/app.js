import express from "express"
import cors from 'cors'
import healthcheckrouter from "./routes/healthcheck.routes.js"
import cookieParser from "cookie-parser"
import userrouter from "./routes/user.routes.js"
import { errorhandler } from "./middlewares/error.middleware.js"

const app=express()

//common middleware
app.use(
    cors({
        origin : process.env.CORS_ORIGIN,
        credentials : true

    })
)

app.use(
    express.json({limit:'16kb'})
)

app.use(
    express.urlencoded({extended:true, limit:'32kb'})
)
app.use(express.static('public'))


app.use(cookieParser())


//router
app.use('/api/v1/healthcheck',healthcheckrouter)
app.use('/api/v1/users',userrouter)





// app.use(errorhandler)

export{app}