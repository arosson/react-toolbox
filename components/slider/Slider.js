import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { themr } from 'react-css-themr';
import { round, range } from '../utils/utils';
import { SLIDER } from '../identifiers';
import events from '../utils/events';
import InjectProgressBar from '../progress_bar/ProgressBar';
import InjectInput from '../input/Input';
import Knob from './Knob';

/**
 * Get index of the nearest handle in an array of handle positions
 * @param {Number} requestedPosition
 * @param {Array/Number} propsValue
 */
export const getNearestHandleIndex = (requestedPosition, propsValue) => {
  const nearestValue = propsValue.reduce((prev, curr) =>
    (Math.abs(curr - requestedPosition) < Math.abs(prev - requestedPosition) ? curr : prev),
  );
  return propsValue.findIndex(val => val === nearestValue);
};

/**
 * Format an input value, applying the value to an array if in range-mode
 * @param {Number} currentValueIndex
 * @param {String} newValue
 * @param {Array/Number} propsValue
 */
export const getFormattedValue = (currentValueIndex, newValue, propsValue) => {
  let value = newValue;

  if (Array.isArray(propsValue)) {
    const valueArray = [...propsValue];
    valueArray[currentValueIndex] = newValue;
    value = valueArray;
  }

  return value;
};

const factory = (ProgressBar, Input) => {
  class Slider extends Component {
    static propTypes = {
      buffer: PropTypes.number,
      className: PropTypes.string,
      disabled: PropTypes.bool,
      editable: PropTypes.bool,
      max: PropTypes.number,
      min: PropTypes.number,
      onChange: PropTypes.func,
      onDragStart: PropTypes.func,
      onDragStop: PropTypes.func,
      pinned: PropTypes.bool,
      snaps: PropTypes.bool,
      step: PropTypes.number,
      // eslint-disable-next-line react/forbid-prop-types
      style: PropTypes.object,
      theme: PropTypes.shape({
        container: PropTypes.string,
        editable: PropTypes.string,
        innerknob: PropTypes.string,
        innerprogress: PropTypes.string,
        input: PropTypes.string,
        knob: PropTypes.string,
        pinned: PropTypes.string,
        pressed: PropTypes.string,
        progress: PropTypes.string,
        ring: PropTypes.string,
        slider: PropTypes.string,
        snap: PropTypes.string,
        snaps: PropTypes.string,
      }),
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
    };

    static defaultProps = {
      buffer: 0,
      className: '',
      editable: false,
      max: 100,
      min: 0,
      onDragStart: () => {},
      onDragStop: () => {},
      pinned: false,
      snaps: false,
      step: 0.01,
      value: 0,
      onChange: () => {},
    };

    state = {
      inputFocused: false,
      inputValue: null,
      sliderLength: 0,
      sliderStart: 0,
      pressed: false,
      selectedValueIndex: null,
    };

    componentDidMount() {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }

    shouldComponentUpdate(nextProps, nextState) {
      return this.state.inputFocused || !nextState.inputFocused;
    }

    componentWillUpdate(nextProps, nextState) {
      if (nextState.pressed !== this.state.pressed) {
        if (nextState.pressed) {
          this.props.onDragStart();
        } else {
          this.props.onDragStop();
        }
      }
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
      events.removeEventsFromDocument(this.getMouseEventMap());
      events.removeEventsFromDocument(this.getTouchEventMap());
      events.removeEventsFromDocument(this.getKeyboardEvents());
    }

    getInput() {
      const { selectedValueIndex } = this.state;
      const { inputNode } = typeof selectedValueIndex === 'number' ? this.inputRefs[selectedValueIndex] : this.inputNode;
      return inputNode;
    }

    getInputValue(targetValueIndex) {
      const { inputFocused, inputValue } = this.state;
      const { value } = this.props;
      let newInputValue;

      if (inputFocused) {
        newInputValue = Array.isArray(inputValue) ? inputValue[targetValueIndex] : inputValue;
      } else {
        newInputValue = (typeof targetValueIndex === 'number')
          ? value[targetValueIndex]
          : this.valueForInput(value);
      }

      return newInputValue;
    }

    getKeyboardEvents() {
      return {
        keydown: this.handleKeyDown,
      };
    }

    getMouseEventMap() {
      return {
        mousemove: this.handleMouseMove,
        mouseup: this.handleMouseUp,
      };
    }

    getTouchEventMap() {
      return {
        touchmove: this.handleTouchMove,
        touchend: this.handleTouchEnd,
      };
    }

    // Create an array with null values, to be filled with refs if in range mode
    inputRefs = Array.isArray(this.props.value) ? this.props.value.map(() => null) : [];

    addToValue(increment) {
      const { selectedValueIndex } = this.state;
      const propsValue = this.props.value;
      const rangeMode = (Array.isArray(this.state.inputValue) && typeof selectedValueIndex === 'number');
      const stateInputValue = this.state.inputFocused
      ? parseFloat(rangeMode ? propsValue[selectedValueIndex] : propsValue)
      : propsValue;
      const valueToTrim = stateInputValue + increment;
      const trimmedValue = rangeMode
        ? this.trimValue(valueToTrim, selectedValueIndex)
        : this.trimValue(valueToTrim);
      const formattedValue = getFormattedValue(selectedValueIndex, trimmedValue, propsValue);

      this.setState({ inputValue: formattedValue });
      this.props.onChange(formattedValue);
    }

    handleInputFocus = (targetValueIndex) => {
      const { value: propsValue } = this.props;
      const newValue = this.valueForInput(propsValue);
      const inputValue = getFormattedValue(targetValueIndex, newValue, propsValue);

      this.setState({
        inputFocused: true,
        inputValue,
        ...(typeof targetValueIndex === 'number' && { selectedValueIndex: targetValueIndex }),
      });
    };

    handleInputChange = (newValue = '', targetValueIndex) => {
      const propsValue = this.props.value;
      const inputValue = getFormattedValue(targetValueIndex, newValue, propsValue);
      this.setState({ inputValue });
    };

    handleInputBlur = (event, targetValueIndex) => {
      const { value: propsValue } = this.props;
      const { inputValue } = this.state;
      const trimmedValue = (Array.isArray(inputValue) && typeof targetValueIndex === 'number')
        ? this.trimValue(inputValue[targetValueIndex], targetValueIndex)
        : this.trimValue(inputValue);
      const newValue = getFormattedValue(targetValueIndex, trimmedValue, propsValue);

      this.setState(
        // Reset the input state
        { inputFocused: false, inputValue: null, selectedValueIndex: null },
        () => {
          if (
            // Is either a valid single or range value
            (!isNaN(newValue) && newValue !== '')
            || (Array.isArray(newValue) && !isNaN(newValue[targetValueIndex]))
          ) {
            // Call the onChange callback with the new value
            this.props.onChange(newValue, event);
          }
        },
      );
    };

    handleKeyDown = (event) => {
      if ([13, 27].indexOf(event.keyCode) !== -1) this.getInput().blur();
      if (event.keyCode === 38) this.addToValue(this.props.step);
      if (event.keyCode === 40) this.addToValue(-this.props.step);
    };

    handleMouseDown = (event, selectedValueIndex) => {
      if (typeof selectedValueIndex === 'number') this.setState({ selectedValueIndex });
      if (this.state.inputFocused) this.getInput().blur();
      events.addEventsToDocument(this.getMouseEventMap());
      this.start(events.getMousePosition(event), selectedValueIndex);
      events.pauseEvent(event);
    };

    /**
     * When in range mode, this event handler will find the nearest handle and select it
     * before invoking the mouseDown/touchStart handler
     *
     * @memberof Slider
     */
    handleRangeClick = (event, type) => {
      const position = type === 'touch' ? events.getTouchPosition(event) : events.getMousePosition(event);
      const nearestIndex = getNearestHandleIndex(this.positionToValue(position), this.props.value);

      // Invoke the touch or mouse event handler
      if (type === 'touch') {
        this.handleTouchStart(event, nearestIndex);
      } else {
        this.handleMouseDown(event, nearestIndex);
      }
    }

    handleMouseMove = (event) => {
      events.pauseEvent(event);
      this.move(events.getMousePosition(event));
    };

    handleMouseUp = () => {
      this.end(this.getMouseEventMap());
    };

    handleResize = (event, callback) => {
      const { left, right } = ReactDOM.findDOMNode(this.progressbarNode).getBoundingClientRect();
      const cb = (callback) || (() => {});
      this.setState({ sliderStart: left, sliderLength: right - left }, cb);
    };

    handleSliderBlur = () => {
      events.removeEventsFromDocument(this.getKeyboardEvents());
    };

    handleSliderFocus = () => {
      events.addEventsToDocument(this.getKeyboardEvents());
    };

    handleTouchEnd = () => {
      this.end(this.getTouchEventMap());
    };

    handleTouchMove = (event) => {
      this.move(events.getTouchPosition(event));
    };

    handleTouchStart = (event, selectedValueIndex) => {
      if (typeof selectedValueIndex === 'number') this.setState({ selectedValueIndex });
      if (this.state.inputFocused) this.getInput().blur();
      this.start(events.getTouchPosition(event));
      events.addEventsToDocument(this.getTouchEventMap());
      events.pauseEvent(event);
    };

    end(revents) {
      events.removeEventsFromDocument(revents);
      this.setState({ pressed: false });
    }

    knobOffset(valueIndex) {
      const { max, min, value } = this.props;
      const currentValue = value.length > 0 ? value[valueIndex] : value;
      return 100 * ((currentValue - min) / (max - min));
    }

    move(position) {
      const { value: propsValue } = this.props;
      const { selectedValueIndex } = this.state;
      const rangeMode = (Array.isArray(propsValue) && typeof selectedValueIndex === 'number');
      const newValue = this.positionToValue(position);
      const trimmedValue = rangeMode
      ? this.trimValue(newValue, selectedValueIndex)
      : this.trimValue(newValue);

      this.props.onChange(
        getFormattedValue(selectedValueIndex, trimmedValue, propsValue),
      );
    }

    positionToValue(position) {
      const { sliderStart: start, sliderLength: length } = this.state;
      const { max, min, step } = this.props;
      const pos = ((position.x - start) / length) * (max - min);
      return this.trimValue((Math.round(pos / step) * step) + min);
    }

    start(position, selectedValueIndex) {
      this.handleResize(null, () => {
        const { value: propsValue } = this.props;
        const rangeMode = (Array.isArray(propsValue) && typeof selectedValueIndex === 'number');
        const newValue = this.positionToValue(position);
        const trimmedValue = rangeMode
        ? this.trimValue(newValue, selectedValueIndex)
        : this.trimValue(newValue);

        this.props.onChange(
          getFormattedValue(selectedValueIndex, trimmedValue, propsValue),
        );
        this.setState({ pressed: typeof selectedValueIndex === 'number' ? selectedValueIndex : true });
      });
    }

    stepDecimals() {
      return (this.props.step.toString().split('.')[1] || []).length;
    }

    trimValue(inputValue, targetValueIndex) {
      const rangeMode = typeof targetValueIndex === 'number';
      const { value: propsValue } = this.props;
      let { min, max } = this.props;
      let value = inputValue;

      if (rangeMode) {
        const lowerBoundary = propsValue[targetValueIndex - 1];
        const upperBoundary = propsValue[targetValueIndex + 1];
        min = lowerBoundary || min;
        max = upperBoundary || max;
      }

      if (value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      } else {
        value = round(value, this.stepDecimals());
      }
      return value;
    }

    valueForInput(value) {
      const currentValue = value.length ? value[0] : value;
      const decimals = this.stepDecimals();
      return decimals > 0 ? currentValue.toFixed(decimals) : currentValue.toString();
    }

    renderSnaps() {
      if (!this.props.snaps) return undefined;
      return (
        <div className={this.props.theme.snaps}>
          {range(0, (this.props.max - this.props.min) / this.props.step).map(i =>
            <div key={`span-${i}`} className={this.props.theme.snap} />,
          )}
        </div>
      );
    }

    renderInput(targetValueIndex) {
      if (!this.props.editable) return undefined;
      const isRangeMode = Array.isArray(this.props.value) && typeof targetValueIndex === 'number';

      return (
        <Input
          key={`sliderInput-${targetValueIndex || 0}`}
          ref={(node) => {
            if (isRangeMode) {
              this.inputRefs[targetValueIndex] = node;
            } else {
              this.inputNode = node;
            }
          }}
          className={this.props.theme.input}
          disabled={this.props.disabled}
          onFocus={isRangeMode
            ? () => this.handleInputFocus(targetValueIndex)
            : this.handleInputFocus
          }
          onChange={isRangeMode
            ? val => this.handleInputChange(val, targetValueIndex)
            : val => this.handleInputChange(val)
          }
          onBlur={isRangeMode
            ? e => this.handleInputBlur(e, targetValueIndex)
            : e => this.handleInputBlur(e)
          }
          value={this.getInputValue(targetValueIndex)}
        />
      );
    }

    renderKnob(index) {
      const { theme, value } = this.props;
      const { pressed } = this.state;
      const isRange = typeof index === 'number';
      return (
        <Knob
          key={index}
          theme={theme}
          pressed={isRange ? pressed === index : pressed}
          leftOffsetValue={this.knobOffset(index)}
          onMouseDown={isRange ? e => this.handleMouseDown(e, index) : this.handleMouseDown}
          onTouchStart={isRange ? e => this.handleTouchStart(e, index) : this.handleTouchStart}
          value={isRange ? value[index] : value}
        />
      );
    }

    render() {
      const { theme, value, min, max } = this.props;
      const className = classnames(theme.slider, {
        [theme.editable]: this.props.editable,
        [theme.disabled]: this.props.disabled,
        [theme.pinned]: this.props.pinned,
        [theme.ring]: value === min,
      }, this.props.className);

      return (
        <div
          className={className}
          disabled={this.props.disabled}
          data-react-toolbox="slider"
          onBlur={this.handleSliderBlur}
          onFocus={this.handleSliderFocus}
          style={this.props.style}
          tabIndex="0"
        >
          <div
            ref={(node) => { this.sliderNode = node; }}
            className={theme.container}
            onMouseDown={Array.isArray(value) ? this.handleRangeClick : this.handleMouseDown}
            onTouchStart={Array.isArray(value) ? event => this.handleRangeClick(event, 'touch') : this.handleTouchStart}
          >
            <div className={theme.progress}>
              <ProgressBar
                disabled={this.props.disabled}
                ref={(node) => { this.progressbarNode = node; }}
                className={theme.innerprogress}
                max={max}
                min={min}
                mode="determinate"
                value={value}
                buffer={this.props.buffer}
              />
              {this.renderSnaps()}
            </div>
            {
              Array.isArray(value)
              ? value.map((_, index) => this.renderKnob(index))
              : this.renderKnob()
            }
          </div>
          {
            Array.isArray(value)
            ? value.map((_, index) => this.renderInput(index))
            : this.renderInput()
          }
        </div>
      );
    }
  }

  return Slider;
};

const Slider = factory(InjectProgressBar, InjectInput);
export default themr(SLIDER)(Slider);
export { factory as sliderFactory };
export { Slider };
