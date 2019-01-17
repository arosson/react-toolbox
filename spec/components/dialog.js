import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../components/button';
import Dialog, { InnerDialog } from '../../components/dialog';
import Dropdown from '../../components/dropdown';

const dialogTypes = [
  { value: 'small', label: 'small' },
  { value: 'normal', label: 'normal' },
  { value: 'large', label: 'large' },
  { value: 'fullscreen', label: 'fullscreen' },
];

class DialogTest extends React.Component {
  state = {
    active: false,
    innerActive: false,
    type: 'normal',
  };

  handleToggle = () => {
    this.setState({
      active: !this.state.active,
    });
  };

  handleToggleInner = () => {
    this.setState({
      innerActive: !this.state.innerActive,
    });
  };

  changeDialogType = (value) => {
    this.setState({ type: value });
  };

  actions = [
    { label: 'Disagree', primary: true, onClick: this.handleToggle },
    { label: 'Agree', primary: true, onClick: this.handleToggle },
  ];

  overlayTopActions = [
    { label: 'Back to Ricochet', icon: 'bookmark', onClick: this.handleToggle },
    { label: 'Esc', onClick: this.handleToggle },
    { icon: 'close', onClick: this.handleToggle }
  ];

  actionsInner = [
    { label: 'Disagree', primary: true, onClick: this.handleToggleInner },
    { label: 'Agree', primary: true, onClick: this.handleToggleInner },
  ];

  render() {
    return (
      <section>
        <h5>Dialog</h5>
        <p>lorem ipsum...</p>
        <Dropdown
          label="Dialog Type"
          auto
          onChange={this.changeDialogType}
          source={dialogTypes}
          value={this.state.type}
        />
        <Button label="Show Dialog" raised primary onClick={this.handleToggle} />
        <Button label="Show InnerDialog" raised primary onClick={this.handleToggleInner} />
        <ContextComponent>
          <Dialog
            actions={this.actions}
            overlayTopActions={this.overlayTopActions}
            active={this.state.active}
            type={this.state.type}
            title="Use Google's location service?"
            onOverlayClick={this.handleToggle}
            onEscKeyDown={this.handleToggle}
          >
            <p>Let Google help apps <strong>determine location</strong>. This means sending anonymous location data to Google, even when no apps are running.</p>
            <DialogChild />
          </Dialog>
          {this.state.innerActive &&
            <InnerDialog
              actions={this.actionsInner}
              type={this.state.type}
              title="Use Google's location service?"
            >
              <DialogChild />
            </InnerDialog>}
        </ContextComponent>
      </section>
    );
  }
}

class ContextComponent extends React.Component {
  static propTypes = {
    children: PropTypes.any,
  };

  static childContextTypes = {
    message: PropTypes.string,
  }

  getChildContext() {
    return {
      message: 'Hi, I\'m the top container',
    };
  }

  render() {
    return this.props.children;
  }
}

class DialogChild extends React.Component {
  static contextTypes = {
    message: PropTypes.string,
  }

  render() {
    return <p>This message comes from a parent: <strong>{this.context.message}</strong></p>;
  }
}

export default DialogTest;
