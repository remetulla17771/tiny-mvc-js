// modules/gii/generators/ModuleGenerator.js
import fs from 'fs/promises';
import path from 'path';

export class ModuleGenerator {
    /**
     * Генерирует структуру и файлы нового модуля
     */
    static async generate({ moduleId, moduleClass = null }) {
        // Очищаем ID от невалидных символов и приводим к нижнему регистру (например: shop, user-management)
        const cleanModuleId = moduleId.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

        if (!cleanModuleId) {
            throw new Error('ID модуля не может быть пустым.');
        }

        // Преобразование kebab-case -> PascalCase (user-management -> UserManagement)
        const toPascalCase = (str) =>
            str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join('');

        const pascalName = toPascalCase(cleanModuleId);
        const className = moduleClass ? moduleClass.trim() : `${pascalName}Module`;

        const moduleDir = path.resolve(process.cwd(), `modules/${cleanModuleId}`);

        // Проверяем, существует ли уже модуль
        try {
            await fs.access(moduleDir);
            throw new Error(`Модуль "${cleanModuleId}" уже существует по пути: ${moduleDir}`);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }

        // 1. Создаем структуру папок модуля
        const dirsToCreate = [
            moduleDir,
            path.join(moduleDir, 'controllers'),
            path.join(moduleDir, 'views'),
            path.join(moduleDir, 'views/default'),
            path.join(moduleDir, 'views/layouts'),
            path.join(moduleDir, 'models')
        ];

        for (const dir of dirsToCreate) {
            await fs.mkdir(dir, { recursive: true });
        }

        // 2. Генерируем Module.js
        const moduleCode = `import { Module as BaseModule } from '../../framework/base/Module.js';

export class ${className}Module extends BaseModule {
    constructor(id = '${cleanModuleId}', parent = null, config = {}) {
        super(id, parent, config);
    }

    async beforeAction(controller, action) {
        return true;
    }
}
`;
        await fs.writeFile(path.join(moduleDir, 'Module.js'), moduleCode, 'utf-8');

        // 3. Генерируем DefaultController.js
        const controllerCode = `import { BaseController } from '../../../framework/BaseController.js';

export class DefaultController extends BaseController {
    layout = 'main';

    async actionIndex() {
        return this.render('index', {
            title: 'Модуль ${cleanModuleId}'
        });
    }
}
`;
        await fs.writeFile(path.join(moduleDir, 'controllers/DefaultController.js'), controllerCode, 'utf-8');

        // 4. Генерируем Layout (views/layouts/main.njk)
        const layoutCode = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>{{ title }} | Модуль ${cleanModuleId}</title>
    {{ view.renderHead() | safe }}
    <style>
        body { margin: 0; font-family: sans-serif; background: #f8fafc; padding-top: 0; }
        .module-navbar { background: #1e293b; color: white; padding: 15px 30px; }
        .module-container { padding: 30px; }
    </style>
</head>
<body>
    <div class="module-navbar">
        <h2>📦 Модуль: ${cleanModuleId}</h2>
    </div>
    <div class="module-container">
        {{ content | safe }}
    </div>
    {{ view.renderEndBody() | safe }}
</body>
</html>
`;
        await fs.writeFile(path.join(moduleDir, 'views/layouts/main.njk'), layoutCode, 'utf-8');

        // 5. Генерируем Главное представление (views/default/index.njk)
        const indexViewCode = `<div class="${cleanModuleId}-default-index">
    <h1>Добро пожаловать в модуль "${cleanModuleId}"!</h1>
    <p>Это главная страница вашего нового модуля. Вы можете отредактировать этот файл по пути:</p>
    <code>modules/${cleanModuleId}/views/default/index.njk</code>
</div>
`;
        await fs.writeFile(path.join(moduleDir, 'views/default/index.njk'), indexViewCode, 'utf-8');

        // Подготавливаем пример конфига для подсказки
        const configSnippet = `// Подключите модуль в config/main.js:
import { ${className}Module } from '../modules/${cleanModuleId}/Module.js';

modules: {
    ${cleanModuleId}: {
        class: ${className}Module
    }
}`;

        return {
            success: true,
            moduleId: cleanModuleId,
            className,
            moduleDir,
            configSnippet
        };
    }
}