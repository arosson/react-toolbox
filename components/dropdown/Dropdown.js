/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import { themr } from 'react-css-themr';
import { DROPDOWN } from '../identifiers';
import InjectInput from '../input/Input';
import events from '../utils/events';
import contains from 'dom-helpers/query/contains';
import activeElement from 'dom-helpers/activeElement';
import ownerDocument from 'dom-helpers/ownerDocument';

const singleCharWord = new RegExp(/\b.\b/); // Matcher for event key codes with a single character
let typeaheadDebounce = 500; // Clear the buffer this many ms after the user stops typing

const factory = (Input) => {
  class Dropdown extends Component {
    static propTypes = {
      allowBlank: PropTypes.bool,
      auto: PropTypes.bool,
      className: PropTypes.string,
      disabled: PropTypes.bool,
      error: PropTypes.string,
      label: PropTypes.string,
      labelKey: PropTypes.string,
      name: PropTypes.string,
      onBlur: PropTypes.func,
      onChange: PropTypes.func,
      onClick: PropTypes.func,
      onFocus: PropTypes.func,
      required: PropTypes.bool,
      source: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
      ])).isRequired,
      template: PropTypes.func,
      theme: PropTypes.shape({
        active: PropTypes.string,
        disabled: PropTypes.string,
        dropdown: PropTypes.string,
        error: PropTypes.string,
        errored: PropTypes.string,
        field: PropTypes.string,
        label: PropTypes.string,
        required: PropTypes.string,
        selected: PropTypes.string,
        focused: PropTypes.string,
        templateValue: PropTypes.string,
        up: PropTypes.string,
        value: PropTypes.string,
        values: PropTypes.string,
      }),
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      valueKey: PropTypes.string,
    };

    static defaultProps = {
      auto: true,
      className: '',
      allowBlank: true,
      disabled: false,
      labelKey: 'label',
      required: false,
      valueKey: 'value',
    };

    state = {
      active: false,
      up: false,
      focusedItemIndex: undefined,
      typeaheadAccumulator: '', // Accumulation of typeahead characters
      typeaheadTimer: null, // Used as a setTimeout for the typeahead debounce function
    };

    dropdown = null;

    componentWillUpdate(nextProps, nextState) {
      if (!this.state.active && nextState.active) {
        events.addEventsToDocument(this.getDocumentEvents());
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevState.active && !this.state.active) {
        events.removeEventsFromDocument(this.getDocumentEvents());
      }
    }

    componentWillUnmount() {
      if (this.state.active) {
        events.removeEventsFromDocument(this.getDocumentEvents());
      }
    }

    getDocumentEvents = () => ({
      click: this.handleDocumentClick,
      touchend: this.handleDocumentClick,
    });

    getSelectedItem = () => {
      for (const item of this.props.source) {
        if (item[this.props.valueKey] === this.props.value) return item;
      }
      return !this.props.allowBlank
        ? this.props.source[0]
        : undefined;
    };

    getNextSelectableItemIndex = (focusedItemIndex) => {
      const { source } = this.props;
      const lastItemIndex = source.length - 1;

      // Set the next index
      let nextIndex = focusedItemIndex !== lastItemIndex ? focusedItemIndex + 1 : 0;

      // If the next item is disabled then keep going until we either find a non-disabled item or we get back to the
      // original focused item
      while (source[nextIndex].disabled && nextIndex !== focusedItemIndex) {
        nextIndex = nextIndex !== lastItemIndex ? nextIndex + 1 : 0;
      }

      return nextIndex;
    };

    getPreviousSelectableItemIndex = (focusedItemIndex) => {
      const { source } = this.props;
      const lastItemIndex = source.length - 1;

      // Set the previous index
      let previousIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : lastItemIndex;

      // If the previous item is disabled then keep going until we either find a non-disabled item or we get back to the
      // original focused item
      while (source[previousIndex].disabled && previousIndex !== focusedItemIndex) {
        previousIndex = previousIndex !== 0 ? previousIndex - 1 : lastItemIndex;
      }

      return previousIndex;
    };

    handleSelect = (item, event) => {
      if (this.props.onBlur) this.props.onBlur(event);
      if (!this.props.disabled && this.props.onChange) {
        if (this.props.name) event.target.name = this.props.name;
        this.props.onChange(item, event);
        this.close();
      }
    };

    handleKeyDown = (event) => {
      const { key } = event;
      const { source, valueKey } = this.props;
      const { focusedItemIndex } = this.state;
      const lastItemIndex = source.length - 1;

      const currentItem = source[focusedItemIndex || 0];
      const nextItemIndex = this.getNextSelectableItemIndex(focusedItemIndex || 0);
      const previousItemIndex = this.getPreviousSelectableItemIndex(focusedItemIndex || 0);

      let newFoucsedItemIndex;

      switch (key) {
        case 'ArrowUp':
          newFoucsedItemIndex = previousItemIndex;
          break;
        case 'ArrowDown':
          newFoucsedItemIndex = nextItemIndex;
          break;
        case 'Tab':
          if (event.key === 'Shift') {
            if (focusedItemIndex === 0) {
              // No-op: Allow default behavior which should take the focus out of the menu
            } else {
              newFoucsedItemIndex = previousItemIndex;
            }
          } else {
            if (focusedItemIndex === lastItemIndex) {
              // No-op: Allow default behavior which should take the focus out of the menu
            } else {
              newFoucsedItemIndex = nextItemIndex;
            }
          }
          break;
        case 'Enter':
          !currentItem.disabled && this.handleSelect(currentItem[valueKey], event);
          break;
        case 'Escape':
          this.setState({ active: false });
          break;
        default:
          const { typeaheadAccumulator } = this.state;
          // If the current key pressed is a single character, add it to the typeahead accumulation string
          if (singleCharWord.test(key)) { this.setState({ typeaheadAccumulator: typeaheadAccumulator + key }); }
          // Compare the typeahead string against the option values to find a match. The comparison is done in lower case so matching is not case sensitive
          const typeaheadMatchIndex = this.props.source.findIndex(({ label = '' }) => label.toLowerCase().indexOf(typeaheadAccumulator.toLowerCase()) > -1);
          // If a match is found, use its index as the focused option
          newFoucsedItemIndex = typeaheadMatchIndex > -1 ? typeaheadMatchIndex : newFoucsedItemIndex;
        }

      clearTimeout(this.state.typeaheadTimer);
      this.setState({
        typeaheadTimer: setTimeout(() => { this.setState({ typeaheadAccumulator: '' }) }, typeaheadDebounce),
      });

      // If we are just shifting focus between list items, update the focus ourselves and prevent propagation of the event
      if (newFoucsedItemIndex || newFoucsedItemIndex === 0) {
        event.preventDefault();
        event.stopPropagation();
        this.dropdown.children[previousItemIndex].blur();
        this.dropdown.children[newFoucsedItemIndex].focus();
        return false;
      }
    };

    handleClick = (event) => {
      this.open(event);
      events.pauseEvent(event);
      if (this.props.onClick) this.props.onClick(event);
      setTimeout(() => {
        this.dropdown.children[this.state.focusedItemIndex || 0].focus();
      }, 0);
    };

    handleDocumentClick = (event) => {
      if (this.state.active && !events.targetIsDescendant(event, findDOMNode(this))) {
        this.setState({ active: false });
      }
    };

    close = () => {
      if (this.state.active) {
        this.setState({ active: false });
      }
    };

    open = (event) => {
      if (this.state.active) return;
      const client = event.target.getBoundingClientRect();
      const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
      const up = this.props.auto ? client.top > ((screenHeight / 2) + client.height) : false;
      if (this.inputNode) this.inputNode.blur();
      this.setState({ active: true, up });
    };

    handleFocus = (event) => {
      event.stopPropagation();
      const { source } = this.props;
      const { focusedItemIndex } = this.state;

      const dropdown = this.dropdown;
      if (!dropdown || !dropdown.children) {
        return;
      }

      let firstFocusableItem = focusedItemIndex || 0;
      // We can't assume the first item should be selected by default since it might be disabled
      if (source && source[firstFocusableItem].disabled) {
        firstFocusableItem = this.getNextSelectableItemIndex(firstFocusableItem);
      }

      // Need a setTimeout here because a parent item is stealing the focus immediately after this method is invoked
      setTimeout(function() {
        dropdown.children[firstFocusableItem].focus();
      }, 30);

      if (!this.props.disabled) this.open(event);
      if (this.props.onFocus) this.props.onFocus(event);
    };

    handleBlur = (event) => {
      event.stopPropagation();

      // Using setTimeout here because blur might be called before we set a focused list item (ex. when we first
      // open the menu, we call focus on the first item in the list, blur on this item will be called before the
      // actual focus on the item is set.)
      setTimeout(() => {
        if (this.dropdown) {
          // Grab the current focused element
          const currentFocusedItem = activeElement(ownerDocument(this.dropdown));
          // Check to see if the focused element is part of the menu -- in which case we don't want to close the menu.
          if (!contains(this.dropdown, currentFocusedItem)) {
            if (this.state.active) this.close();
            if (this.props.onBlur) this.props.onBlur(event);
          }
        }
      }, 30);
    };

    setFocusedItemIndex = (idx, event) => {
      // Stop propagation so that the higher-level focus handler doesn't kick in (only used for initial focus)
      event.stopPropagation();
      this.setState({
        focusedItemIndex: idx
      });
    };

    renderTemplateValue(selected) {
      const { theme } = this.props;
      const className = classnames(theme.field, {
        [theme.errored]: this.props.error,
        [theme.disabled]: this.props.disabled,
        [theme.required]: this.props.required,
      });

      return (
        <div className={className} onClick={this.handleClick}>
          <div className={`${theme.templateValue} ${theme.value}`}>
            {this.props.template(selected)}
          </div>
          {this.props.label
            ? (
              <label className={theme.label}>
                {this.props.label}
                {this.props.required ? <span className={theme.required}> * </span> : null}
              </label>
            ) : null}
          {this.props.error ? <span className={theme.error}>{this.props.error}</span> : null}
        </div>
      );
    }

    renderValue = (item, idx) => {
      const { labelKey, theme, valueKey } = this.props;
      const { focusedItemIndex } = this.state;
      const className = classnames({
        [theme.selected]: item[valueKey] === this.props.value,
        [theme.focused]: idx === focusedItemIndex,
        [theme.disabled]: item.disabled,
      });
      return (
        <li
          key={idx}
          className={className}
          tabIndex={focusedItemIndex === idx ? 0 : -1}
          onFocus={this.setFocusedItemIndex.bind(this, idx)}
          onMouseDown={!item.disabled ? this.handleSelect.bind(this, item[valueKey]) : undefined}
        >
          {this.props.template ? this.props.template(item) : item[labelKey]}
        </li>
      );
    };

    render() {
      const {
        allowBlank, auto, labelKey, required, onChange, onFocus, onBlur, // eslint-disable-line no-unused-vars
        source, template, theme, valueKey, ...others
      } = this.props;
      const selected = this.getSelectedItem();
      const className = classnames(theme.dropdown, {
        [theme.up]: this.state.up,
        [theme.active]: this.state.active,
        [theme.disabled]: this.props.disabled,
        [theme.required]: this.props.required,
      }, this.props.className);

      return (
        <div
          className={className}
          data-react-toolbox="dropdown"
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
        >
          <Input
            {...others}
            tabIndex="0"
            className={theme.value}
            onClick={this.handleClick}
            required={this.props.required}
            readOnly
            ref={(node) => { this.inputNode = node && node.getWrappedInstance(); }}
            type={template && selected ? 'hidden' : null}
            theme={theme}
            themeNamespace="input"
            value={selected && selected[labelKey] ? selected[labelKey] : ''}
          />
          {template && selected ? this.renderTemplateValue(selected) : null}
          <ul
            ref={(dropdown) => this.dropdown = dropdown}
            className={theme.values}
            onKeyDown={this.handleKeyDown} >
            {source.map(this.renderValue)}
          </ul>
        </div>
      );
    }
  }

  return Dropdown;
};

const Dropdown = factory(InjectInput);
export default themr(DROPDOWN)(Dropdown);
export { factory as dropdownFactory };
export { Dropdown };
