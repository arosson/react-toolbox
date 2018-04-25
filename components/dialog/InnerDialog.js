/* eslint-disable jsx-a11y/aria-role */
import React from 'react';
import PropTypes from 'prop-types';
import { themr } from '@shutterstock-libs/react-css-themr';
import classnames from 'classnames';
import { INNER_DIALOG } from '../identifiers';
import InjectButton from '../button/Button';

const factory = (Button) => {
  const InnerDialog = (props) => {
    const actions = props.actions.map((action, idx) => {
      const className = classnames(props.theme.button, { [action.className]: action.className });
      return <Button key={idx} {...action} className={className} />; // eslint-disable-line
    });

    const className = classnames([props.theme.dialog, props.theme[props.type]], {
      [props.theme.active]: props.active,
    }, props.className);

    return (
      <div data-react-toolbox="dialog" className={className}>
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
    theme: PropTypes.shape({
      active: PropTypes.string,
      body: PropTypes.string,
      button: PropTypes.string,
      dialog: PropTypes.string,
      navigation: PropTypes.string,
      overflow: PropTypes.string,
      title: PropTypes.string,
    }),
    title: PropTypes.string,
    type: PropTypes.string,
  };

  InnerDialog.defaultProps = {
    actions: [],
    active: true,
    type: 'normal',
  };

  return InnerDialog;
};


const InnerDialog = factory(InjectButton);
export default themr(INNER_DIALOG)(InnerDialog);
export { InnerDialog };
export { factory as innerDialogFactory };
