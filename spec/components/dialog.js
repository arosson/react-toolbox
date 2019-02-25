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
    topActionsActive: false,
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

  handleToggleTopActions = () => {
    this.setState({
      topActionsActive: !this.state.topActionsActive,
    });
  };

  changeDialogType = (value) => {
    this.setState({ type: value });
  };

  actions = [
    { label: 'Disagree', primary: true, onClick: this.handleToggle },
    { label: 'Agree', primary: true, onClick: this.handleToggle },
  ];

  actionsInner = [
    { label: 'Disagree', primary: true, onClick: this.handleToggleInner },
    { label: 'Agree', primary: true, onClick: this.handleToggleInner },
  ];

  actionsSecondDialog = [
    { label: 'Disagree', primary: true, onClick: this.handleToggleTopActions },
    { label: 'Agree', primary: true, onClick: this.handleToggleTopActions },
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
        <Button label="Show Overlay Top Actions" raised primary onClick={this.handleToggleTopActions} />
        <ContextComponent>
          <Dialog
            actions={this.actions}
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
          {this.state.topActionsActive && 
            <Dialog
              actions={this.actionsSecondDialog}
              overlayTopActions={
                <Button 
                label="Back to Ricochet" 
                icon="bookmark"
                 onClick={this.handleToggleTopActions}
                />
              }
              active={this.state.topActionsActive}
              type={this.state.type}
              title="Use Google's location service?"
              onOverlayClick={this.handleToggleTopActions}
              onEscKeyDown={this.handleToggleTopActions}
            >
            <p>Let Google help apps <strong>determine location</strong>. This means sending anonymous location data to Google, even when no apps are running.</p>
            <DialogChild />
          </Dialog>}
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
