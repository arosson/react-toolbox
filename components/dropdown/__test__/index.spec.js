import React from 'react';
import { shallow } from 'enzyme';
import { Dropdown } from '../Dropdown';
import theme from '../theme.css';

const countries = [
  { value: 'EN-gb', label: 'England', img: 'http://' },
  { value: 'ES-es', label: 'Spain', img: 'http://' },
  { value: 'TH-th', label: 'Thailand', img: 'http://', disabled: true },
  { value: 'EN-en', label: 'USA', img: 'http://' },
  { value: 'FR-fr', label: 'France', img: 'http://' },
];


describe('Dropdown', () => {
  it('should render', () => {
    const wrapper = shallow(
      <Dropdown theme={theme} source={countries} />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
