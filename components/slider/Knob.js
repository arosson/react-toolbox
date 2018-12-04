import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

const Knob = ({ theme, leftOffsetValue, onMouseDown, onTouchStart, value, pressed }) => (
  <div
    className={cn(theme.knob, { [theme.pressed]: pressed })}
    onMouseDown={onMouseDown}
    onTouchStart={onTouchStart}
    style={{ left: `${leftOffsetValue}%` }}
  >
    <div className={theme.innerknob} data-value={typeof value === 'number' ? parseInt(value, 10) : 0} />
  </div>
);

Knob.propTypes = {
  leftOffsetValue: PropTypes.number,
  onMouseDown: PropTypes.func,
  onTouchStart: PropTypes.func,
  pressed: PropTypes.bool,
  theme: PropTypes.shape({
    innerknob: PropTypes.string,
    knob: PropTypes.string,
    pressed: PropTypes.string,
  }),
  value: PropTypes.number,
};

export default Knob;
