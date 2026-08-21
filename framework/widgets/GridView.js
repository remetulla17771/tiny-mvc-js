// framework/widgets/GridView.js

export class GridView {
    static async widget(config = {}) {
        const instance = new GridView(config);
        return await instance.render();
    }

    constructor(config = {}) {
        this.dataProvider = config.dataProvider;
        this.columns = config.columns || [];
        this.tableOptions = config.tableOptions || 'table table-striped table-bordered';
    }

    async render() {
        const models = await this.dataProvider.getModels();
        const pagination = await this.dataProvider.getPagination();

        let html = `<div class="grid-view">`;
        html += `<table class="${this.tableOptions}">`;

        // Передаем первую модель в renderHeader для извлечения attributeLabels
        const sampleModel = models && models.length > 0 ? models[0] : null;
        html += this.renderHeader(sampleModel);

        html += await this.renderBody(models);
        html += `</table>`;
        html += this.renderPagination(pagination);
        html += `</div>`;

        return html;
    }

    renderHeader(sampleModel) {
        let html = '<thead><tr>';

        for (const col of this.columns) {
            let label = '';

            if (typeof col === 'string') {
                // Если модель известна, берём метку из attributeLabels()
                if (sampleModel && typeof sampleModel.getAttributeLabel === 'function') {
                    label = sampleModel.getAttributeLabel(col);
                } else {
                    label = this.formatLabel(col);
                }
            } else if (typeof col === 'object') {
                if (col.label) {
                    label = col.label;
                } else if (col.attribute) {
                    if (sampleModel && typeof sampleModel.getAttributeLabel === 'function') {
                        label = sampleModel.getAttributeLabel(col.attribute);
                    } else {
                        label = this.formatLabel(col.attribute);
                    }
                }
            }

            html += `<th>${this.escape(label)}</th>`;
        }

        html += '</tr></thead>';
        return html;
    }

    async renderBody(models) {
        let html = '<tbody>';
        const safeModels = Array.isArray(models) ? models : [];

        if (safeModels.length === 0) {
            html += `<tr><td colspan="${this.columns.length}" class="text-center text-muted">Записи не найдены</td></tr>`;
            html += '</tbody>';
            return html;
        }

        for (const model of safeModels) {
            html += '<tr>';
            for (const col of this.columns) {
                let cellValue = '';

                if (typeof col === 'string') {
                    cellValue = model[col] !== undefined ? model[col] : '';
                } else if (typeof col === 'object') {
                    if (typeof col.value === 'function') {
                        cellValue = await col.value(model);
                    } else if (col.attribute) {
                        cellValue = model[col.attribute];
                    }
                }

                const isRaw = typeof col === 'object' && (col.format === 'raw' || typeof col.value === 'function');
                html += `<td>${isRaw ? cellValue : this.escape(cellValue)}</td>`;
            }
            html += '</tr>';
        }

        html += '</tbody>';
        return html;
    }

    renderPagination(pagination) {
        if (!pagination || pagination.pageCount <= 1) return '';

        let html = '<nav><ul class="pagination mb-0">';
        const currentUrl = Yii.app.req.raw.url.split('?')[0];

        for (let i = 1; i <= pagination.pageCount; i++) {
            const active = i === pagination.page ? 'active' : '';
            html += `<li class="page-item ${active}"><a class="page-link" href="${currentUrl}?page=${i}">${i}</a></li>`;
        }

        html += '</ul></nav>';
        return html;
    }

    formatLabel(str) {
        return str
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^./, (s) => s.toUpperCase());
    }

    escape(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}