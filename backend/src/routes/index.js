import express from 'express'
import Person from '../models/Person.js'
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = express.Router()
router.post('/postScore',  async (req, res) => {
    const hash = bcrypt.hashSync(req.body.password, saltRounds);
    var fin = await Person.find({name:req.body.name})
    if (Object.keys(fin).length>0)  
    {
        if (bcrypt.compareSync(req.body.password, fin[0].password))
        {
            await Person.deleteOne({name:req.body.name})
            const person = new Person({
                name: req.body.name,
                password: hash,
                score: req.body.score
            })
            try {
                const newPerson = await person.save()
                res.status(200).json({message: "更新資料成功！"})
            } catch (err) {
                res.status(200).json({message: "資料庫無回應，更新資料失敗"})
            }
        }
        else res.status(200).json({message:"密碼錯誤，更新資料失敗"})
    }
    else
    {
        const person = new Person({
            name: req.body.name,
            password: hash,
            score: req.body.score
        })
        try {
            const newPerson = await person.save()
            res.status(201).json({message:`成功儲存`})
        } catch (err) {
            res.status(200).json({message: err.message})
        }
    } 
})
router.get('/allRank',async(req, res)=>{
    var fin = await Person.find({}).sort([['score', -1]])
    if (Object.keys(fin).length>0)   res.status(200).send({message:"success", Person: fin})
    else res.status(403).json({message: "error",data: null})
})
router.post('/deleteData', async (req, res) => {
    const fin = await Person.find({name:req.body.name, score:req.body.score});
    if (fin.length===0||!bcrypt.compareSync(req.body.password, fin[0].password)) res.status(200).json({deleteMessage:'密碼錯誤，刪除失敗'}) 
    else 
    {
        try{
            await Person.deleteOne({name:fin[0].name, score:fin[0].score})
            res.status(200).json({deleteMessage: "成功刪除"})
        }catch(err){
            res.status(400).json({deleteMessage: "資料庫無回應，刪除失敗"})
        }
    }
})

export default router
