// framework/BaseController.js
import { Yii } from './Application.js';
import { ActiveForm } from './widgets/ActiveForm.js';
import { NotFoundHttpException } from './exceptions/HttpException.js';
import { ViewManager } from './web/ViewManager.js';
import {AppAsset} from "../assets/AppAsset.js";
import {BootstrapAsset} from "../assets/BootstrapAsset.js";
export class BaseController {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.layout = 'layouts/main';
    }

    // Централизованный рендеринг ошибок
    // framework/BaseController.js

    async renderError(error) {
        const statusCode = error.statusCode || error.status || 500;
        this.res.status(statusCode);

        // Вызываем с слэшем в начале, чтобы пометить путь как глобальный/абсолютный
        return await this.render('/site/error', {
            title: `Ошибка ${statusCode}`,
            name: error.name || 'HttpException',
            message: error.message || 'Произошла ошибка сервера.',
            statusCode
        });
    }

    // Вспомогательный метод поиска модели (аналог $this->findModel($id) из Yii2)
    async findModel(ModelClass, id) {
        if (!id) {
            throw new NotFoundHttpException('Параметр ID не указан.');
        }

        const model = await ModelClass.findOne(id);
        if (!model) {
            throw new NotFoundHttpException(`Запись в базе данных не найдена.`);
        }

        return model;
    }

    // framework/BaseController.js (Фрагмент метода render)
    async render(viewName, params = {}) {
        const viewEngine = Yii.app.get('view');
        this.view = new ViewManager();

        const currentUser = Yii.app.user ? await Yii.app.user.findIdentity() : null;
        const flashes = Yii.app.session ? Yii.app.session.getAllFlashes() : {};
        const isGuest = Yii.app.user ? Yii.app.user.isGuest : true;

        const registerAsset = (BundleClass) => {
            if (BundleClass && typeof BundleClass.register === 'function') {
                return BundleClass.register(this.view);
            }
            console.warn('registerAsset Warning: Invalid Asset Bundle class passed:', BundleClass);
            return null;
        };

        // 1. Автоматическая регистрация базового AppAsset
        AppAsset.register(this.view);

        // 2. Корректное формирование пути к представлению
        const controllerFolder = this.constructor.name.replace('Controller', '').toLowerCase();
        let viewPath = '';

        if (viewName.startsWith('/')) {
            viewPath = `${viewName.slice(1)}.njk`;
        }

        else if (this.module) {
            // Если контроллер относится к модулю (например, modules/admin/views/default/index.njk)
            viewPath = `modules/${this.module.id}/views/${controllerFolder}/${viewName}.njk`;
        } else {
            // Обычное представление приложения (views/site/index.njk)
            viewPath = `${controllerFolder}/${viewName}.njk`;
        }

        // 3. Общие параметры для всех шаблонов
        const renderParams = {
            ...params,
            Yii,
            ActiveForm,
            registerAsset,
            flashes,
            view: this.view,
            year: new Date().getFullYear(),
            currentUser,
            isGuest
        };

        // 4. Сначала рендерим внутреннее представление (View)
        const content = viewEngine.render(viewPath, renderParams);

        // Если layout отключен (this.layout = null) — отдаем чисто контент
        if (!this.layout) {
            return this.res.type('text/html; charset=utf-8').send(content);
        }

        // 5. Определение пути к Layout (учитываем возможный layout модуля)
        let layoutPath = this.layout.endsWith('.njk') ? this.layout : `${this.layout}.njk`;

        if (this.module && !this.layout.startsWith('layouts/') && !this.layout.startsWith('modules/')) {
            // Если у модуля задан свой кастомный layout
            layoutPath = `modules/${this.module.id}/views/layouts/${this.layout}.njk`;
        }

        // 6. Рендерим общий Layout с вшитым content
        const html = viewEngine.render(layoutPath, {
            ...renderParams,
            content,
            title: params.title || (this.module ? 'Admin Panel' : 'Yii2 Node Application')
        });

        return this.res.type('text/html; charset=utf-8').send(html);
    }

    redirect(url, statusCode = 302) {
        let targetUrl = '';

        if (Array.isArray(url)) {
            // Пример: ['site/view', 'id' => 5]
            const route = url[0].startsWith('/') ? url[0] : '/' + url[0];
            const params = new URLSearchParams();

            // Добавляем остальные элементы как GET-параметры
            Object.keys(url).forEach((key) => {
                if (key !== '0' && url[key] !== undefined && url[key] !== null) {
                    params.append(key, url[key]);
                }
            });

            const queryString = params.toString();
            targetUrl = queryString ? `${route}?${queryString}` : route;
        } else if (typeof url === 'string') {
            targetUrl = url.startsWith('/') || url.startsWith('http') ? url : '/' + url;
        } else {
            targetUrl = '/';
        }

        // В Fastify перенаправление с кодом ответа
        return this.res.status(statusCode).redirect(targetUrl);
    }
    refresh() {
        return this.redirect(this.req.url);
    }

    async json(data = {}) {
        return this.res
            .type('application/json; charset=utf-8')
            .send(data);
    }
}