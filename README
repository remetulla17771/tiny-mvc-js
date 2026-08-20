# TinyMVC JS

> Lightweight JavaScript MVC framework with Routing, Dependency Injection, Controllers, Models and Views.

![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

TinyMVC JS — это минималистичный MVC-фреймворк на чистом JavaScript без зависимостей. Он предоставляет привычную архитектуру, похожую на Laravel и Yii2, сохраняя небольшой размер и простоту.

## Возможности

- MVC архитектура
- SPA Router
- Dependency Injection Container
- Service Provider
- Controller & BaseController
- Model с реактивным состоянием
- Layout + View Renderer
- Middleware
- Event Bus
- Local Storage Driver
- REST API Helper
- Zero Dependencies

---

# Установка

```bash
git clone https://github.com/remetulla17771/tiny-mvc-js.git
cd tiny-mvc-js
```

или подключите через npm:

```bash
npm install tiny-mvc-js
```

---

# Быстрый старт

## Структура проекта

```text
src/
│
├── core/
│   ├── Application.js
│   ├── Router.js
│   ├── Container.js
│   ├── Controller.js
│   ├── Model.js
│   ├── View.js
│   └── EventBus.js
│
├── controllers/
│   └── HomeController.js
│
├── models/
│   └── User.js
│
├── views/
│   ├── layouts/
│   │     └── main.html
│   └── home/
│         └── index.html
│
├── routes.js
└── app.js
```

---

# Создание приложения

```javascript
import { Application } from './core/Application.js';

const app = new Application('#app');

app.run();
```

---

# Роутинг

`routes.js`

```javascript
import HomeController from './controllers/HomeController.js';

export default (router) => {

    router.get('/', HomeController, 'index');

    router.get('/about', HomeController, 'about');

    router.post('/login', HomeController, 'login');

};
```

### Параметры

```javascript
router.get('/users/:id', UserController, 'show');
```

Получение параметра:

```javascript
export default class UserController {

    show({ params }) {

        console.log(params.id);

    }

}
```

URL

```text
/users/25
```

Результат

```javascript
params.id === "25"
```

---

# Controller

```javascript
import { Controller } from '../core/Controller.js';

export default class HomeController extends Controller {

    index() {

        return this.render('home/index', {

            title: 'TinyMVC',
            message: 'Hello World'

        });

    }

}
```

Доступно:

| Метод | Описание |
|--------|----------|
| render() | Отобразить View |
| redirect() | Переход |
| json() | JSON ответ |
| request | Request объект |
| params | Route параметры |

---

# View

`views/home/index.html`

```html
<h1>{{ title }}</h1>

<p>{{ message }}</p>
```

Рендер:

```javascript
return this.render('home/index', {

    title: 'Главная',
    message: 'Добро пожаловать'

});
```

Получится:

```html
<h1>Главная</h1>

<p>Добро пожаловать</p>
```

---

# Layout

`views/layouts/main.html`

```html
<!DOCTYPE html>

<html>

<head>

    <title>{{ title }}</title>

</head>

<body>

    {{ content }}

</body>

</html>
```

Контроллер:

```javascript
this.layout('main');

return this.render('home/index');
```

---

# Model

```javascript
import { Model } from '../core/Model.js';

export default class User extends Model {

    state = {

        name: '',
        email: ''

    };

}
```

Использование

```javascript
const user = new User();

user.set('name', 'Damir');

console.log(user.get('name'));
```

Наблюдение

```javascript
user.watch('name', value => {

    console.log(value);

});
```

---

# Dependency Injection

Регистрация

```javascript
app.container.singleton('api', () => {

    return new ApiService();

});
```

Получение

```javascript
const api = app.container.get('api');
```

В контроллере

```javascript
export default class HomeController extends Controller {

    constructor(container) {

        super();

        this.api = container.get('api');

    }

}
```

---

# Service Provider

```javascript
export default class AppServiceProvider {

    register(container) {

        container.singleton('storage', () => {

            return new Storage();

        });

    }

}
```

Подключение

```javascript
app.register(AppServiceProvider);
```

---

# Middleware

Создание

```javascript
export default function auth({ next, redirect }) {

    if (!localStorage.token)

        return redirect('/login');

    next();

}
```

Маршрут

```javascript
router.get('/profile',

    ProfileController,

    'index',

    [auth]

);
```

---

# Event Bus

Подписка

```javascript
app.events.on('login', user => {

    console.log(user);

});
```

Отправка

```javascript
app.events.emit('login', currentUser);
```

---

# HTTP Client

```javascript
const response = await app.http.get('/api/users');
```

POST

```javascript
await app.http.post('/api/login', {

    email,
    password

});
```

---

# Local Storage

```javascript
app.storage.set('theme', 'dark');

const theme = app.storage.get('theme');

app.storage.remove('theme');
```

---

# Redirect

```javascript
return this.redirect('/dashboard');
```

---

# JSON Response

```javascript
return this.json({

    success: true

});
```

---

# Пример контроллера

```javascript
import { Controller } from '../core/Controller.js';
import User from '../models/User.js';

export default class UserController extends Controller {

    index() {

        const user = new User();

        user.set('name', 'Damir');

        return this.render('user/index', {

            title: 'Профиль',
            user

        });

    }

}
```

---

# Жизненный цикл

```text
Browser
    │
    ▼
Router
    │
    ▼
Middleware
    │
    ▼
Controller
    │
    ▼
Model
    │
    ▼
View
    │
    ▼
Layout
    │
    ▼
HTML
```

---

# API

## Router

```javascript
router.get(path, Controller, action)

router.post(path, Controller, action)

router.put(path, Controller, action)

router.delete(path, Controller, action)
```

## Controller

```javascript
this.render(view, data)

this.json(data)

this.redirect(url)

this.layout(name)
```

## Container

```javascript
container.bind()

container.singleton()

container.get()

container.has()
```

## Model

```javascript
model.get()

model.set()

model.watch()

model.reset()
```

## EventBus

```javascript
on()

off()

emit()

once()
```

---

# Roadmap

- [x] Router
- [x] MVC
- [x] View Engine
- [x] Layout
- [x] DI Container
- [x] Middleware
- [x] Event Bus
- [ ] CLI Generator
- [ ] Validation
- [ ] Form Builder
- [ ] WebSocket Support

---

# License

MIT © 2026 Damir Remetulla