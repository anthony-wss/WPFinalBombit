import express from 'express'
import Person from '../models/Person.js'
const router = express.Router()
router.post('/postScore',  async (req, res) => {
    console.log("in1")
    var fin = await Person.find({name:req.body.name, password:req.body.password})
    if (Object.keys(fin).length>0)  
    {
        await Person.deleteOne({name:req.body.name, password:req.body.password})
        res.status(201).json({message:`Updating (${req.body.name} ${req.body.score})`, Person:fin})
        const person = new Person({
            name: req.body.name,
            password: req.body.password,
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
            password: req.body.password,
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
router.get('/allRank',async(req, res)=>{
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
        res.status(403).json({message: "error",data: null})
    }
})
router.post('/deleteData', async (req, res) => {
    console.log("in delete")
    try {
        console.log(req.body.name, req.body.password, req.body.score)
        const newPerson = await Person.find({name:req.body.name, password:req.body.password, score:req.body.score})
        console.log(newPerson.length)
        if (newPerson.length===0) res.status(201).json({deleteMessage:'Failed'})
        else 
        {
            const newPerson = await Person.deleteOne({name:req.body.name, password:req.body.password, score:req.body.score})
            res.status(201).json({deleteMessage:'Success'})
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({deleteMessage:err})
    }
    
})

export default router
