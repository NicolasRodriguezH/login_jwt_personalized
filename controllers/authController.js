const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const connection = require('../database/db')
const {promisify} = require('util')

/* Procedimineto para registrarnos */

exports.register = async (req, res) => {
    try {
        const name = req.body.name
        const user = req.body.user
        const pass = req.body.pass

        let hash = await bcryptjs.hash(pass, 8)

        connection.query("INSERT INTO users SET ?", {user:user, name:name, pass:hash}, (error, results) => {
            if(error) console.log(error)
            res.redirect('/')
        })
    } catch (error) {
        console.error(error)
    }
}

/* Procedimineto para login */

exports.login = async (req, res) => {
    try {
        const user = req.body.user
        const pass = req.body.pass

        if (!user || !pass) {
            res.render('login', {
                alert: true,
                alertTitle: 'Advertencia',
                alertMessage: 'Ingrese un usuario y passrowrd',
                alertIcon: 'info',
                showConfirmButton: true,
                timer: 800,
                ruta: 'login'
            })
        } else {
            connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results) => {
                if (results.lengh == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                    res.render('login', {
                        alert:true,
                        alertTitle: 'Error',
                        alertMessage: 'Ingrese un usuario y passrowrd',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: 800,
                        ruta: 'login'
                    })
                } else {
                    /* Inicio de sesion OK */

                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRET, {
                        /* Expira en 7 dias */
                        expiresIn: process.env.JWT_TOKEN_EXPIRES
                    })

                    console.log(`TOKEN:${token}, para el usuario: ${user}`)

                    const cookieOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookieOptions)
                    res.render('login', {
                        alert:true,
                        alertTitle: 'Conexion Exitosa',
                        alertMessage: 'Login Correcto!',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

/* Para verificar autenticacion */

exports.isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            connection.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, results) => {
                if(!results) {return next()}
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    } else {
        res.redirect('/login')
    }
}

/* Metodo logout */

exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/')
}