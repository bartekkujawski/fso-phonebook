const dns = require("dns")
const mongoose = require("mongoose")
dns.setServers(["8.8.8.8", "1.1.1.1"])
dns.setDefaultResultOrder("ipv4first")

mongoose.set("strictQuery", false)

const url = process.env.MONGODB_URI

console.log("connecting to ", url)
mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "Phone number required!"],
  },
})

personSchema.set("toJSON", {
  transform: (doc, retObj) => {
    retObj.id = retObj._id.toString()
    delete retObj._id
    delete retObj.__v
  },
})

module.exports = mongoose.model("Person", personSchema)
