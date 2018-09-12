import React from 'react';
import Dropdown from '../../components/dropdown';
import Input from '../../components/input';
import style from '../style';
import countriesObj from '../mocks/countries';

const countries = Object.keys(countriesObj).map(key => ({
  label: countriesObj[key],
  value: key,
}));

class DropdownTest extends React.Component {
  state = {
    dropdown4: 'TH',
    input: ''
  };

  handleChange = (dropdown, value) => {
    const newState = {};
    newState[dropdown] = value;
    this.setState(newState);
  };

  handleInputChange = (value) => {
    this.setState({
      input: value,
    });
  }

  customDropdownItem(data) {
    return (
      <div className={style.dropdownTemplate}>
        <div className={style.dropdownTemplateContent}>
          <strong>{data.label}</strong>
          <small>{data.value}</small>
        </div>
      </div>
    );
  }

  render() {
    return (
      <section>
        <h5>Dropdown</h5>
        <p>lorem ipsum...</p>

        <Dropdown
          label="Country"
          ref="dropdown1"
          onChange={this.handleChange.bind(this, 'dropdown1')}
          source={countries}
          template={this.customDropdownItem}
          value={this.state.dropdown1}
        />

        <Dropdown
          label="Country"
          ref="dropdown4"
          onChange={this.handleChange.bind(this, 'dropdown4')}
          source={countries}
          value={this.state.dropdown4}
        />

        <Dropdown
          disabled
          ref="dropdown3"
          label="Country"
          onChange={this.handleChange.bind(this, 'dropdown3')}
          source={countries}
        />

        <Dropdown
          label="Country"
          ref="dropdown5"
          onChange={this.handleChange.bind(this, 'dropdown5')}
          source={countries}
          value={this.state.dropdown5}
          required
        />

        <hr />
        <h5>Dropdown Autocomplete Example</h5>
        <p>Type a name saved in your browser's autofill entries</p>
        <form>
          <Input onChange={this.handleInputChange} value={this.state.input} label="First Name" name="name" autoComplete="name" />
          <Dropdown
            label="Country"
            ref="dropdown6"
            onChange={this.handleChange.bind(this, 'dropdown6')}
            source={countries}
            value={this.state.dropdown6}
            name="ship-country"
            autoComplete="country"
            required
          />
        </form>

        <hr />
        <h5>Dropdown Autocomplete + Template Example</h5>
        <p>Type a name saved in your browser's autofill entries</p>
        <form>
          <Input onChange={this.handleInputChange} value={this.state.input} label="First Name" name="name" autoComplete="name" />
          <Dropdown
            label="Country"
            ref="dropdown6"
            onChange={this.handleChange.bind(this, 'dropdown6')}
            source={countries}
            value={this.state.dropdown6}
            name="ship-country"
            autoComplete="country"
            template={this.customDropdownItem}
            required
          />
        </form>
      </section>
    );
  }
}

export default DropdownTest;
