// framework/data/ActiveDataProvider.js
import { Yii } from './Application.js';

export class ActiveDataProvider {
    constructor(config = {}) {
        this.query = config.query; // Напр. User.find()
        this.pageSize = config.pageSize || 10;
        this._models = null;
        this._totalCount = null;
    }

    // Текущая страница из query-параметров (?page=1)
    get page() {
        const req = Yii.app.req;
        const p = req && req.query ? parseInt(req.query.page, 10) : 1;
        return isNaN(p) || p < 1 ? 1 : p;
    }

    async getTotalCount() {
        if (this._totalCount === null) {
            this._totalCount = await this.query.count();
        }
        return this._totalCount;
    }

    async getModels() {
        if (this._models === null) {
            const offset = (this.page - 1) * this.pageSize;
            this._models = await this.query
                .offset(offset)
                .limit(this.pageSize)
                .all();
        }
        return this._models;
    }

    async getPagination() {
        const total = await this.getTotalCount();
        const pageCount = Math.ceil(total / this.pageSize);
        return {
            page: this.page,
            pageSize: this.pageSize,
            totalCount: total,
            pageCount: pageCount
        };
    }
}