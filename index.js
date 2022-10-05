require("dotenv").config()

const multer = require("multer")
const mongoose = require("mongoose")

const bcrypt = require("bcrypt")

const File = require('./models/file')

const express = require("express")
const app = express()
var port = 3000

const upload = multer({ dest : "uploads" })

mongoose.connect(process.env.DATABASE_URL)

// setting template engine - ejs
app.set("view engine","ejs")

app.get("/",(req,res)=>{
    // rendering template engine
    res.render("index")
})

app.post("/upload",upload.single("file"),async (req,res)=>{
    const fileData = {
        path : req.file.path ,
        originalName : req.file.originalname
    }
    if(req.body.password != null && req.body.password !== ""){
        fileData.password = await bcrypt.hash(req.body.password,10)
    }
    const file = await File.create(fileData)

   res.render("index", { fileLink : `${req.headers.origin}/file/${file.id}`})
})

app.get("/file/:id",async (req,res)=>{
    const file = await File.findById(req.params.id)

    file.downloadCount++
    await file.save()
    console.log(file.downloadCount);

    res.download(file.path , file.originalName)
})

app.listen(process.env.PORT)