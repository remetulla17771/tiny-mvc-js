# 🚀 Tiny-MVC JS Framework

**Tiny-MVC JS** — лёгкий веб-фреймворк на базе **Node.js + Fastify**, вдохновлённый архитектурой и экосистемой **Yii2**.

Фреймворк предоставляет привычную MVC-архитектуру, ActiveRecord ORM, компоненты и модули, маршрутизацию, Nunjucks-шаблоны, Asset Bundles и встроенный Gii Generator.

Цель проекта — перенести удобные архитектурные подходы Yii2 в современную JavaScript/Node.js среду, сохранив простоту и минимализм.

---

## ✨ Возможности

* 🚀 Fastify как HTTP Core Engine
* 🏗 MVC-архитектура
* 🧩 Components и Modules
* 💉 Изоляция контекста через `AsyncLocalStorage`
* 🗄 ActiveRecord на базе Knex.js
* 🎨 Nunjucks Template Engine
* 📦 Asset Bundles
* 🛠 Gii Generator
* 🔐 Session & Cookie
* 💾 SQLite session storage
* 🐛 `var_dump()` и `dd()` в стиле PHP
* ⚡ Автоматическое сопоставление URL с Controller/Action
* 📁 Модульная архитектура приложения

---

# 🛠 Технологический стек

| Технология            | Назначение                     |
| --------------------- | ------------------------------ |
| **Node.js**           | Runtime                        |
| **Fastify**           | HTTP-сервер и core engine      |
| **AsyncLocalStorage** | Контекст текущего HTTP-запроса |
| **Knex.js**           | Работа с базой данных          |
| **ActiveRecord**      | ORM-паттерн                    |
| **Nunjucks**          | Шаблонизация                   |
| **@fastify/session**  | Сессии                         |
| **@fastify/cookie**   | Cookies                        |
| **connect-sqlite3**   | Хранение сессий в SQLite       |

---

# 📁 Структура проекта

```text
tiny-mvc-js/
│
├── assets/
│   └── ...                  # Asset Bundles
│
├── config/
│   └── main.js              # Конфигурация приложения
│
├── controllers/
│   └── SiteController.js    # Глобальные контроллеры
│
├── framework/
│   ├── base/
│   │   ├── Component.js     # Базовый Component
│   │   └── Module.js        # Базовый Module
│   │
│   ├── db/
│   │   ├── ActiveRecord.js  # ActiveRecord
│   │   └── ...              # Работа с Knex
│   │
│   ├── exceptions/
│   │   ├── HttpException.js
│   │   └── NotFoundHttpException.js
│   │
│   ├── helpers/
│   │   └── VarDumper.js     # var_dump / dd
│   │
│   ├── Application.js       # Application + Yii facade
│   ├── BaseController.js    # Базовый Controller
│   └── Router.js             # Маршрутизация
│
├── models/
│   └── ...                  # ActiveRecord models
│
├── modules/
│   ├── admin/
│   │   └── ...
│   │
│   └── gii/
│       └── ...
│
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/
│
├── views/
│   ├── layouts/
│   └── ...
│
├── index.js                 # Entry point
└── package.json
```

---

# 🚀 Установка

Клонируйте репозиторий:

```bash
git clone https://github.com/remetulla17771/tiny-mvc-js.git
```

Перейдите в директорию проекта:

```bash
cd tiny-mvc-js
```

Установите зависимости:

```bash
npm install
```

---

# ▶️ Запуск

Для запуска приложения в режиме разработки:

```bash
npm run dev
```

После запуска приложение доступно по адресу:

```text
http://localhost:3008
```

---

# 🌐 Routing

Tiny-MVC JS использует собственный Router для сопоставления URL с контроллерами и actions.

Маршрутизация построена по принципу:

```text
URL
 ↓
Router
 ↓
Module / Controller
 ↓
Action
```

## Примеры

Главная страница:

```text
GET /
```

вызывает:

```javascript
SiteController.actionIndex()
```

---

Маршрут:

```text
GET /user-profile/show-info
```

преобразуется в:

```javascript
UserProfileController.actionShowInfo()
```

---

Для модулей:

```text
GET /admin/users/create
```

вызывает:

```javascript
modules/admin/controllers/UsersController.actionCreate()
```

Таким образом, URL автоматически преобразуется из `kebab-case` в имена классов и actions.

---

# 🧩 Modules

Модули позволяют изолировать отдельные части приложения.

Например:

```text
modules/
└── admin/
    ├── controllers/
    ├── models/
    ├── views/
    ├── layouts/
    └── Module.js
```

Модуль может содержать собственные:

* Controllers
* Models
* Views
* Layouts
* Configuration
* Components

Это позволяет строить приложение из независимых функциональных частей.

---

# 🛠 Gii Generator

Tiny-MVC JS включает встроенный генератор кода **Gii**.

После запуска приложения генератор доступен по адресу:

```text
http://localhost:3008/gii
```

Gii предназначен для автоматического создания компонентов приложения.

## Доступные генераторы

### Model Generator

Создаёт ActiveRecord-модель на основе структуры таблицы базы данных.

Пример:

```text
Database
   ↓
Model Generator
   ↓
models/User.js
```

---

### Controller Generator

Создаёт:

* Controller
* Actions
* Nunjucks templates

Это позволяет быстро создавать стандартные CRUD-компоненты приложения.

---

### Module Generator

Создаёт полноценную структуру нового модуля:

```text
modules/
└── example/
    ├── controllers/
    ├── models/
    ├── views/
    ├── layouts/
    │   └── main.njk
    └── Module.js
```

---

# 🗄 ActiveRecord

Работа с базой данных построена поверх **Knex.js**, при этом используется архитектурный паттерн **ActiveRecord**.

## Создание модели

Например, модель пользователя:

```javascript
// models/User.js

import { ActiveRecord } from '../framework/db/ActiveRecord.js';

export class User extends ActiveRecord {

    static tableName() {
        return 'users';
    }

}
```

`tableName()` определяет таблицу, с которой работает модель.

---

## Поиск записи

Поиск по первичному ключу:

```javascript
const user = await User.findOne(1);
```

---

## Поиск по условию

```javascript
const activeUsers = await User
    .find()
    .where({
        status: 'active'
    })
    .all();
```

Таким образом, запрос строится через ActiveRecord API, а выполнение происходит асинхронно.

---

# 🎨 Views

Для отображения HTML используется **Nunjucks**.

Шаблоны имеют расширение:

```text
.njk
```

Например:

```text
views/
├── layouts/
│   └── main.njk
│
└── site/
    └── index.njk
```

---

# 📦 Asset Bundles

Tiny-MVC JS поддерживает архитектуру **Asset Bundles**, аналогичную Yii2.

Например, приложение может зарегистрировать:

```text
BootstrapAsset
AppAsset
```

Asset Bundle отвечает за подключение необходимых CSS и JavaScript файлов.

В layout можно зарегистрировать Asset Bundle:

```njk
{{ registerAsset(BootstrapAsset) }}
```

---

## Layout

Пример основного layout:

```njk
{# views/layouts/main.njk #}

{{ registerAsset(BootstrapAsset) }}

<!DOCTYPE html>
<html lang="ru">

<head>

    <meta charset="UTF-8">

    <title>{{ title }}</title>

    {{ view.renderHead() | safe }}

</head>

<body>

    <div class="container mt-4">

        {{ content | safe }}

    </div>

    {{ view.renderEndBody() | safe }}

</body>

</html>
```

### Head Assets

```njk
{{ view.renderHead() | safe }}
```

выводит ресурсы, зарегистрированные для `<head>`.

### Body Assets

```njk
{{ view.renderEndBody() | safe }}
```

выводит ресурсы, предназначенные для конца `<body>`.

---

# ⚡ AsyncLocalStorage

Для доступа к контексту текущего HTTP-запроса используется Node.js `AsyncLocalStorage`.

Благодаря этому не требуется передавать `request` и `response` через каждый метод вручную.

Контекст доступен через:

```javascript
Yii.app.req
```

и:

```javascript
Yii.app.res
```

Это позволяет обращаться к текущему HTTP-контексту из разных частей приложения.

Например:

```javascript
const request = Yii.app.req;
const response = Yii.app.res;
```

---

# 🧱 Application

Главным объектом приложения является:

```javascript
Application
```

Он отвечает за запуск и организацию основных компонентов фреймворка.

Архитектурно приложение построено вокруг:

```text
Application
│
├── Router
├── Components
├── Modules
├── Database
├── Session
├── View
└── HTTP Context
```

Также предоставляется глобальный facade:

```javascript
Yii
```

что позволяет использовать знакомый подход Yii2:

```javascript
Yii.app
```

---

# 🎮 Controllers

Контроллеры приложения находятся в:

```text
controllers/
```

Например:

```text
controllers/
└── SiteController.js
```

Для модульных контроллеров:

```text
modules/
└── admin/
    └── controllers/
        └── UsersController.js
```

Контроллеры наследуются от базового:

```text
BaseController
```

Базовый контроллер предоставляет общую функциональность для обработки запросов и отображения представлений.

---

# 🧩 Components

Компоненты являются переиспользуемыми объектами приложения.

Базовый класс расположен здесь:

```text
framework/base/Component.js
```

Архитектура компонентов позволяет централизовать сервисы и функциональность, используемую различными частями приложения.

---

# 💥 Exceptions

Фреймворк предоставляет собственные HTTP exceptions.

Основные классы:

```text
framework/exceptions/
├── HttpException.js
└── NotFoundHttpException.js
```

Например:

```javascript
throw new NotFoundHttpException();
```

Это позволяет использовать исключения для обработки HTTP-ошибок на уровне приложения.

---

# 🐛 Debug Helpers

Tiny-MVC JS предоставляет функции дампа, знакомые разработчикам PHP/Yii2.

## var_dump

```javascript
var_dump(data);
```

Выводит подробную структуру значения.

---

## dd

```javascript
dd(data);
```

`dd` означает:

```text
Dump and Die
```

Функция выводит данные и завершает выполнение текущего запроса.

Пример:

```javascript
dd(user);
```

---

# 🏗 Архитектура

Общая архитектура приложения:

```text
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Fastify    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Router    │
                    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
             Controller          Module
                  │                 │
                  └────────┬────────┘
                           ▼
                       Model
                           │
                           ▼
                     ActiveRecord
                           │
                           ▼
                         Knex
                           │
                           ▼
                       Database

                           │
                           ▼
                         View
                           │
                           ▼
                       Nunjucks
                           │
                           ▼
                         HTML
```

---

# 🆚 Концепция

Tiny-MVC JS использует архитектурные идеи Yii2, адаптируя их под Node.js:

| Yii2         | Tiny-MVC JS      |
| ------------ | ---------------- |
| Application  | `Application`    |
| Yii facade   | `Yii`            |
| Controller   | `BaseController` |
| ActiveRecord | `ActiveRecord`   |
| Module       | `Module`         |
| Component    | `Component`      |
| View         | Nunjucks         |
| AssetBundle  | Asset Bundles    |
| Gii          | Gii Generator    |
| DB Layer     | Knex.js          |
| HTTP Server  | Fastify          |

---

# 📌 Принцип проекта

Tiny-MVC JS не пытается быть большим универсальным фреймворком.

Основная идея проекта:

> **Yii2-подобная архитектура для Node.js без лишней сложности.**

Фреймворк предоставляет готовую структуру приложения, но при этом оставляет разработчику контроль над кодом и архитектурой.

---

# 📄 License

MIT License

Copyright © 2026 Remetulla17771
