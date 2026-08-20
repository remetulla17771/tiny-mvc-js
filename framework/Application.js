import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

class Application {
    constructor(config = {}) {
        this.componentsConfig = config.components || {};
        this.modulesConfig = config.modules || {};
        this.componentsInstances = new Map();
        this.modulesInstances = new Map();
        this.asyncLocalStorage = asyncLocalStorage; // Expose ALS
        this.config = config
    }

    getModule(id) {
        if (this.modulesInstances.has(id)) {
            return this.modulesInstances.get(id);
        }

        const moduleConfig = this.modulesConfig[id];
        if (!moduleConfig) return null;

        const ModuleClass = moduleConfig.class;
        const instance = new ModuleClass(id, this, moduleConfig);
        this.modulesInstances.set(id, instance);
        return instance;
    }

    async handleRequest(req, res) {
        const urlPath = req.url.split('?')[0];
        const urlParts = urlPath.split('/').filter(Boolean);

        let moduleId = null;
        let controllerName = 'site';
        let actionName = 'index';

        // 1. Проверяем, идет ли обращение к модулю (например, /admin/...)
        if (urlParts.length > 0 && this.modulesConfig[urlParts[0]]) {
            moduleId = urlParts.shift(); // Извлекаем 'admin'
            controllerName = urlParts.shift() || 'default'; // Имя контроллера или 'default'
            actionName = urlParts.shift() || 'index';       // Имя action или 'index'
        } else {
            // Стандартный роутинг без модуля
            controllerName = urlParts[0] || 'site';
            actionName = urlParts[1] || 'index';
        }

        // Преобразуем имя в camelCase и PascalCase: create-user -> CreateUserController, actionCreateUser
        const formattedController = this.toPascalCase(controllerName) + 'Controller';
        const formattedAction = 'action' + this.toPascalCase(actionName);

        try {
            let controllerPath = '';
            let moduleInstance = null;

            if (moduleId) {
                moduleInstance = this.getModule(moduleId);
                // Формируем абсолютный или относительный путь от текущего файла
                controllerPath = path.resolve(process.cwd(), `modules/${moduleId}/controllers/${formattedController}.js`);
            } else {
                controllerPath = path.resolve(process.cwd(), `controllers/${formattedController}.js`);
            }

            // Импортируем контроллер
            const controllerModule = await import(`file://${controllerPath}`);
            const ControllerClass = controllerModule[formattedController] || controllerModule.default;

            if (!ControllerClass) {
                throw new Error(`Класс ${formattedController} не найден в ${controllerPath}`);
            }

            const controller = new ControllerClass(req, res);
            controller.module = moduleInstance; // Привязываем модуль к контроллеру

            if (typeof controller[formattedAction] === 'function') {
                return await controller[formattedAction]();
            } else {
                res.status(404).send(`404 Action "${formattedAction}" не найден в ${formattedController}`);
            }
        } catch (err) {
            console.error(`[Router Error]: ${err.message}`);
            res.status(404).send(`404 Controller или Route не найден: /${urlParts.join('/')}`);
        }
    }

    // Вспомогательный метод для форматирования имён (kebab-case -> PascalCase)
    toPascalCase(str) {
        return str
            .replace(/[^a-zA-Z0-9-]/g, '') // Удаляем все символы кроме букв, цифр и дефиса
            .split('-')
            .filter(Boolean)
            .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
            .join('');
    }

    // Регистрация / получение синглтон-компонентов
    get(name) {
        if (this.componentsInstances.has(name)) {
            return this.componentsInstances.get(name);
        }

        const config = this.componentsConfig[name];
        if (!config) {
            throw new Error(`Component "${name}" is not defined in config.`);
        }

        // Простая инициализация компонента
        const instance = typeof config === 'function' ? config() : config;
        this.componentsInstances.set(name, instance);
        return instance;
    }

    get db() {
        return this.get('db');
    }

    // Сохраняем текущий контекст HTTP-запроса (req, res)
    runInContext(context, callback) {
        return asyncLocalStorage.run(context, callback);
    }

    get request() {
        const store = asyncLocalStorage.getStore();
        return store ? store.req : null;
    }

    get response() {
        const store = asyncLocalStorage.getStore();
        return store ? store.res : null;
    }


// ... в класс Application добавляем геттер:
    get session() {
        return this.get('session');
    }

    get user() {
        return this.get('user');
    }

}

// Глобальный интерфейс Yii
export const Yii = {
    app: null,
    init(config) {
        this.app = new Application(config);
        return this.app;
    }
};