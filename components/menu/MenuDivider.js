import React from 'react';
import PropTypes from 'prop-types';
import { themr } from 'react-css-themr';
import { MENU } from '../identifiers';

const MenuDivider = ({ theme }) => (
  <hr data-react-toolbox="menu-divider" className={theme.menuDivider} />
);

MenuDivider.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  skipKeyboardNav: PropTypes.bool,
  theme: PropTypes.shape({
    menuDivider: PropTypes.string,
  }),
};

MenuDivider.defaultProps = {
  skipKeyboardNav: true,
};

export default themr(MENU)(MenuDivider);
export { MenuDivider };
