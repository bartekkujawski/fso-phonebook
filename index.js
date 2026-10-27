const express = require("express")
const morgan = require("morgan")
const PORT = process.env.PORT || 3001

morgan.token("body", function (req) {
  return JSON.stringify(req.body)
})

const app = express()

app.use(express.json())
app.use(express.static("dist"))

let phonebook = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>")
})

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${phonebook.length} people</p>
  <p>${new Date()}</p>
  `)
})

app.get("/api/persons", (req, res) => {
  res.json(phonebook)
})

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id
  const person = phonebook.find((p) => p.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
    res.status(404).send({ error: "Person not found" })
  }
})

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
)

app.post("/api/persons", (req, res) => {
  const newId = Math.random() * 100000000

  if (!req.body.name) {
    return res.status(400).json({ error: "name missing" })
  } else if (!req.body.number) {
    return res.status(400).json({ error: "number missing" })
  } else if (phonebook.some((person) => person.name === req.body.name)) {
    return res
      .status(400)
      .json({ error: "the name already exists in the phonebook" })
  }

  const person = {
    id: newId,
    name: req.body.name,
    number: req.body.number,
  }

  phonebook = phonebook.concat(person)

  res.json(person)
})

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id
  phonebook = phonebook.filter((person) => person.id !== id)

  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
