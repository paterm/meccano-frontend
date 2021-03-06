import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import TopBar from '../TopBar/TopBar';
import './page.scss';

const cls = new Bem('page');

class Page extends Component {
    static propTypes = {
        title: PropTypes.string,
        className: PropTypes.string,
        children: PropTypes.node,
        withBar: PropTypes.bool,
        staticBar: PropTypes.bool,
        withContainerClass: PropTypes.bool,
        notificationsPanel: PropTypes.object
    };

    static defaultProps = {
        withContainerClass: true
    };

    render() {
        const {className, children, withBar, staticBar, withContainerClass, notificationsPanel, title} = this.props;

        return (
            <div {...cls('', {'with-bar': withBar && !staticBar, blur: notificationsPanel.open})}>
                {withBar && <TopBar isStatic={staticBar}/>}

                <div
                    {...cls('content', '', {
                        container: withContainerClass,
                        [className]: !!className
                    })}
                >
                    {title && <h1 {...cls('title')}>{title}</h1>}
                    {children}
                </div>
            </div>
        );
    }
}

export default connect(({notificationsPanel}) => ({notificationsPanel}))(Page);
