const express = require('express')
const app = express()
const Handlebars = require('handlebars')


app.get('/', (req, res) => {
    res.send('Hello World')
})

var template = Handlebars.compile("Handlebars {{doesWhat}}");

console.log(template({ doesWhat: "rocks!" }));

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening on port ${port}...`))