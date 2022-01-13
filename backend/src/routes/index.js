import express from 'express'
import Person from '../models/Person.js'
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const router = express.Router()
router.post('/postScore', jsonParser, async (req, res) => {
    console.log("in1")
    var fin = await Person.find({name:req.body.name})
    if (Object.keys(fin).length>0)  
    {
        console.log("in2")
        await Person.remove({name:req.body.name})
        res.status(201).json({message:`Updating (${req.body.name} ${req.body.score})`, Person:fin})
        const person = new Person({
            name: req.body.name,
            score: req.body.score
        })
        try {
            const newPerson = await person.save()
        } catch (err) {
            res.status(400).json({message: err.message})
        }
    }
    else
    {
        console.log(req)
        const person = new Person({
            name: req.body.name,
            score: req.body.score
        })
        console.log(req.body.name)
        try {
            const newPerson = await person.save()
            res.status(201).json({message:`Adding (${req.body.name} ${req.body.score})`, Person:newPerson})
        } catch (err) {
            res.status(400).json({message: err.message})
        }
    } 
})
router.get('/allRank', async(req, res)=>{
    console.log("allRank")
    var fin = await Person.find({}).sort([['score', -1]])
    // var fin = await Person.find()
    if (Object.keys(fin).length>0)  
    {
        console.log("something")
        res.status(200).send({message:"success", Person: fin})
        
        console.log(fin)
    }
    else
    {
        console.log("nothing")
        res.status(403).json({message: "error",
        data: null})
    }
})

export default router
