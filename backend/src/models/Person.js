import mongoose from 'mongoose'

const personSchema = new mongoose.Schema({
    name : {
        type : String
    },
    password : {
        type : String
    },
    score : {
        type : Number
    },
})

export default  mongoose.model('Person', personSchema)