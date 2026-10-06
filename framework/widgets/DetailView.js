// framework/widgets/DetailView.js

export class DetailView {
    static async widget(config = {}) {
        const instance = new DetailView(config);
        return await instance.render();
    }

    constructor(config = {}) {
        this.model = config.model || null;
        this.attributes = config.attributes || [];
        this.tableOptions = config.tableOptions || 'table table-striped table-bordered detail-view';
    }

    async render() {
        if (!this.model) {
            return '<div class="text-danger">Модель не передана в DetailView</div>';
        }

        let html = `<table class="${this.tableOptions}"><tbody>`;

        for (const attr of this.attributes) {
            html += '<tr>';

            if (typeof attr === 'string') {
                // Берем label из attributeLabels() модели или форматируем имя
                const label = typeof this.model.getAttributeLabel === 'function'
                    ? this.model.getAttributeLabel(attr)
                    : this.formatLabel(attr);

                const value = this.model[attr] !== undefined ? this.model[attr] : '';

                html += `<th style="width: 30%;">${this.escape(label)}</th>`;
                html += `<td>${this.escape(value)}</td>`;

            } else if (typeof attr === 'object') {
                // Если передали объект: берём явный attr.label, иначе вытягиваем из модели
                let label = attr.label;
                if (!label && attr.attribute) {
                    label = typeof this.model.getAttributeLabel === 'function'
                        ? this.model.getAttributeLabel(attr.attribute)
                        : this.formatLabel(attr.attribute);
                }

                let value = '';
                if (typeof attr.value === 'function') {
                    value = await attr.value(this.model);
                } else if (attr.attribute) {
                    value = this.model[attr.attribute];
                }

                html += `<th style="width: 30%;">${this.escape(label || '')}</th>`;

                const isRaw = attr.format === 'raw' || typeof attr.value === 'function';
                html += `<td>${isRaw ? value : this.escape(value)}</td>`;
            }

            html += '</tr>';
        }

        html += '</tbody></table>';
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