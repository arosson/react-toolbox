import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { themr } from 'react-css-themr';
import { MENU } from '../identifiers';
import { events } from '../utils';
import { getViewport } from '../utils/utils';
import InjectMenuItem from './MenuItem';

const POSITION = {
  AUTO: 'auto',
  STATIC: 'static',
  TOP_LEFT: 'topLeft',
  TOP_RIGHT: 'topRight',
  BOTTOM_LEFT: 'bottomLeft',
  BOTTOM_RIGHT: 'bottomRight',
};

const DOWN = 'ArrowDown';
const UP = 'ArrowUp';
const ESC = 'Escape';
const TAB = 'Tab';

const factory = (MenuItem) => {
  class Menu extends Component {
    static propTypes = {
      active: PropTypes.bool,
      children: PropTypes.node,
      className: PropTypes.string,
      linkRef: PropTypes.func,
      onClickOutside: PropTypes.func,
      onHide: PropTypes.func,
      onSelect: PropTypes.func,
      onShow: PropTypes.func,
      outline: PropTypes.bool,
      parentContainerRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
      position: PropTypes.oneOf(Object.keys(POSITION).map(key => POSITION[key])),
      ripple: PropTypes.bool,
      selectable: PropTypes.bool,
      selected: PropTypes.node,
      tabIndex: PropTypes.string,
      theme: PropTypes.shape({
        active: PropTypes.string,
        bottomLeft: PropTypes.string,
        bottomRight: PropTypes.string,
        menu: PropTypes.string,
        menuInner: PropTypes.string,
        outline: PropTypes.string,
        rippled: PropTypes.string,
        static: PropTypes.string,
        topLeft: PropTypes.string,
        topRight: PropTypes.string,
      }),
    };

    static defaultProps = {
      active: false,
      linkRef: null,
      outline: true,
      parentContainerRef: null,
      position: POSITION.STATIC,
      ripple: true,
      selectable: true,
    };

    state = {
      active: this.props.active,
      rippled: false,
      selectedIndex: -1,
    };

    componentDidMount() {
      this.positionTimeoutHandle = setTimeout(() => {
        const { width, height } = this.menuNode.getBoundingClientRect();
        const position = this.props.position === POSITION.AUTO
          ? this.calculatePosition()
          : this.props.position;
        this.setState({ position, width, height });
      });
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.position !== nextProps.position) {
        const position = nextProps.position === POSITION.AUTO
          ? this.calculatePosition()
          : nextProps.position;
        this.setState({ position });
      }

      /**
       * If the menu is going to be activated via props and its not active, verify
       * the position is appropriated and then show it recalculating position if its
       * wrong. It should be shown in two consecutive setState.
       */
      if (!this.props.active && nextProps.active && !this.state.active) {
        if (nextProps.position === POSITION.AUTO) {
          const position = this.calculatePosition();
          if (this.state.position !== position) {
            this.setState({ position, active: false }, () => {
              this.activateTimeoutHandle = setTimeout(() => { this.show(); }, 20);
            });
          } else {
            this.show();
          }
        } else {
          this.show();
        }
      }

      /**
       * If the menu is being deactivated via props and the current state is
       * active, it should be hid.
       */
      if (this.props.active && !nextProps.active && this.state.active) {
        this.hide();
      }
    }

    componentWillUpdate(nextProps, nextState) {
      if (!this.state.active && nextState.active) {
        events.addEventsToDocument({
          click: this.handleDocumentClick,
          touchstart: this.handleDocumentClick,
        });
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevState.active && !this.state.active) {
        if (this.props.onHide) this.props.onHide();
        events.removeEventsFromDocument({
          click: this.handleDocumentClick,
          touchstart: this.handleDocumentClick,
        });
      } else if (!prevState.active && this.state.active && this.props.onShow) {
        this.props.onShow();
      }
    }

    componentWillUnmount() {
      if (this.state.active) {
        events.removeEventsFromDocument({
          click: this.handleDocumentClick,
          touchstart: this.handleDocumentClick,
        });
      }
      clearTimeout(this.positionTimeoutHandle);
      clearTimeout(this.activateTimeoutHandle);
    }

    getMenuStyle() {
      const { width, height, position } = this.state;
      if (position !== POSITION.STATIC) {
        if (this.state.active) {
          return { clip: `rect(0 ${width}px ${height}px 0)` };
        } else if (position === POSITION.TOP_RIGHT) {
          return { clip: `rect(0 ${width}px 0 ${width}px)` };
        } else if (position === POSITION.BOTTOM_RIGHT) {
          return { clip: `rect(${height}px ${width}px ${height}px ${width}px)` };
        } else if (position === POSITION.BOTTOM_LEFT) {
          return { clip: `rect(${height}px 0 ${height}px 0)` };
        } else if (position === POSITION.TOP_LEFT) {
          return { clip: 'rect(0 0 0 0)' };
        }
      }

      return undefined;
    }

    getRootStyle() {
      return this.state.position !== POSITION.STATIC
        ? { width: this.state.width, height: this.state.height }
        : undefined;
    }

    calculatePosition() {
      const parentNode = ReactDOM.findDOMNode(this).parentNode;
      if (!parentNode) return undefined;
      const { top, left, height, width } = parentNode.getBoundingClientRect();
      const { height: wh, width: ww } = getViewport();
      const toTop = top < ((wh / 2) - (height / 2));
      const toLeft = left < ((ww / 2) - (width / 2));
      return `${toTop ? 'top' : 'bottom'}${toLeft ? 'Left' : 'Right'}`;
    }

    handleDocumentClick = (event) => {
      const refNode = this.props.parentContainerRef || ReactDOM.findDOMNode(this);
      if (this.state.active && !events.targetIsDescendant(event, refNode)) {
        this.setState({ active: false, rippled: false }, () => {
          if (this.props.onClickOutside) this.props.onClickOutside();
        });
      }
    };

    handleSelect = (item, event) => {
      const { value, onClick } = item.props;
      if (onClick) event.persist();
      this.setState({ active: false, rippled: this.props.ripple }, () => {
        if (onClick) onClick(event);
        if (this.props.onSelect) this.props.onSelect(value);
      });
    };

    childRefs = [];

    nextSuggestion = (direction = DOWN) => {
      const { children } = this.props;
      const { active, selectedIndex } = this.state;
      const nextState = {};
      const offset = direction === DOWN ? 1 : -1;
      let nextIndex = selectedIndex + offset;

      // Open the menu when we hit arrow up or down
      if (!active) {
        nextState.active = true;
      }

      if (nextIndex > children.length - 1) {
        nextIndex = 0;
      } else if (nextIndex < 0) {
        nextIndex = children.length - 1;
      } else if (this.isMenuDivider(children[nextIndex])) {
        nextIndex += offset;
      }

      this.focusOnCurrentElement(nextIndex);

      nextState.selectedIndex = nextIndex;
      this.setState({ ...nextState });
    };

    // TODO: A better solution to skipping the divider
    isMenuDivider = child => !child.props.value &&
        (child.type.displayName === 'ThemedMenuDivider' || child.type.displayName === 'ThemedComponent');

    focusOnCurrentElement = (currentChildIndex) => {
      const nextChildRef = this.childRefs[currentChildIndex];

      if (!nextChildRef) {
        return;
      }

      const elementDom = ReactDOM.findDOMNode(nextChildRef);
      if (elementDom) {
        elementDom.focus();
      }
    };

    handleOnKeyDown = (event) => {
      if (event.key === DOWN || event.key === UP) {
        this.nextSuggestion(event.key === DOWN ? DOWN : UP);

        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === ESC) {
        this.resetMenuDropdown();

        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === TAB) {
        this.resetMenuDropdown();
      }
    };

    resetMenuDropdown = () => {
      if (this.state.active) {
        this.setState({
          active: false,
          selectedIndex: -1,
        });
      }
    };

    show() {
      const { width, height } = this.menuNode.getBoundingClientRect();
      this.setState({ active: true, width, height });
    }

    hide() {
      this.setState({ active: false });
    }

    renderItems() {
      const { selected, selectable, children, ripple } = this.props;
      const { selectedIndex } = this.state;

      return React.Children.map(children, (item, itemIndex) => {
        if (!item) {
          return item;
        }

        const isSameIndex = selectedIndex === itemIndex;
        const valueNotUndefined = typeof item.props.value !== 'undefined';
        const valueEqualSelected = item.props.value === selected;

        let propsToPass = {
          selected: selectable && isSameIndex,
          ref: (child) => {
            this.childRefs.push(child);
          },
        };

        if (item.type === MenuItem) {
          propsToPass = {
            ...propsToPass,
            ripple: item.props.ripple || ripple,
            selected: valueNotUndefined && selectable && (valueEqualSelected || isSameIndex),
            onClick: this.handleSelect.bind(this, item),
          };
        }

        return React.cloneElement(item, propsToPass);
      });
    }

    render() {
      const { theme, tabIndex, linkRef } = this.props;
      const outlineStyle = { width: this.state.width, height: this.state.height };
      const className = classnames([theme.menu, theme[this.state.position]], {
        [theme.active]: this.state.active,
        [theme.rippled]: this.state.rippled,
      }, this.props.className);

      return (
        <div
          data-react-toolbox="menu"
          className={className}
          style={this.getRootStyle()}
          tabIndex={tabIndex}
          onKeyDown={this.handleOnKeyDown}
          ref={linkRef}
        >
          {this.props.outline ? <div className={theme.outline} style={outlineStyle} /> : null}
          <ul
            ref={(node) => { this.menuNode = node; }}
            className={theme.menuInner}
            style={this.getMenuStyle()}
          >
            {this.renderItems()}
          </ul>
        </div>
      );
    }
  }

  return Menu;
};

const Menu = factory(InjectMenuItem);
export default themr(MENU)(Menu);
export { factory as menuFactory };
export { Menu };
