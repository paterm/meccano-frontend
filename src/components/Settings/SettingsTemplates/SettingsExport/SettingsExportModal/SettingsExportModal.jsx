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
import InlineButton from '../../../../Shared/InlineButton/InlineButton';
import InputTags from '../../../../Form/InputTags/InputTags';
import {ProjectService} from '../../../../../services';

const cls = new Bem('settings-export-modal');

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
            projects: [],
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
        const form = _.pick(this.state.form, ['name', 'rules', 'replaces', 'projects', 'file', 'type']);
        const method = this.state.form.id ? 'update' : 'set';

        if (_.get(form.file, 'id')) delete form.file;

        form.rules = form.rules.map(({id, selector, element}) => ({id, selector, element}));
        form.replaces = form.replaces.map(({id, search, replace}) => ({id, search, replace}));
        form.projects = form.projects.map(({id}) => id);

        const formData = objectToFormData(form, {indices: true});

        if (!form.rules.length) return NotificationManager.error('Не заполнены "Правила замены"', 'Ошибка');
        if (!form.rules.every(item => item.selector && item.element)) {
            return NotificationManager.error('Не верно заполнены поля "Правила замены"', ' Ошибка');
        }

        // if (!form.replaces.length) return  NotificationManager.error('Не заполнен "Список замен"', 'Ошибка');
        // if (!form.replaces.every(item => item.search && item.replace)) {
        //     return NotificationManager.error('Не верно заполнены поля "Список замен"', ' Ошибка');
        // }

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
        // {name: 'xml', value: 'xml'},
        {name: 'xlsx', value: 'xlsx'},
        {name: 'html', value: 'html'},
        {name: 'docx', value: 'docx'}
    ];

    renderRule = (rule, ruleIndex) => (
        <div {...cls('rule')}  key={ruleIndex}>
            <div {...cls('rule-row', '', 'row')}>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='Селектор'
                        value={rule.selector}
                        onChange={val => this.handleChangeRule(val, 'selector', ruleIndex)}
                    />
                </div>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        label='Элемент'
                        value={rule.element}
                        onChange={val => this.handleChangeRule(val, 'element', ruleIndex)}
                    />
                </div>
            </div>
            <div {...cls('rule-buttons')}>
                <button
                    tabIndex={-1}
                    type='button'
                    {...cls('button', 'remove')}
                    onClick={() => this.handleDeleteRule(ruleIndex)}
                >✕</button>
            </div>
        </div>
    );

    renderReplace = (replace, replaceIndex) => (
        <div {...cls('rule')}  key={replaceIndex}>
            <div {...cls('rule-row', '', 'row')}>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        label='Замена'
                        value={replace.replace}
                        onChange={val => this.handleChangeReplace(val, 'replace', replaceIndex)}
                    />
                </div>
                <div {...cls('item', '', 'col-xs-6')}>
                    <InputText
                        autoFocus
                        label='Элемент'
                        value={replace.search}
                        onChange={val => this.handleChangeReplace(val, 'search', replaceIndex)}
                    />
                </div>
            </div>
            <div {...cls('rule-buttons')}>
                <button
                    tabIndex={-1}
                    type='button'
                    {...cls('button', 'remove')}
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
                    <div {...cls('row', '', 'row')}>
                        <div {...cls('item', '', 'col-md-6')}>
                            <InputText
                                autoFocus
                                required
                                label='Название'
                                value={form.name}
                                onChange={val => this.handleChangeForm(val, 'name')}
                            />
                        </div>
                        <div {...cls('item', '', 'col-md-6')}>
                            <Select
                                label='Тип'
                                options={this.types}
                                required
                                onChange={item => this.handleChangeForm(item.value, 'type')}
                                selected={this.types.find(({value}) => value === form.type)}
                            />
                        </div>
                    </div>

                    <div {...cls('row', '', 'row')}>
                        <div {...cls('item', '', 'col-md-12')}>
                            <InputFile
                                files={fileName}
                                onChange={file => this.handleChangeForm(file, 'file')}
                            />
                        </div>
                    </div>

                    <div {...cls('row', '', 'row')}>
                        <div {...cls('item', '', 'col-md-12')}>
                            <InputTags
                                allowNew={false}
                                label='Проект'
                                tags={form.projects || []}
                                onChange={val => this.handleChangeForm(val, 'projects')}
                                requestService={ProjectService.get}
                                requestCancelService={ProjectService.cancelLast}
                            />
                        </div>
                    </div>

                    <section {...cls('rules')}>
                        <h3 {...cls('title')}>Правила замены</h3>

                        {form.rules.map(this.renderRule)}
                        <InlineButton onClick={this.handleAddRule}>
                            + Добавить
                        </InlineButton>
                    </section>

                    <section {...cls('joins')}>
                        <h3 {...cls('title')}>Список замен</h3>

                        {form.replaces.map(this.renderReplace)}
                        <InlineButton onClick={this.handleAddReplace}>
                            + Добавить
                        </InlineButton>
                    </section>
                </Form>

                {inProgress && <Loader/>}
            </ConfirmModal>
        );
    }
}
