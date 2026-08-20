// controllers/SiteController.js
import { BaseController } from '../framework/BaseController.js';
import { User } from '../models/User.js';
import { Yii } from '../framework/Application.js';
import {var_dump} from "../framework/helpers/VarDumper.js";

export class SiteController extends BaseController {

    // GET /site/index
    async actionIndex() {
        const users = await User.findAll();
        const userId = Yii.app.user.id;
        // var_dump(Yii.app.config)

        console.log(userId, "USER_ID")
        return this.render('index', {
            title: 'Главная страница',
            users
        });
    }

    async actionCreate() {
        const user = new User();

        if(Yii.app.user.isGuest){
            Yii.app.session.setFlash('danger', `Авторизуйтесь`);
            return this.redirect(['site/index']);
        }

        if (this.req.method === 'POST') {
            // 1. Загружаем POST-данные в модель
            if (user.load(this.req.body)) {

                // 2. Хешируем пароль перед сохранением
                if (this.req.body.password) {
                    user.setPassword(this.req.body.password);
                }

                // 3. Сохраняем модель в БД
                if (await user.save()) {
                    // Добавляем Flash-уведомление
                    Yii.app.session.setFlash('success', `Пользователь "${user.username}" успешно создан!`);

                    // Используем наш системный редирект фреймворка
                    return this.redirect(['site/index']);
                } else {
                    Yii.app.session.setFlash('danger', 'Ошибка при сохранении пользователя.');
                }
            }
        }

        // Если GET запрос или ошибка валидации/сохранения
        return this.render('create', {
            title: 'Создать пользователя',
            user
        });
    }

    // GET /site/view-user?id=1
    async actionView() {
        const id = this.req.query.id;
        const user = await User.findOne(id);


        return this.render('view', {
            title: user ? `Профиль ${user.username}` : 'Ошибка',
            user
        });
    }

    async actionLogin() {
        // Если уже залогинен — отправляем на главную
        if (!Yii.app.user.isGuest) {
            return this.redirect(['site/index']);
        }

        let error = null;

        if (this.req.method === 'POST') {
            const { username, password } = this.req.body;
            const user = await User.findByUsername(username);

            // var_dump(user, username, this.req.body);

            if (user && user.validatePassword(password)) {
                await Yii.app.user.login(user);
                Yii.app.session.setFlash('success', `Добро пожаловать, ${user.username}!`);
                return this.redirect(['site/index']);
            } else {
                error = 'Неверное имя пользователя или пароль.';
            }
        }

        return this.render('login', { error });
    }

    async actionLogout() {
        Yii.app.user.logout();
        Yii.app.session.setFlash('info', 'Вы успешно вышли из системы.');
        return this.redirect(['site/index']);
    }

    async actionUpdate() {
        // 1. Поиск модели или автоматический throw 404
        // const user = await this.findModel(User, this.req.query.id);

        const user = await User.findOne(this.req.query.id);

        if(!await user){
            Yii.app.session.setFlash("danger", "Не найден пользователь")
            return this.redirect(['site/index'])
        }

        // 2. Обработка POST
        if (this.req.method === 'POST') {
            if (user.load(this.req.body) && await user.save()) {
                return this.res.redirect('/site/index');
            }
        }

        return this.render('update', {
            title: 'Редактирование пользователя',
            user
        });
    }

    async actionError(error) {
        const status = error?.status || 500;
        this.res.status(status);

        return this.render('error', {
            title: `Ошибка ${status}`,
            name: error?.name || `Ошибка ${status}`,
            message: error?.message || 'Внутренняя ошибка сервера.'
        });
    }

}