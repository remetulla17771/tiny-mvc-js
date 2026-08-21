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

        let columnInfo = {};
        try {
            columnInfo = await db(tableName).columnInfo();
        } catch (err) {
            throw new Error(`Таблица "${tableName}" не найдена в базе данных.`);
        }

        const columns = Object.keys(columnInfo);

        // 1. Анализируем колонки и формируем rules() и attributeLabels()
        const requiredFields = [];
        const emailFields = [];
        const stringFields = [];
        const numberFields = [];
        const labels = {};

        for (const [colName, info] of Object.entries(columnInfo)) {
            // Формируем человекочитаемый Label (например, created_at -> Created At)
            labels[colName] = colName
                .replace(/_/g, ' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/^./, (str) => str.toUpperCase());

            // Игнорируем автоинкрементный первичный ключ и системные метки времени при валидации обязательных полей
            const isPk = colName === 'id';
            const isTimestamp = ['created_at', 'updated_at'].includes(colName);

            // Проверка на nullable (Required)
            if (!info.nullable && !isPk && !isTimestamp && info.defaultValue === null) {
                requiredFields.push(colName);
            }

            // Определение типов данных
            const type = info.type.toLowerCase();

            if (colName.includes('email')) {
                emailFields.push(colName);
            } else if (['varchar', 'text', 'string', 'char'].some(t => type.includes(t))) {
                if (info.maxLength) {
                    stringFields.push({ name: colName, max: info.maxLength });
                } else {
                    stringFields.push({ name: colName });
                }
            } else if (['int', 'integer', 'bigint', 'smallint', 'tinyint', 'float', 'double', 'decimal', 'numeric'].some(t => type.includes(t))) {
                if (!isPk) {
                    numberFields.push(colName);
                }
            }
        }

        // 2. Генерируем массив строк для rules()
        const rulesArray = [];

        if (requiredFields.length > 0) {
            rulesArray.push(`            [${JSON.stringify(requiredFields)}, 'required']`);
        }

        if (emailFields.length > 0) {
            rulesArray.push(`            [${JSON.stringify(emailFields)}, 'email']`);
        }

        // Группируем обычные string поля и поля с ограничением max
        const plainStringFields = stringFields.filter(f => !f.max).map(f => f.name);
        if (plainStringFields.length > 0) {
            rulesArray.push(`            [${JSON.stringify(plainStringFields)}, 'string']`);
        }

        stringFields.filter(f => f.max).forEach(f => {
            rulesArray.push(`            [['${f.name}'], 'string', { max: ${f.max} }]`);
        });

        // 3. Собираем итоговый код модели
        const code = `import { ActiveRecord } from '../framework/db/ActiveRecord.js';

export class ${className} extends ActiveRecord {
    static tableName() {
        return '${tableName}';
    }

    attributeLabels() {
        return ${JSON.stringify(labels, null, 12).replace(/"([^"]+)":/g, '$1:')};
    }

    rules() {
        return [
${rulesArray.join(',\n')}
        ];
    }
}
`;

        const targetDir = path.resolve(process.cwd(), 'models');
        const targetPath = path.join(targetDir, `${className}.js`);

        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(targetPath, code, 'utf-8');

        return {
            success: true,
            filePath: targetPath,
            columns
        };
    }
}