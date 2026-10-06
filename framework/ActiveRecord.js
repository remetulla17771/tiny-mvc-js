// framework/ActiveRecord.js
import { BaseModel } from './BaseModel.js';
import { ActiveQuery } from './ActiveQuery.js';
import { Yii } from './Application.js';

export class ActiveRecord extends BaseModel {
    static tableName() {
        throw new Error('tableName() must be implemented');
    }

    static primaryKey() {
        return 'id';
    }

    // Главная точка входа: User.find() возвращает ActiveQuery
    static find() {
        return new ActiveQuery(this);
    }

    // Поиск одного элемента
    // framework/ActiveRecord.js
    static async findOne(condition) {
        // Если условие не передано (undefined или null), сразу возвращаем null
        if (condition === undefined || condition === null) {
            return null;
        }

        if (typeof condition === 'object') {
            return await this.find().where(condition).one();
        }
        return await this.find().where({ [this.primaryKey()]: condition }).one();
    }

    // Поиск всех элементов по условию
    static async findAll(condition = null) {
        const query = this.find();
        if (condition) {
            if (typeof condition === 'object') {
                query.where(condition);
            } else {
                query.where({ [this.primaryKey()]: condition });
            }
        }
        return await query.all();
    }

    async save() {
        const isNewRecord = !this[this.constructor.primaryKey()];
        const db = Yii.app.db;
        const tableName = this.constructor.tableName();

        if (!(await this.validate())) {
            return false;
        }

        const data = { ...this };
        delete data._errors;

        if (isNewRecord) {
            const [id] = await db(tableName).insert(data);
            this[this.constructor.primaryKey()] = id;
        } else {
            const pk = this.constructor.primaryKey();
            await db(tableName).where(pk, this[pk]).update(data);
        }

        return true;
    }
}