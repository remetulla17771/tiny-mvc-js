// framework/widgets/ActiveForm.js

class ActiveField {
    constructor(model, attribute, options = {}) {
        this.model = model;
        this.attribute = attribute;
        this.options = options;
        this._type = 'text';
        this._label = null;
    }

    label(text) {
        this._label = text;
        return this;
    }

    passwordInput(options = {}) {
        this._type = 'password';
        Object.assign(this.options, options);
        return this;
    }

    textInput(options = {}) {
        this._type = 'text';
        Object.assign(this.options, options);
        return this;
    }

    textarea(options = {}) {
        this._type = 'textarea';
        Object.assign(this.options, options);
        return this;
    }

    render() {
        const value = this.model[this.attribute] ?? '';
        const labelText = this._label || this.attribute.charAt(0).toUpperCase() + this.attribute.slice(1);
        const errors = this.model.errors?.[this.attribute] || [];
        const hasError = errors.length > 0;

        const groupClass = `form-group field-${this.attribute}${hasError ? 'has-error' : ''}`;

        let inputHtml = '';
        if (this._type === 'textarea') {
            inputHtml = `<textarea id="${this.attribute}" name="${this.attribute}" class="form-control">${value}</textarea>`;
        } else {
            inputHtml = `<input type="${this._type}" id="${this.attribute}" name="${this.attribute}" value="${value}" class="form-control" />`;
        }

        const errorHtml = hasError ? `<div class="help-block error">${errors[0]}</div>` : '';

        return `
      <div class="${groupClass}">
        <label for="${this.attribute}">${labelText}</label>
        ${inputHtml}${errorHtml}
      </div>
    `;
    }

    toString() {
        return this.render();
    }
}

export class ActiveForm {
    constructor(options = {}) {
        this.action = options.action || '';
        this.method = options.method || 'POST';
    }

    static begin(options = {}) {
        const form = new ActiveForm(options);
        return {
            form,
            html: `<form action="${form.action}" method="${form.method}">`
        };
    }

    static end() {
        return `</form>`;
    }

    field(model, attribute, options = {}) {
        return new ActiveField(model, attribute, options);
    }
}