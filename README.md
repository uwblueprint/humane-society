# Oakville and Milton Humane Society 🐾
The Oakville and Milton Humane Society is a non-profit organization dedicated to protecting and improving the life of animals within the community and connecting them to the communities that care about them in Oakville and Milton. We will be developing a web application that allows volunteers to sign up for pet-sitting tasks, enabling volunteers to efficiently care for multiple animals.

## Stack Choices
**Backend Language:** TypeScript (Express.js on Node.js) <br>
**Backend API:** REST <br>
**Database:** PostgreSQL<br>
**User Auth:** Opt-in <br>
**File Storage:** Opt-in <br>

## Table of Contents
* 📝 [Documentation](#documentation)
* 👷 [Getting Started](#getting-started)
  * ✔️ [Prerequisites](#prerequisites)
  * ⚙️ [Set up](#set-up)
* 🧰 [Useful Commands](#useful-commands)
  * ℹ️ [Get Names & Statuses of Running Containers](#get-names--statuses-of-running-containers)
  * 💽 [Accessing PostgreSQL Database](#accessing-postgresql-database)
  * ✨ [Linting & Formatting](#linting--formatting)
  * 🧪 [Running Tests](#running-tests)
* 🌳 [Version Control Guide](#version-control-guide)
  * 🌿 [Branching](#branching)
  * 🔒 [Commits](#commits)

## Documentation

- [Starter Code](https://uwblueprint.github.io/starter-code-v2)
- [Dev Cheatsheat](https://www.notion.so/uwblueprintexecs/Dev-Cheat-Sheet-from-CAS-65c53ce229ca4e91aa3abfe2079ac383) (adapted from Children's Aid Society team)
- [Dev Guidelines](https://www.notion.so/uwblueprintexecs/Dev-Guidelines-9ebd726d5b244e2094c54e10afc7303a)


## Getting Started

### Prerequisites

* Install Docker Desktop ([MacOS](https://docs.docker.com/docker-for-mac/install/) | [Windows (Home)](https://docs.docker.com/docker-for-windows/install-windows-home/) | [Windows (Pro, Enterprise, Education)](https://docs.docker.com/docker-for-windows/install/) | [Linux](https://docs.docker.com/engine/install/#server)) and ensure that it is running


### Set up

1. Clone this repository and `cd` into the project folder
```bash
git clone https://github.com/uwblueprint/humane-society.git
cd humane-society
```
2. Confirm that you have the following files added to your repository, with the correct environment variables set:

- `.env`
- `frontend/.env`
- `e2e-tests/.env`

3. Run the application

```bash
docker-compose up --build
docker exec -it humane_society_backend /bin/bash -c "node migrate up"
```

## Useful Commands

### Get Names & Statuses of Running Containers
```bash
docker ps
```

### Accessing PostgreSQL Database

```bash
# run a bash shell in the container
docker exec -it humane_society_db /bin/bash

# in container now
psql -U postgres -d humane_society_dev

# in postgres shell, some common commands:
# display all table names
\dt
# quit
\q
# you can run any SQL query, don't forget the semicolon!
SELECT * FROM <table-name>;
```

### Linting & Formatting
```bash
# linting & formatting warnings only
docker exec -it humane_society_backend /bin/bash -c "yarn lint"
docker exec -it humane_society_frontend /bin/bash -c "yarn lint"

# linting with fix & formatting
docker exec -it humane_society_backend /bin/bash -c "yarn fix"
docker exec -it humane_society_frontend /bin/bash -c "yarn fix"
```

### Running Tests
```bash
docker exec -it humane_society_backend /bin/bash -c "yarn test"
```


## Version Control Guide

### Branching
* Branch off of `main` for all feature work and bug fixes, creating a "feature branch". Prefix the feature branch name with your name. The branch name should be in kebab case and it should be short and descriptive. E.g. `annie/readme-update`
* To integrate changes on `main` into your feature branch, **use rebase instead of merge**

```bash
# currently working on feature branch, there are new commits on main
git pull origin main --rebase

# if there are conflicts, resolve them and then:
git add .
git rebase --continue

# force push to remote feature branch
git push -f
```

### Commits
* Commits should be atomic (guideline: the commit is self-contained; a reviewer could make sense of it even if they viewed the commit diff in isolation)
* Trivial commits (e.g. fixing a typo in the previous commit, formatting changes) should be squashed or fixup'd into the last non-trivial commit

```bash
# last commit contained a typo, fixed now
git add .
git commit -m "fixes typo"

# fixup into previous commit through interactive rebase
# x in HEAD~x refers to the last x commits you want to view
git rebase -i HEAD~2
# text editor opens, follow instructions in there to fixup

# force push to remote feature branch
git push -f
```

* Commit messages and PR names are descriptive and written in **imperative tense**<sup>1</sup>. E.g. "create user REST endpoints", not "created user REST endpoints"
* PRs can contain multiple commits, they do not need to be squashed together before merging as long as each commit is atomic. Our repo is configured to only allow squash commits to `main` so the entire PR will appear as 1 commit on `main`, but the individual commits are preserved when viewing the PR.
