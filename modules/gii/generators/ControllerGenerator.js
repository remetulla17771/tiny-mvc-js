// modules/gii/generators/ControllerGenerator.js
import fs from 'fs/promises';
import path from 'path';

export class ControllerGenerator {
    static async generate({ controllerName, actions = ['index'] }) {
        // Вычисляем имя класса (User -> UserController)
        const className = controllerName.endsWith('Controller')
            ? controllerName
            : `${controllerName.charAt(0).toUpperCase() + controllerName.slice(1)}Controller`;

        const actionsCode = actions
            .map(act => {
                const actionMethod = 'action' + act.charAt(0).toUpperCase() + act.slice(1);
                const viewName = act.toLowerCase();
                return `    async ${actionMethod}() {
        return this.render('${viewName}', {
            title: '${act.toUpperCase()}'
        });
    }`;
            })
            .join('\n\n');

        const code = `import { BaseController } from '../framework/BaseController.js';

export class ${className} extends BaseController {
${actionsCode}
}
`;

        const targetDir = path.resolve(process.cwd(), 'controllers');
        const targetPath = path.join(targetDir, `${className}.js`);

        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(targetPath, code, 'utf-8');

        // Также автоматически создаем папки и пустышки для views
        const viewFolder = controllerName.replace('Controller', '').toLowerCase();
        const viewsDir = path.resolve(process.cwd(), `views/${viewFolder}`);
        await fs.mkdir(viewsDir, { recursive: true });

        for (const act of actions) {
            const viewPath = path.join(viewsDir, `${act.toLowerCase()}.njk`);
            const viewContent = `<div class="${viewFolder}-${act}">
    <h1>${className}.${act}</h1>
    <p>Шаблон автосгенерирован через Gii Generator.</p>
</div>`;
            await fs.writeFile(viewPath, viewContent, 'utf-8');
        }

        return {
            success: true,
            filePath: targetPath,
            viewsDir
        };
    }
}