import React from 'react';
import { shallow } from 'enzyme';
import { Dropdown, getMatchingOptionIndex } from '../Dropdown';
import theme from '../theme.css';

const countries = [
  { value: 'EN-gb', label: 'England', img: 'http://' },
  { value: 'ES-es', label: 'Spain', img: 'http://' },
  { value: 'TH-th', label: 'Thailand', img: 'http://', disabled: true },
  { value: 'EN-ae', label: 'United Arab Emirates', img: 'http://' },
  { value: 'EN-us', label: 'United States', img: 'http://' },
  { value: 'FR-fr', label: 'France', img: 'http://' },
];

describe('Dropdown', () => {
  it('should render', () => {
    const wrapper = shallow(
      <Dropdown theme={theme} source={countries} />,
    );

    expect(wrapper).toMatchSnapshot();
  });
  describe('should select the correct option while typing', () => {
    it('U[nited Arab Emirates]', () => {
      const index = getMatchingOptionIndex('U', countries);
      expect(countries[index].label).toEqual('United Arab Emirates');
    });
    it('United[ Arab Emirates]', () => {
      const index = getMatchingOptionIndex('United', countries);
      expect(countries[index].label).toEqual('United Arab Emirates');
    });
    it('United [Arab Emirates]', () => {
      const index = getMatchingOptionIndex('United ', countries);
      expect(countries[index].label).toEqual('United Arab Emirates');
    });
    it('United A[rab Emirates]', () => {
      const index = getMatchingOptionIndex('United A', countries);
      expect(countries[index].label).toEqual('United Arab Emirates');
    });
    it('United S[tates]', () => {
      const index = getMatchingOptionIndex('United S', countries);
      expect(countries[index].label).toEqual('United States');
    });
  });
});
