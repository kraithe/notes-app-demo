## Description

This is a demo note-taking app which includes related content for each note. Users can sign up, log in, and manage their notes. Each note displays its related notes and related web content.

The related content can include related notes (other notes in the collection which are topically similar) or related web content (articles, YouTube videos, or any web pages relevant to the note, and what specifically makes them relevant). Related content is computed and stored when a note is added/edited and saved, rather than re-fetched every time the note is viewed.

Design and Tech Stack:

I chose NestJS for the API / backend layer because it’s a fast, high-concurrency, well structured framework that is scaleable for large full-stack applications. Nest’s support for microservices also enables integration with ML pipelines (ex. a customized model running in a separate Python service) while getting the benefits of Node. React, Next.js, and Shadcn were clear front-end choices for a large, widely used library with good base features and extensibility. 

I used pgvector as an open source relational db with vector-search support, along with Mastra, since this demo is based on retrieval-augmented generation. I implemented join-tables to indicate each instance of a one-to-one association a given note has with a related note or item of web-content, so that when a note is edited, we can find the join-table items associated with that note (which can be optimized via id column indexing). 

The related content generation is a main feature of the app. Related web content is fetched as soon as the first note is saved, while the related notes feature requires several notes to have been saved before relations are computed. This generation uses two join tables, so that when the content is fetched, it’s stored in its respective join table. When new content is fetched, the old related content is removed from the table, and we create new records based on a re-computation of the relations. A user can then navigate between existing notes and see all related content from within our database.

The app uses one main logged-in page where the most recent note opens by default, or for new users a new note creation view is open. Some of the placements and design choices were made for at-a-glance clarity. Others, like semantic HTML, ARIA labels, and a couple instances of keyboard navigation, are just to illustrate ways of facilitating accessible design. Deployment is via Railway for expedience (ex. Postgres setup).

I used set up JWT authentication using Passport, along with Bcrypt password hashing for secure storage. I also included rate-limiting to protect my API from excessive calls. There’s input sanitization on the front-end, and validation guards on both front-end and back-end.

Event logging is in place throughout the application, especially on the API and the AI layers, as it’s important to have server observability and be able to analyze how the RAG systems are being utilized. The unit tests are done in Jest, covering various possible cases for each item being tested.

The architectural design reflects my preference for systems that are easy to maintain as a code base grows, including domain-driven design with functional cohesion. As an app expands, we want logically-related parts of the app to exist within the same bounds, so it’s good to have a clear vision from the onset.

Hexagonal architecture is also helpful in this aim by keeping each layer of application logic minimally coupled to the rest of the systems it uses, such that we could adjust one section without having to refactor large amounts of code in multiple other areas.

Most of the development effort went into the design - not just picking the technologies to use and the overall application flow, but also deciding what to include and not include for a small-scale demo.

From a technical perspective, a larger / scaled version might do well to include:
- “Soft delete”, where users can restore a deleted file for period of time, and/or where the note is deleted for the user but still retained by us (ex. for legal requirements, or to allow us to manually restore it for the user)
- Note versioning, where users can view different versions of the same note, saved over time, so notes aren’t completely gone unless the user permanently deletes them
- Load balancers, in round robin pattern, with short-term caching & hashing of users’ IP addresses to ensure persistent sessions are kept on the same server
- Using a CDN for regional distribution and additional security
- A more complex front-end could benefit from optimizations such as lazy loading, minification, and above the fold rendering
- Using GUIDs for table entity Ids can enhance security through obfuscation
- Using a “main” db for write functionality, with a few more used as read-only (CAP theorem). Once a database gets very large and/or begins having large numbers of active users, solutions like indexing, partitioning, or sharding would be beneficial.
- Separate front-end and back-end repos. I used one repo specifically to keep everything organized for demo purposes, but there can be development team advantages to having separate front-end and back-end projects.
- If the back-end became computationally heavy enough at scale to affect performance for users, the compute portions could be offloaded to a separate microservice receiving events from the existing back-end.
- Configuring integration tests and e2e tests.
- Connecting system logs to monitoring tools like Prometheus and Grafana.
- There are also all kinds of UX improvements I would suggest for this app that go beyond the scope of this demo itself - for instance, I wanted the delete interaction to be fairly obvious, so I made it a button, but ideally I’d have it in a right-click context menu with various other options. I added some guards to password length, but in production I would require numbers + symbols, and also probably some form of multi-factor authentication, whether 2FA or SMS/Email.
- CI/CD is really helpful when working on a team, so to sustain a project in the long-term, I would place certain requirements on pull requests in particular: requiring passing unit tests and ESLint, requiring a successful build, and requiring a dependency security scan are my basics.

## Local project setup

```bash

# Running locally requires npm, Docker, and Docker Compose

# backend packages
$ npm install

# postgres, mastra
$ docker compose up -d

# start backend server, port 3000
$ npm run start:dev

# front-end directory
$ cd frontend

# install front-end dependencies
$ npm install

# start front-end, port 4001
$ npm run dev -- -p 3001
```

## Run tests

```bash
# unit tests
$ npm run test
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
