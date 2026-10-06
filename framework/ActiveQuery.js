// framework/ActiveQuery.js
import { Yii } from './Application.js';

export class ActiveQuery {
    constructor(modelClass) {
        this.modelClass = modelClass;
        this.db = Yii.app.db;
        this.knexQuery = this.db(modelClass.tableName()).select('*');
    }

    // Создание изолированной копии билдера для безопасных операций (count, pagination)
    clone() {
        const cloned = new ActiveQuery(this.modelClass);
        cloned.knexQuery = this.knexQuery.clone();
        return cloned;
    }

    // Аналог ->where(['status' => 1]) или ->where('age > ?', [18])
    where(condition, params = []) {
        if (typeof condition === 'string') {
            this.knexQuery.whereRaw(condition, params);
        } else if (typeof condition === 'object') {
            this.knexQuery.where(condition);
        }
        return this;
    }

    // Аналог ->andWhere(...)
    andWhere(condition, params = []) {
        return this.where(condition, params);
    }

    // Аналог ->orWhere(...)
    orWhere(condition, params = []) {
        if (typeof condition === 'string') {
            this.knexQuery.orWhereRaw(condition, params);
        } else if (typeof condition === 'object') {
            this.knexQuery.orWhere(condition);
        }
        return this;
    }

    // Аналог ->orderBy(['id' => SORT_DESC]) или ->orderBy('id DESC')
    orderBy(column, direction = 'asc') {
        if (typeof column === 'object') {
            Object.keys(column).forEach((col) => {
                const dir = column[col] === -1 || column[col] === 'DESC' || column[col] === 'desc' ? 'desc' : 'asc';
                this.knexQuery.orderBy(col, dir);
            });
        } else {
            this.knexQuery.orderBy(column, direction);
        }
        return this;
    }

    // Аналог ->limit(10)
    limit(value) {
        this.knexQuery.limit(value);
        return this;
    }

    // Аналог ->offset(20)
    offset(value) {
        this.knexQuery.offset(value);
        return this;
    }

    // Аналог ->count()
    async count() {
        // Клонируем инстанс и полностью очищаем select, limit и offset для корректного подсчета всех строк
        const cleanQuery = this.knexQuery.clone().clearSelect().clear('limit').clear('offset');
        const result = await cleanQuery.count('* as count').first();
        return result ? Number(result.count) : 0;
    }

    // Выполнение запроса: возврат одного объекта (аналог ->one())
    async one() {
        const row = await this.knexQuery.first();
        if (!row) return null;

        const instance = new this.modelClass();
        Object.assign(instance, row);
        return instance;
    }

    // Выполнение запроса: возврат массива объектов (аналог ->all())
    async all() {
        const rows = await this.knexQuery;
        if (!rows || rows.length === 0) return [];

        return rows.map((row) => {
            const instance = new this.modelClass();
            Object.assign(instance, row);
            return instance;
        });
    }
}