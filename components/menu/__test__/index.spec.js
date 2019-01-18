import React from 'react';
import { shallow } from 'enzyme';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
import { MenuDivider } from '../MenuDivider';
import theme from '../theme.css';

describe('MenuItem', () => {
  describe('#onClick', () => {
    it('passes to listener the event', () => {
      const onClick = jest.fn();
      const wrapper = shallow(
        <Menu theme={theme}>
          <MenuItem key="1" onClick={onClick} />
        </Menu>,
      );

      wrapper.find(MenuItem).first().simulate('click', { persist: () => {} });
      expect(onClick).toHaveBeenCalled();
    });
  });
});


describe('Menu', () => {
  describe('#onKeyDown', () => {
    let menuComponent;

    const mockEvent = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    };

    const arrowDownEvent = {
      ...mockEvent,
      key: 'ArrowDown',
    };

    const arrowUpEvent = {
      ...mockEvent,
      key: 'ArrowUp',
    };

    beforeEach(() => {
      jest.clearAllMocks();

      menuComponent = shallow(
        <Menu theme={theme}>
          <MenuItem key="1" />
          <MenuDivider />
          <MenuItem key="2" />
        </Menu>,
      );
    });

    it('should navigate down the list of items in the menu', () => {
      // Default State
      expect(menuComponent.state().active).toBe(false);
      expect(menuComponent.state().selectedIndex).toBe(-1);

      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(0);

      // Should skip the MenuDivider
      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(2);

      // Should return to the beginning of the array
      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(0);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(3);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(3);
    });

    it('should navigate up the list of items in the menu', () => {
      // Default State
      expect(menuComponent.state().active).toBe(false);
      expect(menuComponent.state().selectedIndex).toBe(-1);

      menuComponent.simulate('keydown', arrowUpEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(2);

      // Should skip the MenuDivider
      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(0);

      // Should return to the top of the array
      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(2);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(3);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(3);
    });

    it('should close the menu if it\'s open when the Escape key is triggered', () => {
      const escapeEvent = {
        ...mockEvent,
        key: 'Escape',
      };

      // Default State
      expect(menuComponent.state().active).toBe(false);
      expect(menuComponent.state().selectedIndex).toBe(-1);

      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(0);

      // Should skip the MenuDivider
      menuComponent.simulate('keydown', escapeEvent);
      expect(menuComponent.state().active).toBe(false);
      expect(menuComponent.state().selectedIndex).toBe(-1);

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(2);
    });

    it('should close the menu if it\'s open when the Tab key is triggered without prevent normal event behavior', () => {
      const tabEvent = {
        ...mockEvent,
        key: 'Tab',
      };

      // Default State
      expect(menuComponent.state().active).toBe(false);
      expect(menuComponent.state().selectedIndex).toBe(-1);

      menuComponent.simulate('keydown', arrowDownEvent);
      expect(menuComponent.state().active).toBe(true);
      expect(menuComponent.state().selectedIndex).toBe(0);

      // Should skip the MenuDivider
      menuComponent.simulate('keydown', tabEvent);
      expect(menuComponent.state().active).toBe(false);
      expect(menuComponent.state().selectedIndex).toBe(-1);

      // We should not stop event progation and the default behaviour for tab key
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });
  });
});
