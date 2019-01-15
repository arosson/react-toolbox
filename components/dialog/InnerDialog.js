/* eslint-disable jsx-a11y/aria-role */
import React from 'react';
import PropTypes from 'prop-types';
import { themr } from 'react-css-themr';
import classnames from 'classnames';
import { INNER_DIALOG } from '../identifiers';
import InjectButton from '../button/Button';

const factory = (Button) => {
  const InnerDialog = (props) => {
    const actions = props.actions.map((action, idx) => {
      const className = classnames(props.theme.button, { [action.className]: action.className });
      return <Button key={idx} {...action} className={className} />; // eslint-disable-line
    });

    const overlayTopActions = props.overlayTopActions.map((action) => {
      const className = classnames(props.theme.button, { [action.className]: action.className });
      return <Button key={action.label || action.icon} {...action} className={className} />;
    });

    const className = classnames([props.theme.dialog,
      props.theme[props.type]], {
        [props.theme.active]: props.active,
      }, props.className);

    return (
      <div data-react-toolbox="dialog" className={className}>
        {overlayTopActions.length
          ? <div className={props.theme.topNavigation} >
            {overlayTopActions}
          </div>
          : null
        }
        <div className={props.theme.dialogContent}>
          <section role="body" className={props.theme.body}>
            {props.title ? <h6 className={props.theme.title}>{props.title}</h6> : null}
            {props.children}
          </section>
          {actions.length
          ? <nav className={props.theme.navigation}>
            {actions}
          </nav>
          : null
        }
        </div>
      </div>);
  };

  InnerDialog.propTypes = {
    actions: PropTypes.arrayOf(PropTypes.shape({
      className: PropTypes.string,
      label: PropTypes.string,
      children: PropTypes.node,
    })),
    active: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    overlayTopActions: PropTypes.arrayOf(PropTypes.shape({
      className: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.string,
    })),
    theme: PropTypes.shape({
      active: PropTypes.string,
      body: PropTypes.string,
      button: PropTypes.string,
      container: PropTypes.string,
      dialog: PropTypes.string,
      dialogContent: PropTypes.string,
      navigation: PropTypes.string,
      overflow: PropTypes.string,
      title: PropTypes.string,
      topNavigation: PropTypes.string,
    }),
    title: PropTypes.string,
    type: PropTypes.string,
  };

  InnerDialog.defaultProps = {
    actions: [],
    overlayTopActions: [],
    active: true,
    type: 'normal',
  };

  return InnerDialog;
};


const InnerDialog = factory(InjectButton);
export default themr(INNER_DIALOG)(InnerDialog);
export { InnerDialog };
export { factory as innerDialogFactory };
