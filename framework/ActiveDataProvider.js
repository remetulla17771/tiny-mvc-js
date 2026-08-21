// framework/data/ActiveDataProvider.js
import { Yii } from './Application.js';

export class ActiveDataProvider {
    constructor(config = {}) {
        this.query = config.query; // Инстанс ActiveQuery (User.find())
        this.pageSize = config.pageSize || 10;
        this.page = config.page || null; // Принимает переданный page из actionIndex
        this._models = null;
        this._totalCount = null;
    }

    // Извлекает страницу из config или берёт из GET-параметров Fastify
    get currentPage() {
        if (this.page) return parseInt(this.page, 10);
        const req = Yii.app?.req;
        const p = req?.query?.page ? parseInt(req.query.page, 10) : 1;
        return isNaN(p) || p < 1 ? 1 : p;
    }

    async getTotalCount() {
        if (this._totalCount === null) {
            // Подсчет без ограничения limit/offset
            this._totalCount = await this.query.clone().count();
        }
        return this._totalCount;
    }

    async getModels() {
        if (this._models === null) {
            const offset = (this.currentPage - 1) * this.pageSize;

            // Выполняем выборку на изолированной копии запроса
            this._models = await this.query
                .clone()
                .limit(this.pageSize)
                .offset(offset)
                .all();
        }
        return this._models;
    }

    async getPagination() {
        const total = await this.getTotalCount();
        const pageCount = Math.ceil(total / this.pageSize);

        return {
            page: this.currentPage,
            pageSize: this.pageSize,
            totalCount: total,
            pageCount: pageCount
        };
    }
}