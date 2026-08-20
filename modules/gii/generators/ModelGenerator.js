// modules/gii/generators/ModelGenerator.js
import fs from 'fs/promises';
import path from 'path';
import { Yii } from '../../../framework/Application.js';

export class ModelGenerator {
    /**
     * Генерирует код модели на основе существующей таблицы БД
     */
    static async generate({ tableName, className }) {
        const db = Yii.app.get('db');

        // Получаем информацию о колонках таблицы через Knex
        let columnInfo = {};
        try {
            columnInfo = await db(tableName).columnInfo();
        } catch (err) {
            throw new Error(`Таблица "${tableName}" не найдена в базе данных.`);
        }

        const columns = Object.keys(columnInfo);

        // Шаблон кода модели ActiveRecord
        const code = `import { ActiveRecord } from '../framework/db/ActiveRecord.js';

export class ${className} extends ActiveRecord {
    static tableName() {
        return '${tableName}';
    }

    constructor(attributes = {}) {
        super(attributes);
    }
}
`;

        const targetDir = path.resolve(process.cwd(), 'models');
        const targetPath = path.join(targetDir, `${className}.js`);

        // Создаем папку models, если она еще не существует
        await fs.mkdir(targetDir, { recursive: true });

        // Записываем файл
        await fs.writeFile(targetPath, code, 'utf-8');

        return {
            success: true,
            filePath: targetPath,
            columns
        };
    }
}