import React from 'react';
import { shallow } from 'enzyme';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';
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
