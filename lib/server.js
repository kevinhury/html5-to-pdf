const autoBind = require("auto-bind")
const { URL } = require("url")
const http = require("http")
const fs = require("fs")
const path = require("path")
const { parse } = require("url")

class StaticServer {
  constructor({ templatePath }) {
    autoBind(this)
    this.templatePath = templatePath
    this.server = http.createServer(this._handleRequest)
  }

  address() {
    let { address, port } = this.server.address()
    if (address === "::") {
      address = "localhost"
    }
    return new URL(`http://${address}:${port}`).toString()
  }

  listen() {
    return new Promise((resolve, reject) => {
      this.server.listen(err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  _handleRequest(req, res) {
    const { pathname } = parse(req.url)
    let filePath = path.join(this.templatePath, pathname)
    fs.exists(filePath, exists => {
      if (!exists) {
        res.statusCode = 404
        return res.end(`File ${filePath} not found!`)
      }

      if (fs.statSync(filePath).isDirectory()) {
        filePath += "/index.html"
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 500
          res.end(`Error getting the file: ${err}.`)
        } else {
          res.end(data)
        }
      })
    })
  }
}

class ExistingServer {
  constructor({ templateURL }) {
    this.templateURL = templateURL
  }
  async listen() {}
  address() {
    return new URL(this.templateURL).toString()
  }
  async close() {}
}

class Server {
  constructor({ templatePath, templateURL }) {
    if (templateURL) {
      return new ExistingServer({ templateURL })
    }
    return new StaticServer({ templatePath })
  }
}

module.exports = Server
