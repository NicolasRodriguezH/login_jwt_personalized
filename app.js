const express = require('express')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const { Router } = require('express')

const app = express()

/* Seteamos el motor de plantillas */
app.set('view engine', 'ejs')

/* Seteamos la carpeta public para archivos estaticos */
app.use(express.static('public'))

/* Para procesar datos enviados desde el form */
app.use(express.urlencoded({extended:true}))
app.use(express.json())

/* Seteamos variables de entorno */
dotenv.config({path:'./env/.env'})

/* Para poder trabajr con las cookies */
/* app.use(cookieParser()) */

/* Llamaos a las rutas en router */
app.use('/', require('./routes/router'))

/* Para eliminar el cache y que no se pueda vovler con el boton de back luego de que hacemos un LOGOUT */
app.use(function(req,res,next) {
    if(!req.user)
        res.header('cache-control', 'private, no-cache, no-store, must-revalidate')
        next()
})

app.listen(8000, () => {
    console.log('Server is running in port: http://localhost:8000')
})