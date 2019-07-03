import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from '../../../../Shared/ConfirmModal/ConfirmModal';
import './settings-export-modal.scss';
import InputText from '../../../../Form/InputText/InputText';
import TransferService from '../../../../../services/TransferService';
import Form from '../../../../Form/Form/Form';
import Loader from '../../../../Shared/Loader/Loader';
import {NotificationManager} from 'react-notifications';
import InputFile from '../../../../Form/InputFile/InputFile';
import objectToFormData from 'object-to-formdata';
import Select from '../../../../Form/Select/Select';

const classes = new Bem('settings-export-modal');

export default class SettingsExportModal extends Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        item: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.defaultForm = {
            name: '',
            rules: [],
            replaces: [],
            type: 'html'
        };
        this.defaultRule = {
            selector: '',
            element: ''
        };
        this.defaultReplace = {
            search: '',
            replace: ''
        };
        this.state = {
            form: props.item || {...this.defaultForm},
            inProgress: false
        };
    }

    handleChangeForm = (value, prop) => {
        const newState = this.state;

        newState.form[prop] = value;
        this.setState(newState);
    };

    handleAddRule = () => {
        const {form: {rules}} = this.state;
        const hasEmpty = rules.some(rule => !rule.selector || !rule.element);

        if (!hasEmpty) {
            this.setState(prev => prev.form.rules.push({...this.defaultRule}));
        }
    };

    handleChangeRule = (value, prop, index) => {
        this.setState(prev => prev.form.rules[index][prop] = value);
    };

    handleDeleteRule = (index) => {
        const newState = this.state;

        newState.form.rules.splice(index, 1);

        this.setState(newState);
    };

    handleAddReplace = () => {
        const {form: {replaces}} = this.state;
        const hasEmpty = replaces.some(join => !join.search || !join.replace);

        if (!hasEmpty) {
            this.setState(prev => prev.form.replaces.push({...this.defaultReplace}));
        }
    };

    handleChangeReplace = (value, prop, index) => {
        this.setState(prev => prev.form.replaces[index][prop] = value);
    };

    handleDeleteJoin = (index) => {
        const newState = this.state;

        newState.form.replaces.splice(index, 1);

        this.setState(newState);
    };

    handleSubmit = () => {
        const form = _.pick(this.state.form, ['name', 'rules', 'replaces', 'file', 'type']);
        const method = this.state.form.id ? 'update' : 'set';
        const formData = objectToFormData(form, {indices: true});

        if (!form.rules.length) return NotificationManager.error('Не заполнены "Правила замены"', 'Ошибка');
        if (!form.rules.every(item => item.selector && item.element)) {
            return NotificationManager.error('Не верно заполнены поля "Правила замены"', ' Ошибка');
        }

        if (!form.replaces.length) return  NotificationManager.error('Не заполнен "Список замен"', 'Ошибка');
        if (!form.replaces.every(item => item.search && item.replace)) {
            return NotificationManager.error('Не верно заполнены поля "Список замен"', ' Ошибка');
        }

        this.setState({inProgress: true}, () => {
            TransferService.export[method](formData, this.state.form.id).then(response => {
                NotificationManager.success('Успешно сохранено', 'Сохранено');
                this.setState({
                    form: {...this.defaultForm},
                    inProgress: false
                });
                this.props.onSubmit(response.data, method);
                this.props.onClose();
            }).catch(() => this.setState({inProgress: false}));
        });
    };

    types = [
        {name: 'xlsx', value: 'xlsx'},
        {name: 'html', value: 'html'},
        {name: 'docx', value: 'docx'}
    ];

    renderRule = (rule, ruleIndex) => (
        <div {...classes('rule')}  key={ruleIndex}>
            <div {...classes('rule-row', '', 'row')}>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='Селектор'
                        value={rule.selector}
                        onChange={val => this.handleChangeRule(val, 'selector', ruleIndex)}
                    />
                </div>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        label='Элемент'
                        value={rule.element}
                        onChange={val => this.handleChangeRule(val, 'element', ruleIndex)}
                    />
                </div>
            </div>
            <div {...classes('rule-buttons')}>
                <button
                    {...classes('button', 'remove')}
                    onClick={() => this.handleDeleteRule(ruleIndex)}
                >✕</button>
            </div>
        </div>
    );

    renderReplace = (replace, replaceIndex) => (
        <div {...classes('rule')}  key={replaceIndex}>
            <div {...classes('rule-row', '', 'row')}>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='Элемент'
                        value={replace.search}
                        onChange={val => this.handleChangeReplace(val, 'search', replaceIndex)}
                    />
                </div>
                <div {...classes('item', '', 'col-xs-6')}>
                    <InputText
                        label='Замена'
                        value={replace.replace}
                        onChange={val => this.handleChangeReplace(val, 'replace', replaceIndex)}
                    />
                </div>
            </div>
            <div {...classes('rule-buttons')}>
                <button
                    {...classes('button', 'remove')}
                    onClick={() => this.handleDeleteJoin(replaceIndex)}
                >✕</button>
            </div>
        </div>
    );

    render() {
        const {onClose} = this.props;
        const {form, inProgress} = this.state;
        const fileName = form.file ? [form.file] : [];

        return (
            <ConfirmModal
                title={form.id ? 'Изменить' : 'Добавить'}
                onClose={onClose}
                onSubmit={() => this.form.submit()}
            >
                <Form
                    onSubmit={this.handleSubmit}
                    ref={ref => this.form = ref}
                    validate
                >
                    <div {...classes('row', '', 'row')}>
                        <div {...classes('item', '', 'col-md-6')}>
                            <InputText
                                autoFocus
                                required
                                label='Название'
                                value={form.name}
                                onChange={val => this.handleChangeForm(val, 'name')}
                            />
                        </div>
                        <div {...classes('item', '', 'col-md-6')}>
                            <Select
                                label='Тип'
                                options={this.types}
                                required
                                onChange={item => this.handleChangeForm(item.value, 'type')}
                                selected={this.types.find(({value}) => value === form.type)}
                            />
                        </div>
                    </div>

                    <div {...classes('row', '', 'row')}>
                        <div {...classes('item', '', 'col-md-12')}>
                            <InputFile
                                required
                                files={fileName}
                                onChange={file => this.handleChangeForm(file, 'file')}
                            />
                        </div>
                    </div>

                    <section {...classes('rules')}>
                        <h3 {...classes('title')}>Правила замены</h3>

                        {form.rules.map(this.renderRule)}
                        <a
                            role='button'
                            {...classes('empty-msg')}
                            onClick={this.handleAddRule}
                        >+ Добавить</a>
                    </section>

                    <section {...classes('joins')}>
                        <h3 {...classes('title')}>Список замен</h3>

                        {form.replaces.map(this.renderReplace)}
                        <a
                            role='button'
                            {...classes('empty-msg')}
                            onClick={this.handleAddReplace}
                        >+ Добавить</a>
                    </section>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
