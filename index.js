const express = require("express")
const morgan = require("morgan")
const Person = require("./models/person")

const app = express()

app.use(express.json())
app.use(express.static("dist"))

const PORT = process.env.PORT

morgan.token("body", function (req) {
  return JSON.stringify(req.body)
})

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>")
})

app.get("/info", (req, res) => {
  Person.find({}).then((people) => {
    res.send(
      `<p>Phonebook has info for ${people.length} people</p><p>${new Date()}</p>`,
    )
  })
})

app.get("/api/people", (req, res) => {
  Person.find({}).then((person) => {
    res.json(person)
  })
})

app.get("/api/people/:id", (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then((person) => {
      res.json(person)
    })
    .catch((err) => next(err))
})

app.use(
  morgan(":method :url :status :res[content-length] :response-time ms :body"),
)

app.post("/api/people", (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "name missing" })
  } else if (!req.body.number) {
    return res.status(400).json({ error: "number missing" })
  }

  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson)
    })
    .catch((err) => next(err))
})

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body

  Person.findById(req.params.id)
    .then((person) => {
      if (!person) return res.status(404).end()

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        res.json(updatedPerson)
      })
    })
    .catch((err) => next(err))
})

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then((deleted) => {
      res.status(204).end()
    })
    .catch((err) => next(err))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if (err.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
