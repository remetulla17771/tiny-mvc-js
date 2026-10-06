// framework/Router.js
import path from 'path';
import { Yii } from './Application.js';
import { NotFoundHttpException } from './exceptions/HttpException.js';

/**
 * Извлекает имена параметров из сигнатуры метода/функции
 * @param {Function} fn Исполняемая функция/метод
 * @returns {Array<{name: string, defaultValue: any}>}
 */
function extractMethodParams(fn) {
    const fnStr = fn.toString();
    const argsMatch = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'));
    if (!argsMatch.trim()) return [];

    return argsMatch.split(',').map(param => {
        const [rawName, rawDefaultValue] = param.split('=').map(s => s.trim());
        const name = rawName.replace(/[\/\*.*\*\/]/g, '').trim(); // очистка от комментариев, если они есть
        let defaultValue = undefined;

        if (rawDefaultValue !== undefined) {
            try {
                defaultValue = JSON.parse(rawDefaultValue);
            } catch {
                defaultValue = rawDefaultValue.replace(/^['"]|['"]$/g, ''); // обработка строк 'val' или "val"
            }
        }

        return { name, defaultValue };
    });
}

export function setupRouter(fastify) {
    fastify.all('/*', async (req, res) => {
        if (req.url === '/favicon.ico' || req.url.startsWith('/.well-known')) {
            return res.status(204).send(); // No Content
        }

        const urlPath = req.url.split('?')[0].replace(/^\/|\/$/g, '');
        const parts = urlPath.split('/').filter(Boolean);

        let moduleId = null;
        let controllerName = 'site';
        let actionName = 'index';

        // 1. Проверяем, зарегистрирован ли первый сегмент как модуль (например, 'admin')
        if (parts.length > 0 && Yii.app.modulesConfig && Yii.app.modulesConfig[parts[0]]) {
            moduleId = parts.shift(); // Извлекаем 'admin'
            controllerName = parts.shift() || 'default';
            actionName = parts.shift() || 'index';
        } else {
            controllerName = parts[0] || 'site';
            actionName = parts[1] || 'index';
        }

        // Преобразование kebab-case -> PascalCase (user-profile -> UserProfile)
        const toPascalCase = (str) =>
            str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join('');

        const className = toPascalCase(controllerName) + 'Controller';
        const actionMethod = 'action' + toPascalCase(actionName);

        let controllerPath = '';
        let moduleInstance = null;

        // 2. Определяем путь к контроллеру в зависимости от наличия модуля
        if (moduleId) {
            moduleInstance = Yii.app.getModule(moduleId);
            controllerPath = path.resolve(process.cwd(), `modules/${moduleId}/controllers/${className}.js`);
        } else {
            controllerPath = path.resolve(process.cwd(), `controllers/${className}.js`);
        }

        try {
            // Динамический импорт по абсолютному пути
            const module = await import(`file://${controllerPath}`);
            const ControllerClass = module[className] || module.default;

            const controller = new ControllerClass(req, res);
            controller.module = moduleInstance; // Важно! Привязываем модуль к контроллеру для render()

            if (typeof controller[actionMethod] === 'function') {
                try {
                    // --- АВТОМАТИЧЕСКАЯ ПОДСТАНОВКА ПАРАМЕТРОВ ИЗ REQ.QUERY ---
                    const targetMethod = controller[actionMethod];
                    const paramMeta = extractMethodParams(targetMethod);
                    const queryParams = req.query || {};

                    const actionArgs = paramMeta.map(({ name, defaultValue }) => {
                        if (queryParams[name] !== undefined) {
                            return queryParams[name];
                        }
                        return defaultValue;
                    });

                    // Вызываем action с собранными параметрами
                    return await targetMethod.apply(controller, actionArgs);
                } catch (actionErr) {
                    if (actionErr.message === 'PHP_DIE_SIGNAL') return;
                    return await controller.renderError(actionErr);
                }
            } else {
                const err = new NotFoundHttpException(`Действие "${actionMethod}" не найдено в контроллере ${className}.`);
                return await controller.renderError(err);
            }

        } catch (err) {
            if (err.message === 'PHP_DIE_SIGNAL') return;

            // Если контроллер не найден (404)
            if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
                try {
                    const siteModule = await import('../controllers/SiteController.js');
                    const siteController = new siteModule.SiteController(req, res);
                    return await siteController.renderError(new NotFoundHttpException(`Страница не найдена.`));
                } catch (siteErr) {
                    console.error('SiteController Error:', siteErr);
                }
            }

            console.error('[Router Exception]:', err);
            return res.status(500).send('Internal Server Error');
        }
    });
}