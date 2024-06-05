const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');

const dbPath = './db/deportes.json';

class Server {

    
	constructor() {
		this.app = express();
		this.port = 3000;
		this.middlewares();
	}

	middlewares() {
		this.app.use(express.static("public"));

        let deportesJSON = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        let deportes = deportesJSON.deportes;

        // GET
		this.app.get("/deportes", (req, res) => {
            if (req.url.startsWith("/deportes") && req.method === "GET") {
		        res.end(JSON.stringify(deportesJSON));
		    }
		});

        // POST
        this.app.post("/agregar", (req, res) => {

         	if (req.url.startsWith("/agregar") && req.method === "POST") {
			let body;
			req.on("data", (payload) => {
				body = JSON.parse(payload);
			});
			req.on("end", () => {
				let deporte = {
					nombre: body.nombre,
					precio: body.precio
				};
			deportes.push(deporte);

			fs.writeFileSync(dbPath, JSON.stringify(deportesJSON));
			res.end();
			});
		}
		});

        // PUT
        this.app.put("/editar", (req, res) => {

            if (req.url.startsWith("/editar") && req.method === "PUT") {
		    let body;
			req.on("data", (payload) => {
				body = JSON.parse(payload);
			});
			req.on("end", () => {
				deportesJSON.deportes = deportes.map((d) => {
					if (d.nombre == body.nombre) {
						return body;
					}
					return d;
				});

				fs.writeFileSync(dbPath, JSON.stringify(deportesJSON));
				res.end();
			});
		}
       });

        // DELETE
        this.app.delete("/eliminar", (req, res) => {

		    if (req.url.startsWith("/eliminar") && req.method === "DELETE") 
            {
			const { nombre } = url.parse(req.url, true).query;
			deportesJSON.deportes = deportes.filter((d) => d.nombre !== nombre);

			fs.writeFileSync(dbPath, JSON.stringify(deportesJSON));
			res.end();
        }
   });

		this.app.get("*", (req, res) => {
			res.sendFile(path.join(__dirname, "../public", "404.html"));
		});
	}

	listen() {
		this.app.listen(this.port, () => {
			console.log(`Server up and listening at http://localhost:${this.port}`);
		});
	}
}

module.exports = Server;