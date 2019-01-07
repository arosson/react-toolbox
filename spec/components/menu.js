import React from 'react';
import { Button } from '../../components/button';
import { Menu, MenuItem, MenuDivider } from '../../components/menu';
import style from '../style.css';

class HoverMenu extends React.Component {
  state = {
    menuActive: false,
  };

  setRef = element => {
    this.ref = element;
  }

  onMouseEnter = () => {
    this.setState({
      menuActive: true,
    });
  };

  onMouseLeave = () => {
    this.setState({
      menuActive: false,
    });
  };

  render() {
    return (
      <div
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        ref={this.setRef}
        className={style.hoverMenuContainer}
      >
        <Button raised primary>Hover over me!</Button>
        <Menu tabIndex="0" active={this.state.menuActive} position="topLeft" parentContainerRef={this.ref} className={style.menu}>
          <MenuItem value="foo" caption="Caption" />
          <MenuDivider />
          <MenuItem caption="Caption & Icon" icon="phone" />
        </Menu>
      </div>
    );
  }
}

class MenuTest extends React.Component {
  state = {
    value: undefined,
  };

  handleSelect = (item) => {
    console.log('Menu selection changed!!, now its', item);
    this.setState({ value: item });
  };

  handleItemClick = () => {
    console.log('This item is so special that has a special handler');
  };

  render() {
    return (
      <section>
        <h5>Menu</h5>
        <p>Tabs can be disabled or hidden.</p>
        <Menu tabIndex="0" onSelect={this.handleSelect} selectable={false} selected={this.state.value}>
          <MenuItem value="foo" caption="Caption" />
          <MenuItem onClick={this.handleItemClick} value="bar" caption="Caption & Shortcut" shortcut="Ctrl + P" />
          <MenuItem caption="Disabled ..." disabled shortcut="Ctrl + P" />
          <MenuDivider />
          <MenuItem caption="Caption & Icon" icon="phone" />
          <MenuItem caption="Caption, Icon & Shortcut" icon="phone" shortcut="Ctrl + P" />
          <MenuItem caption="Disabled ..." icon="phone" shortcut="Ctrl + P" disabled />
        </Menu>    

        <h5>Hoverable menu</h5>
        <p>Controlled menu that is activated upon hover.</p>
        <HoverMenu />
      </section>
    );
  }
}

export default MenuTest;
