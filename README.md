### Monorepo na prática.                                                                                                                                                                                                                                              
**Primeiros Passos**:

**As ferramentas que vamos utilizar:**

 - Node.js
 - React
 - Lerna
 - npm: atenção ao [npm scoped package](https://docs.npmjs.com/cli/v8/using-npm/scope)
 - git

**Projeto:**
Vamos começar com um exemplo mais simples e criar uma aplicação para o Back-End e outra para o Front-End.

Um monorepo não significa que é “tudo junto e misturado”, então vamos criar packages separados com:
-validator: uma biblioteca/package customizada para validação
-logger: uma biblioteca/package customizada

A estrutura dos arquivos do nosso Monorepo ficará assim:

```md
packages/          # pasta com as bibliotecas
  ../validator     # helpers para validação
  ../logger        # biblioteca de logger
apps/             # pasta para aplicações/servidor
  ../api           # API backend
  ../frontend      # frontend
```

**1 - Criar o Monorepo**

 ```md
# instalação global da ferramenta lerna

npm i -g lerna
# criação de um novo diretório por projeto 
mkdir my-project && cd my-project
# inicializar um novo repositório gerenciado pelo lerna 
lerna init
```

Agora você precisa editar o lerna.json:

```json
{
  "packages": [ "packages/*", "apps/*"],
  "version": "0.1.0"
}
```
2- Criar uma biblioteca para validação

2.1 Criar e inicializar o package```@my-project/validator```:

```
# criar uma pasta para a biblioteca e um cd para entrar na pasta
mkdir -p packages/validator && cd packages/validator
# inicializar a biblioteca com o nome do projeto
npm init --scope=my-project --yes
```
2.2 Adicionar ```packages/validator/index.js``` com o seguinte conteúdo:

```js
/* Checa se é dado um valor null ou undefined ou uma string vazia*\
exports.isNullOrWhitespace = (value) => value === undefined || value === null || !value.trim();
```
3 - Criar uma biblioteca “logger”

3.1 - Crie e inicialize o package ```@my-project/logger```:

```
# Na pasta raiz do repositório 
# Crie uma biblioteca e entre na pasta 
mkdir -p packages/logger && cd packages/logger
# inicie a biblioteca 
npm init --scope=my-project --yes
```

3.2 Adicione ao ```packages/logger/index.js``` o seguinte conteúdo:

```js
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

const log = (color, ...args) => console.log(color + '%s', ...args);

exports.info = (...args) => log(CYAN, ...args);
exports.warn = (...args) => log(YELLOW, ...args);
exports.error = (...args) => log(RED, ...args);
```
**4 - Crie agora um package para nossa “API”**

4.1 - Criar e inicializar o package ``` @my-project/api ```

```
# Na pasta raiz do seu repositório
# Crie uma pasta app 
mkdir -p apps/api && cd apps/api
# inicialize o projeto 
npm init --scope=my-project --yes
# instale o express
npm i express --save
# adicione nossa biblioteca “logger” como dependência para nossa API 
lerna add @my-project/logger --scope=@my-project/api``
```

4.1.2 2. Adcione o arquivo ```apps/api/index.js```:

```js
const express = require('express');
const logger = require('@my-project/logger');

const PORT = process.env.PORT || 8080;
const app = express();

app.get('/greeting', (req, res) => {
    logger.info('/greeting was called');
    res.send({
        message: `Hello, ${req.query.name || 'World'}!`
    });
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

```

4.1.3 Adicione um inicializador ao ``` apps/api/package.json```:

```json
"scripts": {
  "start": "node index.js"
  ...
}
```

4.1.4 Rode o app: npm start e abra ```http://localhost:8080/greeting```

5. Crie um frontend:

5.1 Criar @my-project/frontend com o ```create-react-app```:

```
# Na pasta raiz do seu repositório
# crie um app frontend com create-react-app
cd apps && npx create-react-app frontend
``` 

5.1.2 Edite o arquivo ```apps/frontend/package.json``` :

```
{
 "name": "@my-project/frontend",
 ...
 "proxy": "http://localhost:8080"
}
```

5.1.3 Adicione nosso validator como uma dependência do frontend

```
# Adicione a biblioteca validator como depencencia do frontend
lerna add @my-project/validator --scope=@my-project/frontend
```

5.1.4 Adicione o arquivo ```apps/frontend/src/Greeting.js ```:

```js
import React, { Component } from 'react';
import { isNullOrWhitespace } from '@my-project/validator';

export class Greeting extends Component {
    state = {
        name: ''
    }

    onSubmit = () => {
        const {name} = this.state;
        if (isNullOrWhitespace(name)) {
            alert('Please, type your name first.');
            return;
        }

        fetch(`/greeting?name=${name}`)
            .then(response => response.json())
            .then(({message}) => this.setState({message, error: null}))
            .catch(error => this.setState({error}));
    }

    render() {
        const {name, message, error} = this.state;
        return (
            <div style={{padding: '10px'}}>
                {message && <div style={{fontSize: '50px'}}>{message}</div>}
                <input value={name} onChange={(event) => this.setState({name: event.target.value})} placeholder="Type your name"/>
                <button onClick={this.onSubmit}>Submit</button>
                {error && <pre>{JSON.stringify(error)}</pre>}
            </div>
        );
    }
}
```

5.1.5 - Adicione a tag ``` <Greeting />``` no seu ```apps/frontend/src/App.js```

```js
...
import {Greeting} from './Greeting';
class App extends Component {
  ...
  render() {
    return (
        <div className="App">
           <header className="App-header">
             ...
             <Greeting />
           </header>
        </div>
    );
  }
}
...
```

5.1.6 Rode o frontend com ```npm start``` e abra a url ```http://localhost:3000```

Fonte: https://javascript.plainenglish.io/javascript-monorepo-with-lerna-5729d6242302
