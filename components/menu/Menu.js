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

const factory = (MenuItem) => {
  class Menu extends Component {
    static propTypes = {
      active: PropTypes.bool,
      children: PropTypes.node,
      className: PropTypes.string,
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
      outline: true,
      parentContainerRef: null,
      position: POSITION.STATIC,
      ripple: true,
      selectable: true,
    };

    state = {
      active: this.props.active,
      rippled: false,
      cursorIndex: undefined,
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

    onArrowDown = () => {
      const { children } = this.props;
      const { active, cursorIndex } = this.state;
      const nextState = {};

      if (!active) {
        nextState.active = true;
        nextState.cursorIndex = 0;
      } else if (cursorIndex + 1 > children.length - 1) {
        nextState.cursorIndex = 0;
      } else {
        let nextIndex = cursorIndex + 1;
        const nextChild = children[nextIndex];

        if (!nextChild) {
          return;
        }

        if (this.isMenuDivider(nextChild)) {
          nextIndex += 1;
        }

        nextState.cursorIndex = nextIndex;
      }
      this.focusOnCurrentElement(nextState.cursorIndex);

      this.setState({
        ...nextState,
      });
    };

    onArrowUp = () => {
      const { children } = this.props;
      const { active, cursorIndex } = this.state;
      const nextState = {};

      if (!active) {
        nextState.active = true;
        nextState.cursorIndex = children.length - 1;
      } else if (cursorIndex - 1 < 0) {
        nextState.cursorIndex = children.length - 1;
      } else {
        let nextIndex = cursorIndex - 1;
        const nextChild = children[nextIndex];

        if (!nextChild) {
          return;
        }

        if (this.isMenuDivider(nextChild)) {
          nextIndex -= 1;
        }

        nextState.cursorIndex = nextIndex;
      }
      this.focusOnCurrentElement(nextState.cursorIndex);

      this.setState({
        ...nextState,
      });
    };

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
      if (event.key === 'ArrowDown') {
        this.onArrowDown();

        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'ArrowUp') {
        this.onArrowUp();

        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Escape' || event.key === 'Tab') {
        this.resetMenuDropdown();
      }
    };

    resetMenuDropdown = () => {
      if (this.state.active) {
        this.setState({
          active: false,
          cursorIndex: undefined,
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
      return React.Children.map(this.props.children, (item, itemIndex) => {
        if (!item) {
          return item;
        }

        let propsToPass = {
          selected: this.props.selectable
            && (this.state.cursorIndex === itemIndex),
          ref: (child) => {
            this.childRefs.push(child);
          },
        };

        if (item.type === MenuItem) {
          propsToPass = {
            ...propsToPass,
            ripple: item.props.ripple || this.props.ripple,
            selected: typeof item.props.value !== 'undefined'
              && this.props.selectable
              && (item.props.value === this.props.selected || this.state.cursorIndex === itemIndex),
            onClick: this.handleSelect.bind(this, item),
          };
        }

        return React.cloneElement(item, propsToPass);
      });
    }

    render() {
      const { theme, tabIndex } = this.props;
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
