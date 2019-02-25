/* eslint-disable jsx-a11y/aria-role */
import React from 'react';
import PropTypes from 'prop-types';
import { themr } from 'react-css-themr';
import { DIALOG, INNER_DIALOG } from '../identifiers';
import Portal from '../hoc/Portal';
import ActivableRenderer from '../hoc/ActivableRenderer';
import InjectButton from '../button/Button';
import InjectOverlay from '../overlay/Overlay';
import { innerDialogFactory } from './InnerDialog';

const factory = (Overlay, Button) => {
  const InnerDialog = themr(INNER_DIALOG)(innerDialogFactory(Button));
  const Dialog = props => (
    <Portal className={props.theme.wrapper}>
      <Overlay
        active={props.active}
        className={props.theme.overlay}
        onClick={props.onOverlayClick}
        onEscKeyDown={props.onEscKeyDown}
        onMouseDown={props.onOverlayMouseDown}
        onMouseMove={props.onOverlayMouseMove}
        onMouseUp={props.onOverlayMouseUp}
        theme={props.theme}
        themeNamespace="overlay"
      />
      <InnerDialog
        actions={props.actions}
        overlayTopActions={props.overlayTopActions}
        theme={props.theme}
        title={props.title}
        type={props.type}
        active={props.active}
        className={props.className}
      >
        {props.children}
      </InnerDialog>
    </Portal>
    );

  Dialog.propTypes = {
    actions: PropTypes.arrayOf(PropTypes.shape({
      className: PropTypes.string,
      label: PropTypes.string,
      children: PropTypes.node,
    })),
    active: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    onEscKeyDown: PropTypes.func,
    onOverlayClick: PropTypes.func,
    onOverlayMouseDown: PropTypes.func,
    onOverlayMouseMove: PropTypes.func,
    onOverlayMouseUp: PropTypes.func,
    overlayTopActions: PropTypes.node,
    theme: PropTypes.shape({
      active: PropTypes.string,
      body: PropTypes.string,
      button: PropTypes.string,
      dialog: PropTypes.string,
      navigation: PropTypes.string,
      overflow: PropTypes.string,
      overlay: PropTypes.string,
      title: PropTypes.string,
      wrapper: PropTypes.string,
    }),
    title: PropTypes.string,
    type: PropTypes.string,
  };

  Dialog.defaultProps = {
    actions: [],
    overlayTopActions: null,
    active: false,
    type: 'normal',
  };

  return ActivableRenderer()(Dialog);
};

const Dialog = factory(InjectOverlay, InjectButton);
export default themr(DIALOG)(Dialog);
export { Dialog };
export { factory as dialogFactory };
